import * as dotenv from 'dotenv';

dotenv.config();

const checkStrVar = (variable: string | undefined, name: string): string => {
  if (!variable) throw new Error(`undefined variable: ${name}`);
  return variable;
};

export const EBSI_DID = checkStrVar(process.env.DID_1, 'DID_1');
export const EBSI_PRIVATE_KEY_ES256_DID = checkStrVar(
  process.env.PRIVATE_KEY_ES256_DID_1,
  'PRIVATE_KEY_ES256_DID_1',
);
export const EBSI_PRIVATE_KEY_ES256K_DID = checkStrVar(
  process.env.PRIVATE_KEY_ES256K_DID_1,
  'PRIVATE_KEY_ES256K_DID_1',
);

export const TRACE4EU_DID = checkStrVar(process.env.DID_2, 'DID_2');
export const TRACE4EU_PRIVATE_KEY_ES256_DID = checkStrVar(
  process.env.PRIVATE_KEY_ES256_DID_2,
  'PRIVATE_KEY_ES256_DID_2',
);
