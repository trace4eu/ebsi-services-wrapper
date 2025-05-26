import {WalletFactory} from "@trace4eu/signature-wrapper";
import {createHash} from "crypto";
import {TimestampWrapper} from "@trace4eu/timestamp-wrapper";
import crypto from "crypto";
import * as dotenv from 'dotenv';
import { sha256 as sha256multi } from "multiformats/hashes/sha2";
import { base64 } from "multiformats/bases/base64";

dotenv.config();

async function encodeMultibaseBase64(input: string): Promise<string> {
  // Convert input to a Uint8Array
  const inputBytes = new TextEncoder().encode(input);

  // Step 1: Create a multihash (e.g., using SHA-256)
  const hash = await sha256multi.digest(inputBytes);

  // Step 2: Encode the multihash into a multibase base64 string
  const multibaseEncoded = base64.encode(hash.bytes);

  return multibaseEncoded;
}

export function sha256(data: string) {
  return `0x${createHash('sha256').update(data, 'utf8').digest().toString('hex')}`;
}

async function main() {
  const did = process.env.DID_1 as string;
  const entityKey = [
    {
      alg: 'ES256K',
      privateKeyHex:
        process.env.PRIVATE_KEY_ES256K_DID_1 as string,
    },
    {
      alg: 'ES256',
      privateKeyHex:
        process.env.PRIVATE_KEY_ES256_DID_1 as string,
    },
  ];

  const wallet = WalletFactory.createInstance(false, did, entityKey);
  const timestampWrapper = new TimestampWrapper(wallet);

  const dataToHash = crypto.randomUUID();
  const timestampData = '0x' +
    Buffer.from(
      JSON.stringify({ timestamp: `timestampData=${dataToHash}` }),
      'utf-8',
    ).toString('hex');
  const hashedData = sha256(dataToHash);
  const versionInfo =
    '0x' +
    Buffer.from(
      JSON.stringify({ ipfs_cid: `ipfs cid` }),
      'utf-8',
    ).toString('hex');

  const trxRecordHash = await timestampWrapper.timestampRecordHashes(
    0, // sha2-256
    hashedData,
    versionInfo,
    [timestampData],
  );

  if (trxRecordHash.isErr()) console.error(`Error in timestampRecordHashes: ${trxRecordHash.unwrapErr().message}`);
  console.log(`timestampRecordHashes called successfully. RecordId: ${trxRecordHash.unwrap().multibase}. Hashed data: ${hashedData}. Original data: ${dataToHash}`);

  const timestampId = timestampWrapper.computeTimestampId(hashedData);
  console.log(`compute hashed data ${hashedData} to obtain timestampId: ${timestampId}`);

  const timestampResponseData = await timestampWrapper.getTimestamp(timestampId);
  if (timestampResponseData.isErr()) console.error(`Error while querying for the timestamp data: ${timestampResponseData.unwrapErr().message}`);
  console.log(`Timestamp data: ${JSON.stringify(timestampResponseData.unwrap(), null, 2)}`);

  const encodedMultibase64 = await encodeMultibaseBase64(dataToHash);
  console.log(`encoded multibase64: ${encodedMultibase64} => hash from timestamp response: ${timestampResponseData.unwrap().hash}`);
  if (encodedMultibase64 !== timestampResponseData.unwrap().hash) {
    throw new Error(`Encoded multibase64 does not match the hash from the timestamp response.`);
  }
  console.log('Verification successful! The encoded multibase64 matches the hash from the timestamp response.');
}

main().then().catch(error => console.error(error));
