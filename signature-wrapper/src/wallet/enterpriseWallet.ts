import { Wallet } from './wallet.interface';
import { ethers } from 'ethers';
import { KeyPairData } from '../types/types';

export class EnterpriseWallet implements Wallet {
  constructor(
    private readonly did: string,
    private readonly keys: KeyPairData[],
    private readonly urlSignatureEndpoint: string,
  ) {}

  async signVP(): Promise<string> {
    throw new Error('Not Implemented yet');
  }

  async signEthTx(): Promise<string> {
    throw new Error('Not Implemented yet');
  }

  getDid(): string {
    throw new Error('Not Implemented yet');
  }

  getEthAddress(): string {
    throw new Error('Not Implemented yet');
  }
}
