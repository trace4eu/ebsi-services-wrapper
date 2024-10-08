import { Wallet } from './wallet.interface';
import { KeyPairData } from '../types/types';
import { LocalWallet } from './localWallet';
import { EnterpriseWallet } from './enterpriseWallet';
import { InitializationError } from '../errors';

export class WalletFactory {
  static createInstance(
    isEnterpriseWallet: boolean,
    did: string,
    keys: KeyPairData[],
    urlEnterpriseWallet?: string | undefined,
  ): Wallet {
    if (isEnterpriseWallet && urlEnterpriseWallet) {
      return new EnterpriseWallet(did, keys, urlEnterpriseWallet);
    }
    if (keys) return new LocalWallet(did, keys);
    throw new InitializationError('Incorrect Parameters');
  }
}
