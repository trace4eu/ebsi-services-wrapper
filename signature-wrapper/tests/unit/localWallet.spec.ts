import {
  WalletFactory,
  Algorithm,
  SignatureError,
  InitializationError,
  LocalWallet,
} from '../../src';
import { ebsiWrapper } from '../../src/wrappers/ebsiWrapper';

describe('Local Wallet should', () => {
  const did = 'did:ebsi:zp27tdN18pFHAhSPfHWDH4s';
  const entityKeys = [
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
  ];

  const wallet = WalletFactory.createInstance(false, did, entityKeys);

  beforeAll(async () => {
    jest
      .spyOn(ebsiWrapper, 'createVerifiablePresentationJwt')
      .mockResolvedValue('header.payload.signature');
  });

  it('raise an error if LocalWallet cannot be initialized due to missing input keys', async () => {
    expect(() => {
      new LocalWallet('did:ebsi:1234', []);
    }).toThrow(InitializationError);
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

  it('return the public keys in JWK format as an array', () => {
    expect(wallet.getPublicJwks()).toStrictEqual({
      keys: [
        {
          crv: 'secp256k1',
          kty: 'EC',
          x: 'LGab-ItFIAQWe5d4uF-9_bgDUsKp5Kb9SDMnL50ZAWA',
          y: '1LVURPhALC5rxvCqXdmXhgU8zjJauR3saoUryu80GwM',
        },
        {
          crv: 'P-256',
          kty: 'EC',
          x: '7fcJZOkj2z2Qmk4Dxdmeypj-4X-BdbNQzc_Y5i4T1lc',
          y: 'qKIlZf0cGz1r6b2Ji40pMXZ0UuhHPPcgilpSy6XG5Mw',
        },
      ],
    });
  });

  it('Generate a signed Verifiable Credential', async () => {});
  it('Generate a signed Ethereum Transaction', async () => {});
});
