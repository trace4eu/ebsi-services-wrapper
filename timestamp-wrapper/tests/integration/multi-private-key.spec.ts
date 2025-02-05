import { describe, it, expect, vi, beforeAll } from 'vitest';
import { WalletFactory } from '@trace4eu/signature-wrapper';
import * as SignatureWrapperTypes from '@trace4eu/signature-wrapper';
import { TimestampWrapper } from '../../src';
import * as crypto from 'crypto';
import * as dotenv from 'dotenv';
import { createHash } from 'crypto';
import { BytesLike } from 'ethers';
import { arrayify } from 'ethers/lib/utils';

dotenv.config();

const checkStrVar = (variable: string | undefined, name: string): string => {
  if (!variable) throw new Error(`undefined variable: ${name}`);
  return variable;
};

const did = checkStrVar(process.env.DID_3, 'DID_3');
const entityKey = [
  {
    alg: SignatureWrapperTypes.Algorithm.ES256K,
    privateKeyHex: checkStrVar(
      process.env.PRIVATE_KEY_ES256K_DID_3,
      'PRIVATE_KEY_ES256K_DID_3',
    ),
  },
  {
    alg: SignatureWrapperTypes.Algorithm.ES256K,
    privateKeyHex: checkStrVar(
      process.env.PRIVATE_KEY_ES256K_DID_3_2,
      'PRIVATE_KEY_ES256K_DID_3_2',
    ),
  },
  {
    alg: SignatureWrapperTypes.Algorithm.ES256K,
    privateKeyHex: checkStrVar(
      process.env.PRIVATE_KEY_ES256K_DID_3_3,
      'PRIVATE_KEY_ES256K_DID_3_3',
    ),
  },
  {
    alg: SignatureWrapperTypes.Algorithm.ES256,
    privateKeyHex: checkStrVar(
      process.env.PRIVATE_KEY_ES256_DID_3,
      'PRIVATE_KEY_ES256_DID_1',
    ),
  },
];

const wallet = WalletFactory.createInstance(false, did, entityKey);
const timestampWrapper = new TimestampWrapper(wallet);

function sha256(data: BytesLike) {
  return `0x${createHash('sha256')
    .update(Buffer.from(arrayify(data)))
    .digest('hex')}`;
}

describe('Timestamp Wrapper', () => {
  // create a record wich correspons to the documentation of the first event of a supply chain item: producing or manufacturing
  describe('Timestamp wrapper library should', () => {
    crypto.randomInt(10000);
    it.each([
      [crypto.randomInt(10000)],
      [crypto.randomInt(10000)],
      [crypto.randomInt(10000)],
    ])(
      'create timestamps with different inputs at the same time',
      async (randomId) => {
        const data = { number: randomId };
        const bufferData = Buffer.from(JSON.stringify(data));
        const dataHex = `0x${bufferData.toString('hex')}`;
        const hashedData = sha256(bufferData);

        const timestamp = await timestampWrapper.timestampHashes(
          0, // sha2-256
          hashedData,
          dataHex,
          false,
        );

        expect(timestamp.unwrap().id).to.exist;
        expect(timestamp.unwrap().transactionHash).to.exist;
        console.log('timestamp response:', timestamp.unwrap());

        const transactionReceipt = await timestampWrapper.getTransactionReceipt(
          timestamp.value.transactionHash,
        );
        expect(transactionReceipt.value.blockNumber).to.exist;

        const timestampData = await timestampWrapper.getTimestamp(
          timestamp.value.id,
        );
        console.log('timestamp data:', timestampData.unwrap());
        expect(timestampData.value.data).equals(dataHex);
      },
    );

    it.skip.each([
      [crypto.randomInt(10000)],
      [crypto.randomInt(10000)],
      [crypto.randomInt(10000)],
    ])('create timestamp hashes in sequence', async (randomId) => {
      const data = { number: randomId };
      const bufferData = Buffer.from(JSON.stringify(data));
      const dataHex = `0x${bufferData.toString('hex')}`;
      const hashedData = sha256(bufferData);

      const timestamp = await timestampWrapper.timestampHashes(
        0, // sha2-256
        hashedData,
        dataHex,
        false,
      );

      expect(timestamp.unwrap().id).to.exist;
      expect(timestamp.unwrap().transactionHash).to.exist;
      console.log('timestamp response:', timestamp.unwrap());
    });
  });
});
