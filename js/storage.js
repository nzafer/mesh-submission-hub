/* ESOGU Assignment Builder - offline storage */
(function () {
    "use strict";

    const { STORAGE } = window.AssignmentBuilderConfig;

    class StorageManager {
        constructor() {
            this.db = null;
            this.localStorageKey = `${STORAGE.database}:${STORAGE.key}`;
        }

        async initialize() {
            if (this.db) {
                return this.db;
            }

            if (!window.indexedDB) {
                return null;
            }

            return new Promise(resolve => {
                let request;
                try {
                    request = indexedDB.open(STORAGE.database, STORAGE.version);
                } catch (error) {
                    console.warn("IndexedDB blocked; using localStorage fallback.", error);
                    resolve(null);
                    return;
                }

                request.onupgradeneeded = event => {
                    const db = event.target.result;
                    if (!db.objectStoreNames.contains(STORAGE.store)) {
                        db.createObjectStore(STORAGE.store, { keyPath: "id" });
                    }
                };

                request.onsuccess = () => {
                    this.db = request.result;
                    resolve(this.db);
                };

                request.onerror = () => {
                    console.warn("IndexedDB unavailable; using localStorage fallback.", request.error);
                    resolve(null);
                };
            });
        }

        async save(state) {
            const serializable = JSON.parse(JSON.stringify(state));
            const db = await this.initialize();

            if (!db) {
                this.saveLocal(serializable);
                return;
            }

            return new Promise((resolve, reject) => {
                const tx = db.transaction(STORAGE.store, "readwrite");
                tx.objectStore(STORAGE.store).put({
                    id: STORAGE.key,
                    state: serializable,
                    updatedAt: Date.now()
                });
                tx.oncomplete = () => resolve();
                tx.onerror = () => {
                    try {
                        this.saveLocal(serializable);
                        resolve();
                    } catch {
                        reject(tx.error);
                    }
                };
            });
        }

        async load() {
            const db = await this.initialize();

            if (!db) {
                return this.loadLocal();
            }

            return new Promise((resolve, reject) => {
                const tx = db.transaction(STORAGE.store, "readonly");
                const request = tx.objectStore(STORAGE.store).get(STORAGE.key);
                request.onsuccess = () => resolve(request.result?.state || null);
                request.onerror = () => reject(request.error);
            });
        }

        async clear() {
            const db = await this.initialize();
            try {
                localStorage.removeItem(this.localStorageKey);
            } catch {
                /* localStorage can be blocked for some file origins. */
            }

            if (!db) {
                return;
            }

            return new Promise((resolve, reject) => {
                const tx = db.transaction(STORAGE.store, "readwrite");
                tx.objectStore(STORAGE.store).delete(STORAGE.key);
                tx.oncomplete = () => resolve();
                tx.onerror = () => reject(tx.error);
            });
        }

        async reset() {
            await this.clear();
            return null;
        }

        async get(key) {
            const state = await this.load();
            return state?.[key];
        }

        async set(key, value) {
            const state = await this.load() || {};
            state[key] = value;
            await this.save(state);
        }

        async remove(key) {
            const state = await this.load() || {};
            delete state[key];
            await this.save(state);
        }

        compactState(state) {
            return {
                ...state,
                uploadedPages: []
            };
        }

        saveLocal(state) {
            try {
                localStorage.setItem(this.localStorageKey, JSON.stringify(state));
            } catch (error) {
                localStorage.setItem(this.localStorageKey, JSON.stringify(this.compactState(state)));
                console.warn("Uploaded pages were too large for localStorage; saved form fields only.", error);
            }
        }

        loadLocal() {
            try {
                const raw = localStorage.getItem(this.localStorageKey);
                return raw ? JSON.parse(raw) : null;
            } catch (error) {
                console.warn("Unable to load localStorage state.", error);
                return null;
            }
        }
    }

    window.AssignmentBuilderStorage = {
        storage: new StorageManager(),
        StorageManager
    };
}());
