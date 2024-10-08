import { UnsignedTransaction, Wallet } from '@trace4eu/signature-wrapper';
import { ITimestampWrapper } from '../interfaces/TimestampWrapper.interface';
import { Optional } from '../types/optional';
import axios from 'axios';
import {
  AuthorisationApi,
  EbsiAuthorisationApi,
} from '@trace4eu/authorisation-wrapper';
import {
  TimestampData,
  RecordVersions,
  RecordVersionDetails,
  Record,
} from '../types/types';
import { ethers } from 'ethers';
import Multihash from 'multihashes';
import { hash } from 'crypto';
import { Result } from '@trace4eu/error-wrapper';
import {
  sendSignedTransaction,
  sendUnsignedTransaction,
  waitTxToBeMined,
} from '../utils/ledger-v4';
import { fromHexString, multibaseEncode } from '../utils/utils';

const { sha256 } = ethers.utils;

/**
 * Wrapper class for handling timestamping-related operations.
 */
export class TimestampWrapper implements ITimestampWrapper {
  private wallet: Wallet;
  private ebsiAuthorisationApi: AuthorisationApi;

  /**
   * Constructs a TimestampWrapper instance.
   * 
   * @param wallet - The Wallet instance used for signing transactions.
   */
  constructor(wallet: Wallet) {
    this.wallet = wallet;
    this.ebsiAuthorisationApi = new EbsiAuthorisationApi(this.wallet);
  }

  /**
   * Creates a timestamp record with ability to be versioned.
   * 
   * @param hashAlgorithmId - The ID of the hashing algorithm used. note: input 0 for sha2-256
   * @param hashValue - The hash value to be recorded. note: unlike EBSI's Timestamp API, the wrapper only allow for 1 hash value instead of 3
   * @param versionInfo - Information about the version.
   * @param timestampData - Optional array of timestamp data.
   * @param waitMined - Optional command about whether to wait for the transaction to be mined.
   * @returns A Result object containing the record ID in hex and multibase format or an error.
   */
  async timestampRecordHashes(
    hashAlgorithmId: number,
    hashValue: string,
    versionInfo: string,
    timestampData: string[] = [''],
    waitMined: boolean = true
  ): Promise<Result<{ hex: string; multibase: string }, Error>> {
    const { access_token } = await this.ebsiAuthorisationApi.getAccessToken(
      'ES256',
      'timestamp_write',
      []
    );

    const unsignedTx = await sendUnsignedTransaction(
      access_token,
      'timestampRecordHashes',
      [
        {
          from: this.wallet.getEthAddress(),
          hashAlgorithmIds: [hashAlgorithmId],
          hashValues: [hashValue],
          versionInfo: versionInfo,
          timestampData: timestampData,
        },
      ]
    );

    if (unsignedTx.isErr()) {
      return Result.err(unsignedTx.unwrapErr());
    }

    const unsignedTxJson = unsignedTx.unwrap();
    const signatureResponseData = await this.wallet.signEthTx(unsignedTxJson);

    const txReceipt = await sendSignedTransaction(
      unsignedTxJson,
      signatureResponseData,
      access_token,
      waitMined
    );

    if (txReceipt.isErr()) {
      return Result.err(txReceipt.unwrapErr());
    }

    if (waitMined) {
      const resp_mined = await waitTxToBeMined(
        txReceipt.unwrap().transactionHash,
        access_token
      );

      if (resp_mined.isErr()) {
        return Result.err(resp_mined.unwrapErr());
      }
    }

    const recordId = ethers.utils.sha256(
      ethers.utils.defaultAbiCoder.encode(
        ['address', 'uint256', 'bytes'],
        [unsignedTxJson.from, txReceipt.value.blockNumber, hashValue]
      )
    );

    const multibase64urlRecordId = multibaseEncode('base64url', recordId);

    return Result.ok({ hex: recordId, multibase: multibase64urlRecordId });
  }

