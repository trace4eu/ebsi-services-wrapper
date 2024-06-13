/* import { JWK } from 'jose';

export enum DidMethod {
  DidKey = 'key',
  Ebsi = 'ebsi',
}

export enum Algorithm {
  ES256K = 'ES256K',
  ES256 = 'ES256',
} */
/** Interface TnTWrapper */

export interface TimestampData {
  hash: string;
  timestampedBy: string;
  blockNumber: number;
  timestamp: string;
  transactionHash: string;
  data: string;
}
