import { Wallet } from "./wallet.interface.js";
import { Algorithm, EntityKeyPair, KeyPairJwk } from "../types/types.js";
import { ethers } from "ethers";
import {
  exportKeyPairJwk,
  getPrivateKeyJwk,
  getPrivateKeyJwkES256,
  prefixWith0x,
} from "../utils/keys.js";

import {
  createVerifiablePresentationJwt,
  EbsiIssuer,
  EbsiVerifiablePresentation,
} from "@cef-ebsi/verifiable-presentation";
import { randomUUID } from "node:crypto";
import { CONFIG_OPTS } from "../config.js";

export default class LocalWallet implements Wallet {
  constructor(entityKeyPair: EntityKeyPair) {
    this.keys = {};
    this.did = entityKeyPair.did;
    this.ethWallet = new ethers.Wallet(
      prefixWith0x(
        entityKeyPair.keys.find((key) => key.alg === Algorithm.ES256K)
          ?.privateKeyHex as string,
      ),
    );
    const privateKeyJwk = getPrivateKeyJwk(this.ethWallet.privateKey);
    this.keys[Algorithm.ES256K] = exportKeyPairJwk(
      Algorithm.ES256K,
      privateKeyJwk,
    );
    this.did = entityKeyPair.did;
    const privateKeyJwkES256 = getPrivateKeyJwkES256(
      entityKeyPair.keys.find((key) => key.alg === Algorithm.ES256K)
        ?.privateKeyHex as string,
    );
    this.keys[Algorithm.ES256] = exportKeyPairJwk(
      Algorithm.ES256,
      privateKeyJwkES256,
    );
  }

  private keys: {
    ES256K?: KeyPairJwk;
    ES256?: KeyPairJwk;
    // RS256?: KeyPairJwk;
    // EdDSA?: KeyPairJwk;
  };
  private did: string;
  private ethWallet: ethers.Wallet;

  async signVP(alg: Algorithm, vc: string | string[]): Promise<string> {
    const keys = this.keys[alg];
    if (!keys) throw new Error(`No keys defined for alg ${alg}`);

    const issuer: EbsiIssuer = {
      did: this.did,
      kid: keys.kid,
      privateKeyJwk: keys.privateKeyJwk,
      publicKeyJwk: keys.publicKeyJwk,
      alg: alg as "ES256K",
    };

    let verifiableCredential: string[];
    if (vc === "empty") {
      verifiableCredential = [];
    } else if (Array.isArray(vc)) {
      verifiableCredential = vc;
    } else {
      verifiableCredential = [vc];
    }

    const payload = {
      id: `urn:did:${randomUUID()}`,
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiablePresentation"],
      holder: this.did,
      verifiableCredential,
    } as EbsiVerifiablePresentation;

    return await createVerifiablePresentationJwt(
      payload,
      issuer,
      CONFIG_OPTS.pilot.authorisationApiUrl,
      {
        skipValidation: true,
        ebsiAuthority: CONFIG_OPTS.pilot.domain
          .replace("http://", "")
          .replace("https://", ""),
        nonce: randomUUID(),
        exp: Math.floor(Date.now() / 1000) + 900,
        nbf: Math.floor(Date.now() / 1000) - 100,
      },
    );
  }

  getEntityKey(alg: Algorithm) {
    return this.keys[alg];
  }
}
