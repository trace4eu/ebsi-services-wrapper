import { Wallet } from '@trace4eu/signature-wrapper';
import { Document } from '../types/document';
import { Optional } from '../types/optional';

/** Interface TnTWrapper */
export interface ITnTWrapper {
  /**
   * @param documentHash base64 encoded document hash
   */
  createDocument(documentHash: string): Promise<Optional<string>>;
  addEventToDocument(): any;
  getDocument(): any;
  getEvent(): any;
  listDocuments(): any;
  listEventOfDocument(): any;
}
