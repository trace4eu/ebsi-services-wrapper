import { Wallet } from '@trace4eu/signature-wrapper';
import { ITnTWrapper } from '../interfaces/TnTWrapper.interface';
import * as SignatureWrapperTypes from '@trace4eu/signature-wrapper';
import { Optional } from '../types/optional';
import axios from 'axios';
import ethers from 'ethers';

export class TnTWrapper implements ITnTWrapper {
  private wallet: Wallet;

  constructor(wallet: Wallet) {
    this.wallet = wallet;
  }
  async createDocument(documentHash: string): Promise<Optional<string>> {
    const DocumentUnsignedTx =
      await this.sendCreateDocumentRequest(documentHash);
    if (DocumentUnsignedTx.isEmpty()) {
      return Optional.None();
    }
    const DocumentSignedTx = await this.wallet.signEthTx(
      DocumentUnsignedTx.get(),
    );
    await this.sendSendSignedTransaction(DocumentSignedTx);

    throw new Error('Method not implemented.');
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
  ): Promise<Optional<ethers.UnsignedTransaction>> {
    const ebsiDID = this.wallet.getDid();

    const data = JSON.stringify({
      jsonrpc: '2.0',
      method: 'createDocument',
      params: [
        {
          from: '0xc9765eC58E49e6E386549CEAA34FB0d8bB69C320 TODO add address',
          documentHash: documentHash,
          documentMetadata: 'TODO add metadata',
          didEbsiCreator: ebsiDID,
        },
      ],
      id: 474,
    });

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://api-pilot.ebsi.eu/track-and-trace/v1/jsonrpc',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Bearer <TOKEN>',
      },
      data: data,
    };

    const response = axios
      .request(config)
      .then((response) => {
        console.log(JSON.stringify(response.data));
        return Optional.Some(response.data);
      })
      .catch((error) => {
        console.log(error);
        return Optional.None();
      });
    return response;
  }

  private async sendSendSignedTransaction(signedTx: string): Promise<void> {
    const data = JSON.stringify({
      jsonrpc: '2.0',
      method: 'sendSignedTransaction',
      id: 1,
      params: [
        {
          protocol: 'eth',
          unsignedTransaction: {
            from: '0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7',
            to: '0xFde86148db58f57787C06BeAf63a9c3f789357b3',
            data: '0x0000...',
            nonce: '0x00',
            chainId: '0x1b3b',
            gasLimit: '0x10000',
            gasPrice: '0x00',
            value: '0x00',
          },
          r: '0x...',
          s: '0x...',
          v: '0x...',
          signedRawTransaction: signedTx,
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
        Authorization: 'Bearer <TOKEN>',
      },
      data: data,
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
}
