export class RevertedTransactionError extends Error {
  constructor() {
    super();
    this.message = 'transaction has been reverted';
    this.name = 'RevertedTransactionError';
  }
}
