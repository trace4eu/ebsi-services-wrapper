import { describe, it, expect, vi, beforeAll } from 'vitest';
import { Result } from '../../src';

describe('Optional Class should', () => {
  it('setup a value and return it', () => {
    const value = {
      testing: 'testing',
    };
    const result = Result.ok(value);
    expect(result.value).to.equals(value);
    expect(result.unwrap()).to.equals(value);
    expect(result.isOk()).to.equals(true);
    expect(result.isErr()).to.equals(false);
    expect(() => result.unwrapErr()).toThrow('No error present');
  });

  it('setup an error and return it', () => {
    const result = Result.err(new Error('testing Error'));
    expect(() => result.unwrap()).toThrow('No value present');
    expect(result.unwrapErr().message).to.equals('testing Error');
    expect(result.isOk()).to.equals(false);
    expect(result.isErr()).to.equals(true);
  });
});
