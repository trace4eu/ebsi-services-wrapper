import { describe, it, expect, vi, beforeAll } from 'vitest';
import { WalletFactory } from '@trace4eu/signature-wrapper';
import * as SignatureWrapperTypes from '@trace4eu/signature-wrapper';
import { EbsiAuthorisationApi } from '@trace4eu/authorisation-wrapper';
import { TimestampWrapper } from '../../src/wrappers/TimestampWrapper';
import * as crypto from 'crypto';
import { time, trace } from 'console';

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
const timestampWrapper = new TimestampWrapper(wallet);

const eventId = `0x${crypto.randomBytes(32).toString('hex')}`;
const eventMetadata = 'eventMetadata';
const origin = 'origin';

describe('Timestamp Wrapper - create timestamp', () => {
  const hashValue1 = "0x"+crypto.createHash('sha256').update("this is a test 1").digest('hex');;
  const hashValue2 = "0x"+crypto.createHash('sha256').update("this is a test 2").digest('hex');;
  describe('create timestamp', () => {
    it('always true', () => {
      console.log('create timestamp test always true');
      expect(true);
    });
    it('hashValue1 with wait to be Mined "false" ', async () => {
      console.log('hashValue1: ' + hashValue1);
      const timestamps = await timestampWrapper.timestampHashes(
        [0], // sha2-256, check if hash value is hashed as sha2-256
        [hashValue1],
        "",
        false
      );
      console.log(timestamps)
      expect(timestamps[0]).toBe(hashValue1);
    });
    it('create timestamp with wait to be Mined "true"', async () => {
      console.log('hashValue2: ' + hashValue2);
      const timestamps = await timestampWrapper.timestampHashes(
        [0],
        [hashValue2],
        "",
        true,
      );
      const timestampData = await timestampWrapper.getTimestampDetails(hashValue2);
      console.log({ timestampData });
      expect(timestamps[0]).toBe(hashValue2);
    });
    it('check if it is mined', async () => {
      const risp = await timestampWrapper.isTimestampMined(hashValue2);
      expect(risp).toBe(true);
    });
  });
});
