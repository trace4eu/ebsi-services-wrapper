import { describe, it, expect } from 'vitest';
import { WalletFactory } from '@trace4eu/signature-wrapper';
import * as SignatureWrapperTypes from '@trace4eu/signature-wrapper';
import { TnTWrapper } from '../../src';
import { TnTPagedObjectList } from '../../src';
import { Optional } from '@trace4eu/error-wrapper';
import { Result } from '@trace4eu/error-wrapper';

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

describe('Track and Trace Wrapper Get Documents and getDocuments details', () => {
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
      existingDocumentsPage = await tntWrapper.getAllDocuments();
      const indexOfLastDocumentInPage =
        existingDocumentsPage.value?.items.length ?? 0;
      lastDocumentID =
        existingDocumentsPage.value?.items[indexOfLastDocumentInPage - 1]
          .documentId;
      console.log('Document Hash:' + lastDocumentID);
      const documentData = await tntWrapper.getDocumentDetails(lastDocumentID);
      console.log('Document Data');
      console.log(documentData);
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
  });
});
