/* ESOGU Assignment Builder - configuration */
(function () {
    "use strict";

    const UNIVERSITY = {
        name: {
            en: "Eskisehir Osmangazi University",
            tr: "Eskişehir Osmangazi Üniversitesi"
        },
        displayName: {
            en: "Eskişehir Osmangazi Üniversitesi",
            tr: "Eskişehir Osmangazi Üniversitesi"
        },
        faculty: {
            en: "Faculty of Engineering and Architecture",
            tr: "Mühendislik ve Mimarlık Fakültesi"
        },
        department: {
            en: "Department of Mechanical Engineering",
            tr: "Makine Mühendisliği Bölümü"
        },
        logo: "img/esogu-logo.png"
    };

    const COURSES = [
        {
            code: "151816355",
            title: "Control Systems",
            titles: {
                en: "Control Systems",
                tr: "Kontrol Sistemleri"
            },
            instructor: "Naci ZAFER",
            semester: "Spring",
            academicYear: "2026-2027",
            totalWeeks: 14
        },
        {
            code: "151813560",
            title: "Dynamics",
            titles: {
                en: "Dynamics",
                tr: "Dinamik"
            },
            instructor: "Sezcan YILMAZ",
            semester: "Fall",
            academicYear: "2026-2027",
            totalWeeks: 14
        },
        {
            code: "151816357",
            title: "Makine Dinamiği",
            titles: {
                en: "Makine Dinamiği",
                tr: "Makine Dinamiği"
            },
            instructor: "Sezcan YILMAZ",
            semester: "Fall",
            academicYear: "2026-2027",
            totalWeeks: 14
        },
        {
            code: "151815356",
            title: "Mechanism Design",
            titles: {
                en: "Mechanism Design",
                tr: "Mekanizma Tekniği"
            },
            instructor: "Naci ZAFER",
            semester: "Fall",
            academicYear: "2026-2027",
            totalWeeks: 14
        }
    ];

    const COURSE_CODE_ALIASES = {};

    const SUBMISSION_LINKS = {
        /*
         * Paste Microsoft OneDrive/SharePoint "Request files" links here.
         * Create one upload-only request link for each course folder.
         * Example:
         * 151815356: "https://..."
         */
        151816355: "https://ogrencioguedutr-my.sharepoint.com/:f:/g/personal/ab596_ogu_edu_tr/IgDRKYrblJ9fQJXSx6-7-zYmAT9t8ZW_XWU_nvKXJlizuZ8",
        151813560: "https://ogrencioguedutr-my.sharepoint.com/:f:/g/personal/ab596_ogu_edu_tr/IgBhPLanP_P_TLoiE4YbDqAuAYIa6BcUFQqxcYLtm6FkltU",
        151816357: "https://ogrencioguedutr-my.sharepoint.com/:f:/g/personal/ab596_ogu_edu_tr/IgDQhu7d2TUFRqmCtZ7nlEg-AZvfqTzMu1Flkeq3QnLK5wU",
        151815356: "https://ogrencioguedutr-my.sharepoint.com/:f:/g/personal/ab596_ogu_edu_tr/IgARls8Dj0PbR7dPgEokueGbAS8Ns__V46r2ytNaQ-tgRkQ"
    };

    const APP = {
        name: "Mechanical Engineering Submission Hub (MESH)",
        displayName: "Mechanical Engineering Submission Hub (MESH)",
        version: "2.5.1",
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
        light: "#FFFFFF",
        correctLevel: "L"
    };

    const COVER = {
        title: "ASSIGNMENT COVER PAGE",
        signatureLabel: "Student Signature",
        pageCountLabel: "Total PDF Pages",
        footerLeft: "Generated offline with Mechanical Engineering Submission Hub (MESH)",
        footerRight: "Department of Mechanical Engineering"
    };

    const I18N = {
        en: {
            document: {
                title: "Mechanical Engineering Submission Hub (MESH)",
                description: "Offline assignment PDF submission hub for ESOGU Mechanical Engineering"
            },
            language: {
                toggle: "TR",
                title: "Switch to Turkish"
            },
            header: {
                department: "Department of Mechanical Engineering"
            },
            app: {
                version: "Version {version}"
            },
            status: {
                ready: "Ready",
                exporting: "Exporting",
                exported: "Exported",
                exportError: "Export error",
                coverExported: "Cover exported",
                saveError: "Save error",
                reset: "Reset",
                submissionOpened: "Submission link opened"
            },
            fields: {
                studentInformation: "Student Information",
                studentName: "Student Name",
                studentNamePlaceholder: "Enter full name",
                studentID: "Student ID",
                studentIDPlaceholder: "12-digit ID",
                course: "Course",
                week: "Week",
                submissionDate: "Submission Date",
                assignmentTitle: "Assignment Title",
                assignmentTitlePlaceholder: "Assignment title"
            },
            course: {
                placeholder: "Select Course"
            },
            week: {
                option: "Week {week}"
            },
            project: {
                validation: "Validation",
                project: "Project",
                application: "Application",
                mode: "Mode",
                offline: "Offline",
                output: "Output",
                mergedPDF: "Merged PDF",
                submitTo: "Submit To",
                qr: "QR",
                enabled: "Enabled"
            },
            upload: {
                title: "Assignment Pages",
                dropTitle: "Drop Assignment Pages Here",
                dropSubtitle: "JPEG, PNG, WEBP, or PDF",
                selectImages: "Select Images",
                selectPDF: "Select PDF",
                clearPages: "Clear Pages",
                uploadedPages: "Uploaded Pages",
                estimatedPages: "Estimated PDF Pages",
                imageCount: "Page Images",
                progress: "Progress",
                pages: "Pages",
                noPagesSelected: "No pages selected",
                noSupportedImages: "No supported images selected.",
                loadingImages: "Loading images...",
                imagesLoaded: "Images loaded.",
                noSupportedPDF: "No supported PDF selected.",
                pdfLibraryMissing: "PDF.js library is not loaded.",
                readingPDF: "Reading PDF...",
                pdfPage: "PDF page {page} / {total}",
                pdfLoaded: "PDF loaded.",
                pageSingular: "Page",
                pagePlural: "Pages",
                pageIndex: "Page",
                moveUp: "Up",
                moveDown: "Down",
                rotate: "Rotate",
                delete: "Delete",
                moveUpTitle: "Move page up",
                moveDownTitle: "Move page down",
                rotateTitle: "Rotate page",
                deleteTitle: "Delete page",
                dragTitle: "Drag to reorder"
            },
            preview: {
                title: "Live Cover Preview",
                paperSize: "Paper Size",
                coverPage: "Cover Page",
                included: "Included",
                qrCode: "QR Code",
                automatic: "Automatic",
                output: "Output"
            },
            toolbar: {
                printCover: "Print Cover",
                exportCover: "Export Cover",
                exportAssignment: "Export Assignment PDF",
                submit: "Submit to OneDrive",
                reset: "Reset"
            },
            submission: {
                selectCourse: "Select a course",
                selectCourseTitle: "Select a course first.",
                missingLink: "{path} - link not configured",
                openTitle: "Open upload-only submission link for {path}",
                missingLinkTitle: "No file-request link is configured for {path}",
                missingLinkAlert: "No file-request link is configured for {path}. Add the link in js/config.js.",
                openedMessage: "Upload the generated PDF to {path}."
            },
            export: {
                renderingCover: "Rendering cover...",
                renderingPage: "Rendering page {page} / {total}...",
                pdfReady: "PDF ready.",
                savedWithLink: "Saved {filename} ({pageCount} pages). Open the submission link and upload this PDF.",
                savedNoLink: "Saved {filename} ({pageCount} pages). Ask the instructor to add the course submission link.",
                unablePDF: "Unable to export PDF.",
                unableCover: "Unable to export cover."
            },
            validation: {
                ok: "OK",
                needs: "Needs",
                labels: {
                    studentName: "Student Name",
                    studentID: "Student ID",
                    course: "Course",
                    week: "Week",
                    assignmentTitle: "Assignment Title",
                    submissionDate: "Submission Date",
                    pages: "Assignment Pages"
                },
                messages: {
                    studentName: "Student name is required and must be {max} characters or fewer.",
                    studentID: "Student ID must contain exactly {length} digits.",
                    course: "Please select a course.",
                    week: "Please select a valid week.",
                    assignmentTitle: "Assignment title is required and must be {max} characters or fewer.",
                    submissionDate: "Submission date is missing.",
                    pages: "Upload at least one assignment page."
                }
            },
            cover: {
                title: "ASSIGNMENT COVER PAGE",
                courseCode: "Course Code",
                courseTitle: "Course Title",
                instructor: "Instructor",
                semester: "Semester",
                academicYear: "Academic Year",
                studentName: "Student Name",
                studentID: "Student ID",
                assignmentTitle: "Assignment Title",
                week: "Week",
                submissionDate: "Submission Date",
                totalPages: "Total PDF Pages",
                signature: "Student Signature",
                footerLeft: "Generated offline with Mechanical Engineering Submission Hub (MESH)",
                footerRight: "Department of Mechanical Engineering",
                qrUnavailable: "QR unavailable"
            },
            semester: {
                Fall: "Fall",
                Spring: "Spring"
            },
            assignmentFooter: {
                week: "Week",
                page: "Page",
                of: "of"
            },
            dialogs: {
                resetConfirm: "Clear saved information and uploaded pages?"
            }
        },
        tr: {
            document: {
                title: "Mechanical Engineering Submission Hub (MESH)",
                description: "ESOGÜ Makine Mühendisliği için çevrimdışı ödev PDF teslim merkezi"
            },
            language: {
                toggle: "EN",
                title: "İngilizce göster"
            },
            header: {
                department: "Makine Mühendisliği Bölümü"
            },
            app: {
                version: "Sürüm {version}"
            },
            status: {
                ready: "Hazır",
                exporting: "Dışa aktarılıyor",
                exported: "Dışa aktarıldı",
                exportError: "Dışa aktarma hatası",
                coverExported: "Kapak dışa aktarıldı",
                saveError: "Kayıt hatası",
                reset: "Sıfırlandı",
                submissionOpened: "Teslim bağlantısı açıldı"
            },
            fields: {
                studentInformation: "Öğrenci Bilgileri",
                studentName: "Öğrenci Adı Soyadı",
                studentNamePlaceholder: "Ad soyad giriniz",
                studentID: "Öğrenci Numarası",
                studentIDPlaceholder: "12 haneli numara",
                course: "Ders",
                week: "Hafta",
                submissionDate: "Teslim Tarihi",
                assignmentTitle: "Ödev Başlığı",
                assignmentTitlePlaceholder: "Ödev başlığı"
            },
            course: {
                placeholder: "Ders Seçiniz"
            },
            week: {
                option: "Hafta {week}"
            },
            project: {
                validation: "Doğrulama",
                project: "Proje",
                application: "Uygulama",
                mode: "Çalışma Kipi",
                offline: "Çevrimdışı",
                output: "Çıktı",
                mergedPDF: "Birleştirilmiş PDF",
                submitTo: "Teslim Yeri",
                qr: "QR",
                enabled: "Açık"
            },
            upload: {
                title: "Ödev Sayfaları",
                dropTitle: "Ödev Sayfalarını Buraya Bırakın",
                dropSubtitle: "JPEG, PNG, WEBP veya PDF",
                selectImages: "Görsel Seç",
                selectPDF: "PDF Seç",
                clearPages: "Sayfaları Temizle",
                uploadedPages: "Yüklenen Sayfalar",
                estimatedPages: "Tahmini PDF Sayfası",
                imageCount: "Sayfa Görselleri",
                progress: "İlerleme",
                pages: "Sayfalar",
                noPagesSelected: "Seçili sayfa yok",
                noSupportedImages: "Desteklenen görsel seçilmedi.",
                loadingImages: "Görseller yükleniyor...",
                imagesLoaded: "Görseller yüklendi.",
                noSupportedPDF: "Desteklenen PDF seçilmedi.",
                pdfLibraryMissing: "PDF.js kitaplığı yüklenmedi.",
                readingPDF: "PDF okunuyor...",
                pdfPage: "PDF sayfası {page} / {total}",
                pdfLoaded: "PDF yüklendi.",
                pageSingular: "Sayfa",
                pagePlural: "Sayfa",
                pageIndex: "Sayfa",
                moveUp: "Yukarı",
                moveDown: "Aşağı",
                rotate: "Döndür",
                delete: "Sil",
                moveUpTitle: "Sayfayı yukarı taşı",
                moveDownTitle: "Sayfayı aşağı taşı",
                rotateTitle: "Sayfayı döndür",
                deleteTitle: "Sayfayı sil",
                dragTitle: "Sıralamak için sürükleyin"
            },
            preview: {
                title: "Canlı Kapak Önizlemesi",
                paperSize: "Kağıt Boyutu",
                coverPage: "Kapak Sayfası",
                included: "Dahil",
                qrCode: "QR Kodu",
                automatic: "Otomatik",
                output: "Çıktı"
            },
            toolbar: {
                printCover: "Kapağı Yazdır",
                exportCover: "Kapağı Dışa Aktar",
                exportAssignment: "Ödev PDF'sini Dışa Aktar",
                submit: "OneDrive'a Teslim Et",
                reset: "Sıfırla"
            },
            submission: {
                selectCourse: "Ders seçiniz",
                selectCourseTitle: "Önce ders seçiniz.",
                missingLink: "{path} - bağlantı yapılandırılmamış",
                openTitle: "{path} için yalnızca yükleme teslim bağlantısını aç",
                missingLinkTitle: "{path} için dosya isteği bağlantısı yapılandırılmamış",
                missingLinkAlert: "{path} için dosya isteği bağlantısı yapılandırılmamış. Bağlantıyı js/config.js içine ekleyin.",
                openedMessage: "Oluşturulan PDF dosyasını {path} klasörüne yükleyin."
            },
            export: {
                renderingCover: "Kapak oluşturuluyor...",
                renderingPage: "Sayfa {page} / {total} oluşturuluyor...",
                pdfReady: "PDF hazır.",
                savedWithLink: "{filename} kaydedildi ({pageCount} sayfa). Teslim bağlantısını açıp bu PDF dosyasını yükleyin.",
                savedNoLink: "{filename} kaydedildi ({pageCount} sayfa). Ders teslim bağlantısını eklemesi için öğretim elemanına başvurun.",
                unablePDF: "PDF dışa aktarılamadı.",
                unableCover: "Kapak dışa aktarılamadı."
            },
            validation: {
                ok: "Tamam",
                needs: "Gerekli",
                labels: {
                    studentName: "Öğrenci Adı Soyadı",
                    studentID: "Öğrenci Numarası",
                    course: "Ders",
                    week: "Hafta",
                    assignmentTitle: "Ödev Başlığı",
                    submissionDate: "Teslim Tarihi",
                    pages: "Ödev Sayfaları"
                },
                messages: {
                    studentName: "Öğrenci adı gereklidir ve en fazla {max} karakter olmalıdır.",
                    studentID: "Öğrenci numarası tam olarak {length} rakam içermelidir.",
                    course: "Lütfen bir ders seçiniz.",
                    week: "Lütfen geçerli bir hafta seçiniz.",
                    assignmentTitle: "Ödev başlığı gereklidir ve en fazla {max} karakter olmalıdır.",
                    submissionDate: "Teslim tarihi eksik.",
                    pages: "En az bir ödev sayfası yükleyiniz."
                }
            },
            cover: {
                title: "ÖDEV KAPAK SAYFASI",
                courseCode: "Ders Kodu",
                courseTitle: "Ders Adı",
                instructor: "Öğretim Elemanı",
                semester: "Dönem",
                academicYear: "Akademik Yıl",
                studentName: "Öğrenci Adı Soyadı",
                studentID: "Öğrenci Numarası",
                assignmentTitle: "Ödev Başlığı",
                week: "Hafta",
                submissionDate: "Teslim Tarihi",
                totalPages: "Toplam PDF Sayfası",
                signature: "Öğrenci İmzası",
                footerLeft: "Mechanical Engineering Submission Hub (MESH) ile çevrimdışı oluşturuldu",
                footerRight: "Makine Mühendisliği Bölümü",
                qrUnavailable: "QR kullanılamıyor"
            },
            semester: {
                Fall: "Güz",
                Spring: "Bahar"
            },
            assignmentFooter: {
                week: "Hafta",
                page: "Sayfa",
                of: "/"
            },
            dialogs: {
                resetConfirm: "Kayıtlı bilgiler ve yüklenen sayfalar temizlensin mi?"
            }
        }
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

    function normalizeLanguage(language) {
        return language === "tr" ? "tr" : "en";
    }

    function normalizeCourseCode(code) {
        const raw = String(code || "");
        const withoutPrefix = raw.replace(/^ME/i, "");
        return COURSE_CODE_ALIASES[raw] || COURSE_CODE_ALIASES[withoutPrefix] || withoutPrefix;
    }

    function readPath(source, key) {
        return key.split(".").reduce((value, part) => value?.[part], source);
    }

    function interpolate(template, values = {}) {
        return String(template ?? "").replace(/\{(\w+)\}/g, (_, key) => (
            values[key] ?? ""
        ));
    }

    function getText(key, language = "en", values = {}) {
        const normalized = normalizeLanguage(language);
        const translated = readPath(I18N[normalized], key);
        const fallback = readPath(I18N.en, key);
        return interpolate(translated ?? fallback ?? key, values);
    }

    function localizedValue(value, language = "en") {
        if (!value || typeof value !== "object") {
            return value || "";
        }
        const normalized = normalizeLanguage(language);
        return value[normalized] || value.en || "";
    }

    function getCourse(code) {
        const normalizedCode = normalizeCourseCode(code);
        return COURSES.find(course => course.code === normalizedCode) || null;
    }

    function getCourseTitle(courseOrCode, language = "en") {
        const course = typeof courseOrCode === "string" ? getCourse(courseOrCode) : courseOrCode;
        if (!course) {
            return "";
        }
        return localizedValue(course.titles, language) || course.title || "";
    }

    function getUniversityValue(key, language = "en") {
        return localizedValue(UNIVERSITY[key], language);
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
            uploadedPages: [],
            language: "en"
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
        const coursePart = sanitizeFilenamePart(normalizeCourseCode(course), "Course");
        return coursePart;
    }

    function getSubmissionLink(course) {
        return SUBMISSION_LINKS[normalizeCourseCode(course)] || "";
    }

    function getTotalPages(state) {
        return (Array.isArray(state?.uploadedPages) ? state.uploadedPages.length : 0) + 1;
    }

    function createQRPayload(state) {
        return [
            `Course Code: ${normalizeCourseCode(state?.course) || ""}`,
            `Student ID: ${state?.student?.id || ""}`,
            `Student Name: ${state?.student?.name || ""}`,
            `Week: ${Number(state?.week || 1)}`,
            `Assignment Title: ${state?.assignmentTitle || state?.assignment || ""}`,
            `Submission Date: ${state?.submissionDate || ""}`,
            `Total Pages: ${getTotalPages(state)}`
        ].join("\n");
    }

    window.AssignmentBuilderConfig = {
        UNIVERSITY,
        COURSES,
        COURSE_CODE_ALIASES,
        SUBMISSION_LINKS,
        APP,
        PAGE,
        UPLOAD,
        EXPORT,
        QR,
        COVER,
        VALIDATION,
        STORAGE,
        I18N,
        localDateString,
        normalizeLanguage,
        normalizeCourseCode,
        getText,
        getCourseTitle,
        getUniversityValue,
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
