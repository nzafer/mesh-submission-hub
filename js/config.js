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
        logo: "img/esogu-logo.png",
        logoDataURI: window.AssignmentBuilderLogoDataURI || ""
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
        151816355: "",
        151813560: "",
        151816357: "",
        151815356: ""
    };

    const ASSIGNMENTS = [
        /*
         * Add only the assignments that are currently open for submission.
         * The number of assignments can vary by course. Course, assignment
         * number, title, and instructor are locked by the student link.
         */
        {
            code: "151816355-A01",
            course: "151816355",
            number: 1,
            titles: {
                en: "Assignment 1",
                tr: "Ödev 1"
            },
            instructor: "Naci ZAFER"
        },
        {
            code: "151813560-A01",
            course: "151813560",
            number: 1,
            titles: {
                en: "Assignment 1",
                tr: "Ödev 1"
            },
            instructor: "Sezcan YILMAZ"
        },
        {
            code: "151816357-A01",
            course: "151816357",
            number: 1,
            titles: {
                en: "Assignment 1",
                tr: "Ödev 1"
            },
            instructor: "Sezcan YILMAZ"
        },
        {
            code: "151815356-A01",
            course: "151815356",
            number: 1,
            titles: {
                en: "Assignment 1",
                tr: "Ödev 1"
            },
            instructor: "Naci ZAFER"
        }
    ];

    const APP = {
        name: "Mechanical Engineering Submission Hub (MESH)",
        displayName: "Mechanical Engineering Submission Hub (MESH)",
        version: "2.7.0",
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
        filenamePattern: "{studentID}_{course}_A{week}.pdf",
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
                submitting: "Submitting",
                exported: "Exported",
                exportError: "Export error",
                coverExported: "Cover exported",
                saveError: "Save error",
                reset: "Reset",
                submissionOpened: "Submission link opened"
            },
            auth: {
                checking: "Checking sign-in",
                local: "Offline/local mode",
                signedIn: "Signed in: {user}",
                signInRequired: "University Microsoft sign-in is required before OneDrive submission.",
                signIn: "Sign in",
                signOut: "Sign out"
            },
            fields: {
                studentInformation: "Student Information",
                studentName: "Student Name",
                studentNamePlaceholder: "Enter full name",
                studentID: "Student ID",
                studentIDPlaceholder: "12-digit ID",
                course: "Course",
                week: "Assignment No.",
                submissionDate: "Submission Date",
                assignmentTitle: "Assignment Title",
                assignmentTitlePlaceholder: "Assignment title",
                assignmentLocked: "Assignment link",
                assignmentLockedMessage: "{code} is locked to {course}, Assignment {week}.",
                assignmentManualMessage: "Open the assignment-specific MESH link provided by the instructor before submitting."
            },
            assignment: {
                defaultTitle: "{course} - Assignment {week}",
                missingLink: "Assignment link required"
            },
            course: {
                placeholder: "Select Course"
            },
            week: {
                option: "Assignment {week}"
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
                directOnly: "{path} - direct Azure upload",
                openTitle: "Submit the generated PDF directly to {path}",
                missingLinkTitle: "No file-request link is configured for {path}",
                missingLinkAlert: "No file-request link is configured for {path}. Add the link in js/config.js.",
                missingAssignment: "Open the assignment-specific MESH link provided by the instructor before submitting.",
                missingAssignmentTitle: "Submission is enabled only from an assignment-specific link.",
                openedMessage: "Upload the generated PDF to {path}.",
                uploadedMessage: "Submitted {filename} directly to {path}.",
                duplicate: "A submission with this student/course/assignment filename already exists in {path}. Ask the instructor before resubmitting.",
                directUnavailable: "Direct OneDrive upload is not enabled on this site yet. Saved {filename}; the upload-only Microsoft page was opened for {path}.",
                uploadError: "Unable to submit directly to OneDrive."
            },
            export: {
                renderingCover: "Rendering cover...",
                renderingPage: "Rendering page {page} / {total}...",
                pdfReady: "PDF ready.",
                savedWithLink: "Saved {filename} ({pageCount} pages). Use Submit to OneDrive for direct upload when Azure API settings are enabled.",
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
                    week: "Assignment No.",
                    assignmentTitle: "Assignment Title",
                    submissionDate: "Submission Date",
                    pages: "Assignment Pages"
                },
                messages: {
                    studentName: "Student name is required and must be {max} characters or fewer.",
                    studentID: "Student ID must contain exactly {length} digits.",
                    course: "Please select a course.",
                    week: "Please open or select a valid assignment.",
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
                week: "Assignment No.",
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
                week: "Assignment",
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
                submitting: "Teslim ediliyor",
                exported: "Dışa aktarıldı",
                exportError: "Dışa aktarma hatası",
                coverExported: "Kapak dışa aktarıldı",
                saveError: "Kayıt hatası",
                reset: "Sıfırlandı",
                submissionOpened: "Teslim bağlantısı açıldı"
            },
            auth: {
                checking: "Oturum denetleniyor",
                local: "Çevrimdışı/yerel kip",
                signedIn: "Oturum: {user}",
                signInRequired: "OneDrive teslimi için üniversite Microsoft oturumu gereklidir.",
                signIn: "Oturum aç",
                signOut: "Oturumu kapat"
            },
            fields: {
                studentInformation: "Öğrenci Bilgileri",
                studentName: "Öğrenci Adı Soyadı",
                studentNamePlaceholder: "Ad soyad giriniz",
                studentID: "Öğrenci Numarası",
                studentIDPlaceholder: "12 haneli numara",
                course: "Ders",
                week: "Ödev No.",
                submissionDate: "Teslim Tarihi",
                assignmentTitle: "Ödev Başlığı",
                assignmentTitlePlaceholder: "Ödev başlığı",
                assignmentLocked: "Ödev bağlantısı",
                assignmentLockedMessage: "{code}, {course} dersi Ödev {week} için kilitlendi.",
                assignmentManualMessage: "Teslim etmeden önce öğretim elemanı tarafından verilen ödeve özel MESH bağlantısını açınız."
            },
            assignment: {
                defaultTitle: "{course} - Ödev {week}",
                missingLink: "Ödev bağlantısı gerekli"
            },
            course: {
                placeholder: "Ders Seçiniz"
            },
            week: {
                option: "Ödev {week}"
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
                directOnly: "{path} - doğrudan Azure teslimi",
                openTitle: "Oluşturulan PDF dosyasını doğrudan {path} klasörüne teslim et",
                missingLinkTitle: "{path} için dosya isteği bağlantısı yapılandırılmamış",
                missingLinkAlert: "{path} için dosya isteği bağlantısı yapılandırılmamış. Bağlantıyı js/config.js içine ekleyin.",
                missingAssignment: "Teslim etmeden önce öğretim elemanı tarafından verilen ödeve özel MESH bağlantısını açınız.",
                missingAssignmentTitle: "Teslim yalnızca ödeve özel bağlantıdan açıldığında etkindir.",
                openedMessage: "Oluşturulan PDF dosyasını {path} klasörüne yükleyin.",
                uploadedMessage: "{filename} doğrudan {path} klasörüne teslim edildi.",
                duplicate: "{path} içinde bu öğrenci/ders/ödev dosya adıyla bir teslim zaten var. Yeniden teslim etmeden önce öğretim elemanına danışın.",
                directUnavailable: "Bu sitede doğrudan OneDrive teslimi henüz etkin değil. {filename} kaydedildi; {path} için yalnızca yükleme Microsoft sayfası açıldı.",
                uploadError: "OneDrive'a doğrudan teslim yapılamadı."
            },
            export: {
                renderingCover: "Kapak oluşturuluyor...",
                renderingPage: "Sayfa {page} / {total} oluşturuluyor...",
                pdfReady: "PDF hazır.",
                savedWithLink: "{filename} kaydedildi ({pageCount} sayfa). Azure API ayarları etkinse doğrudan yükleme için OneDrive'a Teslim Et düğmesini kullanın.",
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
                    week: "Ödev No.",
                    assignmentTitle: "Ödev Başlığı",
                    submissionDate: "Teslim Tarihi",
                    pages: "Ödev Sayfaları"
                },
                messages: {
                    studentName: "Öğrenci adı gereklidir ve en fazla {max} karakter olmalıdır.",
                    studentID: "Öğrenci numarası tam olarak {length} rakam içermelidir.",
                    course: "Lütfen bir ders seçiniz.",
                    week: "Lütfen geçerli bir ödev bağlantısı açınız veya geçerli bir ödev seçiniz.",
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
                week: "Ödev No.",
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
                week: "Ödev",
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

    function padWeek(week) {
        const numeric = Math.max(1, Number(week) || 1);
        return String(numeric).padStart(2, "0");
    }

    function normalizeAssignmentCode(value) {
        return String(value || "")
            .trim()
            .toUpperCase()
            .replace(/^ME(?=\d)/, "");
    }

    function createAssignmentCode(course, week) {
        const courseCode = normalizeCourseCode(course);
        return courseCode ? `${courseCode}-A${padWeek(week)}` : "";
    }

    function parseAssignmentCode(value) {
        const raw = normalizeAssignmentCode(value);
        const match = raw.match(/^(\d{9})[-_\s]?(?:A|ASSIGNMENT|ODEV|ÖDEV)?[-_\s]?0?(\d{1,2})$/);
        if (!match) {
            return null;
        }
        return {
            course: normalizeCourseCode(match[1]),
            week: Number(match[2]),
            code: createAssignmentCode(match[1], match[2])
        };
    }

    function assignmentRecordByCode(code) {
        const normalized = normalizeAssignmentCode(code);
        return ASSIGNMENTS.find(assignment => normalizeAssignmentCode(assignment.code) === normalized) || null;
    }

    function assignmentRecordByCourseNumber(course, week) {
        const courseCode = normalizeCourseCode(course);
        const number = Number(week || 1);
        return ASSIGNMENTS.find(assignment => (
            normalizeCourseCode(assignment.course) === courseCode &&
            Number(assignment.number || assignment.week || 1) === number
        )) || null;
    }

    function createAssignmentTitle(course, week, language = "en") {
        const courseObject = getCourse(course);
        const record = assignmentRecordByCourseNumber(course, week);
        const recordTitle = localizedValue(record?.titles, language) || record?.title;
        if (recordTitle) {
            return recordTitle;
        }
        return getText("assignment.defaultTitle", language, {
            course: getCourseTitle(courseObject, language),
            courseCode: courseObject?.code || normalizeCourseCode(course),
            week: padWeek(week)
        });
    }

    function getAssignment(source, language = "en") {
        const parsed = typeof source === "string"
            ? parseAssignmentCode(source)
            : {
                course: normalizeCourseCode(source?.course),
                week: Number(source?.number || source?.week || 1),
                code: source?.code ? normalizeAssignmentCode(source.code) : ""
            };
        const record = parsed?.code
            ? assignmentRecordByCode(parsed.code)
            : assignmentRecordByCourseNumber(parsed?.course, parsed?.week);
        if (!record) {
            return null;
        }

        const course = getCourse(record.course);
        if (!course) {
            return null;
        }

        const week = Number(record.number || record.week || 1);
        const code = normalizeAssignmentCode(record.code || createAssignmentCode(course.code, week));
        return {
            code,
            course: course.code,
            week,
            titles: {
                en: createAssignmentTitle(course.code, week, "en"),
                tr: createAssignmentTitle(course.code, week, "tr")
            },
            title: createAssignmentTitle(course.code, week, language),
            instructor: record.instructor || course.instructor || "",
            source: "configured"
        };
    }

    function getAssignmentFromURL(search = window.location.search, language = "en") {
        const params = new URLSearchParams(search || "");
        const assignment = params.get("assignment") || params.get("a") || params.get("code");
        if (assignment) {
            return getAssignment(assignment, language);
        }
        const course = params.get("course") || params.get("c");
        const week = params.get("assignmentNo") || params.get("number") || params.get("week") || params.get("w");
        if (course && week) {
            return getAssignment({ course, week }, language);
        }
        return null;
    }

    function listAssignments(language = "en") {
        return ASSIGNMENTS
            .map(assignment => getAssignment(assignment.code, language))
            .filter(Boolean);
    }

    function createAssignmentURL(baseURL, assignmentCode) {
        const url = new URL(baseURL || window.location.href, window.location.href);
        url.search = "";
        url.hash = "";
        url.searchParams.set("assignment", assignmentCode);
        return url.toString();
    }

    function createDefaultState() {
        return {
            student: {
                name: "",
                id: ""
            },
            course: "",
            week: 1,
            assignmentCode: "",
            submissionDate: localDateString(),
            assignmentTitle: "",
            instructor: "",
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
        const lines = [
            `Course Code: ${normalizeCourseCode(state?.course) || ""}`,
            `Assignment Code: ${state?.assignmentCode || createAssignmentCode(state?.course, state?.week) || ""}`,
            `Assignment No.: ${padWeek(state?.week || 1)}`,
            `Student ID: ${state?.student?.id || ""}`,
            `Student Name: ${state?.student?.name || ""}`,
            `Assignment Title: ${state?.assignmentTitle || state?.assignment || ""}`,
            `Submission Date: ${state?.submissionDate || ""}`,
            `Total Pages: ${getTotalPages(state)}`
        ];
        const signedInAccount = state?.auth?.userDetails || state?.auth?.userEmail || "";
        if (signedInAccount) {
            lines.push(`Signed-in Account: ${signedInAccount}`);
        }
        return lines.join("\n");
    }

    window.AssignmentBuilderConfig = {
        UNIVERSITY,
        COURSES,
        ASSIGNMENTS,
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
        normalizeAssignmentCode,
        getText,
        getCourseTitle,
        getUniversityValue,
        getCourse,
        getWeeks,
        padWeek,
        createAssignmentCode,
        getAssignment,
        getAssignmentFromURL,
        listAssignments,
        createAssignmentURL,
        createDefaultState,
        createFilename,
        createSubmissionPath,
        getSubmissionLink,
        getTotalPages,
        createQRPayload
    };
}());
