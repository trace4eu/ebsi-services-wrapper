import { WalletFactory, Algorithm } from '../../src';
import { ValidationError } from 'joi';

describe('Local Wallet should', () => {
  const entityKey = {
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
            'fa50bbba9feade27ea61dd9973abfd7c04e72366b607558cd0b423b75d067a86',
        },
      ],
    },
  };

  const wallet = WalletFactory.createInstance(false, entityKey);

  it('Generate a signed Verifiable Credential', async () => {});

  it('Generate a signed Verifiable Presentation', async () => {
    const vp = await wallet.signVP(Algorithm.ES256K, 'empty');
    expect(vp).toBeDefined();
  });

  it('Generate a signed Ethereum Transaction', async () => {
    entityKey.entityData.did = 'did:ebsi:z22h9L3a8f32vF9CY9jWMqKL';
    entityKey.entityData.keys[0].privateKeyHex =
      '58919053817fecb9118542a45258dff7025980a005f046adeee80ca4d7299265';

    const unsignedEthTrx = {
      to: '0xf15e3682BCe7ADDefb2F1E1EAE3163448DB539f6',
      data: '0xfbb2240800000000000000000000000000000000000000000000000000000000000000e0000000000000000000000000000000000000000000000000000000000000014000000000000000000000000000000000000000000000000000000000000001c00000000000000000000000000000000000000000000000000000000000000220000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000664b6656000000000000000000000000000000000000000000000000000000006f7f47ce00000000000000000000000000000000000000000000000000000000000000216469643a656273693a7a323268394c3361386633327646394359396a574d714b4c00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005c7b2240636f6e74657874223a5b2268747470733a2f2f7777772e77332e6f72672f6e732f6469642f7631222c2268747470733a2f2f773369642e6f72672f73656375726974792f7375697465732f6a77732d323032302f7631225d7d00000000000000000000000000000000000000000000000000000000000000000000002b7a36326f646a4e6f79547954742d694964704e7033394a33465639325544615030525042457354506f456b000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004104c79c36781d4981cd81766a4bd3fad000ac2d6f43c979b1c89dd4ba011ee2fbdbe409cc45af9324668dd6e3b224c6ff26332f0469f263d178e6930235a6d0900600000000000000000000000000000000000000000000000000000000000000',
      value: '0x0',
      nonce: 0,
      chainId: 6178,
      gasLimit: '0x1b395a',
      gasPrice: '0x0',
    };

    const expectedSignedTrx =
      '0xf903088080831b395a94f15e3682bce7addefb2f1e1eae3163448db539f680b902a4fbb2240800000000000000000000000000000000000000000000000000000000000000e0000000000000000000000000000000000000000000000000000000000000014000000000000000000000000000000000000000000000000000000000000001c00000000000000000000000000000000000000000000000000000000000000220000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000664b6656000000000000000000000000000000000000000000000000000000006f7f47ce00000000000000000000000000000000000000000000000000000000000000216469643a656273693a7a323268394c3361386633327646394359396a574d714b4c00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005c7b2240636f6e74657874223a5b2268747470733a2f2f7777772e77332e6f72672f6e732f6469642f7631222c2268747470733a2f2f773369642e6f72672f73656375726974792f7375697465732f6a77732d323032302f7631225d7d00000000000000000000000000000000000000000000000000000000000000000000002b7a36326f646a4e6f79547954742d694964704e7033394a33465639325544615030525042457354506f456b000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004104c79c36781d4981cd81766a4bd3fad000ac2d6f43c979b1c89dd4ba011ee2fbdbe409cc45af9324668dd6e3b224c6ff26332f0469f263d178e6930235a6d0900600000000000000000000000000000000000000000000000000000000000000823067a01b1eb21be7c107fae2d6e09f25120151ff5bf34b2160ae6c772cbb5c09165cada04dff3433ae866ad405fc2b86b74ae9d77c1150f5d82861bd6669f2d01187efa3';

    const wallet = WalletFactory.createInstance(false, entityKey);
    const signedTrx = await wallet.signEthTx(unsignedEthTrx);
    expect(signedTrx).toBe(expectedSignedTrx);
  });

  it('Throw a ValidationError exception if input EthTrx is not well formatted', async () => {
    entityKey.entityData.did = 'did:ebsi:z22h9L3a8f32vF9CY9jWMqKL';
    entityKey.entityData.keys[0].privateKeyHex =
      '58919053817fecb9118542a45258dff7025980a005f046adeee80ca4d7299265';

    const unsignedEthTrx = {
      to: '0xf15e3682BCe7',
      data: 'noHexData',
      value: '0x0',
      nonce: 0,
      chainId: 6178,
      gasLimit: '0x1b395a',
      gasPrice: '0x0',
    };

    const expectedSignedTrx =
      '0xf903088080831b395a94f15e3682bce7addefb2f1e1eae3163448db539f680b902a4fbb2240800000000000000000000000000000000000000000000000000000000000000e0000000000000000000000000000000000000000000000000000000000000014000000000000000000000000000000000000000000000000000000000000001c00000000000000000000000000000000000000000000000000000000000000220000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000664b6656000000000000000000000000000000000000000000000000000000006f7f47ce00000000000000000000000000000000000000000000000000000000000000216469643a656273693a7a323268394c3361386633327646394359396a574d714b4c00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005c7b2240636f6e74657874223a5b2268747470733a2f2f7777772e77332e6f72672f6e732f6469642f7631222c2268747470733a2f2f773369642e6f72672f73656375726974792f7375697465732f6a77732d323032302f7631225d7d00000000000000000000000000000000000000000000000000000000000000000000002b7a36326f646a4e6f79547954742d694964704e7033394a33465639325544615030525042457354506f456b000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004104c79c36781d4981cd81766a4bd3fad000ac2d6f43c979b1c89dd4ba011ee2fbdbe409cc45af9324668dd6e3b224c6ff26332f0469f263d178e6930235a6d0900600000000000000000000000000000000000000000000000000000000000000823067a01b1eb21be7c107fae2d6e09f25120151ff5bf34b2160ae6c772cbb5c09165cada04dff3433ae866ad405fc2b86b74ae9d77c1150f5d82861bd6669f2d01187efa3';

    const wallet = WalletFactory.createInstance(false, entityKey);

    await expect(wallet.signEthTx(unsignedEthTrx)).rejects.toThrow(
      ValidationError,
    );
  });
});
