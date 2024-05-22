import { Wallet } from '@trace4eu/signature-wrapper/src/wallet/wallet.interface';
import { Document } from '../types/document';

/** Interface TnTWrapper */
export interface ITnTWrapper {
  wallet: Wallet;
  createDocument(document: Document): any;
  addEventToDocument(): any;
  getDocument(): any;
  getEvent(): any;
  listdocuments(): any;
  listEventOfDocument(): any;
}
