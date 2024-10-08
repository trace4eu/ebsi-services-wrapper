import { describe, it, expect, vi, beforeAll } from 'vitest';
import { WalletFactory } from '@trace4eu/signature-wrapper';
import * as SignatureWrapperTypes from '@trace4eu/signature-wrapper';
import { EbsiAuthorisationApi } from '@trace4eu/authorisation-wrapper';
import { TnTWrapper } from '../../src/wrappers/TntWrapper';
import * as crypto from 'crypto';

// Granting user
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

// Subject user
const didSubject = 'did:ebsi:z21ExDPMoRDzXetA6FeHPkUi';
const entityKeySubject = [
  {
    alg: SignatureWrapperTypes.Algorithm.ES256K,
    privateKeyHex:
      '7d7ce544bf90b13e53d2b5c25be92fac25087778bfb6139aa47b029381aa1b5b',
  },
  {
    alg: SignatureWrapperTypes.Algorithm.ES256,
    privateKeyHex:
      '97726eb73aeeb66f9c28b9bab06f3b02e465615839b86c15df89c231a44afb35',
  },
];

const wallet = WalletFactory.createInstance(false, did, entityKey);
const walletSubject = WalletFactory.createInstance(
  false,
  didSubject,
  entityKeySubject,
);

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
  describe('Grant and Revoke permission', () => {
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

    it('Grant permission to another user', async () => {
      const result = await tntWrapper.grantAccessToDocument(
        firstDocumentHash,
        wallet.getHexDid(),
        walletSubject.getHexDid(),
        0,
        0,
        1,
      );
      console.log('Grant permission result');
      console.log(result);
    });
  });
});
