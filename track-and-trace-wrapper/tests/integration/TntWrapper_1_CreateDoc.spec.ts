import { describe, it, expect, vi, beforeAll } from 'vitest';
import { WalletFactory } from '@trace4eu/signature-wrapper';
import * as SignatureWrapperTypes from '@trace4eu/signature-wrapper';
import { EbsiAuthorisationApi } from '@trace4eu/authorisation-wrapper';
import { TnTWrapper } from '../../src/wrappers/TntWrapper';
import * as crypto from 'crypto';
import { trace } from 'console';

const did = 'did:ebsi:zobuuYAHkAbRFCcqdcJfTgR';
const entityKey = [
  {
    alg: SignatureWrapperTypes.Algorithm.ES256K,
    privateKeyHex:
      'c4877a6d51c382b25a57684b5ac0a70398ab77b0eda0fcece0ca14ed00737e57',
  },
  {
    alg: SignatureWrapperTypes.Algorithm.ES256,
    privateKeyHex:
      'fa50bbba9feade27ea61dd9973abfd7c04e72366b607558cd0b423b75d067a86',
  },
];

const wallet = WalletFactory.createInstance(false, did, entityKey);
const ebsiAuthorisationApi = new EbsiAuthorisationApi(wallet);
const tntWrapper = new TnTWrapper(wallet);

const eventId = `0x${crypto.randomBytes(32).toString('hex')}`;
const eventMetadata = 'eventMetadata';
const origin = 'origin';

describe('Track and Trace Wrapper - create document', () => {
  const documentHash1 = `0x${crypto.randomBytes(32).toString('hex')}`;
  const documentHash2 = `0x${crypto.randomBytes(32).toString('hex')}`;
  describe('createDocument', () => {
    it('always true', () => {
      console.log('createDocument test always true');
      expect(true);
    });
    it('createDocument doc1 with wait to be Mined "false" ', async () => {
      console.log('Document Hash:' + documentHash1);
      const documentMetadata = 'documentMetadata';
      const document = await tntWrapper.createDocument(
        documentHash1,
        documentMetadata,
        false,
      );
      console.log(document);
      expect(document).toBe(documentHash1);
    });
    it('createDocument doc2 wait to be Mined "true"', async () => {
      console.log('Document Hash:' + documentHash2);
      const documentMetadata = 'documentMetadata';
      const document = await tntWrapper.createDocument(
        documentHash2,
        documentMetadata,
        true,
      );
      console.log(document);
      const documentData = await tntWrapper.getDocumentDetails(documentHash2);
      console.log({ documentData });
      expect(document).toBe(documentHash2);
    });
    it.skip('check if it is mined', async () => {
      const risp = await tntWrapper.isDocumentMined(documentHash2);
      expect(risp).toBe(true);
    });
  });
});
