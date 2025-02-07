import { JWK } from 'jose';
import elliptic from 'elliptic';
import { Algorithm, KeyPairJwk } from '../types/types';
import { EbsiWallet } from '@cef-ebsi/wallet-lib';
import base64url from 'base64url';

const EC = elliptic.ec;

export function getPublicKeyJwk(jwk: JWK, alg: string): JWK {
  switch (alg) {
    case Algorithm.ES256K:
    case Algorithm.ES256: {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { d, ...publicJwk } = jwk;
      return publicJwk;
    }
    default:
      throw new Error(`Algorithm ${alg} not supported`);
  }
}
export function getPrivateKeyJwkES256(privateKeyHex: string): JWK {
  const ec = new EC('p256');
  const privateKey = removePrefix0x(privateKeyHex);
  const keyPair = ec.keyFromPrivate(privateKey, 'hex');
  const validation = keyPair.validate();
  if (!validation.result) {
    throw new Error(validation.reason);
  }
  const pubPoint = keyPair.getPublic();
  return {
    kty: 'EC',
    crv: 'P-256',
    x: pubPoint.getX().toArrayLike(Buffer, 'be', 32).toString('base64url'),
    y: pubPoint.getY().toArrayLike(Buffer, 'be', 32).toString('base64url'),
    d: Buffer.from(privateKey, 'hex').toString('base64url'),
  };
}

export function exportKeyPairJwk(
  alg: Algorithm,
  privateKeyJwk: JWK,
  kid?: string,
): KeyPairJwk {
  const publicKeyJwk = getPublicKeyJwk(privateKeyJwk, alg);
  return {
    alg,
    privateKeyJwk,
    publicKeyJwk,
    kid,
  };
}

export function prefixWith0x(key: string): string {
  return key.startsWith('0x') ? key : `0x${key}`;
}

export function removePrefix0x(key: string): string {
  return key.startsWith('0x') ? key.slice(2) : key;
}

export function getPrivateKeyJwk(privateKeyHex: string): JWK {
  const publicKeyJWK = new EbsiWallet(privateKeyHex).getPublicKey({
    format: 'jwk',
  }) as JWK;
  const d = Buffer.from(removePrefix0x(privateKeyHex), 'hex')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  return { ...publicKeyJWK, d };
}

export function findKeyByAlg(
  keyPairs: KeyPairJwk[],
  alg: Algorithm,
  position: number,
): KeyPairJwk | undefined {
  return keyPairs.filter((keyPair) => keyPair.alg === alg)[position];
}

export function getPrivateKeyHexFromJWK(privateKeyJwk: JWK): string {
  return base64url.decode(privateKeyJwk.d as string, 'hex');
}
