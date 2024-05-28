import { Wallet } from '@trace4eu/signature-wrapper';
import { Document } from '../types/document';
import { Optional } from '../types/optional';
import { DocumentData } from '../types/types';

/** 
 Interface TnTWrapper  
 main responsibility: hiding the ethereum details exposed by the api
*/
export interface ITnTWrapper {
  /** create a new document in the ledger ( it manage also the signing of the transaction )
   * @param documentHash base64 encoded document hash
   * @param documentMetadata base64 encoded document metadata
   */
  createDocument(
    documentHash: string,
    documentMetadata: string,
  ): Promise<string>;
  listDocuments(): any;
  getDocument(documentHash: string): Promise<DocumentData>;
  addEventToDocument(): any;
  listEventOfDocument(): any;
  getEvent(): any;
}
