import { describe, it, expect, vi, beforeAll } from 'vitest';
import { WalletFactory } from '@trace4eu/signature-wrapper';
import * as SignatureWrapperTypes from '@trace4eu/signature-wrapper';
import { EbsiAuthorisationApi } from '@trace4eu/authorisation-wrapper';
import { TnTWrapper } from '../../src/wrappers/TntWrapper';
import crypto from 'crypto';

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
      console.log(documentHash);
      const documentMetadata = 'documentMetadata';
      const document = await tntWrapper.createDocument(
        documentHash,
        documentMetadata,
      );
      console.log(document);
      expect(document).toBe(documentHash);
    });

    it('getDocument', async () => {
      const documentHash =
        '0x266eb7cd3498f6b4760cded6172178b87fd4cf7b06c99cf1b3862ada1cd3f259';
      const documentData = await tntWrapper.getDocument(documentHash);
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
  });
});
