import { WalletFactory } from '@trace4eu/signature-wrapper';
import { EbsiAuthorisationApi, EbsiAuthorisationApiError } from '../../src';
import { Algorithm } from '@trace4eu/signature-wrapper/dist/types/types';
import { isJwt } from '../../src/utils/jwt';
import { SignatureError } from '@trace4eu/signature-wrapper/dist/errors/SignatureError';

describe('Ebsi Authorisation Api should', () => {
  const did = 'did:ebsi:zobuuYAHkAbRFCcqdcJfTgR';
  const entityKeys = [
    {
      alg: 'ES256K',
      privateKeyHex:
        'c4877a6d51c382b25a57684b5ac0a70398ab77b0eda0fcece0ca14ed00737e57',
    },
    {
      alg: Algorithm.ES256,
      privateKeyHex:
        'fa50bbba9feade27ea61dd9973abfd7c04e72366b607558cd0b423b75d067a86 ',
    },
  ];
  const wallet = WalletFactory.createInstance(false, did, entityKeys);
  const ebsiAuthorisationApi = new EbsiAuthorisationApi(wallet);

  it('Generate an access token with tnt_create scope', async () => {
    const tokenResponse = await ebsiAuthorisationApi.getAccessToken(
      'ES256',
      'tnt_create',
      [],
    );
    expect(isJwt(tokenResponse.access_token)).toBeTruthy();
  });

  it('Generate an access token with tnt_write scope', async () => {
    const tokenResponse = await ebsiAuthorisationApi.getAccessToken(
      'ES256',
      'tnt_write',
      [],
    );
    expect(isJwt(tokenResponse.access_token)).toBeTruthy();
  });

  it('Generate an access token with timestamp_write scope', async () => {
    const tokenResponse = await ebsiAuthorisationApi.getAccessToken(
      'ES256',
      'timestamp_write',
      [],
    );
    expect(isJwt(tokenResponse.access_token)).toBeTruthy();
  });

  it('Throw an exception if the entity if the Presentation Submission is wrong (e.g. needed credential is not included)', async () => {
    await expect(
      ebsiAuthorisationApi.getAccessToken('ES256', 'tnt_authorise', []),
    ).rejects.toThrow(EbsiAuthorisationApiError);
  });

  it('Throw an exception if the entity use a non-existing scope', async () => {
    await expect(
      ebsiAuthorisationApi.getAccessToken('ES256', 'non-existing-scope', []),
    ).rejects.toThrow(EbsiAuthorisationApiError);
  });
});
