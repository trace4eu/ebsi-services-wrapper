# Documentation: signature wrapper
The `SignatureWrapper` class is used by the `TimestampWrapper` and `TrackAndTraceWrapper` for signing the transactions.
It's used by the `vc-component` too when issuing EBSI verifiable credentials and when the authorization server issue and verify JWTs for managing the credential issuance process within the OIDC4VCI flow.

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

## Methods

### `signVC`

Creates a signed VC in JWT format.

- **Parameters:**
    - `data: Buffer`: VC data in Buffer format.
    - `opts: SignatureOptions`: algorithm should be specified. Apart from that other parameters can be setup: issuer, kid, expiresIn, iat

- **Returns:**
    - `Promise<string>`: signed JWT VC.
  
- **Example:**
  ```typescript
  const vcPayload = {
    '@context': ['https://www.w3.org/2018/credentials/v1'],
    id: 'urn:did:123456',
    type: ['VerifiableCredential', 'VerifiableAttestation', 'VerifiableId'],
    issuer: wallet.getDid(),
    credentialSubject: {
      id: 'did:key:z2dmzD81cgPx8Vki7JbuuMmFYrWPgYoytykUZ3eyqht1j9KbrDt4zxXoDrBWYFiATYZ8G9JMeEXC7Kki24fbTwtsJbGe5qcbkYFunSzcDokMRmj8UJ1PbdCGh33mf97K3To89bMzd15qrYq3VkDztoZqfmujkJVpvTbqoXWXqxmzNDbvMJ',
      personalIdentifier: 'IT/DE/1234',
      familyName: 'Castafiori',
      firstName: 'Bianca',
      dateOfBirth: '1930-10-01',
    },
    credentialSchema: {
      id: 'https://api-pilot.ebsi.eu/trusted-schemas-registry/v2/schemas/zDpWGUBenmqXzurskry9Nsk6vq2R8thh9VSeoRqguoyMD',
      type: 'FullJsonSchemaValidator2021',
    },
  };
  const vc = await wallet.signVC(Buffer.from(JSON.stringify(vcPayload)), {
    alg: Algorithm.ES256,
  });

### `signJwt`

Creates a signed JWT

- **Parameters:**
    - `data: Buffer`: The ID of the hashing algorithm used. Use `0` for SHA-256.
    - `opts: SignatureOptions`: The hash value to be recorded. Unlike EBSI's Timestamp API, this method allows only one hash value instead of three.
    - `header?: JwtHeader`: Optional parameter. Some jwt header params can be specified: typ, alg, kid

- **Returns:**
  - `Promise<string>`: signed JWT

- **Example:**
  ```typescript
  const payload = { test: 1234 };
  const jwt = await wallet.signJwt(
    Buffer.from(JSON.stringify(payload)),
    { alg: Algorithm.ES256 },
    {
      typ: 'JWT',
      alg: 'ES256',
    },
  );

### `verifyJwt`

Verify a signed JWT

- **Parameters:**
  - `jwt: string`: The ID of the hashing algorithm used. Use `0` for SHA-256.
  - `alg: string`: The hash value to be recorded. Unlike EBSI's Timestamp API, this method allows only one hash value instead of three.

- **Returns:**
  - `Promise<JWTVerifyResult>`: In case of verifying correctly the JWT, it returns an object that contains the decoded payload and header.

- **Example:**
  ```typescript
  const jwt =
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiIsImtpZCI6Ijg0OXh3dWNxaFRRV21tcGpweG0yNlA3UmgtMTlwZm5COURTY0JZRkNDWXcifQ.eyJ0ZXN0IjoxMjM0fQ.9x6SCpo2b9Wq4f1EnzAUx1xqUK62QdRti_C3Mkwr1VLsRpHNPY0RJO4B8EATDbL_oU0xhfsYNrDvPTYVLyDhEA';
  const result = await wallet.verifyJwt(jwt, 'ES256');

### `signVP`

Sign an Verifiable Presentation (EBSI format compliance)

- **Parameters:**
    - `alg: string`: Algorithm to be used
    - `vc: string`: verifiable credential (one or more) to include in the Verifiable Presentation. It should be a JWTC VC (Verifiable Credential Data Model 1.1). If empty means that no VCs (empty array) will be included in the VP.
    - `expiration?: number`: Expiration time used when signing the Verifiable Presentation

- **Returns:**
    - `Promise<string>`: the resulting Verifiable Presentation in JWT format

- **Example:**
  ```typescript
  const vp = await wallet.signVP(Algorithm.ES256K, 'empty');

