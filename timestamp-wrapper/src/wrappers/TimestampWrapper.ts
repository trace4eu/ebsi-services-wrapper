import { UnsignedTransaction, Wallet } from '@trace4eu/signature-wrapper';
import { ITimestampWrapper } from '../interfaces/TimestampWrapper.interface';
import { Optional } from '../types/optional';
import axios from 'axios';
import {
  AuthorisationApi,
  EbsiAuthorisationApi,
} from '@trace4eu/authorisation-wrapper';
import { TimestampData, RecordVersions, RecordVersionDetails, Record } from '../types/types';
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
import { version } from 'os';

const { sha256 } = ethers.utils;

export class TimestampWrapper implements ITimestampWrapper {
  // atttributes
  private wallet: Wallet;
  private ebsiAuthtorisationApi: AuthorisationApi;

  // constructor
  constructor(wallet: Wallet) {
    this.wallet = wallet;
    this.ebsiAuthtorisationApi = new EbsiAuthorisationApi(this.wallet);
  }

  // methods

  //create record
  async timestampRecordHashes(
    hashAlgorithmId: number, // note: unlike EBSI's Timestamp API we only allow for 1 hash value instead of 3
    hashValue: string, // note: unlike EBSI's Timestamp API we only allow for 1 hash value instead of 3
    versionInfo: string,
    timestampData: string[] = [''], //TODO: why keep this parameter... for qtsp?
    waitMined: boolean = true,
  ): Promise<Result<{"hex": string, "multibase": string}, Error>> {
    const { access_token } = await this.ebsiAuthtorisationApi.getAccessToken(
      'ES256',
      'timestamp_write',
      [],
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
      waitMined,
    );

    if (txReceipt.isErr()) {
      return Result.err(txReceipt.unwrapErr());
    }

    //if wait for transaction to be mined
    if (waitMined) {
      //wait for transaction to be mined
      const resp_mined = await waitTxToBeMined(
        txReceipt.unwrap().transactionHash,
        access_token,
      );

      //check if mining was successful
      if (resp_mined.isErr()) {
        return Result.err(resp_mined.unwrapErr());
      }
    }

    // get recordId
    const recordId = ethers.utils.sha256(
      ethers.utils.defaultAbiCoder.encode(
        ['address', 'uint256', 'bytes'],
        [unsignedTxJson.from, txReceipt.value.blockNumber, hashValue],
      ),
    );

    // format recordId in multibase
    const multibase64urlRecordId = multibaseEncode("base64url", recordId); //format recordId for simple further use 

    //how recordId is created: https://ec.europa.eu/digital-building-blocks/code/projects/EBSI/repos/test-scripts/browse/src/buildParam/timestamp.ts?at=c69c8b52d697c50e98dffac8bcca3f7e8c6fcc1d
    //shows that there are no tests for timestamRecordHashes, only for timestampHashes:
      //https://ec.europa.eu/digital-building-blocks/code/projects/EBSI/repos/test-scripts/browse/tests/timestamp.spec.ts?at=c69c8b52d697c50e98dffac8bcca3f7e8c6fcc1d
      //https://hub.ebsi.eu/tools/cli/upcoming-apis/create-timestamp#records
    return Result.ok({"hex":recordId, "multibase":multibase64urlRecordId}); 
  }

