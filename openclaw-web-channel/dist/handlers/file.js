import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
const ALLOWED_UPLOAD_PREFIX = ['image/', 'application/pdf', 'text/'];
export function isUploadTypeAllowed(mimeType) {
    return ALLOWED_UPLOAD_PREFIX.some((prefix) => mimeType.startsWith(prefix));
}
export async function storeBase64File(params) {
    const content = Buffer.from(params.base64, 'base64');
    const digest = createHash('sha1').update(content).digest('hex').slice(0, 8);
    const safeName = params.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filename = `${Date.now()}-${digest}-${safeName}`;
    await mkdir(params.uploadsDir, { recursive: true });
    await writeFile(join(params.uploadsDir, filename), content);
    return { filename, size: content.byteLength };
}
//# sourceMappingURL=file.js.map