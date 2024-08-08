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
    it('Error case - two serial transactions', async () => {
      console.log('Document Hash:' + documentHash2);
      const documentMetadata = 'documentMetadata';
      const document = await tntWrapper.createDocument(
        documentHash2,
        documentMetadata,
        false,
        false,
      );
      if (document.isErr()) {
        console.log('Error: ' + document.unwrapErr());
      }
      console.log(document);
      /* const documentData = await tntWrapper.getDocumentDetails(documentHash2);
      console.log({ documentData }); */

      console.log('Document Hash:' + documentHash1);
      const documentMetadata2 = 'documentMetadata';
      const document2 = await tntWrapper.createDocument(
        documentHash1,
        documentMetadata2,
        false,
        false,
      );
      expect(document2.unwrapErr()).toBeDefined();
    });
    it('Success case - two serial transactions but incrementing nonce', async () => {
      console.log('Document Hash:' + documentHash2);
      const documentMetadata = 'documentMetadata';
      const document = await tntWrapper.createDocument(
        documentHash2,
        documentMetadata,
        false,
        false,
      );
      if (document.isErr()) {
        console.log('Error: ' + document.unwrapErr());
      }
      console.log(document);
      /* const documentData = await tntWrapper.getDocumentDetails(documentHash2);
      console.log({ documentData }); */

      console.log('Document Hash:' + documentHash1);
      const documentMetadata2 = 'documentMetadata';
      const document2 = await tntWrapper.createDocument(
        documentHash1,
        documentMetadata2,
        false,
        true,
      );
      console.log(document2.unwrap());
      expect(document.unwrap()).toBe(documentHash2);
    });
  });
});
