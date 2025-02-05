import {WalletFactory} from "@trace4eu/signature-wrapper";
import {createHash} from "crypto";
import crypto from "crypto";
import * as dotenv from 'dotenv';
import {BytesLike } from "ethers";
import {arrayify} from "ethers/lib/utils";
import {Result} from "@trace4eu/error-wrapper";
import {DocumentData, TnTWrapper} from "@trace4eu/tnt-wrapper";

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

async function waitDocumentToBeMined(
  timestampId: string,
  tntWrapper: TnTWrapper,
): Promise<Result<DocumentData, Error>> {
  let timestampData: Result<DocumentData, Error>;
  let tentatives = 10;
  do {
    await delay(5000);
    timestampData = await tntWrapper.getDocumentDetails(timestampId);
    tentatives -= 1;
  } while (
    timestampData.isErr() &&
    tentatives > 0
    );
  return timestampData;
}

async function main() {
  const did = process.env.DID_1 as string;
  const entityKeys = [
    {
      alg: 'ES256K',
      privateKeyHex:
        process.env.PRIVATE_KEY_ES256K_DID_1 as string,
    },
    {
      alg: 'ES256K',
      privateKeyHex:
        process.env.PRIVATE_KEY_ES256K_DID_1_2 as string,
    },
    {
      alg: 'ES256K',
      privateKeyHex:
        process.env.PRIVATE_KEY_ES256K_DID_1_3 as string,
    },
    {
      alg: 'ES256',
      privateKeyHex:
        process.env.PRIVATE_KEY_ES256_DID_1 as string,
    },
  ];

  const wallet = WalletFactory.createInstance(false, did, entityKeys);
  const tntWrapper = new TnTWrapper(wallet);

  const documentHashes = [];

  for (let i = 0; i < 3; i++) {
    const { hashedData, hexData, data } = generateDummyData();
    const timestamp = await tntWrapper.createDocument(
      hashedData,
      hexData,
      false,
    );
    if (timestamp.isErr()) process.exit(1);
    documentHashes.push(hashedData);
    console.log(`Document hashes data: ${JSON.stringify(data, null, 2)}`);
    console.log(`Document hash: ${hashedData}`);
  }

  const blockNumbers = [];
  for (let documentHash of documentHashes) {
    const documentData = await waitDocumentToBeMined(documentHash, tntWrapper);
    console.log(`documentHash: ${documentHash}`);
    console.log(`documentData: ${JSON.stringify(documentData.unwrap(), null, 2)}`)
    blockNumbers.push(Number(documentData.unwrap().timestamp.proof));
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
