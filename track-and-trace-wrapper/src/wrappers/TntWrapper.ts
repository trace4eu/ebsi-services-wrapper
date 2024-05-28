import { UnsignedTransaction, Wallet } from '@trace4eu/signature-wrapper';
import { ITnTWrapper } from '../interfaces/TnTWrapper.interface';
import { Optional } from '../types/optional';
import axios from 'axios';
import {
  AuthorisationApi,
  EbsiAuthorisationApi,
} from '@trace4eu/authorisation-wrapper';
import { DocumentData, EventData, TnTObjectRef } from '../types/types';
import { ethers } from 'ethers';

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export class TnTWrapper implements ITnTWrapper {
  private wallet: Wallet;
  private ebsiAuthtorisationApi: AuthorisationApi;

  constructor(wallet: Wallet) {
    this.wallet = wallet;
    this.ebsiAuthtorisationApi = new EbsiAuthorisationApi(this.wallet);
  }

  grantAccessToDocument() {
    throw new Error('Method not implemented.');
  }
  revokeAccessToDocument() {
    throw new Error('Method not implemented.');
  }

  async isDocumentMined(documenthash: string): Promise<boolean> {
    const { access_token } = await this.ebsiAuthtorisationApi.getAccessToken(
      'ES256',
      'tnt_create',
      [],
    );
    const response = await this.getTransactionReceipt(
      documenthash,
      access_token,
    );

    return response.isSome();
  }
  async createDocument(
    documentHash: string,
    documentMetadata: string,
    waitMined: boolean = true,
  ): Promise<string> {
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
    if (DocumentUnsignedTx.isEmpty()) {
      // return Optional.None();
      throw new Error('Error sending request to ebsi api');
    }
    const DocumentUnsignedTxJson = {
      to: DocumentUnsignedTx.get().to,
      from: DocumentUnsignedTx.get().from,
      data: DocumentUnsignedTx.get().data,
      nonce: DocumentUnsignedTx.get().nonce,
      value: DocumentUnsignedTx.get().value,
      chainId: DocumentUnsignedTx.get().chainId,
      gasLimit: DocumentUnsignedTx.get().gasLimit,
      gasPrice: DocumentUnsignedTx.get().gasPrice,
    };
    const signatureResponseData = await this.wallet.signEthTx(
      DocumentUnsignedTxJson,
    );
    // return Optional.None();
    await this.sendSendSignedTransaction(
      DocumentUnsignedTxJson,
      signatureResponseData,
      access_token,
    );
    if (waitMined) {
      const res2 = await this.getTransactionReceipt(documentHash, access_token);
      while (res2.isEmpty()) {
        await delay(15000);
        const res2 = await this.getTransactionReceipt(
          documentHash,
          access_token,
        );
        //console.log(res2);
      }
      await delay(5000);
    }
    return documentHash;
  }
  async addEventToDocument(
    documentHash: string,
    eventId: string,
    eventMetadata: string,
    origin: string,
    waitMined: boolean = true,
  ): Promise<string> {
    const unsignedTransaction = await this.sendCreateEventRequest(
      documentHash,
      eventId,
      eventMetadata,
      origin,
    );
    if (unsignedTransaction.isEmpty()) {
      throw new Error('Error sending request to ebsi api');
    }
    const unsignedTransactionJson = {
      to: unsignedTransaction.get().to,
      from: unsignedTransaction.get().from,
      data: unsignedTransaction.get().data,
      nonce: unsignedTransaction.get().nonce,
      value: unsignedTransaction.get().value,
      chainId: unsignedTransaction.get().chainId,
      gasLimit: unsignedTransaction.get().gasLimit,
      gasPrice: unsignedTransaction.get().gasPrice,
    };
    const signatureResponseData = await this.wallet.signEthTx(
      unsignedTransactionJson,
    );
    const { access_token } = await this.ebsiAuthtorisationApi.getAccessToken(
      'ES256',
      'tnt_write',
      [],
    );
    await this.sendSendSignedTransaction(
      unsignedTransactionJson,
      signatureResponseData,
      access_token,
    );
    if (waitMined) {
      const res2 = await this.getTransactionReceipt(documentHash, access_token);
      while (res2.isEmpty()) {
        await delay(15000);
        const res2 = await this.getTransactionReceipt(
          documentHash,
          access_token,
        );
        //console.log(res2);
      }
      await delay(5000);
    }
    return eventId;
  }

  async getDocumentDetails(documentHash: string): Promise<DocumentData> {
    const documentData = await this.getDocumentFromApi(documentHash);
    const dateTime = new Date(
      parseInt(documentData.get().timestamp.datetime, 16) * 1000,
    );
    console.log(dateTime.toISOString());
    return {
      metadata: documentData.get().metadata,
      timestamp: {
        datetime: dateTime.toISOString(),
        source: documentData.get().timestamp.source,
        proof: documentData.get().timestamp.proof,
      },
      events: documentData.get().events,
      creator: documentData.get().creator,
    };
  }

  async getEventDetails(
    documentHash: string,
    eventId: string,
  ): Promise<Optional<EventData>> {
    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: 'https://api-pilot.ebsi.eu/track-and-trace/v1/documents/${documentHash}/events/${eventId}',
      headers: {
        Accept: 'application/json',
      },
    };

    const response = await axios
      .request(config)
      .then((response) => {
        return Optional.Some(response.data);
      })
      .catch((error) => {
        return Optional.None();
      });
    if (response.isEmpty()) {
      const data = response.get();
      return Optional.Some({
        eventId: data.externalHash,
        documentHash: data.hash,
        timestamp: {
          datetime: data.timestamp.datetime.toISOString(),
          source: data.timestamp.source,
          proof: data.timestamp.proof,
        },
        sender: data.sender,
        origin: data.origin,
        metadata: data.metadata,
      });
    } else return Optional.None();
  }

  getAllDocuments(): Promise<Optional<TnTObjectRef[]>> {
    return this.getDocumentsFromAPI();
  }

  getAllEventsOfDocument(
    documentHash: string,
  ): Promise<Optional<TnTObjectRef[]>> {
    return this.getEventsOfDocumentFromAPI(documentHash);
  }

  private async sendCreateDocumentRequest(
    documentHash: string,
    documentMetadata: string,
    accesToken: string,
  ): Promise<Optional<UnsignedTransaction>> {
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
  ): Promise<object> {
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
      .then()
      .catch(() => {
        return Optional.None();
      });
    return response as Promise<Optional<object>>;
  }

  private async getDocumentFromApi(documentHash: string) {
    const config = {
      method: 'get',
      url: `https://api-pilot.ebsi.eu/track-and-trace/v1/documents/${documentHash}`,
    };

    const response = axios
      .request(config)
      .then((response) => {
        return Optional.Some(response.data);
      })
      .catch((error) => {
        return Optional.None();
      });
    return response as Promise<Optional<DocumentData>>;
  }

  private async getDocumentsFromAPI(): Promise<Optional<TnTObjectRef[]>> {
    const config = {
      method: 'get',
      url: `https://api-pilot.ebsi.eu/track-and-trace/v1/documents`,
    };

    return axios
      .request(config)
      .then((response) => {
        return Optional.Some(response.data);
      })
      .catch((error) => {
        return Optional.None();
      });
  }

  private async getEventsOfDocumentFromAPI(
    documentID: string,
  ): Promise<Optional<TnTObjectRef[]>> {
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
        return Optional.Some(response.data);
      })
      .catch((error) => {
        return Optional.None();
      });
  }

  private async getTransactionReceipt(
    txHash: string,
    accessToken: string,
  ): Promise<Optional<object>> {
    const data = JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_getTransactionReceipt',
      id: Math.ceil(Math.random() * 1000),
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
        console.log(response);
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

  private async sendCreateEventRequest(
    documentHash: string,
    eventId: string,
    eventMetadata: string,
    origin: string,
  ): Promise<Optional<UnsignedTransaction>> {
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
            // TO BE REMOVED WITH DIRECT CALL TO WALLET FUNCTION
            sender: ethers.utils.hexlify(
              ethers.utils.toUtf8Bytes(this.wallet.getDid()),
            ),
            origin: 'origin',
            metadata: 'test metadata',
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
    console.log('PPPPPPPP' + JSON.stringify(config));
    return axios
      .request(config)
      .then((response) => {
        console.log('FFFFFFFFFF');
        console.log(JSON.stringify(response.data));
        return Optional.Some(response.data.result);
      })
      .catch((error) => {
        console.log(error.response.data);
        return Optional.None();
      });
  }
}
