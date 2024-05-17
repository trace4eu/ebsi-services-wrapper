import { DidMethod } from '../../../../shared/utils/did';
import DidMethodNotSupportedException from '../exceptions/didMethodNotSupportedException';
import { EnterpriseWallet } from './wallet.interface.js';
import { EntityKeyPair } from './entityKeyPair';
import EtherWallet from './etherWallet';
import DidKeyWallet from './didKeyWallet';
import EbsiVcWallet from './ebsiVcWallet';
import EbsiTxWallet from './ebsiTxWallet';
import DidWebWallet from './didWebWallet';
import { DidCreationOptions } from '../../services/entityKeyPairCreation/entityKeyPairCreationRequest';

export default class EnterpriseWalletFactory {
  static async create(
    method: string,
    opts?: DidCreationOptions,
  ): Promise<EnterpriseWallet> {
    if (method === DidMethod.Ethr) {
      return EtherWallet.create();
    }
    if (method === DidMethod.DidKey) {
      return DidKeyWallet.create();
    }
    if (method === DidMethod.Web) {
      return DidWebWallet.create(opts);
    }
    throw new DidMethodNotSupportedException(method);
  }

  static load(
    method: string,
    entityKeyPair: EntityKeyPair,
    isTxWallet?: boolean,
  ): EnterpriseWallet {
    if (method === DidMethod.Ethr) {
      return new EtherWallet(entityKeyPair);
    }
    if (method === DidMethod.DidKey) {
      return new DidKeyWallet(entityKeyPair);
    }
    if (method === DidMethod.Ebsi && isTxWallet) {
      return new EbsiTxWallet(entityKeyPair);
    }
    if (method === DidMethod.Ebsi) {
      return new EbsiVcWallet(entityKeyPair);
    }
    if (method === DidMethod.Web) {
      return new DidWebWallet(entityKeyPair);
    }

    throw new DidMethodNotSupportedException(method);
  }
}
