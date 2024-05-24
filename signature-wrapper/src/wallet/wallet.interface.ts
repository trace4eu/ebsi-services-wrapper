import {
  Algorithm,
  SignatureResponse,
  UnsignedTransaction,
} from '../types/types';
import { ethers } from 'ethers';

export interface Wallet {
  // signVC(data: Buffer, opts?: SignatureOptions): Promise<string>;

  signVP(alg: string, vc: string | string[]): Promise<string>;

  signEthTx(data: UnsignedTransaction): Promise<SignatureResponse>;

  getDid(): string;
  getEthAddress(): string;

  // toPrimitives(): EntityKeyPair;
}
