import { Wallet } from './wallet.interface';

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
}
