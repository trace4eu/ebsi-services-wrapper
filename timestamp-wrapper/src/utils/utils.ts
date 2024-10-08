import { bases } from 'multiformats/basics';

export function fromHexString(hexString: string): Buffer {
  return Buffer.from(removePrefix0x(hexString), 'hex');
}

export function removePrefix0x(key: string): string {
  return key.startsWith('0x') ? key.slice(2) : key;
}

export function multibaseEncode(
  base: 'base64url' | 'base58btc',
  input: Buffer | Uint8Array | string,
): string {
  const buffer = typeof input === 'string' ? fromHexString(input) : input;
  return bases[base].encode(buffer).toString();
}
