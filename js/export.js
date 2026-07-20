/* ESOGU Assignment Builder - PDF export */
(function () {
    "use strict";

    const {
        PAGE,
        createFilename,
        getTotalPages
    } = window.AssignmentBuilderConfig;
    const { coverPage } = window.AssignmentBuilderCover;
    const { uploadManager } = window.AssignmentBuilderUpload;

    class ExportManager {
        constructor() {
            this.progressBar = null;
            this.progressText = null;
            this.state = null;
        }

        initialize() {
            this.progressBar = document.getElementById("progressBar");
            this.progressText = document.getElementById("progressText");
        }

        setState(state) {
            this.state = JSON.parse(JSON.stringify(state));
        }

        updateProgress(percent, message = "") {
            if (this.progressBar) {
                this.progressBar.value = Math.max(0, Math.min(100, percent));
            }
            if (this.progressText) {
                this.progressText.textContent = message || "Ready";
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

            this.updateProgress(5, "Rendering cover...");
            await this.addCover(pdf);

            const pages = uploadManager.getPages();
            const totalPages = getTotalPages(state);

            for (let index = 0; index < pages.length; index += 1) {
                pdf.addPage("a4", "portrait");
                this.updateProgress(
                    10 + Math.round((index / Math.max(pages.length, 1)) * 80),
                    `Rendering page ${index + 1} / ${pages.length}...`
                );
                await this.addAssignmentPage(pdf, pages[index], index, totalPages, state);
            }

            this.updateProgress(100, "PDF ready.");
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
            const footer = `${state.course} | ${state.student.id} | Week ${week} | Page ${pageNumber} of ${totalPages}`;

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

        async download(state = this.state) {
            this.setState(state);
            const pdf = await this.createPDF(state);
            const filename = this.filename(state);
            const blob = pdf.output("blob");
            const result = await this.saveBlob(blob, filename);
            return {
                ...result,
                pageCount: getTotalPages(state),
                blob
            };
        }

        async downloadCover(state = this.state) {
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
            const blob = pdf.output("blob");
            return this.saveBlob(blob, filename);
        }

        destroy() {
            this.state = null;
            this.updateProgress(0, "Ready");
        }
    }

    window.AssignmentBuilderExport = {
        exportManager: new ExportManager(),
        ExportManager
    };
}());
