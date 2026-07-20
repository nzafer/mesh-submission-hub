/* ESOGU Assignment Builder - upload and page management */
(function () {
    "use strict";

    const { validator } = window.AssignmentBuilderValidation;
    const { UPLOAD, getText, normalizeLanguage } = window.AssignmentBuilderConfig;

    class UploadManager {
        constructor() {
            this.pages = [];
            this.sortable = null;
            this.dropZone = null;
            this.imageInput = null;
            this.pdfInput = null;
            this.selectImages = null;
            this.selectPDF = null;
            this.clearPages = null;
            this.thumbnailContainer = null;
            this.pageTemplate = null;
            this.uploadedPageCount = null;
            this.estimatedPages = null;
            this.imageCount = null;
            this.pageCounterBadge = null;
            this.progressBar = null;
            this.progressText = null;
            this.language = "en";
        }

        initialize() {
            this.cacheDOM();
            this.configurePDFJS();
            this.bindEvents();
            this.enableSorting();
            this.updateCounters();
        }

        setLanguage(language) {
            this.language = normalizeLanguage(language);
            this.render();
        }

        text(key, values = {}) {
            return getText(`upload.${key}`, this.language, values);
        }

        statusText(key, values = {}) {
            return getText(`status.${key}`, this.language, values);
        }

        cacheDOM() {
            this.dropZone = document.getElementById("dropZone");
            this.imageInput = document.getElementById("imageInput");
            this.pdfInput = document.getElementById("pdfInput");
            this.selectImages = document.getElementById("selectImages");
            this.selectPDF = document.getElementById("selectPDF");
            this.clearPages = document.getElementById("clearPages");
            this.thumbnailContainer = document.getElementById("thumbnailContainer");
            this.pageTemplate = document.getElementById("pageTemplate");
            this.uploadedPageCount = document.getElementById("uploadedPageCount");
            this.estimatedPages = document.getElementById("estimatedPages");
            this.imageCount = document.getElementById("imageCount");
            this.pageCounterBadge = document.getElementById("pageCounterBadge");
            this.progressBar = document.getElementById("progressBar");
            this.progressText = document.getElementById("progressText");
        }

        configurePDFJS() {
            if (window.pdfjsLib) {
                window.pdfjsLib.GlobalWorkerOptions.workerSrc = "libs/pdf.worker.min.js";
            }
        }

        bindEvents() {
            this.selectImages?.addEventListener("click", () => this.openImages());
            this.selectPDF?.addEventListener("click", () => this.openPDF());
            this.clearPages?.addEventListener("click", () => this.clear());
            this.dropZone?.addEventListener("click", () => this.openImages());

            this.imageInput?.addEventListener("change", event => {
                this.loadImages(Array.from(event.target.files || []));
            });

            this.pdfInput?.addEventListener("change", async event => {
                const files = Array.from(event.target.files || []);
                for (const file of files) {
                    await this.loadPDF(file);
                }
            });

            ["dragenter", "dragover"].forEach(type => {
                this.dropZone?.addEventListener(type, event => {
                    event.preventDefault();
                    this.dropZone.classList.add("drag-over");
                });
            });

            ["dragleave", "drop"].forEach(type => {
                this.dropZone?.addEventListener(type, event => {
                    event.preventDefault();
                    this.dropZone.classList.remove("drag-over");
                });
            });

            this.dropZone?.addEventListener("drop", event => this.handleDrop(event));
        }

        openImages() {
            if (!this.imageInput) {
                return;
            }
            this.imageInput.value = "";
            this.imageInput.click();
        }

        openPDF() {
            if (!this.pdfInput) {
                return;
            }
            this.pdfInput.value = "";
            this.pdfInput.click();
        }

        async handleDrop(event) {
            const files = Array.from(event.dataTransfer?.files || []);
            const images = files.filter(file => validator.isValidImage(file));
            const pdfs = files.filter(file => validator.isValidPDF(file));

            if (images.length) {
                await this.loadImages(images);
            }

            for (const pdf of pdfs) {
                await this.loadPDF(pdf);
            }
        }

        async loadImages(files) {
            const validFiles = files.filter(file => validator.isValidImage(file));
            if (!validFiles.length) {
                this.updateProgress(0, this.text("noSupportedImages"));
                return;
            }

            const remainingSlots = Math.max(UPLOAD.maxFiles - this.pages.length, 0);
            const filesToLoad = validFiles.slice(0, remainingSlots);
            this.updateProgress(0, this.text("loadingImages"));

            for (let index = 0; index < filesToLoad.length; index += 1) {
                const file = filesToLoad[index];
                const image = await this.readImage(file);
                this.pages.push({
                    id: crypto.randomUUID(),
                    name: file.name,
                    type: file.type || "image/jpeg",
                    src: image.src,
                    image,
                    width: image.naturalWidth,
                    height: image.naturalHeight,
                    rotation: 0,
                    size: file.size,
                    created: Date.now()
                });
                this.updateProgress(((index + 1) / filesToLoad.length) * 100, `${index + 1} / ${filesToLoad.length}`);
            }

            this.render();
            this.notifyChanged();
            this.updateProgress(100, this.text("imagesLoaded"));
        }

        async loadPDF(file) {
            if (!validator.isValidPDF(file)) {
                this.updateProgress(0, this.text("noSupportedPDF"));
                return;
            }

            if (!window.pdfjsLib) {
                throw new Error(this.text("pdfLibraryMissing"));
            }

            this.updateProgress(0, this.text("readingPDF"));
            const arrayBuffer = await file.arrayBuffer();
            let pdf;

            try {
                pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            } catch (error) {
                console.warn("PDF worker failed; retrying without a worker.", error);
                pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer, disableWorker: true }).promise;
            }

            for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
                const pdfPage = await pdf.getPage(pageNumber);
                const viewport = pdfPage.getViewport({ scale: 2 });
                const canvas = document.createElement("canvas");
                canvas.width = Math.ceil(viewport.width);
                canvas.height = Math.ceil(viewport.height);

                await pdfPage.render({
                    canvasContext: canvas.getContext("2d"),
                    viewport
                }).promise;

                const image = await this.canvasToImage(canvas);
                this.pages.push({
                    id: crypto.randomUUID(),
                    name: `${file.name} - Page ${pageNumber}`,
                    type: "application/pdf",
                    src: image.src,
                    image,
                    width: image.naturalWidth,
                    height: image.naturalHeight,
                    rotation: 0,
                    size: file.size,
                    created: Date.now()
                });
                this.updateProgress((pageNumber / pdf.numPages) * 100, this.text("pdfPage", {
                    page: pageNumber,
                    total: pdf.numPages
                }));
            }

            this.render();
            this.notifyChanged();
            this.updateProgress(100, this.text("pdfLoaded"));
        }

        readImage(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                    const image = new Image();
                    image.onload = () => resolve(image);
                    image.onerror = reject;
                    image.src = reader.result;
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        }

        canvasToImage(canvas) {
            return new Promise(resolve => {
                const image = new Image();
                image.onload = () => resolve(image);
                image.src = canvas.toDataURL("image/jpeg", 0.94);
            });
        }

        updateProgress(percent, text = "") {
            if (this.progressBar) {
                this.progressBar.value = Math.max(0, Math.min(100, percent));
            }
            if (this.progressText) {
                this.progressText.textContent = text || this.statusText("ready");
            }
        }

        render() {
            if (!this.thumbnailContainer) {
                return;
            }

            this.thumbnailContainer.innerHTML = "";

            if (!this.pages.length) {
                const empty = document.createElement("div");
                empty.className = "empty-pages";
                empty.textContent = this.text("noPagesSelected");
                this.thumbnailContainer.appendChild(empty);
                this.updateCounters();
                return;
            }

            this.pages.forEach((page, index) => this.createThumbnail(page, index));
            this.updateCounters();
        }

        createThumbnail(page, index) {
            const item = this.pageTemplate.content.firstElementChild.cloneNode(true);
            item.dataset.pageId = page.id;
            item.draggable = true;

            const handle = item.querySelector(".page-handle");
            if (handle) {
                handle.title = this.text("dragTitle");
            }

            const image = item.querySelector(".page-thumbnail");
            image.src = page.src;
            image.alt = page.name;
            image.style.transform = `rotate(${page.rotation || 0}deg)`;

            item.querySelector(".page-title").textContent = page.name;
            item.querySelector(".page-size").textContent = `${page.width} x ${page.height} px`;
            item.querySelector(".page-index-label").textContent = this.text("pageIndex");
            item.querySelector(".page-number").textContent = String(index + 1);

            const moveUpButton = item.querySelector(".move-up-button");
            const moveDownButton = item.querySelector(".move-down-button");
            const rotateButton = item.querySelector(".rotate-button");
            const deleteButton = item.querySelector(".delete-button");
            moveUpButton.textContent = this.text("moveUp");
            moveDownButton.textContent = this.text("moveDown");
            rotateButton.textContent = this.text("rotate");
            deleteButton.textContent = this.text("delete");
            moveUpButton.title = this.text("moveUpTitle");
            moveDownButton.title = this.text("moveDownTitle");
            rotateButton.title = this.text("rotateTitle");
            deleteButton.title = this.text("deleteTitle");
            moveUpButton.disabled = index === 0;
            moveDownButton.disabled = index === this.pages.length - 1;
            moveUpButton.addEventListener("click", () => this.movePageBy(page.id, -1));
            moveDownButton.addEventListener("click", () => this.movePageBy(page.id, 1));
            rotateButton.addEventListener("click", () => this.rotatePage(page.id));
            deleteButton.addEventListener("click", () => this.deletePage(page.id));
            item.addEventListener("dragstart", event => this.handlePageDragStart(event, page.id));
            item.addEventListener("dragover", event => this.handlePageDragOver(event));
            item.addEventListener("drop", event => this.handlePageDrop(event, page.id));
            item.addEventListener("dragend", () => item.classList.remove("dragging"));
            this.thumbnailContainer.appendChild(item);
        }

        handlePageDragStart(event, pageId) {
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("text/plain", pageId);
            event.currentTarget.classList.add("dragging");
        }

        handlePageDragOver(event) {
            event.preventDefault();
            event.dataTransfer.dropEffect = "move";
        }

        handlePageDrop(event, targetId) {
            event.preventDefault();
            const sourceId = event.dataTransfer.getData("text/plain");
            if (!sourceId || sourceId === targetId) {
                return;
            }

            const rect = event.currentTarget.getBoundingClientRect();
            const insertAfter = event.clientY > rect.top + (rect.height / 2);
            this.movePage(sourceId, targetId, insertAfter);
        }

        movePage(sourceId, targetId, insertAfter = false) {
            const sourceIndex = this.pages.findIndex(page => page.id === sourceId);
            if (sourceIndex < 0) {
                return;
            }

            const [source] = this.pages.splice(sourceIndex, 1);
            const targetIndex = this.pages.findIndex(page => page.id === targetId);
            if (targetIndex < 0) {
                this.pages.push(source);
            } else {
                this.pages.splice(targetIndex + (insertAfter ? 1 : 0), 0, source);
            }

            this.render();
            this.notifyChanged();
        }

        movePageBy(pageId, delta) {
            const sourceIndex = this.pages.findIndex(page => page.id === pageId);
            const targetIndex = sourceIndex + delta;
            if (sourceIndex < 0 || targetIndex < 0 || targetIndex >= this.pages.length) {
                return;
            }

            const [page] = this.pages.splice(sourceIndex, 1);
            this.pages.splice(targetIndex, 0, page);
            this.render();
            this.notifyChanged();
        }

        rotatePage(pageId) {
            const page = this.pages.find(candidate => candidate.id === pageId);
            if (!page) {
                return;
            }
            page.rotation = ((page.rotation || 0) + 90) % 360;
            this.render();
            this.notifyChanged();
        }

        deletePage(pageId) {
            this.pages = this.pages.filter(page => page.id !== pageId);
            this.render();
            this.notifyChanged();
        }

        clear() {
            this.pages = [];
            this.render();
            this.updateProgress(0, this.statusText("ready"));
            this.notifyChanged();
        }

        enableSorting() {
            if (!this.thumbnailContainer || typeof window.Sortable !== "function") {
                return;
            }

            this.sortable = window.Sortable.create(this.thumbnailContainer, {
                animation: 150,
                handle: ".page-handle",
                filter: ".empty-pages",
                onEnd: () => this.reorderPages()
            });
        }

        reorderPages() {
            const ids = Array.from(this.thumbnailContainer.querySelectorAll(".page-item"))
                .map(item => item.dataset.pageId);
            this.pages.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
            this.render();
            this.notifyChanged();
        }

        updateCounters() {
            const pageCount = this.pages.length;
            const totalWithCover = pageCount + 1;

            if (this.uploadedPageCount) {
                this.uploadedPageCount.textContent = String(pageCount);
            }
            if (this.estimatedPages) {
                this.estimatedPages.textContent = String(totalWithCover);
            }
            if (this.imageCount) {
                this.imageCount.textContent = String(pageCount);
            }
            if (this.pageCounterBadge) {
                this.pageCounterBadge.textContent = `${pageCount} ${this.text(pageCount === 1 ? "pageSingular" : "pagePlural")}`;
            }
        }

        serializePages() {
            return this.pages.map(page => ({
                id: page.id,
                name: page.name,
                type: page.type,
                src: page.src,
                width: page.width,
                height: page.height,
                rotation: page.rotation || 0,
                size: page.size || 0,
                created: page.created || Date.now()
            }));
        }

        async restore(serializedPages = []) {
            this.pages = [];
            for (const serialized of serializedPages) {
                if (!serialized?.src) {
                    continue;
                }
                const image = await this.loadImageFromSrc(serialized.src);
                this.pages.push({
                    ...serialized,
                    image,
                    width: serialized.width || image.naturalWidth,
                    height: serialized.height || image.naturalHeight
                });
            }
            this.render();
        }

        loadImageFromSrc(src) {
            return new Promise((resolve, reject) => {
                const image = new Image();
                image.onload = () => resolve(image);
                image.onerror = reject;
                image.src = src;
            });
        }

        getPages() {
            return this.pages.slice();
        }

        getPageCount() {
            return this.pages.length;
        }

        notifyChanged() {
            window.dispatchEvent(new CustomEvent("assignment-pages-change", {
                detail: {
                    pages: this.serializePages()
                }
            }));
        }

        destroy() {
            this.sortable?.destroy();
            this.pages = [];
            this.render();
        }
    }

    window.AssignmentBuilderUpload = {
        uploadManager: new UploadManager(),
        UploadManager
    };
}());
