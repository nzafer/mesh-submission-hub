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
        createAssignmentCode,
        createDefaultState,
        createSubmissionPath,
        getSubmissionLink,
        getAssignment,
        getAssignmentFromURL,
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
            this.assignmentLock = null;
            this.auth = {
                available: false,
                isAuthenticated: false,
                identityProvider: "",
                userDetails: "",
                userId: "",
                userRoles: []
            };
        }

        async initialize() {
            this.cacheDOM();
            this.initializeManagers();
            this.assignmentLock = getAssignmentFromURL(window.location.search, this.state.language);
            this.populateCourses(this.assignmentLock?.course || "", this.assignmentLock?.week || this.state.week);
            this.initializeDate();
            this.bindEvents();
            await this.loadAuth();
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
                "assignmentNotice",
                "languageToggle",
                "authStatus",
                "authButton",
                "signOutButton"
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

        currentAssignment(language = this.state.language) {
            return this.assignmentLock
                ? getAssignment(this.assignmentLock.code, language)
                : null;
        }

        applyLockedAssignmentToState(state = this.state) {
            const assignment = this.currentAssignment(state.language);
            if (!assignment) {
                return state;
            }

            state.course = assignment.course;
            state.week = assignment.week;
            state.assignmentCode = assignment.code;
            state.assignmentTitle = assignment.title;
            state.instructor = assignment.instructor;
            return state;
        }

        applyAssignmentLock() {
            const assignment = this.currentAssignment();
            const locked = Boolean(assignment);
            document.body.classList.toggle("assignment-locked", locked);

            if (this.dom.assignmentNotice) {
                this.dom.assignmentNotice.classList.toggle("hidden", !locked);
                this.dom.assignmentNotice.textContent = locked
                    ? this.text("fields.assignmentLockedMessage", {
                        code: assignment.code,
                        course: `${assignment.course} - ${getCourseTitle(assignment.course, this.state.language)}`,
                        week: String(assignment.week).padStart(2, "0")
                    })
                    : "";
            }

            if (locked) {
                if (this.dom.course.value !== assignment.course) {
                    this.dom.course.value = assignment.course;
                }
                this.populateWeeks(assignment.week);
                this.dom.week.value = String(assignment.week);
                this.dom.assignmentTitle.value = assignment.title;
            }

            this.dom.course.disabled = locked;
            this.dom.week.disabled = locked;
            this.dom.assignmentTitle.readOnly = locked;
            this.dom.assignmentTitle.classList.toggle("locked-control", locked);
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
            const selectedNumber = Number(selectedWeek || 1);
            const weeks = Array.from(new Set([
                ...getWeeks(this.dom.course.value),
                selectedNumber
            ])).filter(Boolean).sort((left, right) => left - right);
            select.innerHTML = "";

            weeks.forEach(week => {
                const option = document.createElement("option");
                option.value = String(week);
                option.textContent = this.text("week.option", { week });
                select.appendChild(option);
            });

            const allowed = weeks.includes(selectedNumber);
            select.value = String(allowed ? selectedNumber : weeks[0]);
        }

        initializeDate() {
            this.dom.submissionDate.value = localDateString();
            this.dom.submissionDate.readOnly = true;
        }

        bindEvents() {
            this.dom.course.addEventListener("change", () => {
                if (this.assignmentLock) {
                    this.applyAssignmentLock();
                    this.updateState();
                    return;
                }
                this.populateWeeks(1);
                this.updateState();
            });
            this.dom.week.addEventListener("change", () => {
                if (this.assignmentLock) {
                    this.applyAssignmentLock();
                }
                this.updateState();
            });
            this.dom.assignmentTitle.addEventListener("input", () => {
                if (this.assignmentLock) {
                    this.applyAssignmentLock();
                    return;
                }
                this.updateState();
            });
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
            const language = normalizeLanguage(this.state.language);
            const assignment = this.currentAssignment(language);
            const course = assignment?.course || normalizeCourseCode(this.dom.course.value);
            const week = assignment?.week || Number(this.dom.week.value || 1);
            return {
                student: {
                    name: this.dom.studentName.value.trim(),
                    id: this.dom.studentID.value.trim()
                },
                course,
                week,
                assignmentCode: assignment?.code || "",
                submissionDate: localDateString(),
                assignmentTitle: assignment?.title || this.dom.assignmentTitle.value.trim(),
                instructor: assignment?.instructor || "",
                uploadedPages: uploadManager.serializePages(),
                language,
                auth: this.auth
            };
        }

        async updateState({ save = true } = {}) {
            this.dom.submissionDate.value = localDateString();
            this.state = this.readFormState();
            this.applyLockedAssignmentToState();
            this.applyAssignmentLock();
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
            const lockedAssignment = this.currentAssignment();
            if (!saved) {
                this.state = createDefaultState();
                this.applyLockedAssignmentToState();
                this.populateCourses(this.state.course || "", this.state.week || 1);
                this.dom.assignmentTitle.value = this.state.assignmentTitle || "";
                this.applyAssignmentLock();
                uploadManager.render();
                return;
            }

            const savedAssignmentCode = saved.assignmentCode || createAssignmentCode(saved.course, saved.week);
            const restorePages = !lockedAssignment ||
                savedAssignmentCode === lockedAssignment.code;

            this.state = {
                ...createDefaultState(),
                ...saved,
                student: {
                    ...createDefaultState().student,
                    ...(saved.student || {})
                },
                assignmentTitle: saved.assignmentTitle || saved.assignment || "",
                instructor: saved.instructor || "",
                submissionDate: localDateString(),
                uploadedPages: restorePages && Array.isArray(saved.uploadedPages) ? saved.uploadedPages : [],
                language: normalizeLanguage(saved.language)
            };
            this.state.course = normalizeCourseCode(this.state.course);
            this.applyLockedAssignmentToState();

            this.dom.studentName.value = this.state.student.name || "";
            this.dom.studentID.value = this.state.student.id || "";
            this.populateCourses(this.state.course || "", this.state.week || 1);
            this.dom.assignmentTitle.value = this.state.assignmentTitle || "";
            this.dom.submissionDate.value = localDateString();
            this.applyAssignmentLock();
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
            if (!this.assignmentLock) {
                if (this.dom.submissionDestination) {
                    this.dom.submissionDestination.textContent = this.text("assignment.missingLink");
                    this.dom.submissionDestination.classList.add("missing-link");
                }

                if (this.dom.submitButton) {
                    this.dom.submitButton.disabled = true;
                    this.dom.submitButton.title = this.text("submission.missingAssignmentTitle");
                }
                return;
            }

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
            const busy = document.body.classList.contains("busy");

            if (this.dom.submissionDestination) {
                this.dom.submissionDestination.textContent = link
                    ? path
                    : this.text("submission.directOnly", { path });
                this.dom.submissionDestination.classList.remove("missing-link");
            }

            if (this.dom.submitButton) {
                this.dom.submitButton.disabled = busy;
                this.dom.submitButton.title = this.text("submission.openTitle", { path });
            }
        }

        async openSubmissionLink() {
            await this.updateState({ save: true });
            await this.loadAuth();
            const link = this.submissionLink();
            const path = this.submissionPath();

            try {
                if (!this.assignmentLock) {
                    const message = this.text("submission.missingAssignment");
                    this.showMessage(message);
                    alert(message);
                    return;
                }
                if (this.auth.available && !this.auth.isAuthenticated) {
                    const message = this.text("auth.signInRequired");
                    this.showMessage(message);
                    window.location.href = this.authLoginURL();
                    return;
                }
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
            this.applyLockedAssignmentToState();
            this.dom.studentName.value = "";
            this.dom.studentID.value = "";
            this.dom.assignmentTitle.value = this.state.assignmentTitle || "";
            this.populateCourses(this.state.course || "", this.state.week || 1);
            this.applyAssignmentLock();
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
            if (this.dom.authButton) {
                this.dom.authButton.textContent = this.text("auth.signIn");
            }
            if (this.dom.signOutButton) {
                this.dom.signOutButton.textContent = this.text("auth.signOut");
            }

            uploadManager.setLanguage(this.state.language);
            exportManager.setLanguage(this.state.language);
            this.applyLockedAssignmentToState();
            this.populateCourses(this.state.course || this.dom.course.value, this.state.week || this.dom.week.value || 1);
            this.applyAssignmentLock();
            this.updateSubmissionDestination();
            this.updateAuthUI();
            this.updateReadyProgressText();
        }

        authLoginURL() {
            const redirect = encodeURIComponent(window.location.href);
            return `/.auth/login/aad?post_login_redirect_uri=${redirect}`;
        }

        authLogoutURL() {
            const redirect = encodeURIComponent(window.location.href);
            return `/.auth/logout?post_logout_redirect_uri=${redirect}`;
        }

        async loadAuth() {
            const unauthenticated = {
                available: false,
                isAuthenticated: false,
                identityProvider: "",
                userDetails: "",
                userId: "",
                userRoles: []
            };

            if (window.location.protocol === "file:") {
                this.auth = unauthenticated;
                this.updateAuthUI();
                return this.auth;
            }

            try {
                const response = await fetch("/.auth/me", {
                    cache: "no-store"
                });
                if (!response.ok) {
                    throw new Error("Auth endpoint unavailable.");
                }

                const payload = await response.json();
                const principal = payload.clientPrincipal;
                this.auth = {
                    available: true,
                    isAuthenticated: Boolean(principal),
                    identityProvider: principal?.identityProvider || "",
                    userDetails: principal?.userDetails || "",
                    userId: principal?.userId || "",
                    userRoles: Array.isArray(principal?.userRoles) ? principal.userRoles : []
                };
            } catch (error) {
                this.auth = unauthenticated;
            }

            this.updateAuthUI();
            return this.auth;
        }

        updateAuthUI() {
            if (!this.dom.authStatus) {
                return;
            }

            if (!this.auth.available) {
                this.dom.authStatus.textContent = this.text("auth.local");
                this.dom.authButton?.classList.add("hidden");
                this.dom.signOutButton?.classList.add("hidden");
                return;
            }

            if (this.auth.isAuthenticated) {
                this.dom.authStatus.textContent = this.text("auth.signedIn", {
                    user: this.auth.userDetails || this.auth.userId || "Microsoft"
                });
                this.dom.authButton?.classList.add("hidden");
                if (this.dom.signOutButton) {
                    this.dom.signOutButton.href = this.authLogoutURL();
                    this.dom.signOutButton.classList.remove("hidden");
                }
                return;
            }

            this.dom.authStatus.textContent = this.text("auth.signInRequired");
            if (this.dom.authButton) {
                this.dom.authButton.href = this.authLoginURL();
                this.dom.authButton.classList.remove("hidden");
            }
            this.dom.signOutButton?.classList.add("hidden");
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