  /**
   * Creates a new version for a specific timestamp record.
   * 
   * @param recordId - The ID of the record (in hex format).
   * @param hashAlgorithmId - The ID of the hashing algorithm used.
   * @param hashValue - The hash value to be recorded.
   * @param versionInfo - Information about the version.
   * @param timestampData - Optional array of timestamp data.
   * @param waitMined - Whether to wait for the transaction to be mined.
   * @returns A Result object containing the version ID or an error.
   */
  async timestampRecordVersionHashes(
    recordId: string,
    hashAlgorithmId: number,
    hashValue: string,
    versionInfo: string,
    timestampData: string[] = [''],
    waitMined: boolean = true
  ): Promise<Result<string, Error>> {
    const { access_token } = await this.ebsiAuthorisationApi.getAccessToken(
      'ES256',
      'timestamp_write',
      []
    );

    const currentVersions = await this.getRecordVersions(
      multibaseEncode('base64url', recordId)
    );
    const totalNumberVersions = currentVersions.unwrap().total;

    const unsignedTx = await sendUnsignedTransaction(
      access_token,
      'timestampRecordVersionHashes',
      [
        {
          from: this.wallet.getEthAddress(),
          recordId: recordId,
          hashAlgorithmIds: [hashAlgorithmId],
          hashValues: [hashValue],
          versionInfo: versionInfo,
          timestampData: timestampData,
        },
      ]
    );

    if (unsignedTx.isErr()) {
      return Result.err(unsignedTx.unwrapErr());
    }

    const unsignedTxJson = unsignedTx.unwrap();
    const signatureResponseData = await this.wallet.signEthTx(unsignedTxJson);

    const txReceipt = await sendSignedTransaction(
      unsignedTxJson,
      signatureResponseData,
      access_token,
      waitMined
    );

    if (txReceipt.isErr()) {
      return Result.err(txReceipt.unwrapErr());
    }

    if (waitMined) {
      const resp_mined = await waitTxToBeMined(
        txReceipt.unwrap().transactionHash,
        access_token
      );

      if (resp_mined.isErr()) {
        return Result.err(resp_mined.unwrapErr());
      }
    }

    return Result.ok(String(totalNumberVersions));
  }

  /**
   * Inserts a new owner for a specific timestamp record.
   * 
   * @param recordId - The ID of the record (in hex format).
   * @param ownerId - The ID of the new owner (in ETH address format).
   * @param notBefore - The start time for ownership.
   * @param notAfter - The end time for ownership.
   * @param waitMined - Whether to wait for the transaction to be mined.
   * @returns A Result object containing the owner ID or an error.
   */
  async insertRecordOwner(
    recordId: string,
    ownerId: string,
    notBefore: number,
    notAfter: number,
    waitMined: boolean = true
  ): Promise<Result<string, Error>> {
    const { access_token } = await this.ebsiAuthorisationApi.getAccessToken(
      'ES256',
      'timestamp_write',
      []
    );

    const unsignedTx = await sendUnsignedTransaction(
      access_token,
      'insertRecordOwner',
      [
        {
          from: this.wallet.getEthAddress(),
          recordId: recordId,
          ownerId: ownerId,
          notBefore: notBefore,
          notAfter: notAfter,
        },
      ]
    );

    if (unsignedTx.isErr()) {
      return Result.err(unsignedTx.unwrapErr());
    }

    const unsignedTxJson = unsignedTx.unwrap();
    const signatureResponseData = await this.wallet.signEthTx(unsignedTxJson);

    const txReceipt = await sendSignedTransaction(
      unsignedTxJson,
      signatureResponseData,
      access_token,
      waitMined
    );

    if (txReceipt.isErr()) {
      return Result.err(txReceipt.unwrapErr());
    }

    if (waitMined) {
      const resp_mined = await waitTxToBeMined(
        txReceipt.unwrap().transactionHash,
        access_token
      );

      if (resp_mined.isErr()) {
        return Result.err(resp_mined.unwrapErr());
      }
    }

    return Result.ok(ownerId);
  }

  /**
   * Revokes ownership of a specific timestamp record.
   * 
   * @param recordId - The ID of the record (in hex format).
   * @param ownerId - The ID of the owner to revoke (in ETH address format).
   * @param waitMined - Whether to wait for the transaction to be mined.
   * @returns A Result object containing the owner ID or an error.
   */
  async revokeRecordOwner(
    recordId: string,
    ownerId: string,
    waitMined: boolean = true
  ): Promise<Result<string, Error>> {
    const { access_token } = await this.ebsiAuthorisationApi.getAccessToken(
      'ES256',
      'timestamp_write',
      []
    );

    const unsignedTx = await sendUnsignedTransaction(
      access_token,
      'revokeRecordOwner',
      [
        {
          from: this.wallet.getEthAddress(),
          recordId: recordId,
          ownerId: ownerId,
        },
      ]
    );

    if (unsignedTx.isErr()) {
      return Result.err(unsignedTx.unwrapErr());
    }

    const unsignedTxJson = unsignedTx.unwrap();
    const signatureResponseData = await this.wallet.signEthTx(unsignedTxJson);

    const txReceipt = await sendSignedTransaction(
      unsignedTxJson,
      signatureResponseData,
      access_token,
      waitMined
    );

    if (txReceipt.isErr()) {
      return Result.err(txReceipt.unwrapErr());
    }

    if (waitMined) {
      const resp_mined = await waitTxToBeMined(
        txReceipt.unwrap().transactionHash,
        access_token
      );

      if (resp_mined.isErr()) {
        return Result.err(resp_mined.unwrapErr());
      }
    }

    return Result.ok(ownerId);
  }

