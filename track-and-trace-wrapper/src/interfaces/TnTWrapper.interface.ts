import { Wallet } from '@trace4eu/signature-wrapper';
import { Document } from '../types/document';
import { Optional } from '../types/optional';

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
  getDocument(): any;
  getEvent(): any;
  listDocuments(): any;
  listEventOfDocument(): any;
}
