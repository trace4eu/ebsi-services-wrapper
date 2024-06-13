import { describe, it, expect, vi, beforeAll } from 'vitest';
import { WalletFactory } from '@trace4eu/signature-wrapper';
import * as SignatureWrapperTypes from '@trace4eu/signature-wrapper';
import { EbsiAuthorisationApi } from '@trace4eu/authorisation-wrapper';
import { TnTWrapper } from '../../src/wrappers/TntWrapper';
import * as crypto from 'crypto';

const did = 'did:ebsi:zobuuYAHkAbRFCcqdcJfTgR';
const entityKey = [
  {
    alg: SignatureWrapperTypes.Algorithm.ES256K,
    privateKeyHex:
     // 'c4877a6d51c382b25a57684b5ac0a70398ab77b0eda0fcece0ca14ed00737e57',
      'c5306796cb9cc41e143774e152c9e3396ba87b8caee91d618062666796483f8e',
  },
  {
    alg: SignatureWrapperTypes.Algorithm.ES256,
    privateKeyHex:
    //  'fa50bbba9feade27ea61dd9973abfd7c04e72366b607558cd0b423b75d067a86',
      '869176bf92b63061b59a26eff6370d26125720844987a60537dee3bff08740fb',
  },
];

const wallet = WalletFactory.createInstance(false, did, entityKey);
const ebsiAuthorisationApi = new EbsiAuthorisationApi(wallet);
const tntWrapper = new TnTWrapper(wallet);
// document already inserted
const documentHash = `0x99910da926cbf151a09e1c4f8eb9e5c55836016260f5cfa1e2c8c184c6e1943c`;
const eventId = `0x${crypto.randomBytes(32).toString('hex')}`;
const eventMetadata = 'eventMetadata';
const origin = 'origin';

describe('Track and Trace Wrapper', () => {
  describe('createDocument', () => {
    it('always true', () => {
      console.log('createDocument test always true');
      expect(true);
    });

    it('getDocumentDetails', async () => {
      //const documentHash =
      //  '0x266eb7cd3498f6b4760cded6172178b87fd4cf7b06c99cf1b3862ada1cd3f259';
      console.log('Document Hash:' + documentHash);
      const documentData = await tntWrapper.getDocumentDetails(documentHash);
      console.log('Document Data');
      console.log(documentData);
      expect(documentData).toHaveProperty('metadata');
      expect(documentData).toEqual(
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

    it('addEventToDocument', async () => {
      const event = await tntWrapper.addEventToDocument(
        documentHash,
        eventId,
        eventMetadata,
        origin,
        false,
      );
      console.log('returned event : ' + event);
      expect(event).toBeDefined();
    });
    /*
    it('getEventDetails', async () => {
      const eventDetails = await tntWrapper.getEventDetails(
        documentHash,
        '0x3c88977dc8dfb5e51615cfc40c39b4b756d42dfe92bdf9b6eba5e8539990c139',
      );
      console.log(eventDetails);
      expect(eventDetails).toBeDefined();
    });

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
