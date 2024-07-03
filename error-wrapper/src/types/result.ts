/**
 * Represents the result of an operation, differentiating between Errors and normal responses.
 * Provides methods for handling the result.
 *
 * @template T - The type of the value.
 * @template E - The type of the error.
 */
export class Result<T, E extends Error> {
  /**
   * The value of the result.
   */
  value: T | null;
  /**
   * The error of the result.
   */
  error: E | null;

  /**
   * Constructs a new Result instance.
   *
   * @param value - The value of the result.
   * @param error - The error of the result.
   */
  private constructor(value: T | null, error: E | null) {
    this.value = value;
    this.error = error;
  }

  /**
   * Creates a new Result instance with a successful value.
   *
   * @param value - The value of the result.
   * @returns A new Result instance.
   */
  public static ok<T, E extends Error>(value: T): Result<T, E> {
    return new Result(value, null);
  }

  /**
   * Creates a new Result instance with an error.
   *
   * @param error - The error of the result.
   * @returns A new Result instance.
   */
  public static err<T, E extends Error>(error: E): Result<T, E> {
    return new Result(null, error);
  }

  /**
   * Checks if the result is successful.
   *
   * @returns True if the result is successful, false otherwise.
   */
  public isOk(): boolean {
    return this.value !== null;
  }

  /**
   * Checks if the result has an error.
   *
   * @returns True if the result has an error, false otherwise.
   */
  public isErr(): boolean {
    return this.error !== null;
  }

  /**
   * Unwraps the value of the result.
   * Throws an error if the result does not have a value.
   *
   * @returns The value of the result.
   * @throws Error if the result does not have a value.
   */
  public unwrap(): T {
    if (this.value === null) {
      throw new Error('No value present');
    }
    return this.value;
  }

  /**
   * Unwraps the error of the result.
   * Throws an error if the result does not have an error.
   *
   * @returns The error of the result.
   * @throws Error if the result does not have an error.
   */
  public unwrapErr(): E {
    if (this.error === null) {
      throw new Error('No error present');
    }
    return this.error;
  }

  /**
   * Unwraps the value of the result, or returns a default value if the result does not have a value.
   *
   * @param other - The default value to return if the result does not have a value.
   * @returns The value of the result, or the default value if the result does not have a value.
   */
  public unwrapOr(other: T): T {
    if (this.value === null) {
      return other;
    }
    return this.value;
  }
}
