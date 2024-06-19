import { describe, it, expect, vi, beforeAll } from 'vitest';
import { WalletFactory } from '@trace4eu/signature-wrapper';
import * as SignatureWrapperTypes from '@trace4eu/signature-wrapper';
import { EbsiAuthorisationApi } from '@trace4eu/authorisation-wrapper';
import { TnTWrapper } from '../../src/wrappers/TntWrapper';
import { TnTPagedObjectList } from '../../src/types/types';
import * as crypto from 'crypto';
import { Optional } from '@trace4eu/error-wrapper';
import { Result } from '@trace4eu/error-wrapper';

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
const documentHash = `0x${crypto.randomBytes(32).toString('hex')}`;
const eventId = `0x${crypto.randomBytes(32).toString('hex')}`;
const eventMetadata = 'eventMetadata';
const origin = 'origin';

describe('Track and Trace Wrapper Get Documents and getDocuments detail', () => {
  let existingDocumentsPage: Result<TnTPagedObjectList, Error>;
  let firstDocumentID;
  let lastDocumentID;
  let totalDocuments: number;
  describe('GetDocuments without parameters', () => {
    it('getDocumentsFistPage', async () => {
      existingDocumentsPage = await tntWrapper.getAllDocuments();
      firstDocumentID = existingDocumentsPage.value?.items[0].documentId;
      expect(existingDocumentsPage).not.toBe(Result.err);
    });
    it('getDocumentsLastPage', async () => {
      totalDocuments = existingDocumentsPage.value?.total ?? 0;
      const lastPage = Math.trunc(totalDocuments / 30); // I'll use a pageSize of 30
      if (totalDocuments % 30 > 0) {
        // true the last page is the next one
        existingDocumentsPage = await tntWrapper.getAllDocuments(
          30,
          lastPage + 1,
        );
      } else {
        existingDocumentsPage = await tntWrapper.getAllDocuments(30, lastPage);
      }
      expect(existingDocumentsPage).not.toBe(Optional.None);
    });
    it('getDocumentDetails of the last document inserted', async () => {
      const indexOfLastDocumentInPage =
        existingDocumentsPage.value?.items.length ?? 0;
      lastDocumentID =
        existingDocumentsPage.value?.items[indexOfLastDocumentInPage]
          .documentId;
      console.log('Document Hash:' + lastDocumentID);
      const documentData = await tntWrapper.getDocumentDetails(lastDocumentID);
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

    it('check if the last document is mined for our isDocumentMined function', async () => {
      const risp = await tntWrapper.isDocumentMined(lastDocumentID);
      expect(risp).toBe(true);
    });

    it('check if the first document is mined for our isDocumentMined function', async () => {
      const risp = await tntWrapper.isDocumentMined(firstDocumentID);
      expect(risp).toBe(true);
    });

    it('check if the the document inserted and mined by the EBSI client is mined also for our isDocumentMined function', async () => {
      // idDocument from the log of the EBSI-client createCocument
      const risp = await tntWrapper.isDocumentMined(
        '0x29210da926cbf151a09e1c4f8eb9e5c55836016260f5cfa1e2c8c184c6e1943c',
      );
      expect(risp).toBe(true);
    });
  });
});
