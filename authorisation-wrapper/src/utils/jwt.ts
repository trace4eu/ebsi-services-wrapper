import { decodeJwt } from 'jose';

export function isJwt(jwt: string): boolean {
  try {
    const jwtDecoded = decodeJwt(jwt);
    return !!jwtDecoded;
  } catch (error) {
    return false;
  }
}

export function isOryFormatAccessToken(jwt: string): boolean {
  try {
    return jwt.startsWith('ory_at_');
  } catch (error) {
    return false;
  }
}
