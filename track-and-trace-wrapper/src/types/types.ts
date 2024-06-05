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

export interface TnTObjectRef {
  documentId: string;
  href: string;
}

export interface TnTPageLinks {
  first: string;
  prev: string;
  next: string;
  last: string;
}

export interface TnTPagedObjectList {
  items: TnTObjectRef[];
  pageSize: number;
  links: TnTPageLinks;
  total: number;
}

export interface EventData {
  eventHash: string;
  eventId: string;
  timestamp: Timestamp;
  sender: string;
  origin: string;
  metadata: string;
}
