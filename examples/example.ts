import {Algorithm, WalletFactory} from "@trace4eu/signature-wrapper";
import {EbsiAuthorisationApi} from "@trace4eu/authorisation-wrapper";
import {TnTWrapper} from "@trace4eu/tnt-wrapper";
import * as crypto from 'crypto';
import {createHash} from "crypto";
import { arrayify, BytesLike } from "@ethersproject/bytes";

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
      alg: 'ES256',
      privateKeyHex:
        'fa50bbba9feade27ea61dd9973abfd7c04e72366b607558cd0b423b75d067a86 ',
    },
  ];
  const wallet = WalletFactory.createInstance(false, did, entityKeys);

  const tntWrapper = new TnTWrapper(wallet);

  const stringToHash = crypto.randomUUID();
  console.log(`String to hash: ${stringToHash}`);
  const documentHash = sha256(Buffer.from(stringToHash));
  console.log(`String hashed: ${documentHash}`);

  const documentMetadata = '';
  await tntWrapper.createDocument(
    documentHash,
    documentMetadata,
    true
  );
  console.log(`Document hash inserted in TnT api!`);
  const documentData = await tntWrapper.getDocumentDetails(documentHash);
  console.log(`Document data retrieved from TnT api:`);
  if (!documentData.isErr()) console.log(documentData.unwrap());

  const eventExternalHash = `0x${crypto.randomBytes(32).toString('hex')}`;
  const eventMetadata = 'eventMetadata';
  const origin = 'origin';

  const transaction = await tntWrapper.addEventToDocument(
    documentHash,
    eventExternalHash,
    eventMetadata,
    origin,
    true,
  );

  if (transaction.isOk()) console.log('Event attached to the document');

  const documentDetails = await tntWrapper.getDocumentDetails(documentHash);

  const eventId = documentDetails.isOk() && documentDetails.value?.events[0];
  const eventData = await tntWrapper.getEventDetails(documentHash, eventId);
  console.log(eventData.value);
}

main();
