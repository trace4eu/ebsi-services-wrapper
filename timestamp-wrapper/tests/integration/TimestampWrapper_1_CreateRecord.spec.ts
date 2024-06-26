import { describe, it, expect, vi, beforeAll } from 'vitest';
import { WalletFactory } from '@trace4eu/signature-wrapper';
import * as SignatureWrapperTypes from '@trace4eu/signature-wrapper';
import { EbsiAuthorisationApi } from '@trace4eu/authorisation-wrapper';
import { TimestampWrapper } from '../../src/wrappers/TimestampWrapper';
import * as crypto from 'crypto';
const base64url = require('base64url');
import { time, trace } from 'console';
import { version } from 'os';

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



function encodeSHA256EncodedHexStringToMultihashAndThenToBase64url(hexString) {
  // Remove '0x' prefix if present
  if (hexString.startsWith('0x')) {
    hexString = hexString.slice(2);
  }

  // Convert hex string to buffer
  const buffer = Buffer.from(hexString, 'hex');

  // Multihash prefix for SHA-256 (0x12) and length (0x20)
  const prefix = Buffer.from([12, 20]);

  // Combine prefix and buffer
  const multihashBuffer = Buffer.concat([prefix, buffer]);

  // Convert to base64url string
  const base64urlString = "u"+base64url(multihashBuffer);

  return base64urlString;
}

describe('Timestamp Wrapper', () => {
  const hashValue1 = "0x"+crypto.createHash('sha256').update("this is hash value 1").digest('hex');;
  const hashValue2 = "0x"+crypto.createHash('sha256').update("this is hash value 2").digest('hex');;
  const timestampData1 = "0x"+Buffer.from(JSON.stringify({timestamp:"example_timestamp"}), "utf-8").toString("hex");;
  const versionInfo1 = "0x"+Buffer.from(JSON.stringify({ipfs_cid: "example"}), "utf-8").toString("hex");;
  const versionInfo2 = "0x"+Buffer.from(JSON.stringify({ipfs_cid: "new example"}), "utf-8").toString("hex");;

  describe('Create record', () => {
    it('always true', () => {
      console.log('create record test always true');
      expect(true);
    });
    it('record with hashValue1', async () => {
      console.log('hashValue1: ' + hashValue1);
      const record = await timestampWrapper.timestampRecordHashes(
        [0], // sha2-256
        [hashValue1],
        versionInfo1,
        [timestampData1] //send as timestampData
      );
      console.log("record:", record)

      const base64urlResult = encodeSHA256EncodedHexStringToMultihashAndThenToBase64url(record[1]);
      console.log("potential recordId:", base64urlResult);

      expect(record[0]).toBe(hashValue1);
    });
  });

  //TODO: make work by getting the recordId from a record created by timestampRecordHashes
  describe('Create record with multiple versions', async () => {
    const record = await timestampWrapper.timestampRecordHashes(
      [0], // sha2-256
      [hashValue1],
      versionInfo1,
      [timestampData1] //send as timestampData
    );

    const recordId = record.id //TODO get
    it('record with hashValue2', async () => {
      console.log('hashValue2: ' + hashValue2);
      const record = await timestampWrapper.timestampRecordVersionHashes(
        recordId, 
        [0], // sha2-256
        [hashValue2],
        versionInfo2,
        [timestampData1] //send as timestampData
      );
      console.log("record:", record)

      expect(record[0]).toBe(hashValue1);
    });
  });
});


/* LEGACY TESTS:
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
      console.log("timestamp hash values:", timestamps)
      expect(timestamps[0]).toBe(hashValue1);
    });

    it('get timestamp with hashValue1', async () => {
      // construct timestamp ID out of hashValue1, followiong formula: timestampId = multibase_base64url(multihash(sha256(original_hash)))
        //const hashValueHex = '0xb2a8e000d1f25778cecf6b29fc0e7f811fb5f4a3a8230585e9056921';
        //const timestampId = generateMultibaseBase64urlHash(hashValueHex);
        //console.log("created timestampID:", timestampId);
      
      const timestampData = await timestampWrapper.getTimestampDetails(hashValue1);
      console.log("timestampData:", timestampData);
      //expect(timestamps[0]).toBe(hashValue1);
    });


    it('create timestamp with wait to be Mined "true"', async () => {
      console.log('hashValue2: ' + hashValue2);
      const timestamps = await timestampWrapper.timestampHashes(
        [0],
        [hashValue2],
        "",
        true
      );
      //const timestampData = await timestampWrapper.getTimestampDetails(hashValue2);
      //console.log("timestampData:", timestampData);
      expect(timestamps[0]).toBe(hashValue2);
    });


    it('check if it is mined', async () => {
      const risp = await timestampWrapper.isTimestampMined(hashValue2);
      expect(risp).toBe(true);
    });
  });
});
*/
