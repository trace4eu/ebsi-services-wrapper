import { describe, it, expect } from 'vitest';
import { WalletFactory } from '@trace4eu/signature-wrapper';
import * as SignatureWrapperTypes from '@trace4eu/signature-wrapper';
import { TnTWrapper } from '../../src';
import * as crypto from 'crypto';
import { assert } from 'console';

const OWNER_DID = process.env.DID_1;
const OWNER_ENTITY_KEY = [
  {
    alg: SignatureWrapperTypes.Algorithm.ES256K,
    privateKeyHex: process.env.PRIVATE_KEY_ES256K_DID_1,
  },
  {
    alg: SignatureWrapperTypes.Algorithm.ES256,
    privateKeyHex: process.env.PRIVATE_KEY_ES256_DID_1,
  },
];

const GRANTED_ENTITY_DID = process.env.DID_2;
const GRANTED_ENTITY_KEY = [
  {
    alg: SignatureWrapperTypes.Algorithm.ES256K,
    privateKeyHex: process.env.PRIVATE_KEY_ES256K_DID_2,
  },
  {
    alg: SignatureWrapperTypes.Algorithm.ES256,
    privateKeyHex: process.env.PRIVATE_KEY_ES256_DID_2,
  },
];

const wallet = WalletFactory.createInstance(false, OWNER_DID, OWNER_ENTITY_KEY);
const grantedWallet = WalletFactory.createInstance(
  false,
  GRANTED_ENTITY_DID,
  GRANTED_ENTITY_KEY,
);

const tntWrapper = new TnTWrapper(wallet);

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
      expect(accesses.unwrap().total).equal(1);
      expect(accesses.unwrap().items[0]).toEqual(
        expect.objectContaining({
          subject: OWNER_DID,
          grantedBy: OWNER_DID,
          permission: 'creator',
          documentId: documentHash,
        }),
      );
    });
  });

  it('Grant permission to another user', async () => {
    const documentHash =
      '0xbb5090f82e73f53ed9ec2cb531ef6fc50fa63ac338e84212990d108b03a2f639';
    const access_status = await tntWrapper.checkAccess(GRANTED_ENTITY_DID);
    expect(access_status.unwrap()).equal(true);
    const result = await tntWrapper.grantAccessToDocument(
      documentHash,
      wallet.getHexDid(),
      grantedWallet.getHexDid(),
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
    const documentHash =
      '0xbb5090f82e73f53ed9ec2cb531ef6fc50fa63ac338e84212990d108b03a2f639';
    const result = await tntWrapper.revokeAccessToDocument(
      documentHash,
      wallet.getHexDid(),
      grantedWallet.getHexDid(),
      1,
    );
    console.log('Revoke permission result');
    assert(result.isOk());
    const accesses = await tntWrapper.listAccesses(documentHash);
    console.log('Accesses');
    console.log(accesses.value?.items);
    assert(accesses.value?.items.length == 1);
  });
});
