/* ESOGU Assignment Builder - PDF export */
(function () {
    "use strict";

    const {
        PAGE,
        createFilename,
        getTotalPages,
        getText,
        normalizeLanguage
    } = window.AssignmentBuilderConfig;
    const { coverPage } = window.AssignmentBuilderCover;
    const { uploadManager } = window.AssignmentBuilderUpload;

    class ExportManager {
        constructor() {
            this.progressBar = null;
            this.progressText = null;
            this.state = null;
            this.language = "en";
        }

        initialize() {
            this.progressBar = document.getElementById("progressBar");
            this.progressText = document.getElementById("progressText");
        }

        setState(state) {
            this.state = JSON.parse(JSON.stringify(state));
            this.language = normalizeLanguage(state?.language);
        }

        setLanguage(language) {
            this.language = normalizeLanguage(language);
        }

        text(key, values = {}) {
            return getText(key, this.language, values);
        }

        updateProgress(percent, message = "") {
            if (this.progressBar) {
                this.progressBar.value = Math.max(0, Math.min(100, percent));
            }
            if (this.progressText) {
                this.progressText.textContent = message || this.text("status.ready");
            }
        }

        getJSPDF() {
            const jsPDF = window.jspdf?.jsPDF || window.jsPDF;
            if (typeof jsPDF !== "function") {
                throw new Error("jsPDF library is not loaded.");
            }
            return jsPDF;
        }

        filename(state = this.state) {
            return createFilename(state.student.id, state.course, state.week);
        }

        async createPDF(state = this.state) {
            if (!state) {
                throw new Error("Application state is not ready.");
            }

            const jsPDF = this.getJSPDF();
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
                compress: true
            });

            this.updateProgress(5, this.text("export.renderingCover"));
            await this.addCover(pdf);

            const pages = uploadManager.getPages();
            const totalPages = getTotalPages(state);

            for (let index = 0; index < pages.length; index += 1) {
                pdf.addPage("a4", "portrait");
                this.updateProgress(
                    10 + Math.round((index / Math.max(pages.length, 1)) * 80),
                    this.text("export.renderingPage", {
                        page: index + 1,
                        total: pages.length
                    })
                );
                await this.addAssignmentPage(pdf, pages[index], index, totalPages, state);
            }

            this.updateProgress(100, this.text("export.pdfReady"));
            return pdf;
        }

        async addCover(pdf) {
            const canvas = await coverPage.exportCanvas();
            const image = canvas.toDataURL("image/png");
            pdf.addImage(image, "PNG", 0, 0, PAGE.widthMM, PAGE.heightMM, undefined, "FAST");
        }

        async addAssignmentPage(pdf, page, index, totalPages, state) {
            const canvas = await this.renderAssignmentCanvas(page, index, totalPages, state);
            const image = canvas.toDataURL("image/jpeg", 0.94);
            pdf.addImage(image, "JPEG", 0, 0, PAGE.widthMM, PAGE.heightMM, undefined, "FAST");
        }

        async renderAssignmentCanvas(page, index, totalPages, state) {
            const scale = PAGE.canvasScale;
            const canvas = document.createElement("canvas");
            canvas.width = Math.round(PAGE.widthMM * scale);
            canvas.height = Math.round(PAGE.heightMM * scale);

            const context = canvas.getContext("2d");
            context.fillStyle = "#ffffff";
            context.fillRect(0, 0, canvas.width, canvas.height);

            const image = page.image || await this.loadImage(page.src);
            const rotation = ((page.rotation || 0) % 360 + 360) % 360;
            const rotatedWidth = rotation === 90 || rotation === 270 ? image.naturalHeight : image.naturalWidth;
            const rotatedHeight = rotation === 90 || rotation === 270 ? image.naturalWidth : image.naturalHeight;

            const margin = PAGE.marginMM * scale;
            const footerHeight = PAGE.footerMM * scale;
            const availableWidth = canvas.width - (margin * 2);
            const availableHeight = canvas.height - (margin * 2) - footerHeight;
            const fitScale = Math.min(availableWidth / rotatedWidth, availableHeight / rotatedHeight);
            const drawWidth = image.naturalWidth * fitScale;
            const drawHeight = image.naturalHeight * fitScale;
            const centerX = canvas.width / 2;
            const centerY = margin + (availableHeight / 2);

            context.save();
            context.translate(centerX, centerY);
            context.rotate(rotation * Math.PI / 180);
            context.drawImage(image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
            context.restore();

            this.drawFooter(context, canvas, index, totalPages, state);
            return canvas;
        }

        drawFooter(context, canvas, index, totalPages, state) {
            const scale = PAGE.canvasScale;
            const left = PAGE.marginMM * scale;
            const right = canvas.width - left;
            const lineY = canvas.height - (PAGE.footerMM * scale);
            const textY = lineY + (5 * scale);
            const week = String(state.week || 1).padStart(2, "0");
            const pageNumber = index + 2;
            const language = normalizeLanguage(state.language);
            const weekLabel = getText("assignmentFooter.week", language);
            const pageLabel = getText("assignmentFooter.page", language);
            const ofLabel = getText("assignmentFooter.of", language);
            const pageText = ofLabel === "/"
                ? `${pageLabel} ${pageNumber} / ${totalPages}`
                : `${pageLabel} ${pageNumber} ${ofLabel} ${totalPages}`;
            const footer = `${state.course} | ${state.student.id} | ${weekLabel} ${week} | ${pageText}`;

            context.strokeStyle = "#d6dde8";
            context.lineWidth = 1;
            context.beginPath();
            context.moveTo(left, lineY);
            context.lineTo(right, lineY);
            context.stroke();

            context.fillStyle = "#56616f";
            context.font = `${Math.round(2.8 * scale)}px Arial, sans-serif`;
            context.textBaseline = "middle";
            context.fillText(footer, left, textY);
        }

        loadImage(src) {
            return new Promise((resolve, reject) => {
                const image = new Image();
                image.onload = () => resolve(image);
                image.onerror = reject;
                image.src = src;
            });
        }

        async saveBlob(blob, filename) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            link.remove();
            setTimeout(() => URL.revokeObjectURL(url), 60000);
            return { method: "download", filename };
        }

        async buildBlob(state = this.state) {
            this.setState(state);
            const pdf = await this.createPDF(state);
            const filename = this.filename(state);
            return {
                filename,
                pageCount: getTotalPages(state),
                blob: pdf.output("blob")
            };
        }

        async submitToOneDrive(state = this.state) {
            const result = await this.buildBlob(state);
            const week = String(state.week || 1).padStart(2, "0");
            const response = await fetch("api/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/pdf",
                    "X-MESH-Filename": result.filename,
                    "X-MESH-Course": state.course,
                    "X-MESH-Week": week,
                    "X-MESH-Assignment-Code": state.assignmentCode || "",
                    "X-MESH-Student-ID": state.student.id,
                    "X-MESH-Student-Name": encodeURIComponent(state.student.name),
                    "X-MESH-Assignment-Title": encodeURIComponent(state.assignmentTitle || ""),
                    "X-MESH-Submission-Date": state.submissionDate,
                    "X-MESH-Page-Count": String(result.pageCount)
                },
                body: result.blob
            });

            let payload = {};
            try {
                payload = await response.json();
            } catch (error) {
                payload = {};
            }

            if (!response.ok) {
                const message = payload.message || `OneDrive upload failed (${response.status}).`;
                const uploadError = new Error(message);
                uploadError.status = response.status;
                uploadError.payload = payload;
                uploadError.fallback = result;
                throw uploadError;
            }

            return {
                ...result,
                method: "onedrive",
                upload: payload
            };
        }

        async download(state = this.state) {
            const built = await this.buildBlob(state);
            const result = await this.saveBlob(built.blob, built.filename);
            return {
                ...result,
                pageCount: built.pageCount,
                blob: built.blob
            };
        }

        async buildCoverBlob(state = this.state) {
            this.setState(state);
            const jsPDF = this.getJSPDF();
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
                compress: true
            });
            await this.addCover(pdf);
            const filename = this.filename(state).replace(/\.pdf$/i, "_Cover.pdf");
            return {
                filename,
                blob: pdf.output("blob")
            };
        }

        async downloadCover(state = this.state) {
            const { filename, blob } = await this.buildCoverBlob(state);
            return this.saveBlob(blob, filename);
        }

        async printCover(state = this.state) {
            const { filename, blob } = await this.buildCoverBlob(state);
            const url = URL.createObjectURL(blob);

            try {
                const iframe = document.createElement("iframe");
                iframe.title = filename;
                iframe.style.position = "fixed";
                iframe.style.right = "0";
                iframe.style.bottom = "0";
                iframe.style.width = "0";
                iframe.style.height = "0";
                iframe.style.border = "0";
                iframe.src = url;
                document.body.appendChild(iframe);

                await new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => reject(new Error("Timed out while opening cover PDF for printing.")), 7000);
                    iframe.onload = () => {
                        clearTimeout(timeout);
                        resolve();
                    };
                });

                iframe.contentWindow?.focus();
                iframe.contentWindow?.print();

                setTimeout(() => {
                    iframe.remove();
                    URL.revokeObjectURL(url);
                }, 60000);

                return {
                    method: "print",
                    filename
                };
            } catch (error) {
                window.open(url, "_blank", "noopener,noreferrer");
                setTimeout(() => URL.revokeObjectURL(url), 60000);
                return {
                    method: "open",
                    filename,
                    warning: error.message
                };
            }
        }

        destroy() {
            this.state = null;
            this.updateProgress(0, this.text("status.ready"));
        }
    }

    window.AssignmentBuilderExport = {
        exportManager: new ExportManager(),
        ExportManager
    };
}());
