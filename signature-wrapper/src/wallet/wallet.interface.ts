import { Algorithm } from "../types/types.js";

export interface Wallet {
  // signVC(data: Buffer, opts?: SignatureOptions): Promise<string>;

  signVP(alg: Algorithm, vc: string | string[]): Promise<string>;

  // signEthTx(data: unknown): Promise<string>;

  // toPrimitives(): EntityKeyPair;
}
