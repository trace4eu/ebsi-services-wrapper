import { WalletFactory } from '@trace4eu/signature-wrapper';
import { EbsiAuthorisationApi, EbsiAuthorisationApiError } from '../../src';
import { Algorithm } from '@trace4eu/signature-wrapper/dist/types/types';
import { isJwt } from '../../src/utils/jwt';
import {
  EBSI_DID,
  EBSI_PRIVATE_KEY_ES256_DID,
  EBSI_PRIVATE_KEY_ES256K_DID,
} from '../setup';

describe('Ebsi Authorisation wrapper should', () => {
  const did = EBSI_DID;
  const entityKeys = [
    {
      alg: 'ES256K',
      privateKeyHex: EBSI_PRIVATE_KEY_ES256K_DID,
    },
    {
      alg: Algorithm.ES256,
      privateKeyHex: EBSI_PRIVATE_KEY_ES256_DID,
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
