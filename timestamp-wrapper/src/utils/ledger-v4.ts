import { Result } from '@trace4eu/error-wrapper';
import axios from 'axios';
import { UnsignedTransaction } from '@trace4eu/signature-wrapper';
import { NotYetMinedError } from '../errors/NotYetMined';
import { TransactionReceipt } from '@ethersproject/abstract-provider';
import { RevertedTransactionError } from '../errors/RevertedTransaction';

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export async function waitTxToBeMined(
  txReceipt: string, //TODO: call transactionHash
  ebsiAccessToken?: string,
): Promise<Result<TransactionReceipt, Error>> {
  let transactionReceipt: Result<TransactionReceipt, Error>;
  let tentatives = 10;
  do {
    await delay(5000);
    transactionReceipt = await getTransactionReceipt(
      txReceipt,
      ebsiAccessToken,
    );
    tentatives -= 1;
  } while (
    transactionReceipt.isErr() &&
    !(transactionReceipt.unwrapErr() instanceof RevertedTransactionError) &&
    transactionReceipt.unwrapErr() instanceof NotYetMinedError &&
    tentatives > 0
  ); // res2.isEmpty() && tentatives > 0
  return transactionReceipt;
}

/**
 *  return data if eth_getTransactionReceipt returns data <> null
 *  otherwise: return error 'empty transaction receipt
 * @param txHash
 * @param accessToken
 * @returns data
 */
export async function getTransactionReceipt(
  txHash: string,
  accessToken?: string,
): Promise<Result<TransactionReceipt, Error>> {
  const data = JSON.stringify({
    jsonrpc: '2.0',
    method: 'eth_getTransactionReceipt',
    id: 1, // Math.ceil(Math.random() * 1000), SE non serve a nulla lasciamolo fisso
    params: [txHash],
  });

  const config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://api-pilot.ebsi.eu/ledger/v4/blockchains/besu',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(accessToken && { Authorization: 'Bearer ' + accessToken }),
    },
    data: data,
  };

  const response = axios
    .request(config)
    .then((response) => {
      if (!response.data.result) {
        return Result.err(new NotYetMinedError());
      }
      if (response.data.result.revertReason) {
        return Result.err(new RevertedTransactionError());
      }
      return Result.ok(response.data.result);
    })
    .catch((error) => {
      return Result.err(error);
    });
  return response as Promise<Result<TransactionReceipt, Error>>;
}

export async function sendSignedTransaction(
  unsignedTransaction: object,
  signedTx: object,
  accessToken: string,
  waitMined?: boolean,
): Promise<Result<TransactionReceipt | { transactionHash: string }, Error>> {
  const data = JSON.stringify({
    jsonrpc: '2.0',
    method: 'sendSignedTransaction',
    id: Math.ceil(Math.random() * 1000),
    params: [
      {
        protocol: 'eth',
        unsignedTransaction: {
          ...unsignedTransaction,
        },
        ...signedTx,
      },
    ],
  });

  const config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://api-pilot.ebsi.eu/timestamp/v4/jsonrpc',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: 'Bearer ' + accessToken,
    },
    data: data,
  };

  let trxReceipt: string;
  let resp_mined: Result<
    TransactionReceipt | { transactionHash: string },
    Error
  >;
  try {
    const response = await axios.request(config);
    trxReceipt = response.data.result;
  } catch (error) {
    return Result.err(error);
  }

  if (waitMined) {
    resp_mined = await waitTxToBeMined(trxReceipt, accessToken);
    if (resp_mined.isErr()) {
      return Result.err(resp_mined.unwrapErr());
    }
    return Result.ok(resp_mined.unwrap());
  }
  return Result.ok({ transactionHash: trxReceipt });
}

export async function sendUnsignedTransaction(
  access_token: string,
  method: string,
  params: object[],
): Promise<Result<UnsignedTransaction, Error>> {
  const data = JSON.stringify({
    jsonrpc: '2.0',
    method: method,
    params: params,
    id: Math.ceil(Math.random() * 1000),
  });

  const config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://api-pilot.ebsi.eu/timestamp/v4/jsonrpc',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: 'Bearer ' + access_token,
    },
    data: data,
  };

  const response = axios
    .request(config)
    .then((response) => {
      return Result.ok(response.data.result);
    })
    .catch((error) => {
      return Result.err(error);
    });
  return response as Promise<Result<UnsignedTransaction, Error>>;
}
