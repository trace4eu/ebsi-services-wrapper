import { Wallet } from '@trace4eu/signature-wrapper/src/wallet/wallet.interface';
import { ITnTWrapper } from '../interfaces/TnTWrapper.interface';
import * as SignatureWrapperTypes from '@trace4eu/signature-wrapper/src/types/types';

export class TnTWrapper implements ITnTWrapper {
  wallet;
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
  listdocuments() {
    throw new Error('Method not implemented.');
  }
  listEventOfDocument() {
    throw new Error('Method not implemented.');
  }
}
