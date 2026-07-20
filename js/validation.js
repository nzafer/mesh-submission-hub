/* ESOGU Assignment Builder - validation */
(function () {
    "use strict";

    const { VALIDATION, UPLOAD, getCourse } = window.AssignmentBuilderConfig;

    class ValidationManager {
        createResult(key, label, valid, message = "") {
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
            const course = getCourse(state.course);
            const studentName = state.student?.name || "";
            const studentID = state.student?.id || "";
            const studentIDPattern = new RegExp(`^\\d{${VALIDATION.studentIDLength}}$`);
            const assignmentTitle = state.assignmentTitle || "";

            return [
                this.createResult(
                    "studentName",
                    "Student Name",
                    studentName.trim().length > 0 && studentName.length <= VALIDATION.studentNameMax,
                    `Student name is required and must be ${VALIDATION.studentNameMax} characters or fewer.`
                ),
                this.createResult(
                    "studentID",
                    "Student ID",
                    studentIDPattern.test(studentID),
                    `Student ID must contain exactly ${VALIDATION.studentIDLength} digits.`
                ),
                this.createResult(
                    "course",
                    "Course",
                    Boolean(course),
                    "Please select a course."
                ),
                this.createResult(
                    "week",
                    "Week",
                    Boolean(course) && Number(state.week) >= 1 && Number(state.week) <= course.totalWeeks,
                    "Please select a valid week."
                ),
                this.createResult(
                    "assignmentTitle",
                    "Assignment Title",
                    assignmentTitle.trim().length > 0 && assignmentTitle.length <= VALIDATION.assignmentMax,
                    `Assignment title is required and must be ${VALIDATION.assignmentMax} characters or fewer.`
                ),
                this.createResult(
                    "submissionDate",
                    "Submission Date",
                    /^\d{4}-\d{2}-\d{2}$/.test(state.submissionDate || ""),
                    "Submission date is missing."
                ),
                this.createResult(
                    "pages",
                    "Assignment Pages",
                    Array.isArray(state.uploadedPages) && state.uploadedPages.length > 0,
                    "Upload at least one assignment page."
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
            this.validate(state).forEach(check => {
                const item = document.createElement("li");
                item.className = check.valid ? "valid" : "invalid";
                item.textContent = `${check.valid ? "OK" : "Needs"} - ${check.label}`;
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
