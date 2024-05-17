import { Algorithm } from '../types/types';

export interface Wallet {
  // signVC(data: Buffer, opts?: SignatureOptions): Promise<string>;

  signVP(alg: string, vc: string | string[]): Promise<string>;

  // signEthTx(data: unknown): Promise<string>;

  // toPrimitives(): EntityKeyPair;
}
