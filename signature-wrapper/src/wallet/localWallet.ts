import { JWK } from "jose";
import { Buffer } from "buffer";
import { SignatureOptions } from "../dtos/signatures";
import { isVerifiableCredential, JWKKeyPair } from "../../utils/util";
import PasswordCipherWallet from "./passwordCipherWallet";
import { COMPONENT_KEYSTORE, COMPONENT_PASSWORD } from "../../config";
import { ebsiWrapper } from "../../../../shared/wrappers/ebsiWrapper";
import { Wallet } from "./wallet.interface.js";
import {
  Algorithms,
  EntityKeyPair,
  KeyPairData,
  KeyPairJwk,
} from "../types/types.js";
import { ethers } from "ethers";
import {
  exportKeyPairJwk,
  getPrivateKeyJwkES256,
  prefixWith0x,
} from "../utils/keys.js";

export default class LocalWallet implements Wallet {
  constructor() {
    this.keys = {};
  }

  private keys: {
    ES256?: KeyPairJwk;
    // RS256?: KeyPairJwk;
    // EdDSA?: KeyPairJwk;
  };
  private did: string;
  private ethWallet: ethers.Wallet;

  async setJwk(entityKeyPair: EntityKeyPair): Promise<void> {
    this.did = entityKeyPair.did;
    this.ethWallet = new ethers.Wallet(
      prefixWith0x(
        entityKeyPair.data.find((key) => key.alg === Algorithms.ES256K)
          ?.privateKeyHex as string,
      ),
    );
    this.did = entityKeyPair.did;
    const privateKeyJwkES256 = getPrivateKeyJwkES256(
      entityKeyPair.data.find((key) => key.alg === Algorithms.ES256K)
        ?.privateKeyHex as string,
    );
    this.keys[Algorithms.ES256] = exportKeyPairJwk(
      Algorithms.ES256,
      privateKeyJwkES256,
    );
  }
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
