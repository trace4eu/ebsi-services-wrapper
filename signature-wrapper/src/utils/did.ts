import { DidMethod } from '../types/types';
import { DidMethodNotSupportedError } from '../errors/DidMethodNotSupportedError';

const isKeyDid = (did: string): boolean => {
  if (!did) return false;
  if (did.match(/^did:key:/g)) {
    return true;
  }
  return false;
};
const isEbsiDid = (did: string): boolean => {
  if (!did) return false;
  if (did.match(/^did:ebsi:/g)) {
    return true;
  }
  return false;
};

export const whatDidMethodIs = (did: string): DidMethod => {
  if (isKeyDid(did)) return DidMethod.DidKey;
  if (isEbsiDid(did)) return DidMethod.Ebsi;
  throw new DidMethodNotSupportedError(did);
};
