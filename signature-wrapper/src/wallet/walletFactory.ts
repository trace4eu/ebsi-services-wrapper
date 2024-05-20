import { Wallet } from './wallet.interface';
import { EntityKeyPair, WalletInitialization } from '../types/types';
import { LocalWallet } from './localWallet';
import { EnterpriseWallet } from './enterpriseWallet';

export class WalletFactory {
  static createInstance(
    isEnterpriseWallet: boolean,
    data: WalletInitialization,
  ): Wallet {
    if (isEnterpriseWallet) {
      return new EnterpriseWallet();
    }
    return new LocalWallet(data.entityData as EntityKeyPair);
  }
}
