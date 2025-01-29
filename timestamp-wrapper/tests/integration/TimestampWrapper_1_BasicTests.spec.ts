import { describe, it, expect, vi, beforeAll } from 'vitest';
import { WalletFactory } from '@trace4eu/signature-wrapper';
import * as SignatureWrapperTypes from '@trace4eu/signature-wrapper';
import { TimestampWrapper } from '../../src';
import * as crypto from 'crypto';
import * as dotenv from 'dotenv';

dotenv.config();

const checkStrVar = (variable: string | undefined, name: string): string => {
  if (!variable) throw new Error(`undefined variable: ${name}`);
  return variable;
};

const did = checkStrVar(process.env.DID_1, 'DID_1');
const entityKey = [
  {
    alg: SignatureWrapperTypes.Algorithm.ES256K,
    privateKeyHex: checkStrVar(
      process.env.PRIVATE_KEY_ES256K_DID_1,
      'PRIVATE_KEY_ES256K_DID_1',
    ),
  },
  {
    alg: SignatureWrapperTypes.Algorithm.ES256,
    privateKeyHex: checkStrVar(
      process.env.PRIVATE_KEY_ES256_DID_1,
      'PRIVATE_KEY_ES256_DID_1',
    ),
  },
];

const did2 = checkStrVar(process.env.DID_2, 'DID_2');
const entityKey2 = [
  {
    alg: SignatureWrapperTypes.Algorithm.ES256K,
    privateKeyHex: checkStrVar(
      process.env.PRIVATE_KEY_ES256K_DID_2,
      'PRIVATE_KEY_ES256K_DID_2',
    ),
  },
  {
    alg: SignatureWrapperTypes.Algorithm.ES256,
    privateKeyHex: checkStrVar(
      process.env.PRIVATE_KEY_ES256_DID_2,
      'PRIVATE_KEY_ES256_DID_2',
    ),
  },
];

const wallet = WalletFactory.createInstance(false, did, entityKey);
const timestampWrapper = new TimestampWrapper(wallet);

