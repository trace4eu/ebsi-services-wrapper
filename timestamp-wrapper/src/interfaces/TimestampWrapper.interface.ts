import { Wallet } from '@trace4eu/signature-wrapper';
import { Optional } from '../types/optional';
import { TimestampData } from '../types/types';

/** 
 Interface TimestampWrapper
 main responsibility: ???
*/
export interface ITimestampWrapper {
  /** create a timestamp: builds an unsigned transaction to timestamp hashes. It's possible to insert up to 3 hashes in a single transaction.
   * https://hub.ebsi.eu/apis/pilot/timestamp/v3/post-jsonrpc#timestamphashes
   * @param hashAlgorithmIds array of numbers representing the used hash algorithms
   * @param hashValues array of hash values --> different to this guide: https://hub.ebsi.eu/tools/cli/upcoming-apis/create-timestamp
   */
  timestampHashes(
    hashAlgorithmIds: number[],
    hashValues: string[],
    waitMined: boolean,
  ): Promise<string>;

  isTimestampMined(timestampId: string): Promise<boolean>;

  //https://hub.ebsi.eu/apis/pilot/timestamp/v3/get-timestamp
  getTimestampDetails(timestampId: string): Promise<TimestampData>;
}
