/**
 * IndexedDB plumbing for Bead Compare.
 *
 * Database "bead-compare", version 1. Everything the app stores lives here;
 * there is no backend. The helpers wrap IDBRequest in promises so the repo
 * can be written with async/await.
 *
 * One rule keeps transactions alive: while a transaction is open, only await
 * IndexedDB requests. Anything else (hashing, Blob.arrayBuffer(), fetch)
 * yields to the event loop and the transaction auto-commits underneath you.
 * Do that work *before* calling withTx().
 *
 * Works in the browser and under fake-indexeddb in vitest (the test imports
 * "fake-indexeddb/auto"; this module only reads globalThis.indexedDB).
 */

export const DB_NAME = "bead-compare";
export const DB_VERSION = 1;

export type StoreName = "passages" | "versions" | "comments" | "pairs";
export const STORE_NAMES: readonly StoreName[] = ["passages", "versions", "comments", "pairs"];

export type IndexName = "by_passage" | "by_version";

function upgrade(db: IDBDatabase): void {
  if (!db.objectStoreNames.contains("passages")) {
    db.createObjectStore("passages", { keyPath: "id" });
  }
  if (!db.objectStoreNames.contains("versions")) {
    const s = db.createObjectStore("versions", { keyPath: "id" });
    s.createIndex("by_passage", "passage_id", { unique: false });
  }
  if (!db.objectStoreNames.contains("comments")) {
    const s = db.createObjectStore("comments", { keyPath: "id" });
    s.createIndex("by_version", "span.version_id", { unique: false });
  }
  if (!db.objectStoreNames.contains("pairs")) {
    const s = db.createObjectStore("pairs", { keyPath: "id" });
    s.createIndex("by_passage", "passage_id", { unique: false });
  }
}

function factory(): IDBFactory {
  const f = (globalThis as { indexedDB?: IDBFactory }).indexedDB;
  if (!f) throw new Error("IndexedDB is not available in this browser.");
  return f;
}

let dbPromise: Promise<IDBDatabase> | null = null;

/** Open (and upgrade) the database once; later calls share the connection. */
export function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  const p = new Promise<IDBDatabase>((resolve, reject) => {
    let req: IDBOpenDBRequest;
    try {
      req = factory().open(DB_NAME, DB_VERSION);
    } catch (e) {
      reject(e);
      return;
    }
    req.onupgradeneeded = () => upgrade(req.result);
    req.onsuccess = () => {
      const db = req.result;
      // Another tab upgraded or deleted the database: drop our connection so
      // the next call reopens cleanly.
      db.onversionchange = () => {
        db.close();
        if (dbPromise === p) dbPromise = null;
      };
      db.onclose = () => {
        if (dbPromise === p) dbPromise = null;
      };
      resolve(db);
    };
    req.onerror = () => reject(req.error ?? new Error("Could not open the database."));
  });
  dbPromise = p;
  p.catch(() => {
    if (dbPromise === p) dbPromise = null;
  });
  return p;
}

/** Close the shared connection (the next openDb() reopens). */
export async function closeDb(): Promise<void> {
  const p = dbPromise;
  dbPromise = null;
  if (!p) return;
  try {
    (await p).close();
  } catch {
    /* never opened */
  }
}

/** Delete the whole database. Used by tests; the app uses repo.clearAll(). */
export async function deleteDb(): Promise<void> {
  await closeDb();
  await new Promise<void>((resolve, reject) => {
    const req = factory().deleteDatabase(DB_NAME);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error ?? new Error("Could not delete the database."));
    req.onblocked = () => reject(new Error("The database is still open in another tab."));
  });
}

export function requestToPromise<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("IndexedDB request failed."));
  });
}

export function transactionDone(tx: IDBTransaction): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("IndexedDB transaction failed."));
    tx.onabort = () => reject(tx.error ?? new Error("IndexedDB transaction aborted."));
  });
}

/**
 * Run `fn` inside one transaction over `stores` and wait for it to commit.
 * If `fn` throws, the transaction is aborted and the error is rethrown.
 * `fn` must only await IndexedDB requests (see the module comment).
 */
export async function withTx<T>(
  stores: StoreName | readonly StoreName[],
  mode: IDBTransactionMode,
  fn: (tx: IDBTransaction) => Promise<T> | T,
): Promise<T> {
  const db = await openDb();
  const tx = db.transaction(typeof stores === "string" ? stores : [...stores], mode);
  const done = transactionDone(tx);
  let result: T;
  try {
    result = await fn(tx);
  } catch (e) {
    done.catch(() => undefined);
    try {
      tx.abort();
    } catch {
      /* already finished */
    }
    throw e;
  }
  await done;
  return result;
}

// ---- transaction-scoped helpers -------------------------------------------

export function getFrom<T>(tx: IDBTransaction, store: StoreName, key: IDBValidKey): Promise<T | undefined> {
  return requestToPromise(tx.objectStore(store).get(key) as IDBRequest<T | undefined>);
}

export function putIn<T>(tx: IDBTransaction, store: StoreName, value: T): Promise<void> {
  return requestToPromise(tx.objectStore(store).put(value)).then(() => undefined);
}

export function deleteFrom(tx: IDBTransaction, store: StoreName, key: IDBValidKey): Promise<void> {
  return requestToPromise(tx.objectStore(store).delete(key));
}

/** All records of a store, or all records under `index` matching `key`. */
export function getAllFrom<T>(tx: IDBTransaction, store: StoreName, index?: IndexName, key?: IDBValidKey): Promise<T[]> {
  const s = tx.objectStore(store);
  const req = index ? s.index(index).getAll(key) : s.getAll();
  return requestToPromise(req as IDBRequest<T[]>);
}

export function getAllKeysFrom(tx: IDBTransaction, store: StoreName, index: IndexName, key: IDBValidKey): Promise<IDBValidKey[]> {
  return requestToPromise(tx.objectStore(store).index(index).getAllKeys(key));
}

/** Delete every record under `index` matching `key`. Returns how many. */
export async function deleteByIndex(tx: IDBTransaction, store: StoreName, index: IndexName, key: IDBValidKey): Promise<number> {
  const keys = await getAllKeysFrom(tx, store, index, key);
  for (const k of keys) await deleteFrom(tx, store, k);
  return keys.length;
}

export function clearStore(tx: IDBTransaction, store: StoreName): Promise<void> {
  return requestToPromise(tx.objectStore(store).clear());
}

// ---- one-call conveniences (each opens its own transaction) ---------------

export function get<T>(store: StoreName, key: IDBValidKey): Promise<T | undefined> {
  return withTx(store, "readonly", (tx) => getFrom<T>(tx, store, key));
}

export function put<T>(store: StoreName, value: T): Promise<void> {
  return withTx(store, "readwrite", (tx) => putIn(tx, store, value));
}

export function del(store: StoreName, key: IDBValidKey): Promise<void> {
  return withTx(store, "readwrite", (tx) => deleteFrom(tx, store, key));
}

export function getAll<T>(store: StoreName): Promise<T[]> {
  return withTx(store, "readonly", (tx) => getAllFrom<T>(tx, store));
}

export function getAllByIndex<T>(store: StoreName, index: IndexName, key: IDBValidKey): Promise<T[]> {
  return withTx(store, "readonly", (tx) => getAllFrom<T>(tx, store, index, key));
}
