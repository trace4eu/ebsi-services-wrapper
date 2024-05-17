import { Wallet } from "./wallet.interface.js";
import { EntityKeyPair, WalletInitialization } from "../types/types.js";
import LocalWallet from "./localWallet.js";
import EnterpriseWallet from "./enterpriseWallet.js";

export default class WalletFactory {
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
