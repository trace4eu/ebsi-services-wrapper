export class Result<T, E> {
  value: T | null;
  error: E | null;

  private constructor(value: T | null, error: E | null) {
    this.value = value;
    this.error = error;
  }

  public static Ok<T, E>(value: T): Result<T, E> {
    return new Result<T, E>(value, null);
  }

  public static Err<T, E>(error: E): Result<T, E> {
    return new Result<T, E>(null, error);
  }

  public isOk(): boolean {
    return this.value !== null;
  }

  public isErr(): boolean {
    return this.error !== null;
  }

  public unwrap(): T {
    if (this.value === null) {
      throw new Error('No value present');
    }
    return this.value;
  }

  public unwrapErr(): E {
    if (this.error === null) {
      throw new Error('No error present');
    }
    return this.error;
  }

  public unwrapOr(other: T): T {
    if (this.value === null) {
      return other;
    }
    return this.value;
  }
}
