import { Wallet } from '@trace4eu/signature-wrapper';
import { Document } from '../types/document';
import { Optional } from '@trace4eu/error-wrapper';
import { Result } from '@trace4eu/error-wrapper';
import {
  EventData,
  DocumentData,
  TnTObjectRef,
  TnTPagedObjectList,
} from '../types/types';

/**
 Interface TnTWrapper
 main responsibility: hiding the ethereum details exposed by the api
*/
export interface ITnTWrapper {
  /** create a new document in the ledger ( it manage also the signing of the transaction )
   * @param documentHash base64 encoded document hash
   * @param documentMetadata base64 encoded document metadata
   * @param waitMined wait document mined if true - default = true
   * @param incrementNonce
   */
  createDocument(
    documentHash: string,
    documentMetadata: string,
    waitMined?: boolean,
    incrementNonce?: boolean,
  ): Promise<Result<string, Error>>;
  getDocumentDetails(
    documentHash: string,
  ): Promise<Result<DocumentData, Error>>;
  /**
   *
   * @param pageSize  requires an integer value
   * @param pageAfter requires an integer value
   */
  getAllDocuments(
    pageSize?: number,
    pageAfter?: number,
  ): Promise<Result<TnTPagedObjectList, Error>>;
  getAllEventsOfDocument(
    documentHash: string,
  ): Promise<Result<TnTObjectRef[], Error>>;
  // isDocumentMined(trx: string): Promise<boolean>;
  addEventToDocument(
    documentHash: string,
    eventId: string,
    eventMetadata: string,
    origin: string,
    waitMined?: boolean,
  ): Promise<Result<string, Error>>;
  getEventDetails(
    documentHash: string,
    eventId: string,
  ): Promise<Result<EventData, Error>>;
  //listEventsOfDocument(): any;
}
