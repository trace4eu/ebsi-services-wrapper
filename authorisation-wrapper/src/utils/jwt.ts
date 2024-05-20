import { decodeJwt } from "jose";

export function isJwt(jwt: string): boolean {
  try {
    const jwtDecoded = decodeJwt(jwt);
    if (jwtDecoded) return true;
  } catch (error) {
    return false;
  }
}
