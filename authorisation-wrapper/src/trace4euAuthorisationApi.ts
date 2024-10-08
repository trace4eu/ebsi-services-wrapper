import { Wallet } from "@trace4eu/signature-wrapper/dist/wallet/wallet.interface";
import { AuthorisationApi } from "./authorisationApi.interface";
import { TokenResponse } from "./types/authToken";

export class Trace4euAuthorisationApi implements AuthorisationApi {
  private wallet: Wallet;
  constructor(wallet: Wallet) {
    this.wallet = wallet;
  }

  getAccessToken(): Promise<TokenResponse> {
    throw new Error("Not Implemented");
  }
}
