import { JWK } from 'jose';
import { EntityKeyPair } from './entityKeyPair';
import { SignatureOptions } from '../dtos/signatures';

export interface Wallet {
  signJwt(data: Buffer, opts?: SignatureOptions): Promise<string>;

  sign(data: unknown): Promise<string>;

  toPrimitives(): EntityKeyPair;

  // static create(): Promise<EnterpriseWallet>;

  getPublicKeyJWK(): Promise<JWK>;
}
