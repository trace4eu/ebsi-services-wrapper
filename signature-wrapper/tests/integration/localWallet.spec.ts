import { WalletFactory } from '../../src';
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
        {
          alg: Algorithm.ES256,
          privateKeyHex:
            'fa50bbba9feade27ea61dd9973abfd7c04e72366b607558cd0b423b75d067a86 ',
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
