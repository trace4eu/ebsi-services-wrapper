import {Algorithm, WalletFactory} from "@trace4eu/signature-wrapper";
import {EbsiAuthorisationApi} from "@trace4eu/authorisation-wrapper";


async function main() {
  const did = 'did:ebsi:zobuuYAHkAbRFCcqdcJfTgR';
  const entityKeys = [
    {
      alg: 'ES256K',
      privateKeyHex:
        'c4877a6d51c382b25a57684b5ac0a70398ab77b0eda0fcece0ca14ed00737e57',
    },
    {
      alg: Algorithm.ES256,
      privateKeyHex:
        'fa50bbba9feade27ea61dd9973abfd7c04e72366b607558cd0b423b75d067a86 ',
    },
  ];
  const wallet = WalletFactory.createInstance(false, did, entityKeys);
  const ebsiAuthorisationApi = new EbsiAuthorisationApi(wallet);
  const tokenResponse = await ebsiAuthorisationApi.getAccessToken(
    'ES256',
    'tnt_create',
    [],
  );
  console.log(`tokenResponse => ${JSON.stringify(tokenResponse, null, 2)}`);
}

main();
