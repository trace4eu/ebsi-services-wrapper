export class Optional<T> {
  value: T | null;
  constructor(value: T | null) {
    this.value = value;
  }
  public static None<T>(): Optional<T> {
    return new Optional<T>(null);
  }
  public static Some<T>(value: T): Optional<T> {
    return new Optional<T>(value);
  }
  public isEmpty(): boolean {
    return this.value === null;
  }
  public isSome(): boolean {
    return this.value !== null;
  }
  public get(): T {
    if (this.value === null) {
      throw new Error('No value present');
    }
    return this.value;
  }
  public getOrDefault(other: T): T {
    if (this.value === null) {
      return other;
    }
    return this.value;
  }
}
