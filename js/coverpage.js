/* ESOGU Assignment Builder - cover page */
(function () {
    "use strict";

    const {
        UNIVERSITY,
        COVER,
        PAGE,
        QR,
        getCourse,
        getCourseTitle,
        getText,
        getUniversityValue,
        normalizeLanguage,
        getTotalPages,
        createQRPayload
    } = window.AssignmentBuilderConfig;
    const { qrManager } = window.AssignmentBuilderQR;

    function escapeHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    class CoverPageManager {
        constructor() {
            this.container = null;
            this.state = null;
        }

        initialize() {
            this.container = document.getElementById("coverPreview");
            if (!this.container) {
                throw new Error("coverPreview element not found.");
            }
        }

        language() {
            return normalizeLanguage(this.state?.language);
        }

        text(key, values = {}) {
            return getText(key, this.language(), values);
        }

        university(key) {
            return getUniversityValue(key, this.language());
        }

        course() {
            return getCourse(this.state?.course) || {
                code: "",
                title: "",
                titles: {},
                instructor: "",
                semester: "",
                academicYear: ""
            };
        }

        formattedWeek() {
            return String(this.state?.week || 1).padStart(2, "0");
        }

        semesterLabel(semester) {
            return semester ? getText(`semester.${semester}`, this.language()) : "";
        }

        formattedDate() {
            if (!this.state?.submissionDate) {
                return "";
            }
            const [year, month, day] = this.state.submissionDate.split("-").map(Number);
            return new Date(year, month - 1, day).toLocaleDateString(this.language() === "tr" ? "tr-TR" : "en-GB", {
                day: "2-digit",
                month: "long",
                year: "numeric"
            });
        }

        row(label, value) {
            return `
                <tr>
                    <th>${escapeHTML(label)}</th>
                    <td>${escapeHTML(value)}</td>
                </tr>
            `;
        }

        template() {
            const course = this.course();
            const student = this.state?.student || {};
            const totalPages = getTotalPages(this.state);

            return `
                <article class="cover-page">
                    <header class="cover-header">
                        <img class="cover-logo" src="${UNIVERSITY.logo}" alt="ESOGU Logo">
                        <div class="cover-university">
                            <h1>${escapeHTML(this.university("displayName"))}</h1>
                            <h2>${escapeHTML(this.university("faculty"))}</h2>
                            <h3>${escapeHTML(this.university("department"))}</h3>
                        </div>
                    </header>

                    <div class="cover-title">${escapeHTML(this.text("cover.title"))}</div>

                    <section class="cover-section">
                        <table class="cover-table">
                            ${this.row(this.text("cover.courseCode"), course.code)}
                            ${this.row(this.text("cover.courseTitle"), getCourseTitle(course, this.language()))}
                            ${this.row(this.text("cover.instructor"), course.instructor)}
                            ${this.row(this.text("cover.semester"), this.semesterLabel(course.semester))}
                            ${this.row(this.text("cover.academicYear"), course.academicYear)}
                        </table>
                    </section>

                    <section class="cover-section">
                        <table class="cover-table">
                            ${this.row(this.text("cover.studentName"), student.name)}
                            ${this.row(this.text("cover.studentID"), student.id)}
                            ${this.row(this.text("cover.assignmentTitle"), this.state?.assignmentTitle || "")}
                            ${this.row(this.text("cover.week"), this.formattedWeek())}
                            ${this.row(this.text("cover.submissionDate"), this.formattedDate())}
                            ${this.row(this.text("cover.totalPages"), totalPages)}
                        </table>
                    </section>

                    <section class="cover-bottom">
                        <div class="cover-signature">
                            <div class="signature-line"></div>
                            <div class="signature-label">${escapeHTML(this.text("cover.signature"))}</div>
                        </div>

                        <div id="qrCode" class="cover-qr" aria-label="Assignment QR code"></div>
                    </section>

                    <footer class="cover-footer">
                        <span>${escapeHTML(this.text("cover.footerLeft"))}</span>
                        <span>${escapeHTML(this.text("cover.footerRight"))}</span>
                    </footer>
                </article>
            `;
        }

        async update(state) {
            if (!this.container) {
                this.initialize();
            }
            this.state = JSON.parse(JSON.stringify(state));
            this.container.innerHTML = this.template();
            qrManager.generate(this.state);
        }

        exportElement() {
            return this.container?.firstElementChild || null;
        }

        async exportCanvas() {
            if (!this.state) {
                throw new Error("Cover page has not been rendered.");
            }

            const scale = PAGE.canvasScale;
            const canvas = document.createElement("canvas");
            canvas.width = Math.round(PAGE.widthMM * scale);
            canvas.height = Math.round(PAGE.heightMM * scale);

            const context = canvas.getContext("2d");
            context.fillStyle = "#ffffff";
            context.fillRect(0, 0, canvas.width, canvas.height);

            await this.drawCanvasCover(context, canvas, scale);
            return canvas;
        }

        async drawCanvasCover(context, canvas, scale) {
            const course = this.course();
            const student = this.state?.student || {};
            const totalPages = getTotalPages(this.state);
            const language = this.language();
            const margin = 18 * scale;
            const blue = "#0B4F8C";
            const dark = "#16324F";
            const muted = "#56616F";
            const border = "#CFD7E3";

            this.drawSealMark(context, margin, margin, 35 * scale);

            const headerX = margin + 47 * scale;
            context.fillStyle = dark;
            context.font = `700 ${6.6 * scale}px Arial, sans-serif`;
            context.fillText(this.university("name"), headerX, margin + 15 * scale);
            context.fillStyle = "#2D3F55";
            context.font = `600 ${3.9 * scale}px Arial, sans-serif`;
            context.fillText(this.university("faculty"), headerX, margin + 25 * scale);
            context.fillStyle = muted;
            context.fillText(this.university("department"), headerX, margin + 34 * scale);

            context.strokeStyle = blue;
            context.lineWidth = 1.4 * scale;
            context.beginPath();
            context.moveTo(margin, margin + 47 * scale);
            context.lineTo(canvas.width - margin, margin + 47 * scale);
            context.stroke();

            context.fillStyle = blue;
            context.font = `800 ${7 * scale}px Arial, sans-serif`;
            context.textAlign = "center";
            context.fillText(this.text("cover.title"), canvas.width / 2, margin + 72 * scale);
            context.textAlign = "left";

            let y = margin + 83 * scale;
            y = this.drawTable(context, scale, margin, y, [
                [this.text("cover.courseCode"), course.code],
                [this.text("cover.courseTitle"), getCourseTitle(course, language)],
                [this.text("cover.instructor"), course.instructor],
                [this.text("cover.semester"), this.semesterLabel(course.semester)],
                [this.text("cover.academicYear"), course.academicYear]
            ], border);

            y += 12 * scale;
            const studentTableBottom = this.drawTable(context, scale, margin, y, [
                [this.text("cover.studentName"), student.name],
                [this.text("cover.studentID"), student.id],
                [this.text("cover.assignmentTitle"), this.state?.assignmentTitle || ""],
                [this.text("cover.week"), this.formattedWeek()],
                [this.text("cover.submissionDate"), this.formattedDate()],
                [this.text("cover.totalPages"), totalPages]
            ], border);

            const footerLineY = canvas.height - 20 * scale;
            const bottomGap = 8 * scale;
            const qrSize = Math.min(30 * scale, footerLineY - studentTableBottom - (bottomGap * 2));
            const bottomTop = studentTableBottom + bottomGap;
            const signatureY = Math.min(bottomTop + 20 * scale, footerLineY - 12 * scale);

            context.strokeStyle = "#182333";
            context.lineWidth = 0.5 * scale;
            context.beginPath();
            context.moveTo(margin, signatureY);
            context.lineTo(margin + 82 * scale, signatureY);
            context.stroke();
            context.fillStyle = muted;
            context.font = `${3.1 * scale}px Arial, sans-serif`;
            context.textAlign = "center";
            context.fillText(this.text("cover.signature"), margin + 41 * scale, signatureY + 8 * scale);
            context.textAlign = "left";

            const qrCanvas = await this.createQRCanvas();
            if (qrCanvas) {
                const qrX = canvas.width - margin - qrSize;
                const qrY = Math.max(bottomTop, footerLineY - qrSize - 6 * scale);
                context.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);
            }

            context.strokeStyle = "#D6DDE8";
            context.beginPath();
            context.moveTo(margin, footerLineY);
            context.lineTo(canvas.width - margin, footerLineY);
            context.stroke();
            context.fillStyle = "#667485";
            context.font = `${2.7 * scale}px Arial, sans-serif`;
            context.fillText(this.text("cover.footerLeft"), margin, canvas.height - 12 * scale);
            context.textAlign = "right";
            context.fillText(this.text("cover.footerRight"), canvas.width - margin, canvas.height - 12 * scale);
            context.textAlign = "left";
        }

        drawSealMark(context, x, y, size) {
            const centerX = x + size / 2;
            const centerY = y + size / 2;
            const lineWidth = Math.max(1, size * 0.03);

            context.save();
            context.fillStyle = "#2F3339";
            context.beginPath();
            context.arc(centerX, centerY, size / 2, 0, Math.PI * 2);
            context.fill();

            context.strokeStyle = "#FFFFFF";
            context.lineWidth = lineWidth;
            context.beginPath();
            context.arc(centerX, centerY, size * 0.42, 0, Math.PI * 2);
            context.stroke();

            context.fillStyle = "#FFFFFF";
            context.font = `700 ${Math.max(7, size * 0.12)}px Arial, sans-serif`;
            context.textAlign = "center";
            context.textBaseline = "middle";
            context.fillText("ESOGU", centerX, y + size * 0.22);
            context.fillText("1970", centerX, y + size * 0.82);

            context.strokeStyle = "#FFFFFF";
            context.lineCap = "round";
            context.lineWidth = Math.max(1, size * 0.025);
            context.beginPath();
            context.moveTo(centerX, centerY + size * 0.21);
            context.lineTo(centerX, centerY - size * 0.20);
            context.stroke();

            [-1, 1].forEach(direction => {
                context.beginPath();
                context.moveTo(centerX, centerY - size * 0.03);
                context.quadraticCurveTo(
                    centerX + direction * size * 0.25,
                    centerY - size * 0.22,
                    centerX + direction * size * 0.28,
                    centerY + size * 0.05
                );
                context.quadraticCurveTo(
                    centerX + direction * size * 0.12,
                    centerY + size * 0.13,
                    centerX,
                    centerY - size * 0.03
                );
                context.stroke();
            });

            context.fillStyle = "#2F3339";
            context.beginPath();
            context.arc(centerX, centerY, size * 0.08, 0, Math.PI * 2);
            context.fill();
            context.restore();
        }

        drawTable(context, scale, x, y, rows, border) {
            const tableWidth = 174 * scale;
            const labelWidth = 68 * scale;
            const rowHeight = 10.5 * scale;

            rows.forEach(([label, value], index) => {
                const rowY = y + index * rowHeight;
                context.fillStyle = "#EDF4FB";
                context.fillRect(x, rowY, labelWidth, rowHeight);
                context.strokeStyle = border;
                context.lineWidth = 0.35 * scale;
                context.strokeRect(x, rowY, labelWidth, rowHeight);
                context.strokeRect(x + labelWidth, rowY, tableWidth - labelWidth, rowHeight);

                context.fillStyle = "#22334A";
                context.font = `700 ${3.2 * scale}px Arial, sans-serif`;
                context.fillText(String(label), x + 4 * scale, rowY + 6.6 * scale);

                context.fillStyle = "#121923";
                context.font = `${3.2 * scale}px Arial, sans-serif`;
                this.drawWrappedText(context, String(value ?? ""), x + labelWidth + 4 * scale, rowY + 6.6 * scale, tableWidth - labelWidth - 8 * scale, 4 * scale);
            });

            return y + rows.length * rowHeight;
        }

        drawWrappedText(context, text, x, y, maxWidth, lineHeight) {
            const words = text.split(/\s+/).filter(Boolean);
            let line = "";
            let offset = 0;

            for (const word of words) {
                const candidate = line ? `${line} ${word}` : word;
                if (context.measureText(candidate).width > maxWidth && line) {
                    context.fillText(line, x, y + offset);
                    line = word;
                    offset += lineHeight;
                } else {
                    line = candidate;
                }
            }

            if (line) {
                context.fillText(line, x, y + offset);
            }
        }

        createQRCanvas() {
            return new Promise(resolve => {
                if (typeof window.QRCode !== "function") {
                    resolve(null);
                    return;
                }

                const wrapper = document.createElement("div");
                wrapper.style.position = "fixed";
                wrapper.style.left = "-9999px";
                wrapper.style.top = "-9999px";
                document.body.appendChild(wrapper);

                new window.QRCode(wrapper, {
                    text: createQRPayload(this.state),
                    width: QR.width,
                    height: QR.height,
                    colorDark: QR.dark,
                    colorLight: QR.light,
                    correctLevel: window.QRCode.CorrectLevel[QR.correctLevel] || window.QRCode.CorrectLevel.L
                });

                setTimeout(() => {
                    const qrCanvas = wrapper.querySelector("canvas");
                    const qrImage = wrapper.querySelector("img");
                    if (qrCanvas) {
                        wrapper.remove();
                        resolve(qrCanvas);
                        return;
                    }
                    if (qrImage?.complete) {
                        const canvas = document.createElement("canvas");
                        canvas.width = QR.width;
                        canvas.height = QR.height;
                        canvas.getContext("2d").drawImage(qrImage, 0, 0, QR.width, QR.height);
                        wrapper.remove();
                        resolve(canvas);
                        return;
                    }
                    wrapper.remove();
                    resolve(null);
                }, 0);
            });
        }

        async downloadPNG(filename = "cover.png") {
            const canvas = await this.exportCanvas();
            const link = document.createElement("a");
            link.href = canvas.toDataURL("image/png");
            link.download = filename;
            link.click();
        }

        destroy() {
            if (this.container) {
                this.container.innerHTML = "";
            }
            this.state = null;
        }
    }

    window.AssignmentBuilderCover = {
        coverPage: new CoverPageManager(),
        CoverPageManager
    };
}());