describe('Timestamp Wrapper', () => {
  // create a record wich correspons to the documentation of the first event of a supply chain item: producing or manufacturing
  describe('Create record', () => {
    const randomId = Math.trunc(Math.random() * 1000000);
    const hashValue1 =
      '0x' +
      crypto
        .createHash('sha256')
        .update(`hash value =${randomId}`)
        .digest('hex');
    const timestampData1 =
      '0x' +
      Buffer.from(
        JSON.stringify({ timestamp: `timestampData=${randomId}` }),
        'utf-8',
      ).toString('hex');
    const versionInfo1 =
      '0x' +
      Buffer.from(
        JSON.stringify({ ipfs_cid: `ipfs version 1 of ${randomId}` }),
        'utf-8',
      ).toString('hex');

    it('create record with one hash value', async () => {
      console.log('hashValue1: ' + hashValue1);

      // create record with hashValue1
      const recordCreationResponse =
        await timestampWrapper.timestampRecordHashes(
          0, // sha2-256
          hashValue1,
          versionInfo1,
          [timestampData1], //send as timestampData
        );
      console.log(
        'versionInfo1:',
        versionInfo1,
        '--> original string:',
        JSON.stringify({ ipfs_cid: `ipfs version 1 of ${randomId}` }),
      );

      // get recordId
      const recordId = recordCreationResponse.unwrap();
      console.log('recordId:', recordId);

      const timestampId = timestampWrapper.computeTimestampId(hashValue1);

      const timestampData = await timestampWrapper.getTimestamp(timestampId);
      expect(timestampData).toBeDefined();

      // get list of record versions
      const recordVersionResponse = await timestampWrapper.getRecordVersions(
        recordId.multibase,
      );

      //get versions of record
      const recordVersions = recordVersionResponse.unwrap().items;

      // record must only have one version
      expect(
        recordVersions.length,
        `record with id ${recordId.multibase} should have only 1 version`,
      ).toBe(1);

      //get details of first version of record
      const recordVersionDetailsResponse =
        await timestampWrapper.getRecordVersionDetails(recordId.multibase, '0');
      console.log(
        'first version of record:',
        recordVersionDetailsResponse.unwrap(),
      );

      // hash value of record must be the same as the hash value of the first version
      expect(
        recordVersionDetailsResponse.unwrap().hashes[0],
        `first version of record with id ${recordId.multibase} should have one hash value, namely: ${hashValue1}`,
      ).toBe(hashValue1);

      //check if hash value is correctly the first version of the record
      expect(
        JSON.stringify(recordVersionDetailsResponse.unwrap().info[0]),
        'info of first version incorrect',
      ).toBe(JSON.stringify({ ipfs_cid: `ipfs version 1 of ${randomId}` }));
    });
  });

  // documenting the supply chain events of a supply chain item means adding new versions to a record
  describe('Create record with multiple versions', async () => {
    const randomId = Math.trunc(Math.random() * 1000000);
    const hashValue1 =
      '0x' +
      crypto
        .createHash('sha256')
        .update(`hash value 1=${randomId}`)
        .digest('hex');
    const hashValue2 =
      '0x' +
      crypto
        .createHash('sha256')
        .update(`hash value 2=${randomId}`)
        .digest('hex');
    const timestampData1 =
      '0x' +
      Buffer.from(
        JSON.stringify({ timestamp: `timestampData1=${randomId}` }),
        'utf-8',
      ).toString('hex');
    const timestampData2 =
      '0x' +
      Buffer.from(
        JSON.stringify({ timestamp: `timestampData2=${randomId}` }),
        'utf-8',
      ).toString('hex');
    const versionInfo1 =
      '0x' +
      Buffer.from(
        JSON.stringify({ ipfs_cid: `ipfs version 1 of ${randomId}` }),
        'utf-8',
      ).toString('hex');
    const versionInfo2 =
      '0x' +
      Buffer.from(
        JSON.stringify({ ipfs_cid: `ipfs version 2 of ${randomId}` }),
        'utf-8',
      ).toString('hex');

    it('create record with 2 versions', async () => {
      //note: to see an example record created by trace4eu with 2 versions: https://api-pilot.ebsi.eu/timestamp/v4/records/uo-dCiIQjwEZ1d46F5WnRairBThXTcm1yDdS10mbiKT8/versions/0
      console.log('hashValue1: ' + hashValue1);

      // create record with hashValue1
      const recordCreationResponse =
        await timestampWrapper.timestampRecordHashes(
          0, // sha2-256
          hashValue1,
          versionInfo1,
          [timestampData1], //send as timestampData
        );
      console.log(
        'versionInfo1:',
        versionInfo1,
        '--> original string:',
        JSON.stringify({ ipfs_cid: `ipfs version 1 of ${randomId}` }),
      );

      // get recordId
      const recordId = recordCreationResponse.unwrap();
      console.log('recordId:', recordId);

      // get list of record versions
      const recordVersionResponse = await timestampWrapper.getRecordVersions(
        recordId.multibase,
      );

      // get versions of record
      const recordVersions = recordVersionResponse.unwrap().items;

      // record must only have one version
      expect(
        recordVersions.length,
        `record with id ${recordId} should have only 1 version`,
      ).toBe(1);

      // get details of first version of record
      const recordVersionDetailsResponse =
        await timestampWrapper.getRecordVersionDetails(recordId.multibase, '0');
      console.log(
        'first version of record:',
        recordVersionDetailsResponse.unwrap(),
      );

      // hash value of record must be the same as the hash value of the first version
      expect(
        recordVersionDetailsResponse.unwrap().hashes[0],
        `first version of record with id ${recordId} should have one hash value, namely: ${hashValue1}`,
      ).toBe(hashValue1);

      // check if hash value is correctly the first version of the record
      expect(
        JSON.stringify(recordVersionDetailsResponse.unwrap().info[0]),
        'info of first version incorrect',
      ).toBe(JSON.stringify({ ipfs_cid: `ipfs version 1 of ${randomId}` }));

      // create another version of the newly created record
      const recordVersionCreationResponse =
        await timestampWrapper.timestampRecordVersionHashes(
          recordId.hex,
          0, // sha2-256
          hashValue2,
          versionInfo2,
          [timestampData2], //send as timestampData
        );
      console.log(
        'recordVersionCreationResponse',
        recordVersionCreationResponse,
      );
      // get new versionId
      const newVersionId = recordVersionCreationResponse.unwrap();
      console.log('newVersionId:', newVersionId);

      // record must now have 2 versions
      expect(
        newVersionId,
        `record with id ${recordId} newest version must have id 1`,
      ).toBe('1');

      // get list of record versions
      const newRecordVersionResponse = await timestampWrapper.getRecordVersions(
        recordId.multibase,
      );

      // get versions of record
      const newRecordVersions = newRecordVersionResponse.unwrap().items;

      // record must now have 2 versions
      expect(
        newRecordVersions.length,
        `record with id ${recordId} should have 2 versions`,
      ).toBe(2);

      // get details of second version of record
      const addedRecordVersionDetailsResponse =
        await timestampWrapper.getRecordVersionDetails(recordId.multibase, '1');
      console.log(
        'second version of record:',
        addedRecordVersionDetailsResponse.unwrap(),
      );

      // hash value of record must be the same as the hash value of the first version
      expect(
        addedRecordVersionDetailsResponse.unwrap().hashes[0],
        `second version of record with id ${recordId} should have one hash value, namely: ${hashValue2}`,
      ).toBe(hashValue2);

      // check if hash value is correctly the first version of the record
      expect(
        JSON.stringify(addedRecordVersionDetailsResponse.unwrap().info[0]),
        'info of second version incorrect',
      ).toBe(JSON.stringify({ ipfs_cid: `ipfs version 2 of ${randomId}` }));
    });
  });

  //TODO: change owner, reflecting change in ownership of supply chain item represented by the record
  describe('Change owner of record', async () => {
    const randomId = Math.trunc(Math.random() * 1000000);
    const hashValue1 =
      '0x' +
      crypto
        .createHash('sha256')
        .update(`hash value 1=${randomId}`)
        .digest('hex');
    const hashValue2 =
      '0x' +
      crypto
        .createHash('sha256')
        .update(`hash value 2=${randomId}`)
        .digest('hex');
    const timestampData1 =
      '0x' +
      Buffer.from(
        JSON.stringify({ timestamp: `timestampData1=${randomId}` }),
        'utf-8',
      ).toString('hex');
    const timestampData2 =
      '0x' +
      Buffer.from(
        JSON.stringify({ timestamp: `timestampData2=${randomId}` }),
        'utf-8',
      ).toString('hex');
    const versionInfo1 =
      '0x' +
      Buffer.from(
        JSON.stringify({ ipfs_cid: `ipfs version 1 of ${randomId}` }),
        'utf-8',
      ).toString('hex');
    const versionInfo2 =
      '0x' +
      Buffer.from(
        JSON.stringify({ ipfs_cid: `ipfs version 2 of ${randomId}` }),
        'utf-8',
      ).toString('hex');

    // create record with hashValue1
    const recordCreationResponse = await timestampWrapper.timestampRecordHashes(
      0, // sha2-256
      hashValue1,
      versionInfo1,
      [timestampData1], //send as timestampData
    );

    // get recordId
    const recordId = recordCreationResponse.unwrap();
    console.log('CHANGING OWNER OF RECORD:', recordId);

    // init second wallet for the new owner
    const wallet2 = WalletFactory.createInstance(false, did2, entityKey2);
    const ethAddressNewOwner = wallet2.getEthAddress();

    // insert new owner
    const newOwner = await timestampWrapper.insertRecordOwner(
      recordId.hex,
      ethAddressNewOwner, // eth address of new owner
      Number(new Date()),
      0,
    );
    expect(
      newOwner.value?.toUpperCase(),
      `insertRecordOwner does not work`,
    ).toBe(ethAddressNewOwner.toUpperCase());

    //login new owner to timestamp wrapper
    const timestampWrapper2 = new TimestampWrapper(wallet2);

    // old owner remove her- or himself
    const revokedOwner = await timestampWrapper.revokeRecordOwner(
      recordId.hex,
      wallet.getEthAddress(), // eth address of owner to be removed
    );
    expect(
      revokedOwner.value?.toUpperCase(),
      `revokeRecordOwner does not work`,
    ).toBe(wallet.getEthAddress().toUpperCase());

    // check if owner change successful
    const record = await timestampWrapper.getRecord(recordId.multibase);
    const recordOwners = record.unwrap().ownerIds;
    expect(recordOwners.length, `not exactly one record owner`).toBe(1); //check if only one owner is listed in the record after owner change
    expect(
      record.unwrap().revokedOwnerIds[0].toUpperCase(),
      'old owner is not declared as removed',
    ).toBe(wallet.getEthAddress().toUpperCase()); //check if old owner is listed as removed
    expect(
      recordOwners[0].toUpperCase(),
      'new owner not listed as owner of record',
    ).toBe(ethAddressNewOwner.toUpperCase()); //check if new owner is listed as record owner
  });
});
