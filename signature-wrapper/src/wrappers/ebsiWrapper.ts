import {
  createVerifiableCredentialJwt,
  EbsiIssuer,
  EbsiVerifiableAttestation,
} from '@cef-ebsi/verifiable-credential';
import {
  createVerifiablePresentationJwt,
  CreateVerifiablePresentationJwtOptions,
  EbsiVerifiablePresentation,
} from '@cef-ebsi/verifiable-presentation';
import crypto from 'crypto';
import { SignatureOptions } from '../types/types';
import { EBSI_CONFIG } from '../config';
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

  createVerifiableCredentialJwt = async (
    payload: Buffer,
    signatureOptions: SignatureOptions,
    issuer: EbsiIssuer,
  ): Promise<string> => {
    const vcPayload = JSON.parse(
      payload.toString(),
    ) as EbsiVerifiableAttestation;

    const issuedAt = new Date();
    const issuanceDate = `${issuedAt.toISOString().slice(0, -5)}Z`;
    if (signatureOptions.expiresIn) {
      const expiresAt = new Date(
        issuedAt.getTime() + signatureOptions.expiresIn,
      );
      vcPayload.validUntil = `${expiresAt.toISOString().slice(0, -5)}Z`;
    }
    vcPayload.issuanceDate = issuanceDate;
    vcPayload.issued = issuanceDate;
    vcPayload.validFrom = issuanceDate;

    return createVerifiableCredentialJwt(vcPayload, issuer, {
      ebsiAuthority: EBSI_CONFIG.authority,
      ebsiEnvConfig: {
        didRegistry: EBSI_CONFIG.didRegistry,
        trustedIssuersRegistry: EBSI_CONFIG.trustedIssuerRegistry,
        trustedPoliciesRegistry: EBSI_CONFIG.trustedPoliciesRegistry,
      },
    });
  };
}

type EbsiWrapperVerifiablePresentation = EbsiVerifiablePresentation;
type EbsiWrapperIssuer = EbsiIssuer;

const ebsiWrapper = new EbsiWrapper();

export { ebsiWrapper, EbsiWrapperIssuer, EbsiWrapperVerifiablePresentation };
