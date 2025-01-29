import { describe, it, expect } from 'vitest';
import { WalletFactory } from '@trace4eu/signature-wrapper';
import * as SignatureWrapperTypes from '@trace4eu/signature-wrapper';
import { TnTWrapper } from '../../src';
import * as crypto from 'crypto';
import exp = require('node:constants');

const DID = process.env.DID_1;
const ENTITY_KEY = [
  {
    alg: SignatureWrapperTypes.Algorithm.ES256K,
    privateKeyHex: process.env.PRIVATE_KEY_ES256K_DID_1,
  },
  {
    alg: SignatureWrapperTypes.Algorithm.ES256,
    privateKeyHex: process.env.PRIVATE_KEY_ES256_DID_1,
  },
];

describe('Track and Trace Wrapper', () => {
  const wallet = WalletFactory.createInstance(false, DID, ENTITY_KEY);
  const tntWrapper = new TnTWrapper(wallet);
  const documentHash = `0x${crypto.randomBytes(32).toString('hex')}`;
  const documentMetadata = 'documentMetadata';
  const eventExternalHash = `0x${crypto.randomBytes(32).toString('hex')}`;
  const eventMetadata = 'eventMetadata_' + new Date();
  const eventMetadata1 = 'AAAAAAAAAAAAA';
  const eventMetadata2 = 'BBBBBBBBBBBBB';
  const origin = 'origin';

  describe('manageEvents', () => {
    it('addEventToDocument with waiting mined = true', async () => {
      const documentMetadata = 'documentMetadata';
      const document = await tntWrapper.createDocument(
        documentHash,
        documentMetadata,
        true,
      );
      expect(document.isOk()).to.equal(true);
      const documentData = await tntWrapper.getDocumentDetails(documentHash);
      console.log('Document Data');
      console.log(
        'Document Data before adding new event' + JSON.stringify(documentData),
      );
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

      const event = await tntWrapper.addEventToDocument(
        documentHash,
        eventExternalHash,
        eventMetadata,
        origin,
        true,
      );

      expect(event.unwrap()).toBe(eventExternalHash);
    });

    it('add two different events with waiting mined = true', async () => {
      const documentMetadata = 'documentMetadata';
      const documentHash = `0x${crypto.randomBytes(32).toString('hex')}`;
      await tntWrapper.createDocument(documentHash, documentMetadata, true);
      await tntWrapper.addEventToDocument(
        documentHash,
        eventExternalHash,
        eventMetadata,
        origin,
        true,
      );
      const eventExternalHash2 = `0x${crypto.randomBytes(32).toString('hex')}`;

      const event = await tntWrapper.addEventToDocument(
        documentHash,
        eventExternalHash2,
        eventMetadata,
        origin,
        true,
      );

      expect(event.unwrap()).toBe(eventExternalHash2);
    });

    it('add two times the same event to the same document', async () => {
      const documentHash = `0x${crypto.randomBytes(32).toString('hex')}`;
      const eventExternalHash = `0x${crypto.randomBytes(32).toString('hex')}`;

      await tntWrapper.createDocument(documentHash, documentMetadata, true);
      await tntWrapper.addEventToDocument(
        documentHash,
        eventExternalHash,
        eventMetadata1,
        origin,
        true,
      );

      const result = await tntWrapper.addEventToDocument(
        documentHash,
        eventExternalHash,
        eventMetadata2,
        origin,
        true,
      );
      expect(result.isErr()).eq(true);

      const documentDetails = await tntWrapper.getDocumentDetails(documentHash);
      console.log(documentDetails.unwrap());
      expect(documentDetails.value.events.length).eq(1);
      const eventDetails = await tntWrapper.getEventDetails(
        documentHash,
        documentDetails.value.events[0],
      );
      expect(eventDetails.unwrap().eventHash).eq(eventExternalHash);
    });

    it('getEventDetails of the first event of the first inserted document in the ledger', async () => {
      const documentHash = `0x${crypto.randomBytes(32).toString('hex')}`;
      const eventExternalHash = `0x${crypto.randomBytes(32).toString('hex')}`;

      await tntWrapper.createDocument(documentHash, documentMetadata, true);
      await tntWrapper.addEventToDocument(
        documentHash,
        eventExternalHash,
        eventMetadata1,
        origin,
        true,
      );
      const documentDetails = await tntWrapper.getDocumentDetails(documentHash);

      const eventId = documentDetails.unwrap().events[0];
      const eventData = await tntWrapper.getEventDetails(documentHash, eventId);
      console.log('returned event data: ' + JSON.stringify(eventData));
      expect(eventData.unwrap().eventHash).to.equal(eventExternalHash);
    });

    it('return documents list', async () => {
      const documentList = await tntWrapper.getAllDocuments();
      expect(documentList.unwrap()).toEqual(
        expect.objectContaining({
          self: expect.any(String),
          items: expect.any(Array),
          total: expect.any(Number),
          pageSize: expect.any(Number),
          links: expect.any(Object),
        }),
      );
      expect(documentList.unwrap().items[0]).toEqual(
        expect.objectContaining({
          documentId: expect.any(String),
          href: expect.any(String),
        }),
      );
      expect(documentList.unwrap().links).toEqual(
        expect.objectContaining({
          first: expect.any(String),
          prev: expect.any(String),
          next: expect.any(String),
          last: expect.any(String),
        }),
      );
    });

    it('return events of document', async () => {
      const documentHash =
        '0x670e49fd1c5a9c465e0292380511826c6d2793efb09f97c73bb1ee8e11d15312';
      const documentList =
        await tntWrapper.getAllEventsOfDocument(documentHash);
      expect(documentList.unwrap()).toEqual(
        expect.objectContaining({
          self: expect.any(String),
          items: expect.any(Array),
          total: expect.any(Number),
          pageSize: expect.any(Number),
          links: expect.any(Object),
        }),
      );
      expect(documentList.unwrap().items[0]).toEqual(
        expect.objectContaining({
          eventId: expect.any(String),
          href: expect.any(String),
        }),
      );
      expect(documentList.unwrap().links).toEqual(
        expect.objectContaining({
          first: expect.any(String),
          prev: expect.any(String),
          next: expect.any(String),
          last: expect.any(String),
        }),
      );
    });
  });
});
