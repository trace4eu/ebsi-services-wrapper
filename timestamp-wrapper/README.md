# Documentation: timestamp wrapper
The `TimestampWrapper` class simplifies the usage of EBSI's [Timestamp API (version 4)](https://hub.ebsi.eu/apis/pilot/timestamp/v4). This class abstracts the complexities of interacting with EBSI's timestamping API, allowing developers to easily create, manage, and retrieve timestamp records and their versions. The class relies on a `Wallet` instance for signing transactions and an `AuthorisationApi` instance for managing authentication with EBSI.

## Constructor

### `constructor(wallet: Wallet)`

Creates a new instance of the `TimestampWrapper` class.

- **Parameters:**
  - `wallet: Wallet`: A `Wallet` instance used for signing transactions.

- **Example:**
  ```typescript
  const wallet = new Wallet();
  const timestampWrapper = new TimestampWrapper(wallet);

## Methods

### `timestampRecordHashes`

Creates a timestamp record with the ability to be versioned.

- **Parameters:**
  - `hashAlgorithmId: number`: The ID of the hashing algorithm used. Use `0` for SHA-256.
  - `hashValue: string`: The hash value to be recorded. Unlike EBSI's Timestamp API, this method allows only one hash value instead of three.
  - `versionInfo: string`: Information about the version.
  - `timestampData: string[] = ['']`: Optional array of timestamp data.
  - `waitMined: boolean = true`: Optional command about whether to wait for the transaction to be mined.

- **Returns:**
  - `Promise<Result<{ hex: string; multibase: string }, Error>>`: A `Result` object containing the record ID in hex and multibase format or an error.

---

### `timestampRecordVersionHashes`

Creates a new version for a specific timestamp record.

- **Parameters:**
  - `recordId: string`: The ID of the record (in hex format).
  - `hashAlgorithmId: number`: The ID of the hashing algorithm used.
  - `hashValue: string`: The hash value to be recorded.
  - `versionInfo: string`: Information about the version.
  - `timestampData: string[] = ['']`: Optional array of timestamp data.
  - `waitMined: boolean = true`: Whether to wait for the transaction to be mined.

- **Returns:**
  - `Promise<Result<string, Error>>`: A `Result` object containing the version ID or an error.

---

### `insertRecordOwner`

Inserts a new owner for a specific timestamp record.

- **Parameters:**
  - `recordId: string`: The ID of the record (in hex format).
  - `ownerId: string`: The ID of the new owner (in ETH address format).
  - `notBefore: number`: The start time for ownership.
  - `notAfter: number`: The end time for ownership.
  - `waitMined: boolean = true`: Optional flag indicating whether to wait for the transaction to be mined.

- **Returns:**
  - `Promise<Result<string, Error>>`: A `Result` object containing the owner ID or an error.

---

### `revokeRecordOwner`

Revokes ownership of a specific timestamp record.

- **Parameters:**
  - `recordId: string`: The ID of the record (in hex format).
  - `ownerId: string`: The ID of the owner to revoke (in ETH address format).
  - `waitMined: boolean = true`: Optional flag indicating whether to wait for the transaction to be mined.

- **Returns:**
  - `Promise<Result<string, Error>>`: A `Result` object containing the owner ID or an error.

---

### `getRecord`

Retrieves details of a specific record by its ID.

- **Parameters:**
  - `recordId: string`: The ID of the record (in multibase format).

- **Returns:**
  - `Promise<Result<Record, Error>>`: A `Result` object containing the record details or an error.

---

### `getRecordVersions`

Retrieves the versions of a specific record by its ID.

- **Parameters:**
  - `recordId: string`: The ID of the record (in multibase format).

- **Returns:**
  - `Promise<Result<RecordVersions, Error>>`: A `Result` object containing the record versions or an error.

---

### `getRecordVersionDetails`

Retrieves details of a specific version of a record.

- **Parameters:**
  - `recordId: string`: The ID of the record (in multibase format).
  - `versionId: string`: The ID of the version.

- **Returns:**
  - `Promise<Result<RecordVersionDetails, Error>>`: A `Result` object containing the version details or an error.

---

### `timestampHashes`

Creates a timestamp for a hash value.
`note: endpoint is not tested, use with caution and report bugs to trace4eu consortium`

- **Parameters:**
  - `from: string`: The sender’s ETH address.
  - `hashAlgorithmId: number`: The ID of the hashing algorithm used.
  - `hashValue: string`: The hash value to be recorded.
  - `timestampData: string[] = ['']`: Optional array of timestamp data.

- **Returns:**
  - `Promise<Result<string, Error>>`: A `Result` object containing the transaction hash or an error.

---

### `timestampVersionHashes`

Creates a timestamp for a versioned hash value.
`note: endpoint is not tested, use with caution and report bugs to trace4eu consortium`

- **Parameters:**
  - `from: string`: The sender’s ETH address.
  - `versionHash: string`: The version hash.
  - `hashAlgorithmId: number`: The ID of the hashing algorithm used.
  - `hashValue: string`: The hash value to be recorded.
  - `versionInfo: string`: Information about the version.
  - `timestampData: string[] = ['']`: Optional array of timestamp data.

- **Returns:**
  - `Promise<Result<string, Error>>`: A `Result` object containing the transaction hash or an error.

---

### `appendRecordVersionHashes`

Appends hash values to a specific record version.
`note: endpoint is not tested, use with caution and report bugs to trace4eu consortium`

- **Parameters:**
  - `from: string`: The sender’s ETH address.
  - `recordId: string`: The ID of the record.
  - `versionId: string`: The ID of the version.
  - `hashAlgorithmId: number`: The ID of the hashing algorithm used.
  - `hashValue: string`: The hash value to be recorded.
  - `versionInfo: string`: Information about the version.
  - `timestampData: string[] = ['']`: Optional array of timestamp data.

- **Returns:**
  - `Promise<Result<string, Error>>`: A `Result` object containing the transaction hash or an error.

---

### `detachRecordVersionHash`

Detaches a hash value from a specific record version.
`note: endpoint is not tested, use with caution and report bugs to trace4eu consortium`

- **Parameters:**
  - `from: string`: The sender’s ETH address.
  - `recordId: string`: The ID of the record.
  - `versionId: string`: The ID of the version.
  - `versionHash: string`: The version hash.
  - `hashValue: string`: The hash value to be detached.

- **Returns:**
  - `Promise<Result<string, Error>>`: A `Result` object containing the transaction hash or an error.

---

### `insertRecordVersionInfo`

Inserts version information into a specific record version.
`note: endpoint is not tested, use with caution and report bugs to trace4eu consortium`

- **Parameters:**
  - `from: string`: The sender’s ETH address.
  - `recordId: string`: The ID of the record.
  - `versionId: string`: The ID of the version.
  - `versionInfo: string`: Information about the version.

- **Returns:**
  - `Promise<Result<string, Error>>`: A `Result` object containing the transaction hash or an error.

---

### `computeTimestampId`

Multihash of the sha256 of the original hash, encoded in multibase base64url.
```
timestampId = multibase_base64url(multihash(sha256(original_hash)))
```

- **Parameters:**
  - `hash: string`: Original hash.

- **Returns:**
  - `string`: A `Result` string that represents the timestampId

---

### `getTimestamp`

Inserts version information into a specific record version.

- **Parameters:**
  - `timestampId: string`: timestampId computed as describe in the `computeTimestampId` method

- **Returns:**
  - `Promise<Result<TimestampData, Error>>`: A `Result` object containing the timestamp data


