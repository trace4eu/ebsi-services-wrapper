import { describe, it, expect, vi, beforeAll } from 'vitest';
import { WalletFactory } from '@trace4eu/signature-wrapper';
import * as SignatureWrapperTypes from '@trace4eu/signature-wrapper';
import { EbsiAuthorisationApi } from '@trace4eu/authorisation-wrapper';
import { TnTWrapper } from '../../src/wrappers/TntWrapper';
import * as crypto from 'crypto';
import { error } from 'console';

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

describe('Track and Trace EBSI Internals hidden features', () => {
  describe('list all documents', () => {
    it('return documents list', async () => {
      const documentList = await tntWrapper.getAllDocuments();
      expect(documentList).toBeDefined();
    });
  });
  it('return events of document', async () => {
    throw new error("metti l'id del documento al posto di pippo");
    const documentList = await tntWrapper.getAllEventsOfDocument('pippo');
    expect(documentList).toBeDefined();
  });
});
