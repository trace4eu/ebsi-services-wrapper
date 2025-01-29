import {WalletFactory} from "@trace4eu/signature-wrapper";
import {createHash} from "crypto";
import {TimestampWrapper} from "@trace4eu/timestamp-wrapper";
import crypto from "crypto";
import * as dotenv from 'dotenv';

dotenv.config();

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
  console.log(`timestampRecordHashes called successfully. RecordId: ${trxRecordHash.unwrap().multibase}. Hashed data ${hashedData}`);

  const timestampId = timestampWrapper.computeTimestampId(hashedData);
  console.log(`compute hashed data ${hashedData} to obtain timestampId: ${timestampId}`);

  const timestampResponseData = await timestampWrapper.getTimestamp(timestampId);
  if (timestampResponseData.isErr()) console.error(`Error while querying for the timestamp data: ${timestampResponseData.unwrapErr().message}`);
  console.log(`Timestamp data: ${JSON.stringify(timestampResponseData.unwrap(), null, 2)}`)
}

main().then().catch(error => console.error(error));
