/* ESOGU Assignment Builder - configuration */
(function () {
    "use strict";

    const UNIVERSITY = {
        name: "Eskisehir Osmangazi University",
        displayName: "Eski&#351;ehir Osmangazi &Uuml;niversitesi",
        faculty: "Faculty of Engineering and Architecture",
        department: "Department of Mechanical Engineering",
        logo: "img/esogu-logo.png"
    };

    const COURSES = [
        {
            code: "ME151815356",
            title: "Mechanism Design",
            instructor: "Dr. Naci Zafer",
            semester: "Fall",
            academicYear: "2026-2027",
            totalWeeks: 14
        },
        {
            code: "ME151815401",
            title: "Machine Dynamics",
            instructor: "Dr. Naci Zafer",
            semester: "Fall",
            academicYear: "2026-2027",
            totalWeeks: 14
        },
        {
            code: "ME151815402",
            title: "Control Systems",
            instructor: "Dr. Naci Zafer",
            semester: "Spring",
            academicYear: "2026-2027",
            totalWeeks: 14
        },
        {
            code: "ME151813560",
            title: "Dynamics",
            instructor: "Dr. Naci Zafer",
            semester: "Fall",
            academicYear: "2026-2027",
            totalWeeks: 14
        }
    ];

    const SUBMISSION_LINKS = {
        /*
         * Paste Microsoft OneDrive/SharePoint "Request files" links here.
         * Create one upload-only request link for each course folder.
         * Example:
         * ME151815356: "https://..."
         */
        ME151815356: "https://ogrencioguedutr-my.sharepoint.com/:f:/g/personal/ab596_ogu_edu_tr/IgARls8Dj0PbR7dPgEokueGbAS8Ns__V46r2ytNaQ-tgRkQ",
        ME151815401: "https://ogrencioguedutr-my.sharepoint.com/:f:/g/personal/ab596_ogu_edu_tr/IgDQhu7d2TUFRqmCtZ7nlEg-AZvfqTzMu1Flkeq3QnLK5wU",
        ME151815402: "https://ogrencioguedutr-my.sharepoint.com/:f:/g/personal/ab596_ogu_edu_tr/IgDRKYrblJ9fQJXSx6-7-zYmAT9t8ZW_XWU_nvKXJlizuZ8",
        ME151813560: "https://ogrencioguedutr-my.sharepoint.com/:f:/g/personal/ab596_ogu_edu_tr/IgBhPLanP_P_TLoiE4YbDqAuAYIa6BcUFQqxcYLtm6FkltU"
    };

    const APP = {
        name: "Mechanical Engineering Submission Hub (MESH)",
        displayName: "Mechanical Engineering Submission Hub (MESH)",
        version: "2.4.2",
        offline: true,
        author: "Department of Mechanical Engineering"
    };

    const PAGE = {
        widthMM: 210,
        heightMM: 297,
        marginMM: 10,
        footerMM: 12,
        canvasScale: 4
    };

    const UPLOAD = {
        maxFiles: 100,
        maxFileSizeMB: 25,
        imageTypes: ["image/jpeg", "image/jpg", "image/pjpeg", "image/png", "image/webp"],
        pdfTypes: ["application/pdf"],
        imageExtensions: [".jpg", ".jpeg", ".jfif", ".png", ".webp"],
        pdfExtensions: [".pdf"]
    };

    const EXPORT = {
        filenamePattern: "{studentID}_{course}_Week{week}.pdf",
        jpegQuality: 0.95
    };

    const QR = {
        width: 132,
        height: 132,
        margin: 1,
        dark: "#111111",
        light: "#FFFFFF"
    };

    const COVER = {
        title: "ASSIGNMENT COVER PAGE",
        signatureLabel: "Student Signature",
        pageCountLabel: "Total PDF Pages",
        footerLeft: "Generated offline with Mechanical Engineering Submission Hub (MESH)",
        footerRight: "Department of Mechanical Engineering"
    };

    const VALIDATION = {
        studentIDLength: 12,
        studentNameMax: 80,
        assignmentMax: 150
    };

    const STORAGE = {
        database: "ESOGU_AssignmentBuilder",
        version: 2,
        store: "state",
        key: "autosave"
    };

    function localDateString(date = new Date()) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    function getCourse(code) {
        return COURSES.find(course => course.code === code) || null;
    }

    function getWeeks(code) {
        const course = getCourse(code);
        const totalWeeks = course?.totalWeeks || 14;
        return Array.from({ length: totalWeeks }, (_, index) => index + 1);
    }

    function createDefaultState() {
        return {
            student: {
                name: "",
                id: ""
            },
            course: "",
            week: 1,
            submissionDate: localDateString(),
            assignmentTitle: "",
            uploadedPages: []
        };
    }

    function sanitizeFilenamePart(value, fallback) {
        const cleaned = String(value || "")
            .trim()
            .replace(/[\\/:*?"<>|]+/g, "")
            .replace(/\s+/g, "_");
        return cleaned || fallback;
    }

    function createFilename(studentID, course, week) {
        return EXPORT.filenamePattern
            .replace("{studentID}", sanitizeFilenamePart(studentID, "StudentID"))
            .replace("{course}", sanitizeFilenamePart(course, "Course"))
            .replace("{week}", String(week || 1).padStart(2, "0"));
    }

    function createSubmissionPath(course) {
        const coursePart = sanitizeFilenamePart(course, "Course");
        return coursePart;
    }

    function getSubmissionLink(course) {
        return SUBMISSION_LINKS[course] || "";
    }

    function getTotalPages(state) {
        return (Array.isArray(state?.uploadedPages) ? state.uploadedPages.length : 0) + 1;
    }

    function createQRPayload(state) {
        const course = getCourse(state?.course);
        return JSON.stringify({
            courseCode: state?.course || "",
            courseTitle: course?.title || "",
            studentID: state?.student?.id || "",
            studentName: state?.student?.name || "",
            week: Number(state?.week || 1),
            assignmentTitle: state?.assignmentTitle || state?.assignment || "",
            submissionDate: state?.submissionDate || "",
            totalPages: getTotalPages(state)
        });
    }

    window.AssignmentBuilderConfig = {
        UNIVERSITY,
        COURSES,
        SUBMISSION_LINKS,
        APP,
        PAGE,
        UPLOAD,
        EXPORT,
        QR,
        COVER,
        VALIDATION,
        STORAGE,
        localDateString,
        getCourse,
        getWeeks,
        createDefaultState,
        createFilename,
        createSubmissionPath,
        getSubmissionLink,
        getTotalPages,
        createQRPayload
    };
}());
