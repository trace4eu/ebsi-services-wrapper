import {Algorithm, WalletFactory} from "@trace4eu/signature-wrapper";
import {EbsiAuthorisationApi} from "@trace4eu/authorisation-wrapper";
import {TnTWrapper} from "@trace4eu/tnt-wrapper";
import * as crypto from 'crypto';
import {createHash} from "crypto";
import { arrayify, BytesLike } from "@ethersproject/bytes";

function timeout(ms: number): Promise<void> {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
}

export function sha256(data: BytesLike): string {
  return "0x" + createHash("sha256").update(Buffer.from(arrayify(data))).digest("hex")
}

async function main() {
  const did = 'did:ebsi:zobuuYAHkAbRFCcqdcJfTgR';
  const entityKeys = [
    {
      alg: 'ES256K',
      privateKeyHex:
        'c4877a6d51c382b25a57684b5ac0a70398ab77b0eda0fcece0ca14ed00737e57',
    },
    {
      alg: Algorithm.ES256,
      privateKeyHex:
        'fa50bbba9feade27ea61dd9973abfd7c04e72366b607558cd0b423b75d067a86 ',
    },
  ];
  const wallet = WalletFactory.createInstance(false, did, entityKeys);
  const ebsiAuthorisationApi = new EbsiAuthorisationApi(wallet);
  const tokenResponse = await ebsiAuthorisationApi.getAccessToken(
    'ES256',
    'tnt_create',
    [],
  );
  console.log(`tokenResponse => ${JSON.stringify(tokenResponse, null, 2)}`);

  const tntWrapper = new TnTWrapper(wallet);
  const stringToHash = crypto.randomUUID();
  console.log(`String to hash: ${stringToHash}`);
  const documentHash = sha256(Buffer.from(stringToHash));
  console.log(`String hashed: ${documentHash}`);
  const documentMetadata = 'documentMetadata';
  const document = await tntWrapper.createDocument(
    documentHash,
    documentMetadata,
    true
  );
  console.log(`Document hash inserted in TnT api!`);
  const documentData = await tntWrapper.getDocumentDetails('0xabd3369f0bc1d001d5b7391dfc5b0b0f756044ead2eb18fa29c5a9da3f29fb8b');
  console.log(`Document data retrieved from TnT api: ${JSON.stringify(documentData, null, 2)}`);
}

main();
