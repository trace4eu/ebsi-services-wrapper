import { Wallet } from '@trace4eu/signature-wrapper/dist/wallet/wallet.interface';
import { AuthorisationApi } from './authorisationApi.interface';
import { TokenResponse } from './types';
import { v4 as uuidv4 } from 'uuid';
import { CONFIG_OPTS } from './config';
import { URLSearchParams } from 'node:url';
import { httpCall } from './utils/http';
import { EbsiAuthorisationApiError } from './errors';
import { isJwt, isOryFormatAccessToken } from './utils/jwt';
import { Trace4euAuthorisationApiError } from './errors/trace4euAuthorisationApiError';

enum Scope {
  OcsRead = 'ocs:read',
  OcsWrite = 'ocs:write',
}

export class Trace4euAuthorisationApi implements AuthorisationApi {
  private wallet: Wallet;
  constructor(wallet: Wallet) {
    this.wallet = wallet;
  }

  async getAccessToken(alg: string, scope: string): Promise<TokenResponse> {
    const header = {
      typ: 'jwt',
      alg,
    };
    const payload = {
      iss: this.wallet.getDid(),
      sub: this.wallet.getDid(),
      aud: CONFIG_OPTS.pilot.trace4euAuthorisationApiUrl,
      jti: uuidv4(),
      exp: Math.floor(Date.now() / 1000) + 10,
    };
    const assertion = await this.wallet.signJwt(
      Buffer.from(JSON.stringify(payload)),
      { alg },
      header,
    );
    const clienCredentialsRequest = new URLSearchParams();
    clienCredentialsRequest.append('grant_type', 'client_credentials');
    clienCredentialsRequest.append('client_id', this.wallet.getDid());
    clienCredentialsRequest.append(
      'client_assertion_type',
      'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
    );
    clienCredentialsRequest.append('client_assertion', assertion);
    clienCredentialsRequest.append('scope', scope);

    const response = await httpCall.post(
      CONFIG_OPTS.pilot.trace4euAuthorisationApiUrl,
      clienCredentialsRequest,
    );
    if (!response.ok) {
      const errorData = await response.text(); // parse the error response as JSON
      throw new Trace4euAuthorisationApiError(
        `Error ${response.status}: ${errorData}`,
      );
    }
    const data = (await response.json()) as TokenResponse;
    if (!data.access_token || !isOryFormatAccessToken(data.access_token))
      throw new Trace4euAuthorisationApiError(JSON.stringify(data));
    return data;
  }
}
