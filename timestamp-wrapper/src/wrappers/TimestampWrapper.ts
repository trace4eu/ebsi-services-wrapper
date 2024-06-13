import { UnsignedTransaction, Wallet } from '@trace4eu/signature-wrapper';
import { ITimestampWrapper } from '../interfaces/TimestampWrapper.interface';
import { Optional } from '../types/optional';
import axios from 'axios';
import {
  AuthorisationApi,
  EbsiAuthorisationApi,
} from '@trace4eu/authorisation-wrapper';
import {
  TimestampData
} from '../types/types';
import { ethers } from 'ethers';
import { hash } from 'crypto';
import { time } from 'console';

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

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
  async timestampHashes( //aka createTimestamp
    hashAlgorithmIds: number[],
    hashValues: string[],
    waitMined: boolean = true,
  ): Promise<string> {
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
    console.log(TimestampUnsignedTxJson)
    const signatureResponseData = await this.wallet.signEthTx(
      TimestampUnsignedTxJson,
    );
    // return Optional.None();
    const txReceipt = await this.sendSendSignedTransaction(
      TimestampUnsignedTxJson,
      signatureResponseData,
      access_token,
    );
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
    return JSON.stringify(hashValues);
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

  async getTimestampDetails(
    timestampId: string
  ): Promise<TimestampData> {
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
      data: timestampData.get().data
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
          hashValues: hashValues,
        },
      ],
      id: Math.ceil(Math.random() * 1000),
    });

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://api-pilot.ebsi.eu/timestamp/v3/jsonrpc',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Bearer ' + accesToken,
      },
      data: data,
    };

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

  private async sendSendSignedTransaction(
    unsignedTransaction: object,
    signedTx: object,
    accessToken: string,
  ): Promise<Optional<string>> {
    const data = JSON.stringify({
      jsonrpc: '2.0',
      method: 'sendSignedTransaction',
      id: Math.ceil(Math.random() * 1000),
      params: [
        {
          protocol: 'eth',
          unsignedTransaction: {
            ...unsignedTransaction,
          },
          ...signedTx,
        },
      ],
    });

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://api-pilot.ebsi.eu/timestamp/v3/jsonrpc',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Bearer ' + accessToken,
      },
      data: data,
    };

    const response = axios
      .request(config)
      .then((response) => {
        return Optional.Some(response.data.result);
      })
      .catch(() => {
        return Optional.None();
      });
    return response as Promise<Optional<string>>;
  }

  private async getTransactionReceipt(
    txHash: string,
    accessToken: string,
  ): Promise<Optional<object>> {
    const data = JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_getTransactionReceipt',
      id: 1, // Math.ceil(Math.random() * 1000), SE non serve a nulla lasciamolo fisso
      params: [txHash],
    });

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://api-pilot.ebsi.eu/ledger/v4/blockchains/besu',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Bearer ' + accessToken,
      },
      data: data,
    };

    const response = axios
      .request(config)
      .then((response) => {
        if (response.data.result === null) {
          return Optional.None();
        } else {
          return Optional.Some(response.data.result);
        }
      })
      .catch((error) => {
        return Optional.None();
      });
    return response as Promise<Optional<object>>;
  }

  private async getTimestampFromApi(timestampId: string) {

    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `https://api-pilot.ebsi.eu/timestamp/v3/timestamps/${timestampId}`,
      headers: { 
        'Accept': 'application/json'
      }
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
}


