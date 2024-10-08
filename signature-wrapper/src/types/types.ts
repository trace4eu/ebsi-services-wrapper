import { JWK } from 'jose';

export enum DidMethod {
  DidKey = 'key',
  Ebsi = 'ebsi',
}

export enum Algorithm {
  ES256K = 'ES256K',
  ES256 = 'ES256',
}

export interface KeyPairData {
  kid?: string;
  alg?: string;
  privateKeyHex?: string;
}

export interface KeyPairJwk {
  kid?: string;
  alg: Algorithm;
  privateKeyJwk: JWK;
  publicKeyJwk: JWK;
}

export interface UnsignedTransaction {
  from?: string;
  to: string;
  data: string;
  nonce: string;
  chainId: string;
  gasLimit: string;
  gasPrice: string;
  value: string;
}

export interface SignatureResponse {
  signedRawTransaction: string;
  r: string;
  s: string;
  v: string;
}

export interface SignatureOptions {
  issuer?: string;
  kid?: string;
  expiresIn?: number;
  alg: string;
  selfIssued?: string;
  iat?: number;
}

export interface JwtHeader {
  typ?: string;
  alg?: string;
  kid?: string;
}

export interface JWTVerifyResult {
  payload: object;
  protectedHeader: JwtHeader;
}
