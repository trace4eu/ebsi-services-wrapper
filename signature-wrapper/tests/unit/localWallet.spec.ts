import { Algorithm } from '../../src/types/types';
import { ebsiWrapper } from '../../src/wrappers/ebsiWrapper';
import { SignatureError } from '../../src/errors/SignatureError';
import { WalletFactory } from '../../src';

describe('Local Wallet should', () => {
  const entityKeys = {
    entityData: {
      did: 'did:ebsi:zp27tdN18pFHAhSPfHWDH4s',
      keys: [
        {
          alg: Algorithm.ES256K,
          privateKeyHex:
            '260482ab2d4f7f1bad8f89c48eab81d30eae31f7625dbea73466e29554611e0c',
        },
        {
          alg: Algorithm.ES256,
          privateKeyHex:
            '15504399647d7c298be3ff52c47f674fa4f7fa2a553c51c87d79fb6073930aa9',
        },
      ],
    },
  };
  const wallet = WalletFactory.createInstance(false, entityKeys);

  beforeAll(async () => {
    jest
      .spyOn(ebsiWrapper, 'createVerifiablePresentationJwt')
      .mockResolvedValue('header.payload.signature');
  });
  it('Generate a signed Verifiable Presentation', async () => {
    const signedVp = await wallet.signVP('ES256', 'empty');
    expect(signedVp).toBe('header.payload.signature');
  });
  it('raise an error if there are no valid keys for sign a Verifiable Presentation', async () => {
    await expect(wallet.signVP('RSA256', 'empty')).rejects.toThrow(
      SignatureError,
    );
  });
  it('Generate a signed Verifiable Credential', async () => {});
  it('Generate a signed Ethereum Transaction', async () => {});
});
