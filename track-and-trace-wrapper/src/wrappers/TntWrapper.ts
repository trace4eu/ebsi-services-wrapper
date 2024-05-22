import { Wallet } from '@trace4eu/signature-wrapper';
import { ITnTWrapper } from '../interfaces/TnTWrapper.interface';
import * as SignatureWrapperTypes from '@trace4eu/signature-wrapper';

export class TnTWrapper implements ITnTWrapper {
  wallet: Wallet;

  constructor(wallet: Wallet) {
    this.wallet = wallet;
  }
  createDocument() {
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
}
