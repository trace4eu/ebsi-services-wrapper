import { Wallet } from '@trace4eu/signature-wrapper';
import { Optional } from '../types/optional';
import { TimestampData } from '../types/types';
import {Result} from "@trace4eu/error-wrapper";

/** 
 Interface TimestampWrapper
 main responsibility: ???
*/
export interface ITimestampWrapper {

  // builds a signed transaction to timestamp data and create a record of it with some info. It's possible to insert up to 3 hashes in a single transaction.
  timestampRecordHashes( //aka create record
    hashAlgorithmIds: number[],
    hashValues: string[],
    versionInfo: string, //This field must be a JSON stringified and converted into hex string
    timestampData?: string[], //This field must be a JSON stringified and converted into hex string
    waitMined?: boolean,
  ): Promise<Result<string, Error>>;

  // builds a signed transaction to timestamp hashes and store them under the given record. It's possible to insert up to 3 hashes in a single transaction.
  timestampRecordVersionHashes( // aka create version of record
    recordId: string, //TODO: find out how to get recordId after running timestampRecordHashes
    hashAlgorithmIds: number[],
    hashValues: string[],
    versionInfo: string, //This field must be a JSON stringified and converted into hex string	
    timestampData?: string[] //This field must be a JSON stringified and converted into hex string
  ): Promise<string[]>;

  //builds a signed transaction to insert a record owner. This method can be called only by record owners.
  insertRecordOwner(
    recordId: string,
    ownerId: string, //Ethereum address of new owner
    notBefore: string, //Point in time when the owner becomes valid. It should be defined in epoch time.
    notAfter: string, //Point in time when the owner becomes invalid. It should be defined in epoch time. For indefinite time set 0.
  ): Promise<string>;

  //builds a signed transaction to revoke a record owner. This method can be called only by record owners.
  revokeRecordOwner(
    recordId: string,
    ownerId: string, //Ethereum address of owner to be revoked
  ): Promise<string>;

  //get all versions of a record
  getRecordVersions(
    recordId: string //multibase base64url encoded
  ): Promise<Optional<string>>;

  //get the details of one version of a record
  getRecordVersionDetails(
    recordId: string, //multibase base64url encoded
    versionId: string
  ): Promise<Optional<string>>;
}
