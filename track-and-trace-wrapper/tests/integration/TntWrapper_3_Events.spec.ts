import { describe, it, expect, vi, beforeAll } from 'vitest';
import { WalletFactory } from '@trace4eu/signature-wrapper';
import * as SignatureWrapperTypes from '@trace4eu/signature-wrapper';
import { EbsiAuthorisationApi } from '@trace4eu/authorisation-wrapper';
import { TnTWrapper } from '../../src/wrappers/TntWrapper';
import * as crypto from 'crypto';

const did = 'did:ebsi:zfEmvX5twhXjQJiCWsukvQA';
const entityKey = [
  {
    alg: SignatureWrapperTypes.Algorithm.ES256K,
    privateKeyHex:
      'c5306796cb9cc41e143774e152c9e3396ba87b8caee91d618062666796483f8e',
  },
  {
    alg: SignatureWrapperTypes.Algorithm.ES256,
    privateKeyHex:
      '869176bf92b63061b59a26eff6370d26125720844987a60537dee3bff08740fb',
  },
];

const wallet = WalletFactory.createInstance(false, did, entityKey);
const tntWrapper = new TnTWrapper(wallet);
// document already inserted
const documentHash = `0x${crypto.randomBytes(32).toString('hex')}`;
const eventExternalHash = `0x${crypto.randomBytes(32).toString('hex')}`;
const eventMetadata = 'eventMetadata_' + new Date();
const eventMetadata1 = 'AAAAAAAAAAAAA';
const eventMetadata2 = 'BBBBBBBBBBBBB';
const origin = 'origin';

describe('Track and Trace Wrapper', () => {
  let firstDocumentHash;
  describe('manageEvents', () => {
    it('getFirstDocumentWrittenInLedger to be sure it exists and it is mined', async () => {
      const existingDocumentsPage = await tntWrapper.getAllDocuments();
      firstDocumentHash = existingDocumentsPage.value?.items[0].documentId;
      console.log('Document Hash:' + firstDocumentHash);
      const documentData =
        await tntWrapper.getDocumentDetails(firstDocumentHash);
      console.log('Document Data');
      console.log(
        'Document Data before adding new event' + JSON.stringify(documentData),
      );
      expect(documentData.unwrap()).toHaveProperty('metadata');
      expect(documentData.unwrap()).toEqual(
        expect.objectContaining({
          metadata: expect.any(String),
          creator: expect.any(String),
          events: expect.any(Array),
          timestamp: expect.objectContaining({
            datetime: expect.any(String),
            source: expect.any(String),
            proof: expect.any(String),
          }),
        }),
      );
    });

    // ToDo the transaction is reverted
    it('addEventToDocument with waiting mined = true', async () => {
      console.log(`first insterted document Hash: ${firstDocumentHash}`);
      const documentMetadata = 'documentMetadata';
      console.log(`eventExternalHash: ${eventExternalHash}`);
      const event = await tntWrapper.addEventToDocument(
        firstDocumentHash,
        eventExternalHash,
        eventMetadata,
        origin,
        true,
      );

      expect(event.unwrap()).toBe(eventExternalHash);
    });

    it('add existing Event to the same document', async () => {
      const documentMetadata = 'documentMetadata';
      const documentHash = `0x${crypto.randomBytes(32).toString('hex')}`;
      console.log(`DocumentHash: ${documentHash}`);
      const eventExternalHash = `0x${crypto.randomBytes(32).toString('hex')}`;

      await tntWrapper.createDocument(
        documentHash,
        documentMetadata,
        true,
      );
      await tntWrapper.addEventToDocument(
        documentHash,
        eventExternalHash,
        eventMetadata1,
        origin,
        true,
      );
      const documentDetails = await tntWrapper.getDocumentDetails(documentHash);
      console.log(documentDetails.unwrap());
      expect(documentDetails.value.events.length).eq(1);
      const eventDetails = await tntWrapper.getEventDetails(
        documentHash,
        documentDetails.value.events[0],
      );
      console.log(eventDetails.unwrap());

      const result = await tntWrapper.addEventToDocument(
        documentHash,
        eventExternalHash,
        eventMetadata2,
        origin,
        true,
      );
      expect(result.isErr()).eq(true);
    });

    it('getEventDetails of the first event of the first inserted document in the ledger', async () => {
      const documentDetails =
        await tntWrapper.getDocumentDetails(firstDocumentHash);
      console.log(
        'documentDetails after addEvent ' +
          eventExternalHash +
          ' : ' +
          JSON.stringify(documentDetails),
      );

      console.log(
        'first document number of events: ' +
          documentDetails.unwrap().events.length,
      );

      const eventId = documentDetails.unwrap().events[0];
      const eventData = await tntWrapper.getEventDetails(
        firstDocumentHash,
        eventId,
      );
      console.log('returned event data: ' + JSON.stringify(eventData));
      expect(eventData).toBeDefined();
      //ToDo, exactly check we had the right event, checking the event hash
    });
    /*
    it('return documents list', async () => {
      const documentList = await tntWrapper.getAllDocuments();
      expect(documentList).toBeDefined();
    });
  });

  it('return events of document', async () => {
    const documentList = await tntWrapper.getAllEventsOfDocument(documentHash);
    expect(documentList).toBeDefined();
  }); */
  });
});
