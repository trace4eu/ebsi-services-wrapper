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

  /**
   * Grant access to write event to a document
   * @param documentHash hash of the document
   * @param grantedByAccount Entity that grants the permission. If the entity uses the did:ebsi method, grantedByAccount must be the UTF-8 DID encoded in hexadecimal. If the entity uses the did:key method, grantedByAccount must be the secp256k1 uncompressed public key (64 bytes or 65 bytes with 04 prefix) encoded in hexadecimal.
   * @param subjectAccount Entity that receives the permission. If the entity uses the did:ebsi method, subjectAccount must be the UTF-8 DID encoded in hexadecimal. If the entity uses the did:key method, subjectAccount must be the secp256k1 uncompressed public key (64 bytes or 65 bytes with 04 prefix) encoded in hexadecimal.
   * @param grantedByAccType DID method of grantedByAccount. Use 0 for did:ebsi or 1 for did:key.
   * @param subjectByAccType DID method of subjectAccount. Use 0 for did:ebsi or 1 for did:key.
   * @param permission Type of the permission to grant. Use 0 for "delegate" or 1 for "write"
   * @param waitMined wait event mined if true - default = true
   */
  grantAccessToDocument(
    documentHash: string,
    grantedByAccount: string,
    subjectAccount: string,
    grantedByAccType: number,
    subjectByAccType: number,
    permission: number,
    waitMined?: boolean,
  ): Promise<Result<boolean, Error>>;

  /**
   * Revoke access to document
   * @param documentHash hash of the document
   * @param revokeByAccount Entity that revokes the permission. If the entity uses the did:ebsi method, revokedByAccount must be the UTF-8 DID encoded in hexadecimal. If the entity uses the did:key method, revokedByAccount must be the secp256k1 uncompressed public key (64 bytes or 65 bytes with 04 prefix) encoded in hexadecimal.
   * @param subjectAccount Entity whose permission is revoked. If the entity uses the did:ebsi method, subjectAccount must be the UTF-8 DID encoded in hexadecimal. If the entity uses the did:key method, subjectAccount must be the secp256k1 uncompressed public key (64 bytes or 65 bytes with 04 prefix) encoded in hexadecimal.
   * @param permission Type of the permission to revoke. Use 0 for "delegate" or 1 for "write"
   * @param waitMined wait event mined if true - default = true
   */
  revokeAccessToDocument(
    documentHash: string,
    revokeByAccount: string,
    subjectAccount: string,
    permission: number,
    waitMined?: boolean,
  ): Promise<Result<boolean, Error>>;

  /**
   * Returns a list of accesses related to the document.
   * @param documentHash hash of the document
   * @param pageSize Cursor that points to the end of the page of data that has been returned.
   * @param pageAfter Defines the maximum number of objects that may be returned.
   */
  listAccesses(
    documentHash: string,
    pageSize?: number,
    pageAfter?: number,
  ): Promise<Result<TnTPagedObjectList, Error>>;

  /**
   * Checks if the DID is included in the allowlist of TnT Document creators or not.
   * @param creator did to check
   */
  checkAccess(creator: string): Promise<Result<boolean, Error>>;
}
