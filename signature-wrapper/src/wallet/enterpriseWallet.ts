import { Wallet } from './wallet.interface';
import { ethers } from 'ethers';

export class EnterpriseWallet implements Wallet {
  /* constructor(
    private readonly urlSignatureEndpoint: string,
    private readonly did: string,
    private readonly kid: string,
  ) {} */
  constructor() {}

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