  /**
   * Retrieves details of a specific record by its ID.
   * 
   * @param recordId - The ID of the record (in multibase format).
   * @returns A Result object containing the record details or an error.
   */
  async getRecord(
    recordId: string
  ): Promise<Result<Record, Error>> {
    try {
      const response = await axios.get<Record>(
        `https://api-pilot.ebsi.eu/timestamp/v4/records/${recordId}`
      );
      return Result.ok(response.data);
    } catch (error) {
      console.log('Error fetching record:', error);
      return Result.err(error as Error);
    }
  }

  /**
   * Retrieves the versions of a specific record by its ID.
   * 
   * @param recordId - The ID of the record (in multibase format).
   * @returns A Result object containing the record versions or an error.
   */
  async getRecordVersions(
    recordId: string
  ): Promise<Result<RecordVersions, Error>> {
    try {
      const response = await axios.get<RecordVersions>(
        `https://api-pilot.ebsi.eu/timestamp/v4/records/${recordId}/versions`
      );
      return Result.ok(response.data);
    } catch (error) {
      console.log('Error fetching record versions:', error);
      return Result.err(error as Error);
    }
  }

  /**
   * Retrieves details of a specific version of a record.
   * 
   * @param recordId - The ID of the record (in multibase format).
   * @param versionId - The ID of the version.
   * @returns A Result object containing the version details or an error.
   */
  async getRecordVersionDetails(
    recordId: string,
    versionId: string
  ): Promise<Result<RecordVersionDetails, Error>> {
    try {
      const response = await axios.get<RecordVersionDetails>(
        `https://api-pilot.ebsi.eu/timestamp/v4/records/${recordId}/versions/${versionId}`
      );
      return Result.ok(response.data);
    } catch (error) {
      console.log('Error fetching record version details:', error);
      return Result.err(error as Error);
    }
  }

  //ADDITIONAL METHODS to fully replicate Timestamp JSON-RPC API
  //note: these methods are not tested, use with caution and report bugs to trace4eu consortium
  async timestampHashes(
    from: string,
    hashAlgorithmId: number,
    hashValue: string,
    timestampData: string[] = [""],
  ): Promise<Result<string, Error>> {
    const { access_token } = await this.ebsiAuthorisationApi.getAccessToken(
      'ES256',
      'timestamp_write',
      [],
    );

    const unsignedTx = await sendUnsignedTransaction(
      access_token,
      'timestampHashes',
      [
        {
          from: from,
          hashAlgorithmIds: [hashAlgorithmId],
          hashValues: [hashValue],
          timestampData: timestampData
        },
      ],
    );

    if (unsignedTx.isErr()) {
      return Result.err(unsignedTx.unwrapErr());
    }

    const unsignedTxJson = unsignedTx.unwrap();
    const signatureResponseData = await this.wallet.signEthTx(unsignedTxJson);
    const txReceipt = await sendSignedTransaction(
      unsignedTxJson,
      signatureResponseData,
      access_token,
    );

    if (txReceipt.isErr()) {
      return Result.err(txReceipt.unwrapErr());
    }

    return Result.ok(txReceipt.unwrap().transactionHash);
  }

