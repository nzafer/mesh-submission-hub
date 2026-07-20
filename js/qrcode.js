/* ESOGU Assignment Builder - QR code */
(function () {
    "use strict";

    const { QR, createQRPayload, getText, normalizeLanguage } = window.AssignmentBuilderConfig;

    class QRCodeManager {
        constructor(containerId = "qrCode") {
            this.containerId = containerId;
            this.container = null;
            this.instance = null;
        }

        initialize() {
            this.container = document.getElementById(this.containerId);
            return Boolean(this.container);
        }

        clear() {
            if (this.container) {
                this.container.innerHTML = "";
            }
            this.instance = null;
        }

        generate(state) {
            if (!this.initialize()) {
                return;
            }

            this.clear();
            const payload = createQRPayload(state);
            const language = normalizeLanguage(state?.language);

            if (typeof window.QRCode !== "function") {
                this.container.textContent = getText("cover.qrUnavailable", language);
                this.container.dataset.payload = payload;
                return;
            }

            this.instance = new window.QRCode(this.container, {
                text: payload,
                width: QR.width,
                height: QR.height,
                colorDark: QR.dark,
                colorLight: QR.light,
                correctLevel: window.QRCode.CorrectLevel[QR.correctLevel] || window.QRCode.CorrectLevel.L
            });
            this.container.dataset.payload = payload;
        }
    }

    window.AssignmentBuilderQR = {
        qrManager: new QRCodeManager(),
        QRCodeManager
    };
}());
