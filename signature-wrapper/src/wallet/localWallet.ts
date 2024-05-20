import { Wallet } from './wallet.interface';
import { Algorithm, EntityKeyPair, KeyPairJwk } from '../types/types';
import { ethers } from 'ethers';
import {
  exportKeyPairJwk,
  getPrivateKeyJwk,
  getPrivateKeyJwkES256,
  prefixWith0x,
} from '../utils/keys';

import { CONFIG_OPTS } from '../config';
import * as crypto from 'crypto';
import { calculateJwkThumbprint } from 'jose';
import {
  ebsiWrapper,
  EbsiWrapperIssuer,
  EbsiWrapperVerifiablePresentation,
} from '../wrappers/ebsiWrapper';
import { SignatureError } from '../errors/SignatureError';

export class LocalWallet implements Wallet {
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
      entityKeyPair.keys.find((key) => key.alg === Algorithm.ES256)
        ?.privateKeyHex as string,
    );
    this.keys[Algorithm.ES256] = exportKeyPairJwk(
      Algorithm.ES256,
      privateKeyJwkES256,
    );
  }

  private readonly keys: {
    ES256K?: KeyPairJwk;
    ES256?: KeyPairJwk;
    // RS256?: KeyPairJwk;
    // EdDSA?: KeyPairJwk;
  };
  private readonly did: string;
  private ethWallet: ethers.Wallet;

  async signVP(alg: string, vc: string | string[]): Promise<string> {
    const keyPair = this.keys[alg];
    if (!keyPair) throw new SignatureError(`No keys defined for alg ${alg}`);
    keyPair.kid = await calculateJwkThumbprint(keyPair.publicKeyJwk, 'sha256');

    const issuer: EbsiWrapperIssuer = {
      did: this.did,
      kid: `${this.did}#${keyPair.kid}`,
      privateKeyJwk: keyPair.privateKeyJwk,
      publicKeyJwk: keyPair.publicKeyJwk,
      alg: alg as 'ES256' | 'ES256K',
    };

    let verifiableCredential: string[];
    if (vc === 'empty') {
      verifiableCredential = [];
    } else if (Array.isArray(vc)) {
      verifiableCredential = vc;
    } else {
      verifiableCredential = [vc];
    }

    const payload = {
      id: `urn:did:${crypto.randomUUID()}`,
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiablePresentation'],
      holder: this.did,
      verifiableCredential,
    } as EbsiWrapperVerifiablePresentation;

    return await ebsiWrapper.createVerifiablePresentationJwt(
      payload,
      issuer,
      CONFIG_OPTS.pilot.authorisationApiUrl,
      {
        ebsiAuthority: CONFIG_OPTS.pilot.domain
          .replace('http://', '')
          .replace('https://', ''),
        exp: Math.floor(Date.now() / 1000) + 900,
        nbf: Math.floor(Date.now() / 1000) - 100,
      },
    );
  }

  getEntityKey(alg: Algorithm) {
    return this.keys[alg];
  }

  private validateInput(): void {}
}
