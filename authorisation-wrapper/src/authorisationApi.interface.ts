import { TokenResponse } from './types';

export interface AuthorisationApi {
  getAccessToken(
    alg: string,
    scope: string,
    credential?: string | string[],
  ): Promise<TokenResponse>;
}
