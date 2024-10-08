import { ethers } from 'ethers';

class EthersWrapper {
  async signTransaction(
    wallet: ethers.Wallet,
    unsignedTrx: ethers.Transaction,
  ) {
    return wallet.signTransaction(unsignedTrx);
  }
}

const ethersWrapper = new EthersWrapper();

export { ethersWrapper };
