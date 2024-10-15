import { WalletFactory } from '@trace4eu/signature-wrapper';
import { Trace4euAuthorisationApi } from '../../src';
import { Algorithm } from '@trace4eu/signature-wrapper/dist/types/types';
import { isJwt, isOryFormatAccessToken } from '../../src/utils/jwt';
import { Trace4euAuthorisationApiError } from '../../src/errors/trace4euAuthorisationApiError';

describe('Ebsi Authorisation Api should', () => {
  const did = 'did:ebsi:zfEmvX5twhXjQJiCWsukvQA';
  const entityKeys = [
    {
      alg: Algorithm.ES256,
      privateKeyHex:
        '869176bf92b63061b59a26eff6370d26125720844987a60537dee3bff08740fb',
    },
  ];
  const wallet = WalletFactory.createInstance(false, did, entityKeys);
  const trace4euAuthorisationApi = new Trace4euAuthorisationApi(wallet);

  it('Generate an access token with ocs:write scope', async () => {
    const tokenResponse = await trace4euAuthorisationApi.getAccessToken(
      'ES256',
      'ocs:write',
    );
    expect(isOryFormatAccessToken(tokenResponse.access_token)).toBeTruthy();
  });

  it('Generate an access token with ocs:write scope', async () => {
    const tokenResponse = await trace4euAuthorisationApi.getAccessToken(
      'ES256',
      'ocs:read',
    );
    expect(isOryFormatAccessToken(tokenResponse.access_token)).toBeTruthy();
  });

  it('Generate an access token with both ocs:write and ocs:read scopes', async () => {
    const tokenResponse = await trace4euAuthorisationApi.getAccessToken(
      'ES256',
      'ocs:read ocs:write',
    );
    expect(isOryFormatAccessToken(tokenResponse.access_token)).toBeTruthy();
  });

  it('Throw an exception if the entity use a non-existing scope', async () => {
    await expect(
      trace4euAuthorisationApi.getAccessToken('ES256', 'non-existing-scope'),
    ).rejects.toThrow(Trace4euAuthorisationApiError);
  });
});
