import { describe, it, expect, vi, beforeAll } from 'vitest';
import { WalletFactory } from '@trace4eu/signature-wrapper';
import * as SignatureWrapperTypes from '@trace4eu/signature-wrapper';
import { EbsiAuthorisationApi } from '@trace4eu/authorisation-wrapper';
import { TnTWrapper } from '../../src/wrappers/TntWrapper';
import * as crypto from 'crypto';

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

describe('Track and Trace Wrapper events', () => {
  describe('Document events', () => {
    console.log('addEventToDocument test always true');
    const documentHash = `0x447e9c2b8d631c5296d12b9cb2c57b6ab5bc17ded80472a7f77ecfab731cde42`;
    const eventId = `0x${crypto.randomBytes(32).toString('hex')}`;
    const eventMetadata = 'eventMetadata';
    const origin = 'origin';
    const wallet = WalletFactory.createInstance(false, did, entityKey);
    const tntWrapper = new TnTWrapper(wallet);

    it('addEventToDocument', async () => {
      const event = await tntWrapper.addEventToDocument(
        documentHash,
        eventId,
        eventMetadata,
        origin,
        false,
      );
      console.log(event);
      expect(event).toBe(eventId);
    });

    it('getEventDetails', async () => {
      const eventDetails = await tntWrapper.getEventDetails(
        documentHash,
        eventId,
      );
      console.log(eventDetails);
      expect(eventDetails).toBeDefined();
    });
  });
});
