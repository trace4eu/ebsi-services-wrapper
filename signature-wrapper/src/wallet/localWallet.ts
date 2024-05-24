import { Wallet } from './wallet.interface';
import {
  Algorithm,
  KeyPairData,
  KeyPairJwk,
  SignatureResponse,
  UnsignedTransaction,
} from '../types/types';
import { ethers } from 'ethers';
import {
  exportKeyPairJwk,
  findKeyByAlg,
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
import { InitializationError, SignatureError } from '../errors';
import {
  formatEthereumTransaction,
  validateUnsignedTransaction,
} from '../utils/ethers';
import { ethersWrapper } from '../wrappers/ethersWrapper';
import { UnsupportedAlgorithmError } from '../errors/UnspportedAlgorithmError';

const supportedSignatureAlgorithms = [Algorithm.ES256K, Algorithm.ES256];
export class LocalWallet implements Wallet {
  constructor(did: string, keys: KeyPairData[]) {
    this.validateKeys(keys);
    this.keys = [];
    this.did = did;

    keys.forEach((keyPair) => {
      if (keyPair.alg === Algorithm.ES256K && keyPair.privateKeyHex) {
        this.ethWallet = new ethers.Wallet(prefixWith0x(keyPair.privateKeyHex));
        this.keys.push(
          exportKeyPairJwk(
            Algorithm.ES256K,
            getPrivateKeyJwk(keyPair.privateKeyHex),
          ),
        );
      }
      if (keyPair.alg === Algorithm.ES256 && keyPair.privateKeyHex) {
        const privateKeyJwkES256 = getPrivateKeyJwkES256(keyPair.privateKeyHex);
        this.keys.push(exportKeyPairJwk(keyPair.alg, privateKeyJwkES256));
      }
    });
  }

  private readonly keys: KeyPairJwk[];
  private readonly did: string;
  protected ethWallet!: ethers.Wallet;

  async signVP(alg: string, vc: string | string[]): Promise<string> {
    const keyPair: KeyPairJwk | undefined = findKeyByAlg(
      this.keys,
      alg as Algorithm,
    );
    if (!keyPair) throw new SignatureError(`No keys defined for alg ${alg}`);
    this.validaSignatureAlgorithm(keyPair.alg);
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

  async signEthTx(data: UnsignedTransaction): Promise<SignatureResponse> {
    validateUnsignedTransaction(data);

    const signedRawTransaction = await ethersWrapper.signTransaction(
      this.ethWallet,
      formatEthereumTransaction(data),
    );
    const { r, s, v } = ethers.utils.parseTransaction(signedRawTransaction);
    return {
      r,
      s,
      v: `0x${Number(v).toString(16)}`,
      signedRawTransaction,
    };
  }

  getDid(): string {
    return this.did;
  }

  getEthAddress(): string {
    return this.ethWallet.address;
  }

  private validateKeys(keys: KeyPairData[]): void {
    const isES256K = keys.some((key) => key.alg === Algorithm.ES256K);
    const isES256 = keys.some((key) => key.alg === Algorithm.ES256);
    if (!isES256K || !isES256)
      throw new InitializationError('ES256 and ES256K keys are required');
  }

  private validaSignatureAlgorithm(alg: string): void {
    if (!supportedSignatureAlgorithms.includes(alg as Algorithm))
      throw new UnsupportedAlgorithmError(
        `Supported algorithms: ${supportedSignatureAlgorithms.toString()}`,
      );
  }
}
