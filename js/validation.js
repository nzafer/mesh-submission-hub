/* ESOGU Assignment Builder - validation */
(function () {
    "use strict";

    const {
        VALIDATION,
        UPLOAD,
        getCourse,
        getText,
        normalizeLanguage
    } = window.AssignmentBuilderConfig;

    class ValidationManager {
        createResult(key, language, valid, messageValues = {}) {
            const label = getText(`validation.labels.${key}`, language);
            const message = getText(`validation.messages.${key}`, language, messageValues);
            return { key, label, valid: Boolean(valid), message };
        }

        hasExtension(file, extensions) {
            const name = file?.name?.toLowerCase() || "";
            return extensions.some(extension => name.endsWith(extension));
        }

        isValidImage(file) {
            if (!file) {
                return false;
            }
            const sizeOK = file.size <= UPLOAD.maxFileSizeMB * 1024 * 1024;
            const typeOK = UPLOAD.imageTypes.includes(file.type) ||
                this.hasExtension(file, UPLOAD.imageExtensions);
            return sizeOK && typeOK;
        }

        isValidPDF(file) {
            if (!file) {
                return false;
            }
            const sizeOK = file.size <= UPLOAD.maxFileSizeMB * 1024 * 1024;
            const typeOK = UPLOAD.pdfTypes.includes(file.type) ||
                this.hasExtension(file, UPLOAD.pdfExtensions);
            return sizeOK && typeOK;
        }

        validate(state) {
            const language = normalizeLanguage(state.language);
            const course = getCourse(state.course);
            const studentName = state.student?.name || "";
            const studentID = state.student?.id || "";
            const studentIDPattern = new RegExp(`^\\d{${VALIDATION.studentIDLength}}$`);
            const assignmentTitle = state.assignmentTitle || "";
            const assignmentNumber = Number(state.week);
            const assignmentNumberValid = Boolean(course) &&
                assignmentNumber >= 1 &&
                (Boolean(state.assignmentCode) || assignmentNumber <= course.totalWeeks);

            return [
                this.createResult(
                    "studentName",
                    language,
                    studentName.trim().length > 0 && studentName.length <= VALIDATION.studentNameMax,
                    { max: VALIDATION.studentNameMax }
                ),
                this.createResult(
                    "studentID",
                    language,
                    studentIDPattern.test(studentID),
                    { length: VALIDATION.studentIDLength }
                ),
                this.createResult(
                    "course",
                    language,
                    Boolean(course),
                    {}
                ),
                this.createResult(
                    "week",
                    language,
                    assignmentNumberValid,
                    {}
                ),
                this.createResult(
                    "assignmentTitle",
                    language,
                    assignmentTitle.trim().length > 0 && assignmentTitle.length <= VALIDATION.assignmentMax,
                    { max: VALIDATION.assignmentMax }
                ),
                this.createResult(
                    "submissionDate",
                    language,
                    /^\d{4}-\d{2}-\d{2}$/.test(state.submissionDate || ""),
                    {}
                ),
                this.createResult(
                    "pages",
                    language,
                    Array.isArray(state.uploadedPages) && state.uploadedPages.length > 0,
                    {}
                )
            ];
        }

        isReady(state) {
            return this.validate(state).every(check => check.valid);
        }

        firstInvalid(state) {
            return this.validate(state).find(check => !check.valid) || null;
        }

        updatePanel(state) {
            const list = document.getElementById("validationList");
            if (!list) {
                return;
            }

            list.innerHTML = "";
            const language = normalizeLanguage(state.language);
            this.validate(state).forEach(check => {
                const item = document.createElement("li");
                item.className = check.valid ? "valid" : "invalid";
                item.textContent = `${getText(check.valid ? "validation.ok" : "validation.needs", language)} - ${check.label}`;
                item.title = check.valid ? "" : check.message;
                list.appendChild(item);
            });
        }

        getErrorMessage(state) {
            return this.firstInvalid(state)?.message || "";
        }
    }

    window.AssignmentBuilderValidation = {
        validator: new ValidationManager(),
        ValidationManager
    };
}());
