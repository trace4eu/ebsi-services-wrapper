import { TokenResponse } from "./types/authToken";

export interface AuthorisationApi {
  getAccessToken(
    alg: string,
    scope: string,
    credential: string | string[],
  ): Promise<TokenResponse>;
}
