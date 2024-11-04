import {
  calculateJwkThumbprint,
  decodeJwt,
  exportJWK,
  importJWK,
  JWK,
  JWTHeaderParameters,
  JWTPayload,
  jwtVerify,
  JWTVerifyResult,
  KeyLike,
  SignJWT,
} from 'jose';
import { JwtHeader } from '../types/types';

export type JoseWrapperJWK = JWK;
class JoseWrapper {
  exportJWK = async (key: KeyLike): Promise<JWK> => {
    return exportJWK(key);
  };

  verifyJwt = async (
    jwt: string,
    publicKey: JWK,
    alg: string,
  ): Promise<JWTVerifyResult> => {
    return jwtVerify(jwt, await importJWK(publicKey, alg));
  };

  signJwt = async (
    jwk: JWK,
    payload: Buffer,
    header?: JwtHeader,
  ): Promise<string> => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const jws = new SignJWT(JSON.parse(payload.toString()))
      .setProtectedHeader(
        <JWTHeaderParameters>header || {
          alg: 'ES256K',
          typ: 'JWT',
        },
      )
      .sign(await importJWK(jwk, header.alg || 'ES256K'));

    return jws;
  };

  calculateJwkThumbprint = async (publicJwk: JWK) => {
    return calculateJwkThumbprint(publicJwk, 'sha256');
  };

  decodeJWT = (jwt: string): JWTPayload => {
    return decodeJwt(jwt);
  };
}
const joseWrapper = new JoseWrapper();
export { joseWrapper, JWK, JWTVerifyResult };
