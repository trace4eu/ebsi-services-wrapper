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

    it('addEventToDocument', async () => {
      console.log(`documentHash: ${documentHash}`);
      const documentMetadata = 'documentMetadata';
      await tntWrapper.createDocument(documentHash, documentMetadata, true);
      console.log(`eventExternalHash: ${eventExternalHash}`);
      await tntWrapper.addEventToDocument(
        documentHash,
        eventExternalHash,
        eventMetadata,
        origin,
        true,
      );

      const documentDetails = await tntWrapper.getDocumentDetails(documentHash);
      console.log({ documentDetails });

      const eventId = documentDetails.unwrap().events[0];
      const eventData = await tntWrapper.getEventDetails(documentHash, eventId);
      console.log({ eventData });
      expect(eventData).toBeDefined();
    });
    it('getEventDetails', async () => {
      const documentDetails = await tntWrapper.getDocumentDetails(
        '0x88df2180efac18dba72747e4204977b88d781eac9b5051b15bd0c997f432f82c',
      );
      console.log({ documentDetails });

      const eventId = documentDetails.unwrap().events[0];
      const eventData = await tntWrapper.getEventDetails(
        '0x88df2180efac18dba72747e4204977b88d781eac9b5051b15bd0c997f432f82c',
        '0x1c062d1699ecc5e8e62335da3136844634d3d83643bf32bc443e1cb8a24f2a5e',
      );
      console.log({ eventData });
      expect(eventData).toBeDefined();
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
