import WalletFactory from '../../src/wallet/walletFactory';
import { Algorithm } from '../../src/types/types';
import { SignatureError } from '../../src/errors/SignatureError';

describe('Local Wallet should', () => {
  const entityKeys = {
    entityData: {
      did: 'did:ebsi:zobuuYAHkAbRFCcqdcJfTgR',
      keys: [
        {
          alg: Algorithm.ES256K,
          privateKeyHex:
            'c4877a6d51c382b25a57684b5ac0a70398ab77b0eda0fcece0ca14ed00737e57',
        },
      ],
    },
  };

  const wallet = WalletFactory.createInstance(false, entityKeys);

  it('Generate a signed Verifiable Credential', async () => {});

  it('Generate a signed Verifiable Presentation', async () => {
    const vc = await wallet.signVP(Algorithm.ES256K, 'empty');
    expect(vc).toBeDefined();
  });

  it('Generate a signed Ethereum Transaction', async () => {});
});
