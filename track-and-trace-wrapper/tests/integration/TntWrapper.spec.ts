import { describe, it, expect, vi, beforeAll } from 'vitest';
import { WalletFactory } from '@trace4eu/signature-wrapper';
import * as SignatureWrapperTypes from '@trace4eu/signature-wrapper';
import { EbsiAuthorisationApi } from '@trace4eu/authorisation-wrapper';
import { TnTWrapper } from '../../src/wrappers/TntWrapper';
import crypto from 'node:crypto';

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

describe('Track and Trace Wrapper', () => {
  describe('createDocument', () => {
    it('always true', () => {
      console.log('createDocument test always true');
      expect(true);
    });
    it('getBarerToken', async () => {
      const tntCreateBarerToken = await ebsiAuthorisationApi.getAccessToken(
        'ES256',
        'tnt_create',
        [],
      );
      console.log(tntCreateBarerToken);
      expect(true);
    });
    it('createDocument', async () => {
      const documentHash = `0x${crypto.randomBytes(32).toString('hex')}`;
      const documentMetadata = 'documentMetadata';
      const document = await tntWrapper.createDocument(
        documentHash,
        documentMetadata,
      );
      console.log(document);
      expect(true);
    });
  });
});
