import { UnsignedTransaction, Wallet } from '@trace4eu/signature-wrapper';
import { ITnTWrapper } from '../interfaces/TnTWrapper.interface';
import { Optional } from '../types/optional';
import axios from 'axios';
import {
  AuthorisationApi,
  EbsiAuthorisationApi,
} from '@trace4eu/authorisation-wrapper';
import { DocumentData } from '../types/types';

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
        console.log(res2);
      }
      console.log(res2);
      await delay(15000);
    }
    return documentHash;
  }
  async addEventToDocument(
    documentHash: string,
    eventId: string,
    eventMetadata: string,
    origin: string,
  ): Promise<Optional<string>> {
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
          eventParams: [
            {
              documentHash: documentHash,
              externalHash: eventId,
              sender: this.wallet.getDid(),
              origin: 'origin',
              metadata: 'test metadata',
            },
          ],
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
        Authorization: 'Bearer' + access_token,
      },
      data: data,
    };

    return axios
      .request(config)
      .then((response) => {
        console.log(JSON.stringify(response.data));
        return Optional.Some(response.data.result);
      })
      .catch((error) => {
        console.log(error);
        return Optional.None();
      });
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
  getEventDetails(documentHash: string, eventId: string) {
    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: 'https://api-pilot.ebsi.eu/track-and-trace/v1/documents/${documentHash}/events/${eventId}',
      headers: {
        Accept: 'application/json',
      },
    };

    axios
      .request(config)
      .then((response) => {
        console.log(JSON.stringify(response.data));
      })
      .catch((error) => {
        console.log(error);
      });
  }
  listDocuments() {
    throw new Error('Method not implemented.');
  }
  listEventOfDocument() {
    throw new Error('Method not implemented.');
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
}
