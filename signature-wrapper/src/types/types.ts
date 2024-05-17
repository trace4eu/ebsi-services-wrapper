import { JWK } from "jose";

export enum DidMethod {
  DidKey = "key",
  Ebsi = "ebsi",
}

export enum Algorithm {
  ES256K = "ES256K",
  ES256 = "ES256",
}

export interface EntityKeyPair {
  did: string;
  keys: KeyPairData[];
}

export interface KeyPairData {
  alg: Algorithm;
  privateKeyHex: string;
}

export interface KeyPairJwk {
  id: string;
  kid: string;
  privateKeyJwk: JWK;
  publicKeyJwk: JWK;
}

export interface WalletInitialization {
  entityData?: EntityKeyPair;
  urlEnterpriseWallet?: string;
}
