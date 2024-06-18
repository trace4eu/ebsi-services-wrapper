/** Main objective differentiate between Errors and normal responses,
 * letting the possibility to throw the error */
export class Result<T, E extends Error> {
  value: T | null;
  error: E | null;

  private constructor(value: T | null, error: E | null) {
    this.value = value;
    this.error = error;
  }

  public static ok<T, E extends Error>(value: T): Result<T, E> {
    return new Result(value, null);
  }

  public static err<T, E extends Error>(error: E): Result<T, E> {
    return new Result(null, error);
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
