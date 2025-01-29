import * as dotenv from 'dotenv';

dotenv.config();

const checkStrVar = (variable: string | undefined, name: string): string => {
  if (!variable) throw new Error(`undefined variable: ${name}`);
  return variable;
};

export const DID = checkStrVar(process.env.DID, 'DID');
export const PRIVATE_KEY_ES256_DID = checkStrVar(
  process.env.PRIVATE_KEY_ES256_DID,
  'PRIVATE_KEY_ES256_DID',
);
export const PRIVATE_KEY_ES256K_DID = checkStrVar(
  process.env.PRIVATE_KEY_ES256K_DID,
  'PRIVATE_KEY_ES256K_DID',
);
