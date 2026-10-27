import { officialResourceKey, type OfficialImport } from "./atricon-official";
export interface StoredAtriconImport {
  key: string;
  imported: OfficialImport;
  original: Blob;
}
const DATABASE = "municipal-atricon-official",
  STORE = "publications";
async function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE, { keyPath: "key" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(
        new Error("Não foi possível abrir o armazenamento dos arquivos oficiais neste navegador."),
      );
  });
}
async function transact<T>(
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const req = operation(tx.objectStore(STORE));
    tx.oncomplete = () => {
      db.close();
      resolve(req.result);
    };
    tx.onabort = tx.onerror = () => {
      db.close();
      reject(
        new Error(
          "Não foi possível salvar ou ler o arquivo oficial. Verifique o espaço e as permissões do navegador.",
        ),
      );
    };
  });
}
export async function saveAtriconImport(
  imported: OfficialImport,
  original: Blob,
): Promise<StoredAtriconImport> {
  const stored = {
    key: `${imported.resource.year}:${officialResourceKey(imported.resource)}:${imported.sha256}:${encodeURIComponent(imported.importFilter ?? "")}`,
    imported,
    original,
  };
  await transact("readwrite", (store) => store.put(stored));
  return stored;
}
export async function listAtriconImports(): Promise<StoredAtriconImport[]> {
  const rows = (await transact("readonly", (store) => store.getAll())) as StoredAtriconImport[];
  return rows.sort((a, b) => b.imported.importedAt.localeCompare(a.imported.importedAt));
}
