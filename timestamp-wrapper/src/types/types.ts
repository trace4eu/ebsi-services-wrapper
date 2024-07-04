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

export interface RecordVersions {
  self: string;
  items: {}[];
  total: number;
  pageSize: string;
  links: {
    first: string;
    last: string;
    prev: string;
    next: string;
  };
}

export interface RecordVersionDetails {
  hashes: string[];
  info: {}[];
}
