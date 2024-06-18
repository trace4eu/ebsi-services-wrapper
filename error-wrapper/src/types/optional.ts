/**
 * Represents an optional value that may or may not be present.
 * @template T - The type of the value.
 */
export class Optional<T> {
  /**
   * The value of the optional.
   */
  value: T | null;

  /**
   * Creates a new Optional instance.
   * @param value - The value of the optional.
   */
  constructor(value: T | null) {
    this.value = value;
  }

  /**
   * Creates an Optional instance with no value.
   * @returns An Optional instance with no value.
   */
  public static None<T>(): Optional<T> {
    return new Optional<T>(null);
  }

  /**
   * Creates an Optional instance with the specified value.
   * @param value - The value of the optional.
   * @returns An Optional instance with the specified value.
   */
  public static Some<T>(value: T): Optional<T> {
    return new Optional<T>(value);
  }

  /**
   * Checks if the optional is empty.
   * @returns True if the optional is empty, false otherwise.
   */
  public isEmpty(): boolean {
    return this.value === null;
  }

  /**
   * Checks if the optional has a value.
   * @returns True if the optional has a value, false otherwise.
   */
  public isSome(): boolean {
    return this.value !== null;
  }

  /**
   * Gets the value of the optional.
   * @throws Error if the optional is empty.
   * @returns The value of the optional.
   */
  public get(): T {
    if (this.value === null) {
      throw new Error('No value present');
    }
    return this.value;
  }

  /**
   * Gets the value of the optional, or a default value if the optional is empty.
   * @param other - The default value to return if the optional is empty.
   * @returns The value of the optional, or the default value if the optional is empty.
   */
  public getOrDefault(other: T): T {
    if (this.value === null) {
      return other;
    }
    return this.value;
  }
}
