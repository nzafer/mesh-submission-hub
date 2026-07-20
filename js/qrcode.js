/* ESOGU Assignment Builder - QR code */
(function () {
    "use strict";

    const { QR, createQRPayload } = window.AssignmentBuilderConfig;

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

            if (typeof window.QRCode !== "function") {
                this.container.textContent = "QR unavailable";
                this.container.dataset.payload = payload;
                return;
            }

            this.instance = new window.QRCode(this.container, {
                text: payload,
                width: QR.width,
                height: QR.height,
                colorDark: QR.dark,
                colorLight: QR.light,
                correctLevel: window.QRCode.CorrectLevel.M
            });
            this.container.dataset.payload = payload;
        }
    }

    window.AssignmentBuilderQR = {
        qrManager: new QRCodeManager(),
        QRCodeManager
    };
}());
