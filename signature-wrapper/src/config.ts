export const EBSI_ENVIRONMENT = 'pilot';
export const EBSI_HOST = `api-${EBSI_ENVIRONMENT}.ebsi.eu`;

export const EBSI_CONFIG = {
  authority: `${EBSI_HOST}`,
  didRegistry: `https://${EBSI_HOST}/did-registry/v5/identifiers`,
  trustedIssuerRegistry: `https://${EBSI_HOST}/trusted-issuers-registry/v5/issuers`,
  trustedPoliciesRegistry: `https://${EBSI_HOST}/trusted-policies-registry/v3/users`,
  authorisationApiUrl: `https://${EBSI_HOST}/authorisation/v4`,
  domain: `https://${EBSI_HOST}`,
  audience: `${EBSI_HOST}`,
};
