export class NotYetMinedError extends Error {
  constructor() {
    super();
    this.message = 'transaction not yet mined';
    this.name = 'TnTWrapperNotYetMinedError';
  }
}
