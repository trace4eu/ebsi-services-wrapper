import {
  WalletFactory,
  Algorithm,
  SignatureError,
  InitializationError,
  LocalWallet,
} from '../../src';
import { ebsiWrapper } from '../../src/wrappers/ebsiWrapper';

describe('Local Wallet should', () => {
  const did = 'did:ebsi:zgTR5EytcDC47UhfDwJ8viz';
  const entityKeys = [
    {
      alg: Algorithm.ES256K,
      privateKeyHex:
        '20e50bb192a6841247198e0c06a90679dae1ce0dd13f760283917d3df3c75c78',
    },
    {
      alg: Algorithm.ES256,
      privateKeyHex:
        '39b9e0453f4bab8b0d1724d9a6cbbccb0e91a43d03b805dc4c2182dc393650c0',
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
          x: 'UlECaasKBFQurBDk62SaL7KSFiKMYpnj93UBQSaT7Zg',
          y: 'lRU92eMUxYWbRZAZtkVHkQ9KjKtUevIagQgDkoWlBQ8',
        },
        {
          crv: 'P-256',
          kty: 'EC',
          x: 'VosVbG2YhYx7x-Ena3aiHtkOuM2A-uXoXWlnkSfKcII',
          y: 'R5IJevYjPdZ_De_t2CjTFwdclwmDH_Qwk6feM7pzGRM',
        },
      ],
    });
  });
});
