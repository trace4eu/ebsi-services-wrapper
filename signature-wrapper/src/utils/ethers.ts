import { BigNumber, ethers } from 'ethers';
import { SignatureError } from '../errors';
import Joi from 'joi';
import { UnsignedTransaction } from '../types/types';

const JoiHash = Joi.string().pattern(/^(0x)?[0-9a-fA-F]{64}$/);
const JoiEthAddress = Joi.string().pattern(/^(0x)?[0-9a-fA-F]{40}$/);
const JoiHexadecimal = Joi.string().pattern(/^(0x)?[0-9a-fA-F]+$/);

export function validateUnsignedTransaction(inputTrxData: UnsignedTransaction) {
  if (
    !inputTrxData.to ||
    !inputTrxData.data ||
    !inputTrxData.chainId ||
    Number.isNaN(inputTrxData.nonce) ||
    !inputTrxData.value
  ) {
    throw new SignatureError('Input data is not well formed');
  }
  Joi.assert(inputTrxData.to, JoiEthAddress);
  Joi.assert(inputTrxData.data, JoiHexadecimal);
  // Joi.assert(ethers.BigNumber.isBigNumber(inputTrxData.nonce), Joi.boolean());
  // oi.assert(ethers.BigNumber.isBigNumber(inputTrxData.chainId), Joi.boolean());
}

export function formatEthereumTransaction(
  unsignedTransaction: UnsignedTransaction,
): ethers.Transaction {
  const chainId = Number(unsignedTransaction.chainId);
  return {
    to: unsignedTransaction.to,
    data: unsignedTransaction.data,
    value: BigNumber.from(unsignedTransaction.value),
    nonce: Number(unsignedTransaction.nonce),
    chainId: Number.isNaN(chainId) ? undefined : chainId,
    gasLimit: BigNumber.from(unsignedTransaction.gasLimit),
    gasPrice: BigNumber.from(unsignedTransaction.gasPrice),
  };
}