  // create version for a specific record
  async timestampRecordVersionHashes(
    recordId: string, //hex
    hashAlgorithmId: number,
    hashValue: string,
    versionInfo: string,
    timestampData: string[] = [''], //TODO: why keep this parameter... for qtsp?
    waitMined: boolean = true
  ): Promise<Result<string, Error>> {
    const { access_token } = await this.ebsiAuthtorisationApi.getAccessToken(
      'ES256',
      'timestamp_write',
      [],
    );

    // get versionId of newest version specific to inputted record
    const currentVersions = await this.getRecordVersions(multibaseEncode("base64url", recordId))
    const totalNumberVersions = currentVersions.get().total

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
      ],
    );

    if (unsignedTx.isErr()) {
      return Result.err(unsignedTx.unwrapErr());
    }

    const unsignedTxJson = unsignedTx.unwrap();
    console.log("unsignedTxJson", unsignedTxJson)

    const signatureResponseData = await this.wallet.signEthTx(unsignedTxJson);

    const txReceipt = await sendSignedTransaction(
      unsignedTxJson,
      signatureResponseData,
      access_token,
      waitMined,
    );

    if (txReceipt.isErr()) {
      return Result.err(txReceipt.unwrapErr());
    }

    //if wait for transaction to be mined
    if (waitMined) {
      //wait for transaction to be mined
      const resp_mined = await waitTxToBeMined(
        txReceipt.unwrap().transactionHash,
        access_token,
      );

      //check if mining was successful
      if (resp_mined.isErr()) {
        return Result.err(resp_mined.unwrapErr());
      }
    }

    // return versionId of newly created versions
    return Result.ok(String(totalNumberVersions)) //note: totalNumberVersions = last versionId + 1 = versionId of newest version
 }

  async insertRecordOwner(
    recordId: string,
    ownerId: string,
    notBefore: number,
    notAfter: number,
    waitMined: boolean = true
  ): Promise<Result<string, Error>> {
    const { access_token } = await this.ebsiAuthtorisationApi.getAccessToken(
      'ES256',
      'timestamp_write',
      [],
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
      waitMined,
    );

    if (txReceipt.isErr()) {
      return Result.err(txReceipt.unwrapErr());
    }

    //if wait for transaction to be mined
    if (waitMined) {
      //wait for transaction to be mined
      const resp_mined = await waitTxToBeMined(
        txReceipt.unwrap().transactionHash,
        access_token,
      );

      //check if mining was successful
      if (resp_mined.isErr()) {
        return Result.err(resp_mined.unwrapErr());
      }
    }
    return Result.ok(ownerId)
  }

  async revokeRecordOwner(
    recordId: string, 
    ownerId: string,
    waitMined: boolean = true
  ): Promise<Result<string, Error>>{
    const { access_token } = await this.ebsiAuthtorisationApi.getAccessToken(
      'ES256',
      'timestamp_write',
      [],
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
      waitMined,
    );

    if (txReceipt.isErr()) {
      return Result.err(txReceipt.unwrapErr());
    }

    //if wait for transaction to be mined
    if (waitMined) {
      //wait for transaction to be mined
      const resp_mined = await waitTxToBeMined(
        txReceipt.unwrap().transactionHash,
        access_token,
      );

      //check if mining was successful
      if (resp_mined.isErr()) {
        return Result.err(resp_mined.unwrapErr());
      }
    }

    return Result.ok(ownerId); // ETH address of revoked owner
  }

  // get list of all versions of a record
  async getRecord(
    recordId: string //multibase
  ): Promise<Optional<Record>> {
    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `https://api-pilot.ebsi.eu/timestamp/v4/records/${recordId}`,
      headers: {
        Accept: 'application/json',
      },
    };

    const response = axios
      .request(config)
      .then((response) => {
        return Optional.Some(response.data);
      })
      .catch((error) => {
        console.log(error);
        return Optional.None();
      });
    return response as Promise<Optional<Record>>;
  }
  
  // get list of all versions of a record
  async getRecordVersions(recordId: string): Promise<Optional<RecordVersions>> {
    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `https://api-pilot.ebsi.eu/timestamp/v4/records/${recordId}/versions`,
      headers: {
        Accept: 'application/json',
      },
    };

    const response = axios
      .request(config)
      .then((response) => {
        return Optional.Some(response.data);
      })
      .catch((error) => {
        console.log(error);
        return Optional.None();
      });
    return response as Promise<Optional<RecordVersions>>;
  }

  // get details of a specific version of a specific record
  async getRecordVersionDetails(
    recordId: string,
    versionId: string,
  ): Promise<Optional<RecordVersionDetails>> {
    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `https://api-pilot.ebsi.eu/timestamp/v4/records/${recordId}/versions/${versionId}`,
      headers: {
        Accept: 'application/json',
      },
    };

    const response = axios
      .request(config)
      .then((response) => {
        return Optional.Some(response.data);
      })
      .catch((error) => {
        console.log(error);
        return Optional.None();
      });
    return response as Promise<Optional<RecordVersionDetails>>;
  }

  //ADDITIONAL METHODS to fully replicate Timestamp JSON-RPC API
  //note: these methods are not tested, use with caution and report bugs to trace4eu consortium
  async timestampHashes(
    from: string,
    hashAlgorithmId: number,
    hashValue: string,
    timestampData: string[] = [""],
  ): Promise<Result<string, Error>> {
    const { access_token } = await this.ebsiAuthtorisationApi.getAccessToken(
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
    const { access_token } = await this.ebsiAuthtorisationApi.getAccessToken(
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
    const { access_token } = await this.ebsiAuthtorisationApi.getAccessToken(
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
    const { access_token } = await this.ebsiAuthtorisationApi.getAccessToken(
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
    const { access_token } = await this.ebsiAuthtorisationApi.getAccessToken(
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
