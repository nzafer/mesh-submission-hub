/* ESOGU Assignment Builder - application controller */
(function () {
    "use strict";

    const {
        APP,
        COURSES,
        localDateString,
        getWeeks,
        createDefaultState,
        createSubmissionPath,
        getSubmissionLink
    } = window.AssignmentBuilderConfig;
    const { storage } = window.AssignmentBuilderStorage;
    const { validator } = window.AssignmentBuilderValidation;
    const { coverPage } = window.AssignmentBuilderCover;
    const { uploadManager } = window.AssignmentBuilderUpload;
    const { exportManager } = window.AssignmentBuilderExport;

    class Application {
        constructor() {
            this.state = createDefaultState();
            this.dom = {};
            this.saveTimer = null;
            this.ready = false;
        }

        async initialize() {
            this.cacheDOM();
            this.initializeManagers();
            this.populateCourses();
            this.initializeDate();
            this.bindEvents();
            await this.restore();
            await this.updateState({ save: false });
            this.ready = true;
            this.setStatus("Ready", "ready");
            console.log(`${APP.name} v${APP.version} ready.`);
        }

        cacheDOM() {
            [
                "studentName",
                "studentID",
                "course",
                "week",
                "submissionDate",
                "assignmentTitle",
                "exportButton",
                "exportCoverButton",
                "submitButton",
                "printButton",
                "resetButton",
                "previewStatus",
                "versionLabel",
                "submissionDestination"
            ].forEach(id => {
                this.dom[id] = document.getElementById(id);
            });
        }

        initializeManagers() {
            coverPage.initialize();
            uploadManager.initialize();
            exportManager.initialize();
            if (this.dom.versionLabel) {
                this.dom.versionLabel.textContent = `Version ${APP.version}`;
            }
        }

        populateCourses(selectedCode = "") {
            const select = this.dom.course;
            select.innerHTML = "";

            const placeholder = document.createElement("option");
            placeholder.value = "";
            placeholder.textContent = "Select Course";
            select.appendChild(placeholder);

            COURSES.forEach(course => {
                const option = document.createElement("option");
                option.value = course.code;
                option.textContent = `${course.code} - ${course.title}`;
                select.appendChild(option);
            });

            select.value = selectedCode;
            this.populateWeeks(this.state.week);
        }

        populateWeeks(selectedWeek = 1) {
            const select = this.dom.week;
            const weeks = getWeeks(this.dom.course.value);
            select.innerHTML = "";

            weeks.forEach(week => {
                const option = document.createElement("option");
                option.value = String(week);
                option.textContent = `Week ${week}`;
                select.appendChild(option);
            });

            const allowed = weeks.includes(Number(selectedWeek));
            select.value = String(allowed ? selectedWeek : weeks[0]);
        }

        initializeDate() {
            this.dom.submissionDate.value = localDateString();
            this.dom.submissionDate.readOnly = true;
        }

        bindEvents() {
            this.dom.course.addEventListener("change", () => {
                this.populateWeeks(1);
                this.updateState();
            });
            this.dom.week.addEventListener("change", () => this.updateState());
            this.dom.assignmentTitle.addEventListener("input", () => this.updateState());
            this.dom.studentName.addEventListener("input", () => this.updateState());
            this.dom.studentID.addEventListener("input", () => {
                this.dom.studentID.value = this.dom.studentID.value.replace(/\D/g, "").slice(0, 12);
                this.updateState();
            });
            window.addEventListener("assignment-pages-change", () => this.updateState());
            this.dom.exportButton.addEventListener("click", () => this.exportPDF());
            this.dom.exportCoverButton.addEventListener("click", () => this.exportCover());
            this.dom.submitButton.addEventListener("click", () => this.openSubmissionLink());
            this.dom.printButton.addEventListener("click", () => window.print());
            this.dom.resetButton.addEventListener("click", () => this.reset());
        }

        readFormState() {
            return {
                student: {
                    name: this.dom.studentName.value.trim(),
                    id: this.dom.studentID.value.trim()
                },
                course: this.dom.course.value,
                week: Number(this.dom.week.value || 1),
                submissionDate: localDateString(),
                assignmentTitle: this.dom.assignmentTitle.value.trim(),
                uploadedPages: uploadManager.serializePages()
            };
        }

        async updateState({ save = true } = {}) {
            this.dom.submissionDate.value = localDateString();
            this.state = this.readFormState();
            await coverPage.update(this.state);
            exportManager.setState(this.state);
            validator.updatePanel(this.state);
            this.updateSubmissionDestination();

            if (save) {
                this.queueSave();
            }
        }

        queueSave() {
            clearTimeout(this.saveTimer);
            this.saveTimer = setTimeout(() => {
                storage.save(this.state).catch(error => {
                    console.error("Unable to save offline state.", error);
                    this.setStatus("Save error", "error");
                });
            }, 150);
        }

        async restore() {
            const saved = await storage.load();
            if (!saved) {
                this.populateWeeks(1);
                uploadManager.render();
                return;
            }

            this.state = {
                ...createDefaultState(),
                ...saved,
                student: {
                    ...createDefaultState().student,
                    ...(saved.student || {})
                },
                assignmentTitle: saved.assignmentTitle || saved.assignment || "",
                submissionDate: localDateString(),
                uploadedPages: Array.isArray(saved.uploadedPages) ? saved.uploadedPages : []
            };

            this.dom.studentName.value = this.state.student.name || "";
            this.dom.studentID.value = this.state.student.id || "";
            this.dom.course.value = this.state.course || "";
            this.populateWeeks(this.state.week || 1);
            this.dom.assignmentTitle.value = this.state.assignmentTitle || "";
            this.dom.submissionDate.value = localDateString();
            await uploadManager.restore(this.state.uploadedPages);
        }

        validateForExport() {
            const firstInvalid = validator.firstInvalid(this.state);
            if (firstInvalid) {
                throw new Error(firstInvalid.message);
            }
        }

        async exportPDF() {
            try {
                await this.updateState({ save: true });
                this.validateForExport();
                this.setBusy(true);
                this.setStatus("Exporting", "warning");
                const result = await exportManager.download(this.state);
                this.setStatus("Exported", "ready");
                const linkMessage = this.submissionLink()
                    ? " Open the submission link and upload this PDF."
                    : " Ask the instructor to add the course/week submission link.";
                this.showMessage(`Saved ${result.filename} (${result.pageCount} pages).${linkMessage}`);
            } catch (error) {
                console.error(error);
                this.setStatus("Export error", "error");
                this.showMessage(error.message || "Unable to export PDF.");
                alert(error.message || "Unable to export PDF.");
            } finally {
                this.setBusy(false);
            }
        }

        submissionLink() {
            return getSubmissionLink(this.state.course, this.state.week);
        }

        submissionPath() {
            return createSubmissionPath(this.state.course, this.state.week);
        }

        updateSubmissionDestination() {
            if (!this.state.course) {
                if (this.dom.submissionDestination) {
                    this.dom.submissionDestination.textContent = "Select a course and week";
                    this.dom.submissionDestination.classList.add("missing-link");
                }

                if (this.dom.submitButton) {
                    this.dom.submitButton.disabled = true;
                    this.dom.submitButton.title = "Select a course and week first.";
                }
                return;
            }

            const path = this.submissionPath();
            const link = this.submissionLink();

            if (this.dom.submissionDestination) {
                this.dom.submissionDestination.textContent = link
                    ? path
                    : `${path} - link not configured`;
                this.dom.submissionDestination.classList.toggle("missing-link", !link);
            }

            if (this.dom.submitButton) {
                this.dom.submitButton.disabled = !link;
                this.dom.submitButton.title = link
                    ? `Open upload-only submission link for ${path}`
                    : `No file-request link is configured for ${path}`;
            }
        }

        async openSubmissionLink() {
            await this.updateState({ save: true });
            const link = this.submissionLink();
            const path = this.submissionPath();

            if (!link) {
                alert(`No file-request link is configured for ${path}. Add the link in js/config.js.`);
                return;
            }

            window.open(link, "_blank", "noopener,noreferrer");
            this.setStatus("Submission link opened", "ready");
            this.showMessage(`Upload the generated PDF to ${path}.`);
        }

        async exportCover() {
            try {
                await this.updateState({ save: true });
                this.setBusy(true);
                this.setStatus("Exporting", "warning");
                await exportManager.downloadCover(this.state);
                this.setStatus("Cover exported", "ready");
            } catch (error) {
                console.error(error);
                this.setStatus("Export error", "error");
                this.showMessage(error.message || "Unable to export cover.");
                alert(error.message || "Unable to export cover.");
            } finally {
                this.setBusy(false);
            }
        }

        async reset() {
            if (!confirm("Clear saved information and uploaded pages?")) {
                return;
            }

            clearTimeout(this.saveTimer);
            await storage.clear();
            this.state = createDefaultState();
            this.dom.studentName.value = "";
            this.dom.studentID.value = "";
            this.dom.assignmentTitle.value = "";
            this.dom.course.value = "";
            this.populateWeeks(1);
            this.initializeDate();
            uploadManager.clear();
            await this.updateState({ save: false });
            this.setStatus("Reset", "ready");
        }

        setBusy(busy) {
            document.body.classList.toggle("busy", busy);
            this.dom.exportButton.disabled = busy;
            this.dom.exportCoverButton.disabled = busy;
            this.updateSubmissionDestination();
        }

        setStatus(text, type = "ready") {
            const status = this.dom.previewStatus;
            if (!status) {
                return;
            }
            status.textContent = text;
            status.classList.toggle("status-warning", type === "warning");
            status.classList.toggle("status-error", type === "error");
        }

        showMessage(message) {
            const progressText = document.getElementById("progressText");
            if (progressText) {
                progressText.textContent = message;
            }
        }

        getState() {
            return JSON.parse(JSON.stringify(this.state));
        }
    }

    window.AssignmentBuilderApp = {
        app: new Application(),
        Application
    };

    document.addEventListener("DOMContentLoaded", () => {
        window.AssignmentBuilderApp.app.initialize().catch(error => {
            console.error(error);
            alert(error.message || "Application failed to start.");
        });
    });
}());
