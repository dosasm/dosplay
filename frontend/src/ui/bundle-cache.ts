const DB_NAME = 'jsdosDB';
const STORE_NAME = 'bundles';
const DB_VERSION = 1;

export async function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };

        request.onsuccess = (event) => {
            resolve((event.target as IDBOpenDBRequest).result);
        };

        request.onerror = (event) => {
            reject((event.target as IDBOpenDBRequest).error);
        };
    });
}

export async function cacheBundle(key: string, bundle: Uint8Array): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(bundle, key);

        request.onsuccess = () => {
            resolve();
        };

        request.onerror = (event) => {
            reject((event.target as IDBRequest).error);
        };
    });
}

export async function getBundle(key: string): Promise<Uint8Array | null> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(key);

        request.onsuccess = (event) => {
            resolve((event.target as IDBRequest).result || null);
        };

        request.onerror = (event) => {
            reject((event.target as IDBRequest).error);
        };
    });
}

export async function deleteBundle(key: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(key);

        request.onsuccess = () => {
            resolve();
        };

        request.onerror = (event) => {
            reject((event.target as IDBRequest).error);
        };
    });
}

export async function existsBundle(key: string): Promise<boolean> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getKey(key);

        request.onsuccess = (event) => {
            resolve((event.target as IDBRequest).result !== undefined);
        };

        request.onerror = (event) => {
            reject((event.target as IDBRequest).error);
        };
    });
}

export async function clearBundles(): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();

        request.onsuccess = () => {
            resolve();
        };

        request.onerror = (event) => {
            reject((event.target as IDBRequest).error);
        };
    });
}

export async function listBundles(): Promise<string[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAllKeys();

        request.onsuccess = (event) => {
            resolve((event.target as IDBRequest).result as string[]);
        };

        request.onerror = (event) => {
            reject((event.target as IDBRequest).error);
        };
    });
}
