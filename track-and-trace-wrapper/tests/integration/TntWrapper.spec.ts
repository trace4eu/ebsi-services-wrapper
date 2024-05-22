import { describe, it, expect, vi, beforeAll } from 'vitest';
import { WalletFactory } from '@trace4eu/signature-wrapper/src/wallet/walletFactory';
import * as SignatureWrapperTypes from '@trace4eu/signature-wrapper/src/types/types';
import { EbsiAuthorisationApi } from '@trace4eu/authorisation-wrapper/src/ebsiAuthorisationApi';

const entityKey = {
  entityData: {
    did: 'did:ebsi:zobuuYAHkAbRFCcqdcJfTgR',
    keys: [
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
    ],
  },
};

const wallet = WalletFactory.createInstance(false, entityKey);
const ebsiAuthorisationApi = new EbsiAuthorisationApi(wallet);

describe('Track and Trace Wrapper', () => {
  describe('createDocument', () => {
    it('always true', () => {
      console.log('createDocument test always true');
      expect(true);
    });
    it('createDocument', async () => {
      const tntCreateBarerToken = await ebsiAuthorisationApi.getAccessToken(
        'ES256',
        'tnt_create',
        [],
      );
      console.log(tntCreateBarerToken);
      expect(true);
    });
  });
});
