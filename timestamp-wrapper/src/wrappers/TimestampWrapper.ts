import { UnsignedTransaction, Wallet } from '@trace4eu/signature-wrapper';
import { ITimestampWrapper } from '../interfaces/TimestampWrapper.interface';
import { Optional } from '../types/optional';
import axios from 'axios';
import {
  AuthorisationApi,
  EbsiAuthorisationApi,
} from '@trace4eu/authorisation-wrapper';
import { TimestampData, RecordVersions, RecordVersionDetails } from '../types/types';
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
    hashAlgorithmIds: number[],
    hashValues: string[],
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
          hashAlgorithmIds: hashAlgorithmIds,
          hashValues: hashValues,
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
        [unsignedTxJson.from, txReceipt.value.blockNumber, hashValues[0]], //TODO: generalize so that it works with multiple hashValues (max. 3 are allowd according to EBSI documentation)
      ),
    );
    console.log("recordId raw", recordId)

    // format recordId in multibase
    const multibase64urlRecordId = multibaseEncode("base64url", recordId); //format recordId for simple further use 

    // format recordId in hex
    const hexRecordId = "ajas"; //format recordId for simple further use


    //how recordId is created: https://ec.europa.eu/digital-building-blocks/code/projects/EBSI/repos/test-scripts/browse/src/buildParam/timestamp.ts?at=c69c8b52d697c50e98dffac8bcca3f7e8c6fcc1d
    //shows that there are no tests for timestamRecordHashes, only for timestampHashes:
      //https://ec.europa.eu/digital-building-blocks/code/projects/EBSI/repos/test-scripts/browse/tests/timestamp.spec.ts?at=c69c8b52d697c50e98dffac8bcca3f7e8c6fcc1d
      //https://hub.ebsi.eu/tools/cli/upcoming-apis/create-timestamp#records
    return Result.ok({"hex":recordId, "multibase":multibase64urlRecordId}); 
  }

  // create version for a specific record
  async timestampRecordVersionHashes(
    recordId: string,
    hashAlgorithmIds: number[],
    hashValues: string[],
    versionInfo: string,
    timestampData: string[] = [''], //TODO: why keep this parameter... for qtsp?
    waitMined: boolean = true
  ): Promise<Result<string, Error>> {
    const { access_token } = await this.ebsiAuthtorisationApi.getAccessToken(
      'ES256',
      'timestamp_write',
      [],
    );

    const unsignedTx = await sendUnsignedTransaction(
      access_token,
      'timestampRecordVersionHashes',
      [
        {
          from: this.wallet.getEthAddress(),
          recordId: recordId,
          hashAlgorithmIds: hashAlgorithmIds,
          hashValues: hashValues,
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

    // TODO: return... what?
    // get new versionId
       //option 1: getRecordVersions(recordId) and then get increment the versionId
       //option 2: deduce versionId from txReceipt
    return Result.ok("1")
 }

  async insertRecordOwner(
    recordId: string,
    ownerId: string,
    notBefore: string,
    notAfter: string,
  ): Promise<string> {
    const { access_token } = await this.ebsiAuthtorisationApi.getAccessToken(
      'ES256',
      'timestamp_write',
      [],
    );

    const UnsignedTx = await sendUnsignedTransaction(
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

    if (UnsignedTx.isEmpty()) {
      throw new Error(
        'Error sending request to ebsi api: empty DocumentUnsignedTransaction',
      );
    }
    const UnsignedTxJson = {
      to: UnsignedTx.get().to,
      from: UnsignedTx.get().from,
      data: UnsignedTx.get().data,
      nonce: UnsignedTx.get().nonce,
      value: UnsignedTx.get().value,
      chainId: UnsignedTx.get().chainId,
      gasLimit: UnsignedTx.get().gasLimit,
      gasPrice: UnsignedTx.get().gasPrice,
    };
    const signatureResponseData = await this.wallet.signEthTx(UnsignedTxJson);

    const txReceipt = await this.sendSignedTransaction(
      UnsignedTxJson,
      signatureResponseData,
      access_token,
    );

    return ownerId;
  }

  async revokeRecordOwner(recordId: string, ownerId: string): Promise<string> {
    const { access_token } = await this.ebsiAuthtorisationApi.getAccessToken(
      'ES256',
      'timestamp_write',
      [],
    );

    const UnsignedTx = await sendUnsignedTransaction(
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

    if (UnsignedTx.isEmpty()) {
      throw new Error(
        'Error sending request to ebsi api: empty DocumentUnsignedTransaction',
      );
    }

    const UnsignedTxJson = {
      to: UnsignedTx.get().to,
      from: UnsignedTx.get().from,
      data: UnsignedTx.get().data,
      nonce: UnsignedTx.get().nonce,
      value: UnsignedTx.get().value,
      chainId: UnsignedTx.get().chainId,
      gasLimit: UnsignedTx.get().gasLimit,
      gasPrice: UnsignedTx.get().gasPrice,
    };

    const signatureResponseData = await this.wallet.signEthTx(UnsignedTxJson);

    const txReceipt = await this.sendSignedTransaction(
      UnsignedTxJson,
      signatureResponseData,
      access_token,
    );

    return ownerId; // ETH address of revoked owner
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

  /* LEGACY CODE
  async timestampHashes(
    //aka createTimestamp
    hashAlgorithmIds: number[],
    hashValues: string[],
    timestampData: string = "", //TODO: why keep this parameter... for qtsp?
    waitMined: boolean = true,
  ): Promise<string[]> {
    const { access_token } = await this.ebsiAuthtorisationApi.getAccessToken(
      'ES256',
      'timestamp_write',
      [],
    );

   
    const TimestampUnsignedTx = await this.sendTimestampHashesRequest(
      hashAlgorithmIds,
      hashValues,
      access_token,
    );

    if (TimestampUnsignedTx.isEmpty()) {
      // return Optional.None();
      throw new Error(
        'Error sending request to ebsi api: empty DocumentUnsignedTransaction',
      );
    }
    const TimestampUnsignedTxJson = {
      to: TimestampUnsignedTx.get().to,
      from: TimestampUnsignedTx.get().from,
      data: TimestampUnsignedTx.get().data,
      nonce: TimestampUnsignedTx.get().nonce,
      value: TimestampUnsignedTx.get().value,
      chainId: TimestampUnsignedTx.get().chainId,
      gasLimit: TimestampUnsignedTx.get().gasLimit,
      gasPrice: TimestampUnsignedTx.get().gasPrice,
    };
    const signatureResponseData = await this.wallet.signEthTx(
      TimestampUnsignedTxJson,
    );
    // return Optional.None();
    const txReceipt = await this.sendSignedTransaction(
      TimestampUnsignedTxJson,
      signatureResponseData,
      access_token,
    );

    console.log("tx receipt", txReceipt)
    let res2: Optional<object>;
    let tentatives = 5;
    if (waitMined) {
      do {
        await delay(2000);
        res2 = await this.getTransactionReceipt(txReceipt.get(), access_token);
        tentatives -= 1;
      } while (res2.isEmpty() && tentatives > 0); // res2.isEmpty() && tentatives > 0
      if (res2.isEmpty()) {
        throw new Error('waiting to much to mine document : ' + hashValues);
      }
    }
    return hashValues;
  }

  async isTimestampMined(timestampId: string): Promise<boolean> {
    const { access_token } = await this.ebsiAuthtorisationApi.getAccessToken(
      'ES256',
      'timestamp_write',
      [],
    );
    const response = await this.getTransactionReceipt(
      timestampId,
      access_token,
    );

    return response.isSome();
  }

  async getTimestampDetails(timestampId: string): Promise<TimestampData> {
    const timestampData = await this.getTimestampFromApi(timestampId);
    if (timestampData.isEmpty()) {
      throw new Error(
        'getTimestampDetails method: missing timestamp with id =  ' +
          timestampId,
      );
    }
    return {
      hash: timestampData.get().hash,
      timestampedBy: timestampData.get().timestampedBy,
      blockNumber: timestampData.get().blockNumber,
      timestamp: timestampData.get().timestamp,
      transactionHash: timestampData.get().transactionHash,
      data: timestampData.get().data,
    };
  }

  // private helper methods
  private async sendTimestampHashesRequest(
    hashAlgorithmIds: number[],
    hashValues: string[], //TODO: adapt type to array of hashes=string?
    accesToken: string,
  ): Promise<Optional<UnsignedTransaction>> {
    const data = JSON.stringify({
      jsonrpc: '2.0',
      method: 'timestampHashes',
      params: [
        {
          from: this.wallet.getEthAddress(),
          hashAlgorithmIds: hashAlgorithmIds,
          hashValues: hashValues
        },
      ],
      id: Math.ceil(Math.random() * 1000),
    });

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://api-pilot.ebsi.eu/timestamp/v4/jsonrpc',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Bearer ' + accesToken,
      },
      data: data,
    };

    console.log("access token:", accesToken)

    const response = axios
      .request(config)
      .then((response) => {
        return Optional.Some(response.data.result);
      })
      .catch((error) => {
        return Optional.None();
      });
    
    return response as Promise<Optional<UnsignedTransaction>>;
  }


  private async getTimestampFromApi(timestampId: string) {
    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `https://api-pilot.ebsi.eu/timestamp/v4/timestamps/${timestampId}`,
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
        console.error(error);
        return Optional.None();
      });
    return response as Promise<Optional<TimestampData>>;
  }
  */
}
