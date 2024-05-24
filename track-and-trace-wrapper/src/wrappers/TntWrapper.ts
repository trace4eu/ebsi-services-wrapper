import { UnsignedTransaction, Wallet } from '@trace4eu/signature-wrapper';
import { ITnTWrapper } from '../interfaces/TnTWrapper.interface';
import { Optional } from '../types/optional';
import axios from 'axios';
import {
  AuthorisationApi,
  EbsiAuthorisationApi,
} from '@trace4eu/authorisation-wrapper';

export class TnTWrapper implements ITnTWrapper {
  private wallet: Wallet;
  private ebsiAuthtorisationApi: AuthorisationApi;

  constructor(wallet: Wallet) {
    this.wallet = wallet;
    this.ebsiAuthtorisationApi = new EbsiAuthorisationApi(this.wallet);
  }
  async createDocument(
    documentHash: string,
    documentMetadata: string,
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
    // ToDO
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
    return documentHash;
  }
  addEventToDocument() {
    throw new Error('Method not implemented.');
  }
  getDocument() {
    throw new Error('Method not implemented.');
  }
  getEvent() {
    throw new Error('Method not implemented.');
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
        console.log(JSON.stringify(response.data.result));
        return Optional.Some(response.data.result);
      })
      .catch((error) => {
        console.log(error);
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
      .catch((error) => {
        console.log(error);
        return Optional.None();
      });
    return response as Promise<Optional<object>>;
  }
}
