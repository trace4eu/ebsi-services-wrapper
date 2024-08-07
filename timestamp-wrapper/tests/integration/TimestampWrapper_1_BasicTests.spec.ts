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

const did2 = "did:ebsi:z21ExDPMoRDzXetA6FeHPkUi"
const entityKey2 = [
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
const ebsiAuthorisationApi = new EbsiAuthorisationApi(wallet);
const timestampWrapper = new TimestampWrapper(wallet);

describe('Timestamp Wrapper', () => {

  // create a record wich correspons to the documentation of the first event of a supply chain item: producing or manufacturing
  describe('Create record', () => {

    const randomId = Math.trunc(Math.random()*1000000)
    const hashValue1 = "0x"+crypto.createHash('sha256').update(`hash value =${randomId}`).digest('hex');;
    const timestampData1 = "0x"+Buffer.from(JSON.stringify({timestamp:`timestampData=${randomId}`}), "utf-8").toString("hex");;
    const versionInfo1 = "0x"+Buffer.from(JSON.stringify({ipfs_cid: `ipfs version 1 of ${randomId}`}), "utf-8").toString("hex");;

    it('always true', () => {
      console.log('create record test always true');
      expect(true);
    });
    it('create record with one hash value', async () => {
      console.log('hashValue1: ' + hashValue1);

      // create record with hashValue1
      const recordCreationResponse = await timestampWrapper.timestampRecordHashes(
        [0], // sha2-256
        [hashValue1],
        versionInfo1,
        [timestampData1] //send as timestampData
      );
      console.log("versionInfo1:", versionInfo1, "--> original string:", JSON.stringify({ipfs_cid: `ipfs version 1 of ${randomId}`}))

      // get recordId
      const recordId = recordCreationResponse.unwrap();
      console.log("recordId:", recordId)

      // get list of record versions
      const recordVersionResponse = await timestampWrapper.getRecordVersions(recordId.multibase);

      //get versions of record
      const recordVersions = recordVersionResponse.get().items

      // record must only have one version
      expect(recordVersions.length, `record with id ${recordId.multibase} should have only 1 version`).toBe(1);

      //get details of first version of record
      const recordVersionDetailsResponse = await timestampWrapper.getRecordVersionDetails(recordId.multibase, "0");
      console.log("first version of record:", recordVersionDetailsResponse.get())

      // hash value of record must be the same as the hash value of the first version
      expect(recordVersionDetailsResponse.get().hashes[0], `first version of record with id ${recordId.multibase} should have one hash value, namely: ${hashValue1}`).toBe(hashValue1);

      //check if hash value is correctly the first version of the record
      expect(JSON.stringify(recordVersionDetailsResponse.get().info[0]), "info of first version incorrect").toBe(JSON.stringify({ipfs_cid: `ipfs version 1 of ${randomId}`}));
    });

    it('create record with 3 hash values (maximum number of allowed hashes)', async () => {
      //TODO --> requires porbably adaption of the recordId creation in the timestampWrapper funtion of timestampRecordHashes
    });
  });

  // documenting the supply chain events of a supply chain item means adding new versions to a record
  describe('Create record with multiple versions', async () => {
    const randomId = Math.trunc(Math.random()*1000000)
    const hashValue1 = "0x"+crypto.createHash('sha256').update(`hash value 1=${randomId}`).digest('hex');;
    const hashValue2 = "0x"+crypto.createHash('sha256').update(`hash value 2=${randomId}`).digest('hex');;
    const timestampData1 = "0x"+Buffer.from(JSON.stringify({timestamp:`timestampData1=${randomId}`}), "utf-8").toString("hex");;
    const timestampData2 = "0x"+Buffer.from(JSON.stringify({timestamp:`timestampData2=${randomId}`}), "utf-8").toString("hex");;
    const versionInfo1 = "0x"+Buffer.from(JSON.stringify({ipfs_cid: `ipfs version 1 of ${randomId}`}), "utf-8").toString("hex");;
    const versionInfo2 = "0x"+Buffer.from(JSON.stringify({ipfs_cid: `ipfs version 2 of ${randomId}`}), "utf-8").toString("hex");;

    it('create record with 2 versions', async () => {
      //note: to see an example record created by trace4eu with 2 versions: https://api-pilot.ebsi.eu/timestamp/v4/records/uo-dCiIQjwEZ1d46F5WnRairBThXTcm1yDdS10mbiKT8/versions/0
      console.log('hashValue1: ' + hashValue1);

      // create record with hashValue1
      const recordCreationResponse = await timestampWrapper.timestampRecordHashes(
        [0], // sha2-256
        [hashValue1],
        versionInfo1,
        [timestampData1] //send as timestampData
      );
      console.log("versionInfo1:", versionInfo1, "--> original string:", JSON.stringify({ipfs_cid: `ipfs version 1 of ${randomId}`}))

      // get recordId
      const recordId = recordCreationResponse.unwrap();
      console.log("recordId:", recordId)

      // get list of record versions
      const recordVersionResponse = await timestampWrapper.getRecordVersions(recordId.multibase);

      // get versions of record
      const recordVersions = recordVersionResponse.get().items

      // record must only have one version
      expect(recordVersions.length, `record with id ${recordId} should have only 1 version`).toBe(1);

      // get details of first version of record
      const recordVersionDetailsResponse = await timestampWrapper.getRecordVersionDetails(recordId.multibase, "0");
      console.log("first version of record:", recordVersionDetailsResponse.get())

      // hash value of record must be the same as the hash value of the first version
      expect(recordVersionDetailsResponse.get().hashes[0], `first version of record with id ${recordId} should have one hash value, namely: ${hashValue1}`).toBe(hashValue1);

      // check if hash value is correctly the first version of the record
      expect(JSON.stringify(recordVersionDetailsResponse.get().info[0]), "info of first version incorrect").toBe(JSON.stringify({ipfs_cid: `ipfs version 1 of ${randomId}`}));

      // create another version of the newly created record
      const recordVersionCreationResponse = await timestampWrapper.timestampRecordVersionHashes(
        recordId.hex,
        [0], // sha2-256
        [hashValue2],
        versionInfo2,
        [timestampData2] //send as timestampData
      );
      console.log("recordVersionCreationResponse", recordVersionCreationResponse)
      // get new versionId
      const newVersionId = recordVersionCreationResponse.unwrap();
      console.log("newVersionId:", newVersionId)

      // record must now have 2 versions
      expect(newVersionId, `record with id ${recordId} newest version must have id 1`).toBe("1");

      // get list of record versions
      const newRecordVersionResponse = await timestampWrapper.getRecordVersions(recordId.multibase);

      // get versions of record
      const newRecordVersions = newRecordVersionResponse.get().items

      // record must now have 2 versions
      expect(newRecordVersions.length, `record with id ${recordId} should have 2 versions`).toBe(2);

      // get details of second version of record
      const addedRecordVersionDetailsResponse = await timestampWrapper.getRecordVersionDetails(recordId.multibase, "1");
      console.log("second version of record:", addedRecordVersionDetailsResponse.get())

      // hash value of record must be the same as the hash value of the first version
      expect(addedRecordVersionDetailsResponse.get().hashes[0], `second version of record with id ${recordId} should have one hash value, namely: ${hashValue2}`).toBe(hashValue2);

      // check if hash value is correctly the first version of the record
      expect(JSON.stringify(addedRecordVersionDetailsResponse.get().info[0]), "info of second version incorrect").toBe(JSON.stringify({ipfs_cid: `ipfs version 2 of ${randomId}`}));
    });
  });


  //TODO: change owner, reflecting change in ownership of supply chain item represented by the record
  describe('Change owner of record', async () => {
    
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
