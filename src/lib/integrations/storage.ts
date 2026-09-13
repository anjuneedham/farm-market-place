import { mkdir, writeFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import { join } from 'node:path';
import { type ServiceResult, type StorageService, type StoredFile, fail, ok } from './types';

/**
 * Upload rules live here, not at call sites, so they survive a provider change.
 * See docs/SECURITY.md §5.
 */
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
] as const;

/** Magic bytes per allowed type. The multipart content-type header is not trusted. */
const SIGNATURES: Array<{ type: string; test: (bytes: Uint8Array) => boolean }> = [
  { type: 'image/jpeg', test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  {
    type: 'image/png',
    test: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  },
  {
    type: 'image/webp',
    test: (b) =>
      b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
      b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50,
  },
  {
    // AVIF: 'ftyp' box at offset 4, brand 'avif' or 'avis' at offset 8.
    type: 'image/avif',
    test: (b) =>
      b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70 &&
      b[8] === 0x61 && b[9] === 0x76 && b[10] === 0x69 && (b[11] === 0x66 || b[11] === 0x73),
  },
];

export function sniffImageType(bytes: Uint8Array): string | null {
  return SIGNATURES.find((signature) => signature.test(bytes))?.type ?? null;
}

/** Local filesystem storage. Development only — production uses object storage. */
export class LocalStorageService implements StorageService {
  readonly maxBytes = MAX_UPLOAD_BYTES;
  readonly allowedTypes = ALLOWED_IMAGE_TYPES;

  isConfigured(): boolean {
    return true;
  }

  status(): string {
    return 'Images are stored on the local filesystem. Configure object storage before deploying.';
  }

  async put(file: File, prefix: string): Promise<ServiceResult<StoredFile>> {
    if (file.size > this.maxBytes) {
      return fail('validation', `Images must be ${Math.round(this.maxBytes / 1024 / 1024)}MB or smaller.`);
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const sniffed = sniffImageType(bytes);
    if (!sniffed || !this.allowedTypes.includes(sniffed as (typeof ALLOWED_IMAGE_TYPES)[number])) {
      return fail('validation', 'Upload a JPEG, PNG, WebP or AVIF image.');
    }

    const extension = sniffed.split('/')[1] ?? 'jpg';
    // The original filename is never used as a path component.
    const key = `${prefix}/${Date.now()}-${randomBytes(8).toString('hex')}.${extension}`;
    const destination = join(process.cwd(), 'public', 'uploads', key);

    try {
      await mkdir(join(destination, '..'), { recursive: true });
      await writeFile(destination, bytes);
    } catch (error) {
      console.error('[agriloop:storage] write failed', error);
      return fail('unavailable', 'We could not save that image. Please try again.');
    }

    return ok({ url: `/uploads/${key}`, key, size: file.size, contentType: sniffed });
  }

  async remove(_key: string): Promise<ServiceResult<null>> {
    // Deletion is deferred: orphaned development uploads are harmless, and the
    // object-storage implementation will handle lifecycle properly.
    return ok(null);
  }
}