  async timestampVersionHashes(
    from: string,
    versionHash: string,
    hashAlgorithmId: number,
    hashValue: string,
    versionInfo: string,
    timestampData: string[] = [""],
  ): Promise<Result<string, Error>> {
    const { access_token } = await this.ebsiAuthorisationApi.getAccessToken(
      'ES256',
      'timestamp_write',
      [],
    );

    const unsignedTx = await sendUnsignedTransaction(
      access_token,
      'timestampVersionHashes',
      [
        {
          from: from,
          versionHash: versionHash,
          hashAlgorithmIds: [hashAlgorithmId],
          hashValues: [hashValue],
          versionInfo: versionInfo,
          timestampData: timestampData,
        },
      ],
    );

    if (unsignedTx.isErr()) {
      return Result.err(unsignedTx.unwrapErr());
    }

    const unsignedTxJson = unsignedTx.unwrap();
    const signatureResponseData = await this.wallet.signEthTx(unsignedTxJson);
    const txReceipt = await sendSignedTransaction(
      unsignedTxJson,
      signatureResponseData,
      access_token,
    );

    if (txReceipt.isErr()) {
      return Result.err(txReceipt.unwrapErr());
    }

    return Result.ok(txReceipt.unwrap().transactionHash);
  }

  async appendRecordVersionHashes(
    from: string,
    recordId: string,
    versionId: string,
    hashAlgorithmId: number,
    hashValue: string,
    versionInfo: string,
    timestampData: string[] = [""],
  ): Promise<Result<string, Error>> {
    const { access_token } = await this.ebsiAuthorisationApi.getAccessToken(
      'ES256',
      'timestamp_write',
      [],
    );

    const unsignedTx = await sendUnsignedTransaction(
      access_token,
      'appendRecordVersionHashes',
      [
        {
          from: from,
          recordId: recordId,
          versionId: versionId,
          hashAlgorithmIds: [hashAlgorithmId],
          hashValues: [hashValue],
          versionInfo: versionInfo,
          timestampData: timestampData,
        },
      ],
    );

    if (unsignedTx.isErr()) {
      return Result.err(unsignedTx.unwrapErr());
    }

    const unsignedTxJson = unsignedTx.unwrap();
    const signatureResponseData = await this.wallet.signEthTx(unsignedTxJson);
    const txReceipt = await sendSignedTransaction(
      unsignedTxJson,
      signatureResponseData,
      access_token,
    );

    if (txReceipt.isErr()) {
      return Result.err(txReceipt.unwrapErr());
    }

    return Result.ok(txReceipt.unwrap().transactionHash);
  }

  async detachRecordVersionHash(
    from: string,
    recordId: string,
    versionId: string,
    versionHash: string,
    hashValue: string,
  ): Promise<Result<string, Error>> {
    const { access_token } = await this.ebsiAuthorisationApi.getAccessToken(
      'ES256',
      'timestamp_write',
      [],
    );

    const unsignedTx = await sendUnsignedTransaction(
      access_token,
      'detachRecordVersionHash',
      [
        {
          from: from,
          recordId: recordId,
          versionId: versionId,
          versionHash: versionHash,
          hashValue: hashValue,
        },
      ],
    );

    if (unsignedTx.isErr()) {
      return Result.err(unsignedTx.unwrapErr());
    }

    const unsignedTxJson = unsignedTx.unwrap();
    const signatureResponseData = await this.wallet.signEthTx(unsignedTxJson);
    const txReceipt = await sendSignedTransaction(
      unsignedTxJson,
      signatureResponseData,
      access_token,
    );

    if (txReceipt.isErr()) {
      return Result.err(txReceipt.unwrapErr());
    }

    return Result.ok(txReceipt.unwrap().transactionHash);
  }

  async insertRecordVersionInfo(
    from: string,
    recordId: string,
    versionId: string,
    versionInfo: string,
  ): Promise<Result<string, Error>> {
    const { access_token } = await this.ebsiAuthorisationApi.getAccessToken(
      'ES256',
      'timestamp_write',
      [],
    );

    const unsignedTx = await sendUnsignedTransaction(
      access_token,
      'insertRecordVersionInfo',
      [
        {
          from: from,
          recordId: recordId,
          versionId: versionId,
          versionInfo: versionInfo,
        },
      ],
    );

    if (unsignedTx.isErr()) {
      return Result.err(unsignedTx.unwrapErr());
    }

    const unsignedTxJson = unsignedTx.unwrap();
    const signatureResponseData = await this.wallet.signEthTx(unsignedTxJson);
    const txReceipt = await sendSignedTransaction(
      unsignedTxJson,
      signatureResponseData,
      access_token,
    );

    if (txReceipt.isErr()) {
      return Result.err(txReceipt.unwrapErr());
    }

    return Result.ok(txReceipt.unwrap().transactionHash);
  }
}
