import { Wallet } from '../../../signature-wrapper';


/** Interface TnTWrapper */
export interface ITnTWrapper {
  wallet: Wallet;
  createDocument(): Promise<any>;
}
