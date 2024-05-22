import { Wallet } from '@trace4eu/signature-wrapper';


/** Interface TnTWrapper */
export interface ITnTWrapper {
  wallet: Wallet;
  createDocument(): any;
  addEventToDocument(): any;
  getDocument(): any;
  getEvent(): any;
  listdocuments(): any;
  listEventOfDocument(): any;
}
