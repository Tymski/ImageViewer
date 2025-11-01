// Small IndexedDB helper for key/value storage used by ImageViewer
(function () {
    const DB_NAME = 'imageviewer-db';
    const STORE = 'kv';
    const VERSION = 1;

    function openDB() {
        return new Promise((resolve, reject) => {
            const req = indexedDB.open(DB_NAME, VERSION);
            req.onerror = () => reject(req.error);
            req.onsuccess = () => resolve(req.result);
            req.onupgradeneeded = (ev) => {
                const db = ev.target.result;
                if (!db.objectStoreNames.contains(STORE)) {
                    db.createObjectStore(STORE, { keyPath: 'key' });
                }
            };
        });
    }

    async function doTx(type, callback) {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE, type);
            const store = tx.objectStore(STORE);
            let result;
            try {
                result = callback(store);
            } catch (err) {
                reject(err);
            }
            tx.oncomplete = () => resolve(result);
            tx.onerror = () => reject(tx.error || new Error('tx error'));
        });
    }

    async function dbSet(key, value) {
        return doTx('readwrite', (store) => store.put({ key: key, value: value }));
    }

    async function dbGet(key) {
        return doTx('readonly', (store) => {
            return new Promise((resolve, reject) => {
                const req = store.get(key);
                req.onsuccess = () => resolve(req.result ? req.result.value : undefined);
                req.onerror = () => reject(req.error);
            });
        });
    }

    async function dbDelete(key) {
        return doTx('readwrite', (store) => store.delete(key));
    }

    async function dbClearAll() {
        return doTx('readwrite', (store) => store.clear());
    }

    // Expose on window for simple usage from other scripts
    window.__ivDB = {
        get: dbGet,
        set: dbSet,
        delete: dbDelete,
        clear: dbClearAll
    };
})();
