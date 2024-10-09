import { createHash } from 'node:crypto';

export function fromHexString(hexString: string): Buffer {
  return Buffer.from(removePrefix0x(hexString), 'hex');
}

export function removePrefix0x(key: string): string {
  return key.startsWith('0x') ? key.slice(2) : key;
}

export function bufferToBase64URL(input: Buffer | Uint8Array | string) {
  const buffer = typeof input === 'string' ? fromHexString(input) : input;
  const base64 = 'u' + buffer.toString('base64');
  const base64url = base64
    .replace(/\+/g, '-') // Replace '+' with '-'
    .replace(/\//g, '_') // Replace '/' with '_'
    .replace(/=+$/, ''); // Remove trailing '=' characters
  return base64url;
}

export function sha256(data: string) {
  let hash = createHash('sha256');
  if (data.startsWith('0x')) {
    hash = hash.update(removePrefix0x(data), 'hex');
  } else {
    hash = hash.update(data, 'utf8');
  }
  return hash.digest().toString('hex');
}
