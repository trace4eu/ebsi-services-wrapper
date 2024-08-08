import { SignatureResponse, UnsignedTransaction } from '../types/types';

export interface Wallet {
  // signVC(data: Buffer, opts?: SignatureOptions): Promise<string>;

  signVP(alg: string, vc: string | string[], expiration?: number): Promise<string>;

  signEthTx(data: UnsignedTransaction): Promise<SignatureResponse>;

  getDid(): string;
  getHexDid(): string;
  getEthAddress(): string;

  // toPrimitives(): EntityKeyPair;
}
