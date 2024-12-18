import { CONFIG_OPTS } from './config';
import { URLSearchParams } from 'node:url';
import crypto from 'crypto';
import { TokenResponse } from './types';
import { Wallet } from '@trace4eu/signature-wrapper';

import { httpCall } from './utils/http';
import { isJwt } from './utils/jwt';
import { EbsiAuthorisationApiError } from './errors';
import { AuthorisationApi } from './authorisationApi.interface';

enum Scope {
  DidRInvite = 'didr_invite',
  DidRWrite = 'didr_write',
  TirInvite = 'tir_invite',
  TirWrite = 'tir_write',
  TimestampWrite = 'timestamp_write',
  TntAuthorize = 'tnt_authorise',
  TntCreate = 'tnt_create',
  TntWrite = 'tnt_write',
}
export class EbsiAuthorisationApi implements AuthorisationApi {
  constructor(private wallet: Wallet) {}

  async getAccessToken(
    alg: string,
    scope: string,
    credential?: string | string[],
  ): Promise<TokenResponse> {
    const { tokenEndpoint } = await this.getAuthorisationApiOpenidMetadata();
    const signedVp = await this.wallet.signVP(alg, credential ?? []);
    const tokenPresentatationEndpointParams = new URLSearchParams();
    tokenPresentatationEndpointParams.append('grant_type', 'vp_token');
    tokenPresentatationEndpointParams.append('scope', `openid ${scope}`);
    tokenPresentatationEndpointParams.append('vp_token', signedVp);
    tokenPresentatationEndpointParams.append(
      'presentation_submission',
      JSON.stringify({
        id: crypto.randomUUID(),
        definition_id: `${scope}_presentation`,
        descriptor_map:
          scope === Scope.DidRInvite ||
          scope === Scope.TirInvite ||
          scope === Scope.TntAuthorize
            ? [
                {
                  id: `${scope}_credential`,
                  format: 'jwt_vp',
                  path: '$',
                  path_nested: {
                    id: `${scope}_credential`,
                    format: 'jwt_vc',
                    path: '$.vp.verifiableCredential[0]',
                  },
                },
              ]
            : [],
      }),
    );

    const response = await httpCall.post(
      tokenEndpoint,
      tokenPresentatationEndpointParams,
    );
    if (!response.ok) {
      const errorData = await response.text(); // parse the error response as JSON
      throw new EbsiAuthorisationApiError(
        `Error ${response.status}: ${errorData}`,
      );
    }
    const data = (await response.json()) as TokenResponse;
    if (!data.access_token || !isJwt(data.access_token))
      throw new EbsiAuthorisationApiError(JSON.stringify(data));
    return data;
  }

  private async getAuthorisationApiOpenidMetadata(): Promise<{
    presentationDefinitionEndpoint: string;
    tokenEndpoint: string;
  }> {
    const authorisationApiMetadata = await httpCall.get(
      `${CONFIG_OPTS.pilot.ebsiAuthorisationApiUrl}/.well-known/openid-configuration`,
    );
    const authorisationApiMetadataResponse =
      (await authorisationApiMetadata.json()) as {
        presentation_definition_endpoint: string;
        token_endpoint: string;
      };
    const {
      presentation_definition_endpoint: presentationDefinitionEndpoint,
      token_endpoint: tokenEndpoint,
    } = authorisationApiMetadataResponse;
    return {
      presentationDefinitionEndpoint,
      tokenEndpoint,
    };
  }
}
