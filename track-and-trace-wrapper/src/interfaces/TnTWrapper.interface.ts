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
   * @param waitMined wait document mined if true - default = true
   */
  createDocument(
    documentHash: string,
    documentMetadata: string,
    waitMined?: boolean,
  ): Promise<string>;
  getDocumentDetails(documentHash: string): Promise<DocumentData>;
  isDocumentMined(documenthash: string): Promise<boolean>;
  addEventToDocument(
    documentHash: string,
    eventId: string,
    eventMetadata: string,
    origin: string,
  ): Promise<Optional<string>>;
  getEventDetails(documentHash: string, eventId: string): any;
  listDocuments(): any;
  grantAccessToDocument(): any;
  revokeAccessToDocument(): any;
  //listEventsOfDocument(): any;
}
