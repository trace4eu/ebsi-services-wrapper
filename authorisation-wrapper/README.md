# Documentation: authorisation wrapper
The `AuthorisationWrapper` class can be used for requesting an access token to the following authorisation servers:
- EBSI Authorisation API: https://hub.ebsi.eu/apis/pilot/authorisation/v4.  
  This is used by the `TimestampWrapper` and `TrackAndTraceWrapper` for requesting an access token to EBSI, required value to consume EBSI Timestamp and Track and Trace apis.  


- Trace4eu authorization server: https://api-dev-auth.trace4eu.eu/oauth2/token.
  This server is part of the authorization-and-authentication server of Trace4eu (https://github.com/trace4eu/authorization-and-authentication).
  The client needs to execute a Oauth client credentials flow by sending a jwt assertion
  It's used by the `vc-component` too when issuing EBSI verifiable credentials and when the authorization server issue and verify JWTs for managing the credential issuance process within the OIDC4VCI flow.

It depends on the `SignatureWrapper` for making the signatures. In order to instantiate the `EbsiAuthorisationApi` or the `Trace4euAuthorisationApi`, the wallet is required.

## Constructor

### `constructor(wallet: Wallet)`

Creates a new instance of the `Wallet` class.

- **Parameters:**
    - `isEnterprise: boolean`: flag to indicate if keys will be imported locally otherwise it will link to an Enterprise Wallet.
    - `did: string`: it represents the did of the entity.
    - `entityKeys: KeyPairData[]`: array of keys in hex format. You need to specify the algorithm of each key.


- **Example:**
  ```typescript
  const did = 'did:ebsi:zobuuYAHkAbRFCcqdcJfTgR';
  const entityKeys = [
    {
      alg: Algorithm.ES256K,
      privateKeyHex:
        '<ecc private key>',
      kid: '<optional key identifier>'
    },
    {
      alg: Algorithm.ES256,
      privateKeyHex:
        '<ecc private key>',,
      kid: '<optional key identifier>'
    },
  ];
  const wallet = WalletFactory.createInstance(false, did, entityKeys);

### `EbsiAuthorisationApi(wallet: Wallet)`

Creates a new instance of the `EbsiAuthorisationApi` class.

- **Parameters:**
  - `wallet: Wallet`: wallet will be used for 


- **Example:**
  ```typescript
  const ebsiAuthorisationApi = new EbsiAuthorisationApi(wallet);

### `Trace4euAuthorisationApi(wallet: Wallet)`

Creates a new instance of the `Trace4euAuthorisationApi` class.

- **Parameters:**
  - `wallet: Wallet`: wallet will be used for


- **Example:**
  ```typescript
  const trace4euAuthorisationApi = new Trace4euAuthorisationApi(wallet);

## Methods

### `getAccessToken`

Request an access token to the corresponding authorization server.

- **Parameters:**
  - `alg: string`: algorithm to be used.
  - `scope: string`: scope to be requested
  - `credentials: string | string[]`: ebsi authz server is an OIDC4VP server and vp_token needs to be presented with the required VCs according to the presentation definition

- **Returns:**
  - `Promise<string>`: access token

- **Example:**
  ```typescript
  const ebsiAccessToken = await ebsiAuthorisationApi.getAccessToken(
    'ES256',
    'tnt_create',
    [],
  );

  const trace4euAccessToken = await trace4euAuthorisationApi.getAccessToken(
    'ES256',
    'ocs:read',
  );
