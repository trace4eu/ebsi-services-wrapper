import { Wallet } from './wallet.interface';
import {
  Algorithm,
  JwksResponse,
  JwtHeader,
  JWTVerifyResult,
  KeyPairData,
  KeyPairJwk,
  SignatureOptions,
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

import { EBSI_CONFIG } from '../config';
import * as crypto from 'crypto';
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
import { EbsiIssuer } from '@cef-ebsi/verifiable-credential';
import { joseWrapper } from '../wrappers/joseWrapper';

export class LocalWallet implements Wallet {
  constructor(did: string, keys: KeyPairData[]) {
    this.validateKeys(keys);
    this.keys = [];
    this.did = did;
    this.privateKeyEs256kCounter = 0;
    this.ethWallet = [];

    keys.forEach((keyPair) => {
      if (keyPair.alg === Algorithm.ES256K && keyPair.privateKeyHex) {
        this.ethWallet.push(
          new ethers.Wallet(prefixWith0x(keyPair.privateKeyHex)),
        );
        this.keys.push(
          exportKeyPairJwk(
            Algorithm.ES256K,
            getPrivateKeyJwk(keyPair.privateKeyHex),
            keyPair.kid,
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
  protected ethWallet!: ethers.Wallet[];
  private privateKeyEs256kCounter: number;

  async signVP(
    alg: string,
    vc: string | string[],
    expiration?: number,
  ): Promise<string> {
    const keyPair: KeyPairJwk = this.findKeyByAlg(alg as Algorithm);
    keyPair.kid = await joseWrapper.calculateJwkThumbprint(
      keyPair.publicKeyJwk,
    );

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

    const expirationTime = expiration ? expiration : 250;

    return await ebsiWrapper.createVerifiablePresentationJwt(
      payload,
      issuer,
      EBSI_CONFIG.authorisationApiUrl,
      {
        ebsiAuthority: EBSI_CONFIG.authority,
        exp: Math.floor(Date.now() / 1000) + expirationTime,
        nbf: Math.floor(Date.now() / 1000) - 100,
      },
    );
  }

  async signEthTx(data: UnsignedTransaction): Promise<SignatureResponse> {
    validateUnsignedTransaction(data);
    const signedRawTransaction = await ethersWrapper.signTransaction(
      this.ethWallet[this.privateKeyEs256kCounter],
      formatEthereumTransaction(data),
    );

    this.incrementCounter();
    const { r, s, v } = ethers.utils.parseTransaction(signedRawTransaction);
    return {
      r,
      s,
      v: `0x${Number(v).toString(16)}`,
      signedRawTransaction,
    };
  }

  async signVC(data: Buffer, opts: SignatureOptions): Promise<string> {
    const keyPair: KeyPairJwk = this.findKeyByAlg(opts.alg as Algorithm);
    keyPair.kid = keyPair.kid
      ? keyPair.kid
      : await joseWrapper.calculateJwkThumbprint(keyPair.publicKeyJwk);
    const issuer: EbsiIssuer = {
      did: this.did,
      kid: keyPair.kid,
      alg: keyPair.alg,
      publicKeyJwk: keyPair.publicKeyJwk,
      privateKeyJwk: keyPair.privateKeyJwk,
    };
    return await ebsiWrapper.createVerifiableCredentialJwt(data, opts, issuer);
  }

  async signJwt(
    data: Buffer,
    opts: SignatureOptions,
    header?: JwtHeader,
  ): Promise<string> {
    const keyPair: KeyPairJwk = this.findKeyByAlg(opts.alg as Algorithm);
    keyPair.kid =
      keyPair.kid ??
      `${this.did}#${await joseWrapper.calculateJwkThumbprint(keyPair.publicKeyJwk)}`;
    if (header) {
      header.kid = header.kid ?? keyPair.kid;
    }

    return await joseWrapper.signJwt(keyPair.privateKeyJwk, data, header);
  }

  async verifyJwt(jwt: string, alg: string): Promise<JWTVerifyResult> {
    const keyPair: KeyPairJwk = this.findKeyByAlg(alg as Algorithm);
    return await joseWrapper.verifyJwt(jwt, keyPair.publicKeyJwk, alg);
  }

  getDid(): string {
    return this.did;
  }

  getHexDid(): string {
    return `0x${Buffer.from(this.did, 'utf8').toString('hex')}`;
  }

  getEthAddress(): string {
    return this.ethWallet[this.privateKeyEs256kCounter].address;
  }
  getPublicJwks(): JwksResponse {
    const jwks = this.keys.map((key) => {
      return key.publicKeyJwk;
    });
    return {
      keys: jwks,
    };
  }

  private validateKeys(keys: KeyPairData[]): void {
    const isES256K = keys.some((key) => key.alg === Algorithm.ES256K);
    const isES256 = keys.some((key) => key.alg === Algorithm.ES256);
    if (!(isES256K || isES256))
      throw new InitializationError('ES256 and ES256K keys are required');
  }

  private validaSignatureAlgorithm(alg: string): void {
    if (alg !== Algorithm.ES256 && alg !== Algorithm.ES256K)
      throw new UnsupportedAlgorithmError(`Unsupported algorithm: ${alg}`);
  }

  private findKeyByAlg(alg: Algorithm, position?: number) {
    const keyPair: KeyPairJwk | undefined = findKeyByAlg(
      this.keys,
      alg as Algorithm,
      position ?? 0,
    );
    if (!keyPair) throw new SignatureError(`No keys defined for alg ${alg}`);
    this.validaSignatureAlgorithm(keyPair.alg);
    return keyPair;
  }

  private incrementCounter() {
    if (this.privateKeyEs256kCounter === this.ethWallet.length - 1) {
      this.privateKeyEs256kCounter = 0;
      return;
    }
    ++this.privateKeyEs256kCounter;
  }
}
