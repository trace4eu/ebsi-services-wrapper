import { Wallet } from '@trace4eu/signature-wrapper';
import { Document } from '../types/document';
import { Optional } from '../types/optional';
import { DocumentData } from '../types/types';

/** Interface TnTWrapper */
export interface ITnTWrapper {
  /**
   * @param documentHash base64 encoded document hash
   * @param documentMetadata document metadata
   */
  createDocument(
    documentHash: string,
    documentMetadata: string,
  ): Promise<string>;
  addEventToDocument(): any;
  getDocument(documentHash: string): Promise<DocumentData>;
  getEvent(): any;
  listDocuments(): any;
  listEventOfDocument(): any;
}
