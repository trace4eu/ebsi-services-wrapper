import {
  JwtHeader,
  JWTVerifyResult,
  SignatureOptions,
  SignatureResponse,
  UnsignedTransaction,
} from '../types/types';
import { JWK } from 'jose';

export interface Wallet {
  signVC(data: Buffer, opts: SignatureOptions): Promise<string>;
  signJwt(
    data: Buffer,
    opts: SignatureOptions,
    header?: JwtHeader,
  ): Promise<string>;

  verifyJwt(jwt: string, alg: string): Promise<JWTVerifyResult>;

  signVP(
    alg: string,
    vc: string | string[],
    expiration?: number,
  ): Promise<string>;

  signEthTx(data: UnsignedTransaction): Promise<SignatureResponse>;

  getDid(): string;
  getHexDid(): string;
  getEthAddress(): string;
}
