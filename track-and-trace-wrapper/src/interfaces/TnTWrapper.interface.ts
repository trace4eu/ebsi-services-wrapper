import { Wallet } from '@trace4eu/signature-wrapper';
import { Document } from '../types/document';
import { Optional } from '../types/optional';
import { DocumentData, TnTObjectRef, TnTPagedObjectList } from '../types/types';

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
  /**
   *
   * @param pageSize  requires an integer value
   * @param pageAfter requires an integer value
   */
  getAllDocuments(
    pageSize?: number,
    pageAfter?: number,
  ): Promise<Optional<TnTPagedObjectList>>;
  getAllEventsOfDocument(
    documentHash: string,
  ): Promise<Optional<TnTObjectRef[]>>;
  // isDocumentMined(trx: string): Promise<boolean>;
  addEventToDocument(
    documentHash: string,
    eventId: string,
    eventMetadata: string,
    origin: string,
    waitMined?: boolean,
  ): Promise<string>;
  getEventDetails(documentHash: string, eventId: string): any;
  //listEventsOfDocument(): any;
}
