import { decodeJwt } from 'jose';

export function isJwt(jwt: string): boolean {
  try {
    const jwtDecoded = decodeJwt(jwt);
    return !!jwtDecoded;
  } catch (error) {
    return false;
  }
}
