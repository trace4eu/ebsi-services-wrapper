import { describe, it, expect, vi, beforeAll } from 'vitest';
import { WalletFactory } from '@trace4eu/signature-wrapper';
import { TnTWrapper } from '../../src';
import * as crypto from 'crypto';
import * as SignatureWrapperTypes from '@trace4eu/signature-wrapper';

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

const wallet = WalletFactory.createInstance(false, DID, ENTITY_KEY);
const tntWrapper = new TnTWrapper(wallet);

describe('Track and Trace Wrapper - create document', () => {
  const documentHash1 = `0x${crypto.randomBytes(32).toString('hex')}`;
  const documentHash2 = `0x${crypto.randomBytes(32).toString('hex')}`;
  describe('createDocument', () => {
    it('always true', () => {
      console.log('createDocument test always true');
      expect(true);
    });
    it('createDocument doc2 wait to be Mined "true"', async () => {
      console.log('Document Hash:' + documentHash2);
      const documentMetadata = 'documentMetadata';
      const document = await tntWrapper.createDocument(
        documentHash2,
        documentMetadata,
        true,
      );
      if (document.isErr()) {
        console.log('Error: ' + document.unwrapErr());
      }
      console.log(document);
      const documentData = await tntWrapper.getDocumentDetails(documentHash2);
      console.log({ documentData });
      expect(document.unwrap()).toBe(documentHash2);
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
      expect(document.unwrap()).toBe(documentHash1);
    });
    it.skip('check if it is mined', async () => {
      const risp = await tntWrapper.isDocumentMined(documentHash2);
      expect(risp).toBe(true);
    });
  });
});
