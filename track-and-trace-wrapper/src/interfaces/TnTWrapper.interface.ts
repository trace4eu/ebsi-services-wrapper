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
   * @returns the document hash as the documentId or and error
   */
  createDocument(
    documentHash: string,
    documentMetadata: string,
    waitMined?: boolean,
  ): Promise<Result<string, Error>>;

  /**
   * Retrieve the document details from the ledger
   * @param documentHash is the key to retrieve the document from the ledger
   * @returns the document details or an error
   */
  getDocumentDetails(
    documentHash: string,
  ): Promise<Result<DocumentData, Error>>;

  /**
   * Retrieve all the documents from the ledger with pagination
   * @param pageSize  requires an integer value
   * @param pageAfter requires an integer value
   * @returns a list of documents or an error
   */
  getAllDocuments(
    pageSize?: number,
    pageAfter?: number,
  ): Promise<Result<TnTPagedObjectList, Error>>;

  /**
   * Retrieve all the events of a document
   * @param documentHash  identifies the document to wich the events are attached
   * @returns a list of events or an error
   */
  getAllEventsOfDocument(
    documentHash: string,
  ): Promise<Result<TnTObjectRef[], Error>>;
  // isDocumentMined(trx: string): Promise<boolean>;

  /**
   * Add an event to a document
   * @param documentHash identifies the document to which the event is attached
   * @param eventId identifies the event
   * @param eventMetadata base64 encoded event metadata
   * @param origin identifies the origin of the event
   * @param waitMined wait event mined if true - default = true
   * @returns the event id or an error
   */
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

  grantAccessToDocument(
    documentHash: string,
    grantedByAccount: string,
    subjectAccount: string,
    grantedByAccType: number,
    subjectByAccType: number,
    permission: number,
    waitMined?: boolean,
  ): Promise<Result<boolean, Error>>;

  revokeAccessToDocument(
    documentHash: string,
    revokeByAccount: string,
    subjectAccount: string,
    permission: number,
    waitMined?: boolean,
  ): Promise<Result<boolean, Error>>;
  //listEventsOfDocument(): any;
}
