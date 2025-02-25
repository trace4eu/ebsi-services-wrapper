import { UnsignedTransaction, Wallet } from '@trace4eu/signature-wrapper';
import { ITnTWrapper } from '../interfaces/TnTWrapper.interface';
import { NotYetMinedError, RevertedTransactionError } from '../errors';
import { TransactionReceipt } from '@ethersproject/abstract-provider';
import { Result } from '@trace4eu/error-wrapper';
import axios from 'axios';
import {
  AuthorisationApi,
  EbsiAuthorisationApi,
} from '@trace4eu/authorisation-wrapper';
import {
  DocumentData,
  EventData,
  TnTObjectRef,
  TnTPagedObjectList,
} from '../types/types';
import { send } from 'process';

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export class TnTWrapper implements ITnTWrapper {
  private wallet: Wallet;
  private ebsiAuthtorisationApi: AuthorisationApi;

  constructor(wallet: Wallet) {
    this.wallet = wallet;
    this.ebsiAuthtorisationApi = new EbsiAuthorisationApi(this.wallet);
  }

  async checkAccess(creator: string): Promise<Result<boolean, Error>> {
    const config = {
      method: 'head',
      maxBodyLength: Infinity,
      url: `https://api-pilot.ebsi.eu/track-and-trace/v1/accesses?creator=${creator}`,
      headers: {},
    };

    return axios
      .request(config)
      .then((response) => {
        switch (response.status) {
          case 204:
            return Result.ok(true);
          case 404:
            return Result.ok(false);
          default:
            return Result.ok(false);
        }
      })
      .catch((error) => {
        return Result.err(error);
      });
  }

  async grantAccessToDocument(
    documentHash: string,
    grantedByAccount: string,
    subjectAccount: string,
    grantedByAccType: number,
    subjectByAccType: number,
    permission: number,
    waitMined: boolean = true,
  ): Promise<Result<boolean, Error>> {
    const { access_token } = await this.ebsiAuthtorisationApi.getAccessToken(
      'ES256',
      'tnt_write',
      [],
    );
    const GrantUnsignedTx = await this.sendGrantAccessRequest(
      documentHash,
      grantedByAccount,
      subjectAccount,
      grantedByAccType,
      subjectByAccType,
      permission,
      access_token,
    );

    if (GrantUnsignedTx.isErr()) {
      return Result.err(GrantUnsignedTx.unwrapErr());
    }
    const UnsignedTxValue = GrantUnsignedTx.unwrap();
    const UnsignedTxJson = {
      to: UnsignedTxValue.to,
      from: UnsignedTxValue.from,
      data: UnsignedTxValue.data,
      nonce: UnsignedTxValue.nonce,
      value: UnsignedTxValue.value,
      chainId: UnsignedTxValue.chainId,
      gasLimit: UnsignedTxValue.gasLimit,
      gasPrice: UnsignedTxValue.gasPrice,
    };
    const signatureResponseData = await this.wallet.signEthTx(UnsignedTxJson);
    // return Optional.None();
    const txReceipt = await this.sendSendSignedTransaction(
      UnsignedTxJson,
      signatureResponseData,
      access_token,
    );

    if (txReceipt.isErr()) {
      return Result.err(txReceipt.unwrapErr());
    }

    if (waitMined) {
      const resp_mined = await this.waitTxToBeMined(
        txReceipt.unwrap(),
        access_token,
      );
      if (resp_mined.isErr()) {
        return Result.err(resp_mined.unwrapErr());
      }
    }
    return Result.ok(true);
  }

  async revokeAccessToDocument(
    documentHash: string,
    revokeByAccount: string,
    subjectAccount: string,
    permission: number,
    waitMined: boolean = true,
  ): Promise<Result<boolean, Error>> {
    const { access_token } = await this.ebsiAuthtorisationApi.getAccessToken(
      'ES256',
      'tnt_write',
      [],
    );
    const UnsignedTx = await this.sendRevokeAccessRequest(
      documentHash,
      revokeByAccount,
      subjectAccount,
      permission,
      access_token,
    );

    if (UnsignedTx.isErr()) {
      return Result.err(UnsignedTx.unwrapErr());
    }
    const UnsignedTxValue = UnsignedTx.unwrap();
    const UnsignedTxJson = {
      to: UnsignedTxValue.to,
      from: UnsignedTxValue.from,
      data: UnsignedTxValue.data,
      nonce: UnsignedTxValue.nonce,
      value: UnsignedTxValue.value,
      chainId: UnsignedTxValue.chainId,
      gasLimit: UnsignedTxValue.gasLimit,
      gasPrice: UnsignedTxValue.gasPrice,
    };
    const signatureResponseData = await this.wallet.signEthTx(UnsignedTxJson);
    // return Optional.None();
    const txReceipt = await this.sendSendSignedTransaction(
      UnsignedTxJson,
      signatureResponseData,
      access_token,
    );

    if (txReceipt.isErr()) {
      return Result.err(txReceipt.unwrapErr());
    }

    if (waitMined) {
      const resp_mined = await this.waitTxToBeMined(
        txReceipt.unwrap(),
        access_token,
      );
      if (resp_mined.isErr()) {
        return Result.err(resp_mined.unwrapErr());
      }
    }
    return Result.ok(true);
  }

  async createDocument(
    documentHash: string,
    documentMetadata: string,
    waitMined: boolean = true,
  ): Promise<Result<string, Error>> {
    const { access_token } = await this.ebsiAuthtorisationApi.getAccessToken(
      'ES256',
      'tnt_create',
      [],
    );
    const DocumentUnsignedTx = await this.sendCreateDocumentRequest(
      documentHash,
      documentMetadata,
      access_token,
    );
    if (DocumentUnsignedTx.isErr()) {
      return Result.err(DocumentUnsignedTx.unwrapErr());
    }
    const DocumentUnsignedTxValue = DocumentUnsignedTx.unwrap();
    const DocumentUnsignedTxJson = {
      to: DocumentUnsignedTxValue.to,
      from: DocumentUnsignedTxValue.from,
      data: DocumentUnsignedTxValue.data,
      nonce: DocumentUnsignedTxValue.nonce,
      value: DocumentUnsignedTxValue.value,
      chainId: DocumentUnsignedTxValue.chainId,
      gasLimit: DocumentUnsignedTxValue.gasLimit,
      gasPrice: DocumentUnsignedTxValue.gasPrice,
    };
    const signatureResponseData = await this.wallet.signEthTx(
      DocumentUnsignedTxJson,
    );
    // return Optional.None();
    const txReceipt = await this.sendSendSignedTransaction(
      DocumentUnsignedTxJson,
      signatureResponseData,
      access_token,
    );

    if (txReceipt.isErr()) {
      return Result.err(txReceipt.unwrapErr());
    }

    if (waitMined) {
      const resp_mined = await this.waitTxToBeMined(
        txReceipt.unwrap(),
        access_token,
      );
      if (resp_mined.isErr()) {
        return Result.err(resp_mined.unwrapErr());
      }
    }
    return Result.ok(documentHash);
  }

  async addEventToDocument(
    documentHash: string,
    eventId: string,
    eventMetadata: string,
    origin: string,
    waitMined: boolean = true,
  ): Promise<Result<string, Error>> {
    const unsignedTransaction = await this.sendCreateEventRequest(
      documentHash,
      eventId,
      eventMetadata,
      origin,
    );
    if (unsignedTransaction.isErr()) {
      return Result.err(new Error('Error sending request to ebsi api'));
    }
    const unsignedTransactionValue = unsignedTransaction.unwrap();
    const unsignedTransactionJson = {
      to: unsignedTransactionValue.to,
      from: unsignedTransactionValue.from,
      data: unsignedTransactionValue.data,
      nonce: unsignedTransactionValue.nonce,
      value: unsignedTransactionValue.value,
      chainId: unsignedTransactionValue.chainId,
      gasLimit: unsignedTransactionValue.gasLimit,
      gasPrice: unsignedTransactionValue.gasPrice,
    };
    const signatureResponseData = await this.wallet.signEthTx(
      unsignedTransactionJson,
    );
    const { access_token } = await this.ebsiAuthtorisationApi.getAccessToken(
      'ES256',
      'tnt_write',
      [],
    );
    const txReceipt = await this.sendSendSignedTransaction(
      unsignedTransactionJson,
      signatureResponseData,
      access_token,
    );

    if (txReceipt.isErr()) {
      return Result.err(txReceipt.unwrapErr());
    }

    if (waitMined) {
      const resp_mined = await this.waitTxToBeMined(
        txReceipt.unwrap(),
        access_token,
      );
      if (resp_mined.isErr()) {
        return Result.err(resp_mined.unwrapErr());
      }
    }
    return Result.ok(eventId);
  }
  async getDocumentDetails(
    documentHash: string,
  ): Promise<Result<DocumentData, Error>> {
    const documentData = await this.getDocumentFromApi(documentHash);
    if (documentData.isErr()) {
      return documentData;
    }
    const documentDataValue = documentData.unwrap();
    const dateTime = new Date(
      parseInt(documentDataValue.timestamp.datetime, 16) * 1000,
    );
    return Result.ok({
      metadata: documentDataValue.metadata,
      timestamp: {
        datetime: dateTime.toISOString(),
        source: documentDataValue.timestamp.source,
        proof: documentDataValue.timestamp.proof,
      },
      events: documentDataValue.events,
      creator: documentDataValue.creator,
    });
  }
  async getEventDetails(
    documentHash: string,
    eventId: string,
  ): Promise<Result<EventData, Error>> {
    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      url:
        'https://api-pilot.ebsi.eu/track-and-trace/v1/documents/' +
        documentHash +
        '/events/' +
        eventId,
      headers: {
        Accept: 'application/json',
      },
    };

    const response = await axios
      .request(config)
      .then((response) => {
        return Result.ok(response.data);
      })
      .catch((error) => {
        return Result.err(error);
      });
    if (response.isErr()) {
      return Result.err(response.unwrapErr());
    }
    const data = response.unwrap();
    const dateTime = new Date(parseInt(data.timestamp.datetime, 16) * 1000);
    return Result.ok({
      eventHash: data.externalHash,
      eventId: data.hash,
      timestamp: {
        datetime: dateTime.toISOString(),
        source: data.timestamp.source,
        proof: data.timestamp.proof,
      },
      sender: data.sender,
      origin: data.origin,
      metadata: data.metadata,
    });
  }
  async getAllDocuments(
    pageSize?: number,
    pageAfter?: number,
  ): Promise<Result<TnTPagedObjectList, Error>> {
    if (typeof pageAfter !== 'undefined' && typeof pageSize !== 'undefined') {
      // both undefined
      return this.getDocumentsFromAPI(pageSize, pageAfter);
    } else {
      // pageAfter without pageSize makes no sense
      if (typeof pageSize !== 'undefined') {
        return this.getDocumentsFromAPI(pageSize);
      }
    }
    return this.getDocumentsFromAPI();
  }
  async listAccesses(
    documentHash: string,
    pageSize?: number,
    pageAfter?: number,
  ): Promise<Result<TnTPagedObjectList, Error>> {
    if (typeof pageAfter !== 'undefined' && typeof pageSize !== 'undefined') {
      // both undefined
      return this.getAccessesFromAPI(documentHash, pageSize, pageAfter);
    } else {
      // pageAfter without pageSize makes no sense
      if (typeof pageSize !== 'undefined') {
        return this.getAccessesFromAPI(documentHash, pageSize);
      }
    }
    return this.getAccessesFromAPI(documentHash);
  }
  async getAllEventsOfDocument(
    documentHash: string,
  ): Promise<Result<TnTObjectRef[], Error>> {
    return this.getEventsOfDocumentFromAPI(documentHash);
  }
  //
  //
  //  UTILS METHODS
  //
  //

  private async waitTxToBeMined(
    txReceipt: string,
    ebsiAccessToken: string,
  ): Promise<Result<any, Error>> {
    let transactionReceipt: Result<TransactionReceipt, Error>;
    let tentatives = 10;
    do {
      await delay(5000);
      transactionReceipt = await this.getTransactionReceipt(
        txReceipt,
        ebsiAccessToken,
      );
      tentatives -= 1;
    } while (
      transactionReceipt.isErr() &&
      !(transactionReceipt.unwrapErr() instanceof RevertedTransactionError) &&
      transactionReceipt.unwrapErr() instanceof NotYetMinedError &&
      tentatives > 0
    ); // res2.isEmpty() && tentatives > 0
    return transactionReceipt;
  }
  private async sendCreateEventRequest(
    documentHash: string,
    eventId: string,
    eventMetadata: string,
    origin: string,
  ): Promise<Result<UnsignedTransaction, Error>> {
    try {
      const { access_token } = await this.ebsiAuthtorisationApi.getAccessToken(
        'ES256',
        'tnt_write',
        [],
      );

      const data = JSON.stringify({
        jsonrpc: '2.0',
        method: 'writeEvent',
        params: [
          {
            from: this.wallet.getEthAddress(),
            eventParams: {
              documentHash: documentHash,
              externalHash: eventId,
              sender: this.wallet.getHexDid(),
              origin: origin,
              metadata: eventMetadata,
            },
          },
        ],
        id: Math.ceil(Math.random() * 1000),
      });

      const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://api-pilot.ebsi.eu/track-and-trace/v1/jsonrpc',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: 'Bearer ' + access_token,
        },
        data: data,
      };
      return axios
        .request(config)
        .then((response) => {
          return Result.ok(response.data.result);
        })
        .catch((error) => {
          console.error(error);
          return Result.err(error);
        });
    } catch (err) {
      console.error(err);
      return Result.err(err as Error);
    }
  }
  /**
   *  return data if eth_getTransactionReceipt returns data <> null
   *  otherwise: return error 'empty transaction receipt
   * @param txHash
   * @param accessToken
   * @returns data
   */
  private async getTransactionReceipt(
    txHash: string,
    accessToken: string,
  ): Promise<Result<TransactionReceipt, Error>> {
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
        if (!response.data.result) {
          return Result.err(new NotYetMinedError());
        }
        if (response.data.result['revertReason']) {
          return Result.err(new RevertedTransactionError());
        }
        return Result.ok(response.data.result);
      })
      .catch((error) => {
        return Result.err(error);
      });
    return response as Promise<Result<TransactionReceipt, Error>>;
  }
  private async getEventsOfDocumentFromAPI(
    documentID: string,
  ): Promise<Result<TnTObjectRef[], Error>> {
    const config = {
      method: 'get',
      url:
        'https://api-pilot.ebsi.eu/track-and-trace/v1/documents/' +
        documentID +
        '/events',
    };

    return axios
      .request(config)
      .then((response) => {
        return Result.ok(response.data);
      })
      .catch((error) => {
        return Result.err(error);
      });
  }
  private async getDocumentsFromAPI(
    pageSize?: number,
    pageAfter?: number,
  ): Promise<Result<TnTPagedObjectList, Error>> {
    let url = `https://api-pilot.ebsi.eu/track-and-trace/v1/documents`;
    if (typeof pageAfter !== 'undefined' && typeof pageSize !== 'undefined') {
      // both undefined
      url +=
        '?page[size]=' +
        pageSize.toString() +
        '&page[after]=' +
        pageAfter.toString();
    } else {
      // pageAfter without pageSize makes no sense
      if (typeof pageSize !== 'undefined') {
        url += '?page[size]=' + pageSize.toString();
      }
    }

    const config = {
      method: 'get',
      url: url,
    };

    return axios
      .request(config)
      .then((response) => {
        return Result.ok(response.data);
      })
      .catch((error) => {
        return Result.err(error);
      });
  }
  private async getAccessesFromAPI(
    documentHash: string,
    pageSize?: number,
    pageAfter?: number,
  ): Promise<Result<TnTPagedObjectList, Error>> {
    let url = `https://api-pilot.ebsi.eu/track-and-trace/v1/documents/${documentHash}/accesses`;

    if (typeof pageAfter !== 'undefined' && typeof pageSize !== 'undefined') {
      // both undefined
      url +=
        '?page[size]=' +
        pageSize.toString() +
        '&page[after]=' +
        pageAfter.toString();
    } else {
      // pageAfter without pageSize makes no sense
      if (typeof pageSize !== 'undefined') {
        url += '?page[size]=' + pageSize.toString();
      }
    }

    const config = {
      method: 'get',
      url: url,
    };

    return axios
      .request(config)
      .then((response) => {
        return Result.ok(response.data);
      })
      .catch((error) => {
        return Result.err(error);
      });
  }
  private async getDocumentFromApi(
    documentHash: string,
  ): Promise<Result<DocumentData, Error>> {
    const config = {
      method: 'get',
      url: `https://api-pilot.ebsi.eu/track-and-trace/v1/documents/${documentHash}`,
    };

    const response = axios
      .request(config)
      .then((response) => {
        return Result.ok(response.data);
      })
      .catch((error) => {
        console.error(error);
        return Result.err(error);
      });
    return response as Promise<Result<DocumentData, Error>>;
  }
  private async sendSendSignedTransaction(
    unsignedTransaction: object,
    signedTx: object,
    accessToken: string,
  ): Promise<Result<string, Error>> {
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
      url: 'https://api-pilot.ebsi.eu/track-and-trace/v1/jsonrpc',
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
        return Result.ok(response.data.result);
      })
      .catch((error) => {
        return Result.err(error);
      });
    return response as Promise<Result<string, Error>>;
  }
  private async sendCreateDocumentRequest(
    documentHash: string,
    documentMetadata: string,
    accesToken: string,
  ): Promise<Result<UnsignedTransaction, Error>> {
    const ebsiDID = this.wallet.getDid();
    const data = JSON.stringify({
      jsonrpc: '2.0',
      method: 'createDocument',
      params: [
        {
          from: this.wallet.getEthAddress(),
          documentHash: documentHash,
          documentMetadata: documentMetadata,
          didEbsiCreator: ebsiDID,
        },
      ],
      id: Math.ceil(Math.random() * 1000),
    });

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://api-pilot.ebsi.eu/track-and-trace/v1/jsonrpc',
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
        return Result.ok(response.data.result);
      })
      .catch((error) => {
        return Result.err(error);
      });
    return response as Promise<Result<UnsignedTransaction, Error>>;
  }

  private async sendGrantAccessRequest(
    documentHash: string,
    grantedByAccount: string,
    subjectAccount: string,
    grantedByAccType: number,
    subjectByAccType: number,
    permission: number,
    accesToken: string,
  ): Promise<Result<UnsignedTransaction, Error>> {
    const data = JSON.stringify({
      jsonrpc: '2.0',
      method: 'grantAccess',
      params: [
        {
          from: this.wallet.getEthAddress(),
          documentHash: documentHash,
          grantedByAccount: grantedByAccount,
          subjectAccount: subjectAccount,
          grantedByAccType: grantedByAccType,
          subjectAccType: subjectByAccType,
          permission: permission,
        },
      ],
      id: Math.ceil(Math.random() * 1000),
    });

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://api-pilot.ebsi.eu/track-and-trace/v1/jsonrpc',
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
        return Result.ok(response.data.result);
      })
      .catch((error) => {
        return Result.err(error);
      });
    return response as Promise<Result<UnsignedTransaction, Error>>;
  }

  private async sendRevokeAccessRequest(
    documentHash: string,
    revokedByAccount: string,
    subjectAccount: string,
    permission: number,
    accesToken: string,
  ): Promise<Result<UnsignedTransaction, Error>> {
    const data = JSON.stringify({
      jsonrpc: '2.0',
      method: 'revokeAccess',
      params: [
        {
          from: this.wallet.getEthAddress(),
          documentHash: documentHash,
          revokedByAccount: revokedByAccount,
          subjectAccount: subjectAccount,
          permission: permission,
        },
      ],
      id: Math.ceil(Math.random() * 1000),
    });

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://api-pilot.ebsi.eu/track-and-trace/v1/jsonrpc',
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
        return Result.ok(response.data.result);
      })
      .catch((error) => {
        return Result.err(error);
      });
    return response as Promise<Result<UnsignedTransaction, Error>>;
  }
}
