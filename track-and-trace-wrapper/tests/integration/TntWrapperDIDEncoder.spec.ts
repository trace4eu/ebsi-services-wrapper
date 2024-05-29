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
     // 'c4877a6d51c382b25a57684b5ac0a70398ab77b0eda0fcece0ca14ed00737e57',
      'c5306796cb9cc41e143774e152c9e3396ba87b8caee91d618062666796483f8e',
  },
  {
    alg: SignatureWrapperTypes.Algorithm.ES256,
    privateKeyHex:
    //  'fa50bbba9feade27ea61dd9973abfd7c04e72366b607558cd0b423b75d067a86',
      '869176bf92b63061b59a26eff6370d26125720844987a60537dee3bff08740fb',
  },
];

const wallet = WalletFactory.createInstance(false, did, entityKey);
const ebsiAuthorisationApi = new EbsiAuthorisationApi(wallet);
const tntWrapper = new TnTWrapper(wallet);
// document already inserted
const documentHash = `0x99910da926cbf151a09e1c4f8eb9e5c55836016260f5cfa1e2c8c184c6e1943c`;
const eventId = `0x${crypto.randomBytes(32).toString('hex')}`;
const eventMetadata = 'eventMetadata';
const origin = 'origin';

describe('generate DID in exadecimal string', () => {
  describe('convert did in exdecimal, values from EBSI-cli log of createevent ( just add "0x" at the beginning of the string to have the identifier', () => {
    it('exadecimal to did', () => {
      const sender: string =
        '6469643a656273693a7a66456d765835747768586a514a69435773756b765141';
      const buffer = Buffer.from(sender, 'hex');
      const did = buffer.toString('utf8');
      // did 0 "did:ebsi:zfEmvX5twhXjQJiCWsukvQA"

      expect(true);
    });
    it('did to exadecimal string', () => {
      const did2 = 'did:ebsi:zfEmvX5twhXjQJiCWsukvQA';
      const buffer2 = Buffer.from(did2, 'utf8');
      const sender2 = buffer2.toString('hex');
      // sender2 = "6469643a656273693a7a66456d765835747768586a514a69435773756b765141"
      expect(true);
    });
  });
});
