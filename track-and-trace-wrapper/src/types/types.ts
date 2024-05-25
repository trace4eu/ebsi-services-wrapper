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

export interface DocumentData {
  metadata: string;
  timestamp: Timestamp;
  events: any[];
  creator: string;
}

export interface Timestamp {
  datetime: string;
  source: string;
  proof: string;
}