### `signEthTx`

Creates a signed Ethereum Transaction. This is used by the `TimestampWrapper` and `TrackAndTraceWrapper` for sending signed transactions to the EBSI ledger.

- **Parameters:**
    - `data: UnsignedTransaction`: The wallet will try to use the key with algorithm `ES256K`

- **Returns:**
    - `Promise<SignatureResponse>`: The result object will contain the signedRawTransaction, and the r s v signature components.

- **Example:**
  ```typescript
  const unsignedEthTrx = {
    to: '0xf15e3682BCe7ADDefb2F1E1EAE3163448DB539f6',
    data: '0xfbb2240800000000000000000000000000000000000000000000000000000000000000e0000000000000000000000000000000000000000000000000000000000000014000000000000000000000000000000000000000000000000000000000000001c00000000000000000000000000000000000000000000000000000000000000220000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000664b6656000000000000000000000000000000000000000000000000000000006f7f47ce00000000000000000000000000000000000000000000000000000000000000216469643a656273693a7a323268394c3361386633327646394359396a574d714b4c00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005c7b2240636f6e74657874223a5b2268747470733a2f2f7777772e77332e6f72672f6e732f6469642f7631222c2268747470733a2f2f773369642e6f72672f73656375726974792f7375697465732f6a77732d323032302f7631225d7d00000000000000000000000000000000000000000000000000000000000000000000002b7a36326f646a4e6f79547954742d694964704e7033394a33465639325544615030525042457354506f456b000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004104c79c36781d4981cd81766a4bd3fad000ac2d6f43c979b1c89dd4ba011ee2fbdbe409cc45af9324668dd6e3b224c6ff26332f0469f263d178e6930235a6d0900600000000000000000000000000000000000000000000000000000000000000',
    value: '0x0',
    nonce: '0x0',
    chainId: '0x181f',
    gasLimit: '0x1b395a',
    gasPrice: '0x0',
  };

  const signedTrx = await wallet.signEthTx(unsignedEthTrx);

  const expectedSignedTrx = {
  r: '0x5fcf886bed6b4270d52745a119d5b0b5fcd3c9594501294603883c8be61e7990',
  s: '0x2a1b021bc16ad223eb10bb27a9669f76b27fdcac92edd61fffab2ce90cda2b24',
  v: '0x3062',
  signedRawTransaction:
  '0xf903088080831b395a94f15e3682bce7addefb2f1e1eae3163448db539f680b902a4fbb2240800000000000000000000000000000000000000000000000000000000000000e0000000000000000000000000000000000000000000000000000000000000014000000000000000000000000000000000000000000000000000000000000001c00000000000000000000000000000000000000000000000000000000000000220000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000664b6656000000000000000000000000000000000000000000000000000000006f7f47ce00000000000000000000000000000000000000000000000000000000000000216469643a656273693a7a323268394c3361386633327646394359396a574d714b4c00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005c7b2240636f6e74657874223a5b2268747470733a2f2f7777772e77332e6f72672f6e732f6469642f7631222c2268747470733a2f2f773369642e6f72672f73656375726974792f7375697465732f6a77732d323032302f7631225d7d00000000000000000000000000000000000000000000000000000000000000000000002b7a36326f646a4e6f79547954742d694964704e7033394a33465639325544615030525042457354506f456b000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004104c79c36781d4981cd81766a4bd3fad000ac2d6f43c979b1c89dd4ba011ee2fbdbe409cc45af9324668dd6e3b224c6ff26332f0469f263d178e6930235a6d0900600000000000000000000000000000000000000000000000000000000000000823062a05fcf886bed6b4270d52745a119d5b0b5fcd3c9594501294603883c8be61e7990a02a1b021bc16ad223eb10bb27a9669f76b27fdcac92edd61fffab2ce90cda2b24',
  };

### `getDid`

It returns the did of the wallet

- **Returns:**
    - `string`: did

### `getHexDid`

It returns the did in hex format. It is used in the `TrackAndTraceWrapper` for defining the sender in the `writeEvent` transaction

- **Returns:**
  - `string`: did in hex format

### `getEthAddress`

It returns the ethereum address that is computed from the public key. It is used by the `TimestampWrapper` and `TrackAndTraceWrapper` for specifying the `from` field when sending the signed transaction to the EBSI JSON RPC API. 

- **Returns:**
  - `string`: ethereum address
---
