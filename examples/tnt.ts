import {WalletFactory} from "@trace4eu/signature-wrapper";
import {TnTWrapper} from "@trace4eu/tnt-wrapper";
import * as crypto from 'crypto';
import {createHash} from "crypto";

import * as dotenv from 'dotenv';

dotenv.config();

export function sha256(data: string) {
  return `0x${createHash('sha256').update(data, 'utf8').digest().toString('hex')}`;
}

function getHexDid(did: string): string {
  return `0x${Buffer.from(did, 'utf8').toString('hex')}`;
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
      alg: 'ES256',
      privateKeyHex:
        process.env.PRIVATE_KEY_ES256_DID_1 as string,
    },
  ];
  const walletEntityDocumentCreator = WalletFactory.createInstance(false, did, entityKeys);

  const tntWrapper = new TnTWrapper(walletEntityDocumentCreator);

  const stringToHash = crypto.randomUUID();
  console.log(`String to hash: ${stringToHash}`);
  const documentHash = sha256(stringToHash);
  console.log(`String hashed: ${documentHash}`);

  const documentMetadata = '';
  await tntWrapper.createDocument(
    documentHash,
    documentMetadata
  );
  console.log(`Document hash inserted in TnT api!`);
  const documentData = await tntWrapper.getDocumentDetails(documentHash);
  console.log(`Document data retrieved from TnT api:`);
  if (!documentData.isErr()) console.log(documentData.unwrap());

  const eventMetadata = 'eventMetadata';
  const origin = 'origin';

  const transaction = await tntWrapper.addEventToDocument(
    documentHash,
    `0x${crypto.randomBytes(32).toString('hex')}`,
    eventMetadata,
    origin
  );

  if (transaction.isOk()) console.log('Event attached to the document');

  const documentDetails = await tntWrapper.getDocumentDetails(documentHash);

  const eventId = documentDetails.isOk() && documentDetails.value?.events[0];
  const eventData = await tntWrapper.getEventDetails(documentHash, eventId);
  console.log(eventData.value);

  const didDelegatedEntity = process.env.DID_2 as string;
  const entityKeysDelegatedEntity = [
    {
      alg: 'ES256K',
      privateKeyHex:
        process.env.PRIVATE_KEY_ES256K_DID_2 as string,
    },
    {
      alg: 'ES256',
      privateKeyHex:
        process.env.PRIVATE_KEY_ES256_DID_2 as string,
    },
  ];

  const transactionGrantAccess = await tntWrapper.grantAccessToDocument(
    documentHash,
    walletEntityDocumentCreator.getHexDid(),
    getHexDid(didDelegatedEntity),
    0,
    0,
    1
  )

  if (transactionGrantAccess.isErr()) console.error(`Error occurred while granting access to a document ${transactionGrantAccess.unwrapErr().message}`);
  console.log(`Entity ${did} has granted access to the document ${documentHash} to the entity ${didDelegatedEntity}`);

  const walletDelegatedEntity = WalletFactory.createInstance(false, didDelegatedEntity, entityKeysDelegatedEntity);
  const tntWrapperDelegated = new TnTWrapper(walletDelegatedEntity);
  const transactionCreateEvent = await tntWrapperDelegated.addEventToDocument(
    documentHash,
    `0x${crypto.randomBytes(32).toString('hex')}`,
    'Delegated writing events!',
    origin
  );
  if (transactionCreateEvent.isErr()) console.error(`Error occurred while creating an event ${transactionCreateEvent.unwrapErr().message}`);
  console.log(`Entity ${didDelegatedEntity} has added an event to the document ${documentHash} that is owned by ${didDelegatedEntity}`);

  const documentDetailsWithTwoEvents = await tntWrapper.getDocumentDetails(documentHash);
  console.log(documentDetailsWithTwoEvents.value);

  const transactionRevokeAccess = await tntWrapper.revokeAccessToDocument(
    documentHash,
    walletEntityDocumentCreator.getHexDid(),
    getHexDid(didDelegatedEntity),
    1
  )
  if (transactionRevokeAccess.isErr()) console.error(`Error occurred while revoking access to a document: ${transactionRevokeAccess.unwrapErr().message}`);
  console.log(`Entity ${didDelegatedEntity} has revoked access the document ${documentHash} to ${didDelegatedEntity}`);

  const transactionCreateEventFailed = await tntWrapperDelegated.addEventToDocument(
    documentHash,
    `0x${crypto.randomBytes(32).toString('hex')}`,
    'Delegated trying to write an event but access is revoked!',
    origin
  );
  if (transactionCreateEventFailed.isErr()) {
    console.log(`Entity ${didDelegatedEntity} has tried to add an event to the document ${documentHash} that is owned by ${didDelegatedEntity}. But access is revoked`);
  }


}

main();
