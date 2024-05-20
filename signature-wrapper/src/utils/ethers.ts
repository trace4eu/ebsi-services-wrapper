import { ethers } from 'ethers';
import { SignatureError } from '../errors';
import Joi from 'joi';

const JoiHash = Joi.string().pattern(/^(0x)?[0-9a-fA-F]{64}$/);
const JoiEthAddress = Joi.string().pattern(/^(0x)?[0-9a-fA-F]{40}$/);
const JoiHexadecimal = Joi.string().pattern(/^(0x)?[0-9a-fA-F]+$/);
export function validateUnsignedTransaction(
  inputTrxData: ethers.UnsignedTransaction,
) {
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
  Joi.assert(inputTrxData.chainId, Joi.number());
  Joi.assert(inputTrxData.nonce, Joi.number());
  Joi.assert(inputTrxData.value, JoiHexadecimal);
}

export interface UnsignedTransaction {}
