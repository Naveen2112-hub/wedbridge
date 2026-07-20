declare module "firebase/storage" {
  export type FirebaseStorage = unknown;
  export function getStorage(app?: unknown): FirebaseStorage;
  export function ref(storage: FirebaseStorage, path: string): unknown;
  export function uploadBytes(ref: unknown, data: Blob | ArrayBuffer | Uint8Array): Promise<unknown>;
  export function getDownloadURL(ref: unknown): Promise<string>;
  export function deleteObject(ref: unknown): Promise<void>;
}
