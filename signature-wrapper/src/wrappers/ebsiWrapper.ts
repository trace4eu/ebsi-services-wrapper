import {
  createVerifiableCredentialJwt,
  EbsiIssuer,
  EbsiVerifiableAttestation,
  verifyCredentialJwt,
  VerifyCredentialOptions,
} from '@cef-ebsi/verifiable-credential';
import { JWK } from 'jose';
import { EbsiWallet } from '@cef-ebsi/wallet-lib';
import {
  createVerifiablePresentationJwt,
  EbsiVerifiablePresentation,
} from '@cef-ebsi/verifiable-presentation';
import { CreateVerifiablePresentationJwtOptions } from '@cef-ebsi/verifiable-presentation/dist/types';
import { CONFIG_OPTS } from '../config';
import crypto from 'crypto';

class EbsiWrapper {
  createVerifiablePresentationJwt = async (
    payload: EbsiVerifiablePresentation | unknown,
    holder: EbsiIssuer,
    audience: string,
    options: CreateVerifiablePresentationJwtOptions,
  ): Promise<string> => {
    return createVerifiablePresentationJwt(payload, holder, audience, {
      ...options,
      skipValidation: false,
      nonce: crypto.randomUUID(),
    });
  };
}

type EbsiWrapperVerifiablePresentation = EbsiVerifiablePresentation;
type EbsiWrapperIssuer = EbsiIssuer;

const ebsiWrapper = new EbsiWrapper();

export { ebsiWrapper, EbsiWrapperIssuer, EbsiWrapperVerifiablePresentation };
