import { base64url } from "multiformats/bases/base64";
import { JWK } from "jose";
import { Buffer } from "buffer";
import elliptic from "elliptic";
import { Algorithm, KeyPairJwk } from "../types/types.js";
import { EbsiWallet } from "@cef-ebsi/wallet-lib";

const EC = elliptic.ec;

export function getPublicKeyJwk(jwk: JWK, alg: string): JWK {
  switch (alg) {
    case Algorithm.ES256K:
    case Algorithm.ES256: {
      const { d, ...publicJwk } = jwk;
      return publicJwk;
    }
    default:
      throw new Error(`Algorithm ${alg} not supported`);
  }
}
export function getPrivateKeyJwkES256(privateKeyHex: string): JWK {
  const ec = new EC("p256");
  const privateKey = removePrefix0x(privateKeyHex);
  const keyPair = ec.keyFromPrivate(privateKey, "hex");
  const validation = keyPair.validate();
  if (!validation.result) {
    throw new Error(validation.reason);
  }
  const pubPoint = keyPair.getPublic();
  return {
    kty: "EC",
    crv: "P-256",
    x: base64url.baseEncode(pubPoint.getX().toBuffer("be", 32)),
    y: base64url.baseEncode(pubPoint.getY().toBuffer("be", 32)),
    d: base64url.baseEncode(Buffer.from(privateKey, "hex")),
  };
}

export function exportKeyPairJwk(
  alg: Algorithm,
  privateKeyJwk: JWK,
): KeyPairJwk {
  const publicKeyJwk = getPublicKeyJwk(privateKeyJwk, alg);
  return {
    id: "",
    kid: "",
    privateKeyJwk,
    publicKeyJwk,
  };
}

export function prefixWith0x(key: string): string {
  return key.startsWith("0x") ? key : `0x${key}`;
}

export function removePrefix0x(key: string): string {
  return key.startsWith("0x") ? key.slice(2) : key;
}

export function getPrivateKeyJwk(privateKeyHex: string): JWK {
  const publicKeyJWK = new EbsiWallet(privateKeyHex).getPublicKey({
    format: "jwk",
  }) as JWK;
  const d = Buffer.from(removePrefix0x(privateKeyHex), "hex")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
  return { ...publicKeyJWK, d };
}
