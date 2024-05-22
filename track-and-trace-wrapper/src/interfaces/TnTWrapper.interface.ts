import { Wallet } from '@trace4eu/signature-wrapper';
import { Document } from '../types/document';

/** Interface TnTWrapper */
export interface ITnTWrapper {
  wallet: Wallet;
  createDocument(document: Document): any;
  addEventToDocument(): any;
  getDocument(): any;
  getEvent(): any;
  listDocuments(): any;
  listEventOfDocument(): any;
}
