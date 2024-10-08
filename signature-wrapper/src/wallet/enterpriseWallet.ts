import { Wallet } from './wallet.interface';
import { ethers } from 'ethers';
import {JwtHeader, JWTVerifyResult, KeyPairData, SignatureOptions, SignatureResponse} from '../types/types';

export class EnterpriseWallet implements Wallet {
  constructor(
    private readonly did: string,
    private readonly keys: KeyPairData[],
    private readonly urlSignatureEndpoint: string,
  ) {}

  async signVP(): Promise<string> {
    throw new Error('Not Implemented yet');
  }

  signJwt(
    data: Buffer,
    opts: SignatureOptions,
    header?: JwtHeader,
  ): Promise<string> {
    throw new Error('Not Implemented yet');
  }

  verifyJwt(jwt: string, alg: string): Promise<JWTVerifyResult> {
    throw new Error('Not Implemented yet');
  }

  async signEthTx(): Promise<SignatureResponse> {
    throw new Error('Not Implemented yet');
  }

  signVC(data: Buffer, opts: SignatureOptions): Promise<string> {
    throw new Error('Not Implemented yet');
  }

  getDid(): string {
    throw new Error('Not Implemented yet');
  }

  getHexDid(): string {
    throw new Error('Not Implemented yet');
  }

  getEthAddress(): string {
    throw new Error('Not Implemented yet');
  }
}
