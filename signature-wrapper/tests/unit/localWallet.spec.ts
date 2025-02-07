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

  it('allow to be instantiated with multiple private keys for the same algorithm', () => {
    const did = 'did:ebsi:zgTR5EytcDC47UhfDwJ8viz';
    const entityKeys = [
      {
        alg: Algorithm.ES256K,
        privateKeyHex:
          '20e50bb192a6841247198e0c06a90679dae1ce0dd13f760283917d3df3c75c78',
      },
      {
        alg: Algorithm.ES256K,
        privateKeyHex:
          '64224f2bc138f5984dbc52d5780e4fa9c69cee854e89faafc6b016361155d2da',
      },
      {
        alg: Algorithm.ES256K,
        privateKeyHex:
          'a433f3ddca19785b22eb668050e46ef214cd50619da5d1e82f5245e203bffde5',
      },
      {
        alg: Algorithm.ES256,
        privateKeyHex:
          '39b9e0453f4bab8b0d1724d9a6cbbccb0e91a43d03b805dc4c2182dc393650c0',
      },
    ];

    const wallet = WalletFactory.createInstance(false, did, entityKeys);

    const expectedJwks = {
      keys: [
        {
          kty: 'EC',
          crv: 'secp256k1',
          x: 'UlECaasKBFQurBDk62SaL7KSFiKMYpnj93UBQSaT7Zg',
          y: 'lRU92eMUxYWbRZAZtkVHkQ9KjKtUevIagQgDkoWlBQ8',
        },
        {
          kty: 'EC',
          crv: 'secp256k1',
          x: '9V_oYIJXW6Wf5E3Nr5D8_wYAkdBReUEIPhbO9kt4UZQ',
          y: 'k8J22xB5mizH5HwK0bUUXQeh3E-2eVnMSpHejG3wm60',
        },
        {
          kty: 'EC',
          crv: 'secp256k1',
          x: 'EhM77SLgPnkgqAk7_lLiGZdu0GYkeduIHaoPj0mvm70',
          y: 'CyoFvqCSoFHLYvYWTiVz4AyGW6Foe-7IBEqlrRZ4p4A',
        },
        {
          kty: 'EC',
          crv: 'P-256',
          x: 'VosVbG2YhYx7x-Ena3aiHtkOuM2A-uXoXWlnkSfKcII',
          y: 'R5IJevYjPdZ_De_t2CjTFwdclwmDH_Qwk6feM7pzGRM',
        },
      ],
    };
    const expectedEthereumAddress =
      '0x6eE7a9338323dD8FaAb5FFe8F3529522DED7166a';

    expect(wallet.getPublicJwks()).toStrictEqual(expectedJwks);
    expect(wallet.getEthAddress()).toStrictEqual(expectedEthereumAddress);
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
