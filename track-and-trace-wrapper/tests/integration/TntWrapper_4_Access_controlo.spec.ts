import { describe, it, expect, vi, beforeAll } from 'vitest';
import { WalletFactory } from '@trace4eu/signature-wrapper';
import * as SignatureWrapperTypes from '@trace4eu/signature-wrapper';
import { EbsiAuthorisationApi } from '@trace4eu/authorisation-wrapper';
import { TnTWrapper } from '../../src/wrappers/TntWrapper';
import * as crypto from 'crypto';
import { assert } from 'console';

// Granting user
const did = 'did:ebsi:zfEmvX5twhXjQJiCWsukvQA';
const entityKey = [
  {
    alg: SignatureWrapperTypes.Algorithm.ES256K,
    privateKeyHex:
      'c5306796cb9cc41e143774e152c9e3396ba87b8caee91d618062666796483f8e',
  },
  {
    alg: SignatureWrapperTypes.Algorithm.ES256,
    privateKeyHex:
      '869176bf92b63061b59a26eff6370d26125720844987a60537dee3bff08740fb',
  },
];

// Subject user
const didSubject = 'did:ebsi:z21ExDPMoRDzXetA6FeHPkUi';
const entityKeySubject = [
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
const walletSubject = WalletFactory.createInstance(
  false,
  didSubject,
  entityKeySubject,
);

const tntWrapper = new TnTWrapper(wallet);
// document already inserted
const documentHash = `0x${crypto.randomBytes(32).toString('hex')}`;
const eventExternalHash = `0x${crypto.randomBytes(32).toString('hex')}`;
const eventMetadata = 'eventMetadata_' + new Date();
const eventMetadata1 = 'AAAAAAAAAAAAA';
const eventMetadata2 = 'BBBBBBBBBBBBB';
const origin = 'origin';

describe('Track and Trace Wrapper', () => {
  const documentHash = `0x${crypto.randomBytes(32).toString('hex')}`;
  describe('createDocument', () => {
    it('createDocument doc wait to be Mined "true"', async () => {
      console.log('Document Hash:' + documentHash);
      const documentMetadata = 'documentMetadata';
      const document = await tntWrapper.createDocument(
        documentHash,
        documentMetadata,
        true,
      );
      if (document.isErr()) {
        console.log('Error: ' + document.unwrapErr());
      }
      console.log(document);
      const documentData = await tntWrapper.getDocumentDetails(documentHash);
      console.log({ documentData });
      expect(document.unwrap()).toBe(documentHash);
      const accesses = await tntWrapper.listAccesses(documentHash);
      console.log('Accesses: ');
      console.log(accesses.value?.items);
    });
  });

  it('Grant permission to another user', async () => {
    const access_status = await tntWrapper.checkAccess(didSubject);
    const result = await tntWrapper.grantAccessToDocument(
      documentHash,
      wallet.getHexDid(),
      walletSubject.getHexDid(),
      0,
      0,
      1,
    );
    console.log('Grant permission result');
    assert(result.isOk());
    //console.log(result.unwrapErr().response.data);
    const accesses = await tntWrapper.listAccesses(documentHash);
    console.log('Accesses');
    console.log(accesses.value?.items);
    assert(accesses.value?.items.length == 2);
  });

  it('Revoke permission to another user', async () => {
    const result = await tntWrapper.revokeAccessToDocument(
      documentHash,
      wallet.getHexDid(),
      walletSubject.getHexDid(),
      1,
    );
    console.log('Revoke permission result');
    assert(result.isOk());
    const accesses = await tntWrapper.listAccesses(documentHash);
    console.log('Accesses');
    console.log(accesses.value?.items);
    assert(accesses.value?.items.length == 1);
    //console.log(result.unwrapErr().response.data);
  });
});
