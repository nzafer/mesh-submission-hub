/* ESOGU Assignment Builder - application controller */
(function () {
    "use strict";

    const {
        APP,
        COURSES,
        localDateString,
        getWeeks,
        getText,
        getCourseTitle,
        createDefaultState,
        createSubmissionPath,
        getSubmissionLink,
        normalizeCourseCode,
        normalizeLanguage
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
            this.applyLanguage();
            await this.updateState({ save: false });
            this.ready = true;
            this.setStatus("ready", "ready");
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
                "submissionDestination",
                "languageToggle"
            ].forEach(id => {
                this.dom[id] = document.getElementById(id);
            });
        }

        initializeManagers() {
            coverPage.initialize();
            uploadManager.initialize();
            exportManager.initialize();
        }

        text(key, values = {}) {
            return getText(key, this.state.language, values);
        }

        populateCourses(selectedCode = "", selectedWeek = this.state.week) {
            const select = this.dom.course;
            const normalizedCode = normalizeCourseCode(selectedCode);
            select.innerHTML = "";

            const placeholder = document.createElement("option");
            placeholder.value = "";
            placeholder.textContent = this.text("course.placeholder");
            select.appendChild(placeholder);

            COURSES.forEach(course => {
                const option = document.createElement("option");
                option.value = course.code;
                option.textContent = `${course.code} - ${getCourseTitle(course, this.state.language)}`;
                select.appendChild(option);
            });

            select.value = normalizedCode;
            this.populateWeeks(selectedWeek);
        }

        populateWeeks(selectedWeek = 1) {
            const select = this.dom.week;
            const weeks = getWeeks(this.dom.course.value);
            select.innerHTML = "";

            weeks.forEach(week => {
                const option = document.createElement("option");
                option.value = String(week);
                option.textContent = this.text("week.option", { week });
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
            this.dom.printButton.addEventListener("click", () => this.printCover());
            this.dom.resetButton.addEventListener("click", () => this.reset());
            this.dom.languageToggle?.addEventListener("click", () => this.toggleLanguage());
        }

        readFormState() {
            return {
                student: {
                    name: this.dom.studentName.value.trim(),
                    id: this.dom.studentID.value.trim()
                },
                course: normalizeCourseCode(this.dom.course.value),
                week: Number(this.dom.week.value || 1),
                submissionDate: localDateString(),
                assignmentTitle: this.dom.assignmentTitle.value.trim(),
                uploadedPages: uploadManager.serializePages(),
                language: normalizeLanguage(this.state.language)
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
                    this.setStatus("saveError", "error");
                });
            }, 150);
        }

        async restore() {
            const saved = await storage.load();
            if (!saved) {
                this.populateCourses("", 1);
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
                uploadedPages: Array.isArray(saved.uploadedPages) ? saved.uploadedPages : [],
                language: normalizeLanguage(saved.language)
            };
            this.state.course = normalizeCourseCode(this.state.course);

            this.dom.studentName.value = this.state.student.name || "";
            this.dom.studentID.value = this.state.student.id || "";
            this.populateCourses(this.state.course || "", this.state.week || 1);
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
                this.setStatus("exporting", "warning");
                const result = await exportManager.download(this.state);
                this.setStatus("exported", "ready");
                this.showMessage(this.text(
                    this.submissionLink() ? "export.savedWithLink" : "export.savedNoLink",
                    {
                        filename: result.filename,
                        pageCount: result.pageCount
                    }
                ));
            } catch (error) {
                console.error(error);
                this.setStatus("exportError", "error");
                this.showMessage(error.message || this.text("export.unablePDF"));
                alert(error.message || this.text("export.unablePDF"));
            } finally {
                this.setBusy(false);
            }
        }

        submissionLink() {
            return getSubmissionLink(this.state.course);
        }

        submissionPath() {
            return createSubmissionPath(this.state.course);
        }

        updateSubmissionDestination() {
            if (!this.state.course) {
                if (this.dom.submissionDestination) {
                    this.dom.submissionDestination.textContent = this.text("submission.selectCourse");
                    this.dom.submissionDestination.classList.add("missing-link");
                }

                if (this.dom.submitButton) {
                    this.dom.submitButton.disabled = true;
                    this.dom.submitButton.title = this.text("submission.selectCourseTitle");
                }
                return;
            }

            const path = this.submissionPath();
            const link = this.submissionLink();

            if (this.dom.submissionDestination) {
                this.dom.submissionDestination.textContent = link
                    ? path
                    : this.text("submission.directOnly", { path });
                this.dom.submissionDestination.classList.remove("missing-link");
            }

            if (this.dom.submitButton) {
                this.dom.submitButton.disabled = false;
                this.dom.submitButton.title = this.text("submission.openTitle", { path });
            }
        }

        async openSubmissionLink() {
            await this.updateState({ save: true });
            const link = this.submissionLink();
            const path = this.submissionPath();

            try {
                this.validateForExport();
                this.setBusy(true);
                this.setStatus("submitting", "warning");

                const result = await exportManager.submitToOneDrive(this.state);

                this.setStatus("submissionOpened", "ready");
                this.showMessage(this.text(
                    "submission.uploadedMessage",
                    {
                        filename: result.filename,
                        path
                    }
                ));
            } catch (error) {
                console.error(error);
                this.setStatus("exportError", "error");

                if (error.status === 404 || error.status === 405 || error.status === 501) {
                    if (!link) {
                        const message = this.text("submission.missingLinkAlert", { path });
                        this.showMessage(message);
                        alert(message);
                        return;
                    }
                    const fallback = error.fallback || await exportManager.buildBlob(this.state);
                    await exportManager.saveBlob(fallback.blob, fallback.filename);
                    window.open(link, "_blank", "noopener,noreferrer");
                    const message = this.text("submission.directUnavailable", {
                        filename: fallback.filename,
                        path
                    });
                    this.showMessage(message);
                    alert(message);
                    return;
                }

                const message = error.status === 409
                    ? this.text("submission.duplicate", { path })
                    : error.message || this.text("submission.uploadError");
                this.showMessage(message);
                alert(message);
            } finally {
                this.setBusy(false);
            }
        }

        async exportCover() {
            try {
                await this.updateState({ save: true });
                this.setBusy(true);
                this.setStatus("exporting", "warning");
                await exportManager.downloadCover(this.state);
                this.setStatus("coverExported", "ready");
            } catch (error) {
                console.error(error);
                this.setStatus("exportError", "error");
                this.showMessage(error.message || this.text("export.unableCover"));
                alert(error.message || this.text("export.unableCover"));
            } finally {
                this.setBusy(false);
            }
        }

        async printCover() {
            try {
                await this.updateState({ save: true });
                this.setBusy(true);
                this.setStatus("exporting", "warning");
                await exportManager.printCover(this.state);
                this.setStatus("coverExported", "ready");
            } catch (error) {
                console.error(error);
                this.setStatus("exportError", "error");
                this.showMessage(error.message || this.text("export.unableCover"));
                alert(error.message || this.text("export.unableCover"));
            } finally {
                this.setBusy(false);
            }
        }

        async reset() {
            if (!confirm(this.text("dialogs.resetConfirm"))) {
                return;
            }

            clearTimeout(this.saveTimer);
            await storage.clear();
            const language = this.state.language;
            this.state = createDefaultState();
            this.state.language = language;
            this.dom.studentName.value = "";
            this.dom.studentID.value = "";
            this.dom.assignmentTitle.value = "";
            this.dom.course.value = "";
            this.populateCourses("", 1);
            this.initializeDate();
            uploadManager.clear();
            await this.updateState({ save: false });
            this.setStatus("reset", "ready");
        }

        setBusy(busy) {
            document.body.classList.toggle("busy", busy);
            this.dom.exportButton.disabled = busy;
            this.dom.exportCoverButton.disabled = busy;
            this.updateSubmissionDestination();
        }

        setStatus(key, type = "ready", values = {}) {
            const status = this.dom.previewStatus;
            if (!status) {
                return;
            }
            status.textContent = this.text(`status.${key}`, values);
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

        applyLanguage() {
            this.state.language = normalizeLanguage(this.state.language);
            document.documentElement.lang = this.state.language;
            document.title = this.text("document.title");

            const metaDescription = document.querySelector("meta[name='description']");
            if (metaDescription) {
                metaDescription.setAttribute("content", this.text("document.description"));
            }

            document.querySelectorAll("[data-i18n]").forEach(element => {
                element.textContent = this.text(element.dataset.i18n);
            });
            document.querySelectorAll("[data-i18n-placeholder]").forEach(element => {
                element.setAttribute("placeholder", this.text(element.dataset.i18nPlaceholder));
            });
            document.querySelectorAll("[data-i18n-title]").forEach(element => {
                element.setAttribute("title", this.text(element.dataset.i18nTitle));
            });

            if (this.dom.languageToggle) {
                this.dom.languageToggle.textContent = this.text("language.toggle");
                this.dom.languageToggle.title = this.text("language.title");
                this.dom.languageToggle.setAttribute("aria-label", this.text("language.title"));
            }
            if (this.dom.versionLabel) {
                this.dom.versionLabel.textContent = this.text("app.version", { version: APP.version });
            }

            uploadManager.setLanguage(this.state.language);
            exportManager.setLanguage(this.state.language);
            this.populateCourses(this.dom.course.value, this.dom.week.value || this.state.week);
            this.updateSubmissionDestination();
            this.updateReadyProgressText();
        }

        async toggleLanguage() {
            this.state.language = this.state.language === "tr" ? "en" : "tr";
            this.applyLanguage();
            await this.updateState({ save: true });
            this.setStatus("ready", "ready");
        }

        updateReadyProgressText() {
            const progressText = document.getElementById("progressText");
            if (!progressText) {
                return;
            }

            const readyTexts = ["en", "tr"].map(language => getText("status.ready", language));
            if (readyTexts.includes(progressText.textContent.trim())) {
                progressText.textContent = this.text("status.ready");
            }
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
