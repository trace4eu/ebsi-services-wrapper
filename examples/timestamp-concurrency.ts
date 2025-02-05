import {WalletFactory} from "@trace4eu/signature-wrapper";
import {createHash} from "crypto";
import {TimestampData, TimestampWrapper} from "@trace4eu/timestamp-wrapper";
import crypto from "crypto";
import * as dotenv from 'dotenv';
import {BytesLike } from "ethers";
import {arrayify} from "ethers/lib/utils";
import {Result} from "@trace4eu/error-wrapper";

dotenv.config();

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

function sha256(data: BytesLike) {
  return `0x${createHash('sha256')
    .update(Buffer.from(arrayify(data)))
    .digest('hex')}`;
}

function generateDummyData(): { data: object, bufferData: Buffer, hexData: string, hashedData: string } {
  const data = { number: crypto.randomInt(10000) };
  const bufferData = Buffer.from(JSON.stringify(data));
  const hexData = `0x${bufferData.toString('hex')}`;
  const hashedData = sha256(bufferData);
  return {
    data,
    bufferData,
    hexData,
    hashedData
  }
}

async function waitTimestampToBeMined(
  timestampId: string,
  timestampWrapper: TimestampWrapper,
): Promise<Result<TimestampData, Error>> {
  let timestampData: Result<TimestampData, Error>;
  let tentatives = 10;
  do {
    await delay(5000);
    timestampData = await timestampWrapper.getTimestamp(timestampId);
    tentatives -= 1;
  } while (
    timestampData.isErr() &&
    tentatives > 0
    );
  return timestampData;
}

async function main() {
  const did = process.env.DID_3 as string;
  const entityKeys = [
    {
      alg: 'ES256K',
      privateKeyHex:
        process.env.PRIVATE_KEY_ES256K_DID_3 as string,
    },
    {
      alg: 'ES256K',
      privateKeyHex:
        process.env.PRIVATE_KEY_ES256K_DID_3_2 as string,
    },
    {
      alg: 'ES256K',
      privateKeyHex:
        process.env.PRIVATE_KEY_ES256K_DID_3_3 as string,
    },
    {
      alg: 'ES256',
      privateKeyHex:
        process.env.PRIVATE_KEY_ES256_DID_3 as string,
    },
  ];

  const wallet = WalletFactory.createInstance(false, did, entityKeys);
  const timestampWrapper = new TimestampWrapper(wallet);

  const timestampIds = [];

  for (let i = 0; i < 3; i++) {
    const { hashedData, hexData, data } = generateDummyData();
    const timestamp = await timestampWrapper.timestampHashes(
      0, // sha2-256
      hashedData,
      hexData,
      false,
    );
    if (timestamp.isErr()) process.exit(1);
    timestampIds.push(timestamp.unwrap().id);
    console.log(`Timestamped data: ${JSON.stringify(data, null, 2)}`);
    console.log(`Timestamp Id: ${timestamp.unwrap().id}`);
  }

  const blockNumbers = [];
  for (let timestampId of timestampIds) {
    const timestampData = await waitTimestampToBeMined(timestampId, timestampWrapper);
    console.log(`Timestamp Id: ${timestampId}`);
    console.log(`Timestamp id return the timestamp data: ${JSON.stringify(timestampData.unwrap(), null, 2)}`)
    blockNumbers.push(timestampData.unwrap().blockNumber);
  }

  const uniqueArrayWithBlockNumbers = blockNumbers.filter((value, index, array) => array.indexOf(value) === index);
  if (uniqueArrayWithBlockNumbers.length === 1) {
    console.log(`All transactions have been written in the same block number: ${uniqueArrayWithBlockNumbers[0]}`);
    process.exit(0);
  }
  console.error('Transactions have not been included in the same block number: ' + blockNumbers.toString());
  process.exit(1);


}

main().then().catch(error => console.error(error));
