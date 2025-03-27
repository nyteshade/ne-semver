import { describe, it, expect } from 'vitest';
import { SemVer } from '../dist/semver.js';

/**
 * Test suite for the SemVer class.
 * Aims to achieve high coverage by testing all methods and edge cases.
 */
describe('SemVer', () => {
  // Constructor tests
  describe('constructor', () => {
    it('should create a new SemVer instance with valid version string', () => {
      const version = new SemVer('1.2.3');
      expect(version.major).toBe(1);
      expect(version.minor).toBe(2);
      expect(version.patch).toBe(3);
      expect(version.prerelease).toBeUndefined();
      expect(version.build).toBeUndefined();
    });

    it('should handle version with prerelease', () => {
      const version = new SemVer('1.2.3-alpha');
      expect(version.major).toBe(1);
      expect(version.minor).toBe(2);
      expect(version.patch).toBe(3);
      expect(version.prerelease).toBe('alpha');
      expect(version.build).toBeUndefined();
    });

    it('should handle version with build metadata', () => {
      const version = new SemVer('1.2.3+build.123');
      expect(version.major).toBe(1);
      expect(version.minor).toBe(2);
      expect(version.patch).toBe(3);
      expect(version.prerelease).toBeUndefined();
      expect(version.build).toBe('build.123');
    });

    it('should handle version with prerelease and build metadata', () => {
      const version = new SemVer('1.2.3-beta.1+build.456');
      expect(version.major).toBe(1);
      expect(version.minor).toBe(2);
      expect(version.patch).toBe(3);
      expect(version.prerelease).toBe('beta.1');
      expect(version.build).toBe('build.456');
    });

    it('should default to 0.0.0 when string is "undefined"', () => {
      const version = new SemVer('undefined');
      expect(version.major).toBe(0);
      expect(version.minor).toBe(0);
      expect(version.patch).toBe(0);
    });

    it('should convert non-string inputs to strings', () => {
      expect(() => new SemVer(123)).toThrow();
    });

    it('should throw TypeError for invalid semver strings', () => {
      expect(() => new SemVer('not.a.version')).toThrow(TypeError);
      expect(() => new SemVer('1.2')).toThrow(TypeError);
      expect(() => new SemVer('v1.2.3')).toThrow(TypeError);
    });
  });

  // Static method tests
  describe('static methods', () => {
    describe('test', () => {
      it('should parse valid semver strings', () => {
        const result = SemVer.test('1.2.3');
        expect(result).not.toBeNull();
        expect(result.major).toBe(1);
        expect(result.minor).toBe(2);
        expect(result.patch).toBe(3);
      });

      it('should return null for invalid semver strings', () => {
        expect(SemVer.test('not.a.version')).toBeNull();
        expect(SemVer.test('1.2')).toBeNull();
        expect(SemVer.test('v1.2.3')).toBeNull();
      });

      it('should handle all semver components', () => {
        const result = SemVer.test('10.20.30-alpha.1+build.123');
        expect(result).not.toBeNull();
        expect(result.major).toBe(10);
        expect(result.minor).toBe(20);
        expect(result.patch).toBe(30);
        expect(result.prerelease).toBe('alpha.1');
        expect(result.build).toBe('build.123');
      });

      it('should handle various prerelease formats', () => {
        expect(SemVer.test('1.0.0-alpha')).not.toBeNull();
        expect(SemVer.test('1.0.0-alpha.1')).not.toBeNull();
        expect(SemVer.test('1.0.0-0.3.7')).not.toBeNull();
        expect(SemVer.test('1.0.0-x.7.z.92')).not.toBeNull();
      });

      it('should handle various build metadata formats', () => {
        expect(SemVer.test('1.0.0+build.1')).not.toBeNull();
        expect(SemVer.test('1.0.0+001')).not.toBeNull();
        expect(SemVer.test('1.0.0+20130313144700')).not.toBeNull();
        expect(SemVer.test('1.0.0+exp.sha.5114f85')).not.toBeNull();
      });

      it('should have correct Symbol.toStringTag', () => {
        const result = SemVer.test('1.2.3');
        expect(Object.prototype.toString.call(result)).toBe('[object ParsedSemVer]');
      });
    });

    describe('regexp', () => {
      it('should return a new RegExp instance each time', () => {
        const re1 = SemVer.regexp;
        const re2 = SemVer.regexp;
        expect(re1).not.toBe(re2);
        expect(re1).toBeInstanceOf(RegExp);
      });

      it('should match valid semver strings', () => {
        const re = SemVer.regexp;
        expect(re.test('1.2.3')).toBe(true);
        expect(re.test('10.20.30')).toBe(true);
        expect(re.test('1.0.0-alpha')).toBe(true);
        expect(re.test('1.0.0+build.1')).toBe(true);
        expect(re.test('1.0.0-alpha+build.1')).toBe(true);
      });

      it('should not match invalid semver strings', () => {
        const re = SemVer.regexp;
        expect(re.test('v1.2.3')).toBe(false);
        expect(re.test('1.2')).toBe(false);
        expect(re.test('1.2.3.4')).toBe(false);
        expect(re.test('01.2.3')).toBe(false);
      });
    });
  });

  // Static property tests
  describe('static properties', () => {
    it('should provide kAllParts', () => {
      expect(SemVer.kAllParts).toEqual(['major', 'minor', 'patch', 'prerelease', 'build']);
    });

    it('should provide kNumericParts', () => {
      expect(SemVer.kNumericParts).toEqual(['major', 'minor', 'patch']);
    });

    it('should provide kStringParts', () => {
      expect(SemVer.kStringParts).toEqual(['prerelease', 'build']);
    });

    it('should provide kOperatorNames', () => {
      expect(SemVer.kOperatorNames).toEqual(['+', '/', '*', '-']);
    });

    it('should provide kOperators as an object with operation functions', () => {
      const operators = SemVer.kOperators;
      expect(operators['+'](2, 3)).toBe(5);
      expect(operators['-'](5, 2)).toBe(3);
      expect(operators['*'](2, 3)).toBe(6);
      expect(operators['/'](6, 2)).toBe(3);
    });

    it('should provide individual part constants', () => {
      expect(SemVer.kMajor).toBe('major');
      expect(SemVer.kMinor).toBe('minor');
      expect(SemVer.kPatch).toBe('patch');
      expect(SemVer.kPrerelease).toBe('prerelease');
      expect(SemVer.kBuild).toBe('build');
    });

    it('should provide individual operator constants as arrays', () => {
      const [addOp, addFn] = SemVer.kAdd;
      expect(addOp).toBe('+');
      expect(addFn(2, 3)).toBe(5);

      const [subOp, subFn] = SemVer.kSubtract;
      expect(subOp).toBe('-');
      expect(subFn(5, 2)).toBe(3);

      const [mulOp, mulFn] = SemVer.kMultiply;
      expect(mulOp).toBe('*');
      expect(mulFn(2, 3)).toBe(6);

      const [divOp, divFn] = SemVer.kDivide;
      expect(divOp).toBe('/');
      expect(divFn(6, 2)).toBe(3);
    });
  });

  // Instance method tests
  describe('instance methods', () => {
    describe('adjustBy', () => {
      it('should adjust major version by addition', () => {
        const version = new SemVer('1.2.3');
        const result = version.adjustBy('major', 2);
        expect(result).toBe(3);
        expect(version.major).toBe(3);
        expect(version.toString()).toBe('3.2.3');
      });

      it('should adjust minor version by subtraction', () => {
        const version = new SemVer('1.2.3');
        const result = version.adjustBy('minor', 1, '-');
        expect(result).toBe(1);
        expect(version.minor).toBe(1);
        expect(version.toString()).toBe('1.1.3');
      });

      it('should adjust patch version by multiplication', () => {
        const version = new SemVer('1.2.3');
        const result = version.adjustBy('patch', 2, '*');
        expect(result).toBe(6);
        expect(version.patch).toBe(6);
        expect(version.toString()).toBe('1.2.6');
      });

      it('should adjust version by division', () => {
        const version = new SemVer('1.10.10');
        const result = version.adjustBy('minor', 2, '/');
        expect(result).toBe(5);
        expect(version.minor).toBe(5);
        expect(version.toString()).toBe('1.5.10');
      });

      it('should return null for invalid part', () => {
        const version = new SemVer('1.2.3');
        expect(version.adjustBy('invalid', 1)).toBeNull();
        expect(version.adjustBy('prerelease', 1)).toBeNull();
        expect(version.adjustBy('build', 1)).toBeNull();
      });

      it('should return null for invalid operator', () => {
        const version = new SemVer('1.2.3');
        expect(version.adjustBy('major', 1, 'invalid')).toBeNull();
      });

      it('should return null for non-finite adjustment value', () => {
        const version = new SemVer('1.2.3');
        expect(version.adjustBy('major', NaN)).toBeNull();
        expect(version.adjustBy('major', Infinity)).toBeNull();
      });
    });

    describe('adjustTo', () => {
      it('should set major version to specific value', () => {
        const version = new SemVer('1.2.3');
        const result = version.adjustTo('major', 5);
        expect(result).toBe(5);
        expect(version.major).toBe(5);
        expect(version.toString()).toBe('5.2.3');
      });

      it('should set minor version to specific value', () => {
        const version = new SemVer('1.2.3');
        const result = version.adjustTo('minor', 7);
        expect(result).toBe(7);
        expect(version.minor).toBe(7);
        expect(version.toString()).toBe('1.7.3');
      });

      it('should set patch version to specific value', () => {
        const version = new SemVer('1.2.3');
        const result = version.adjustTo('patch', 9);
        expect(result).toBe(9);
        expect(version.patch).toBe(9);
        expect(version.toString()).toBe('1.2.9');
      });

      it('should set prerelease to specific value', () => {
        const version = new SemVer('1.2.3');
        const result = version.adjustTo('prerelease', 'beta');
        expect(result).toBe('beta');
        expect(version.prerelease).toBe('beta');
        expect(version.toString()).toBe('1.2.3-beta');
      });

      it('should set build to specific value', () => {
        const version = new SemVer('1.2.3');
        const result = version.adjustTo('build', 'xyz');
        expect(result).toBe('xyz');
        expect(version.build).toBe('xyz');
        expect(version.toString()).toBe('1.2.3+xyz');
      });

      it('should convert string numbers to actual numbers for numeric parts', () => {
        const version = new SemVer('1.2.3');
        const result = version.adjustTo('major', '10');
        expect(result).toBe(10);
        expect(version.major).toBe(10);
      });

      it('should convert non-string values to strings for string parts', () => {
        const version = new SemVer('1.2.3');
        const result = version.adjustTo('prerelease', 123);
        expect(result).toBe('123');
        expect(version.prerelease).toBe('123');
      });

      it('should return null for invalid part name', () => {
        const version = new SemVer('1.2.3');
        expect(version.adjustTo('invalid', 1)).toBeNull();
      });

      it('should return null for NaN value on numeric parts', () => {
        const version = new SemVer('1.2.3');
        expect(version.adjustTo('major', 'not-a-number')).toBeNull();
      });
    });

    describe('bump', () => {
      it('should increment major version by 1 by default', () => {
        const version = new SemVer('1.2.3');
        const result = version.bump('major');
        expect(result).toBe(2);
        expect(version.major).toBe(2);
        expect(version.toString()).toBe('2.2.3');
      });

      it('should increment minor version by specified amount', () => {
        const version = new SemVer('1.2.3');
        const result = version.bump('minor', 3);
        expect(result).toBe(5);
        expect(version.minor).toBe(5);
        expect(version.toString()).toBe('1.5.3');
      });

      it('should increment patch version', () => {
        const version = new SemVer('1.2.3');
        const result = version.bump('patch');
        expect(result).toBe(4);
        expect(version.patch).toBe(4);
        expect(version.toString()).toBe('1.2.4');
      });

      it('should return null for invalid part', () => {
        const version = new SemVer('1.2.3');
        expect(version.bump('invalid')).toBeNull();
      });
    });

    describe('toString', () => {
      it('should convert basic version to string', () => {
        const version = new SemVer('1.2.3');
        expect(version.toString()).toBe('1.2.3');
      });

      it('should include prerelease in string representation', () => {
        const version = new SemVer('1.2.3-alpha');
        expect(version.toString()).toBe('1.2.3-alpha');
      });

      it('should include build in string representation', () => {
        const version = new SemVer('1.2.3+build.123');
        expect(version.toString()).toBe('1.2.3+build.123');
      });

      it('should include both prerelease and build in string representation', () => {
        const version = new SemVer('1.2.3-beta.1+build.456');
        expect(version.toString()).toBe('1.2.3-beta.1+build.456');
      });

      it('should work with template literals', () => {
        const version = new SemVer('1.2.3');
        expect(`Version: ${version}`).toBe('Version: 1.2.3');
      });
    });
  });

  // Symbol.toStringTag tests
  describe('Symbol.toStringTag', () => {
    it('should have correct Symbol.toStringTag', () => {
      const version = new SemVer('1.2.3');
      expect(Object.prototype.toString.call(version)).toBe('[object SemVer]');
    });
  });

  // Additional edge cases
  describe('edge cases', () => {
    it('should handle zero versions', () => {
      const version = new SemVer('0.0.0');
      expect(version.major).toBe(0);
      expect(version.minor).toBe(0);
      expect(version.patch).toBe(0);
    });

    it('should handle large version numbers', () => {
      const version = new SemVer('999.888.777');
      expect(version.major).toBe(999);
      expect(version.minor).toBe(888);
      expect(version.patch).toBe(777);
    });

    it('should allow complex prerelease identifiers', () => {
      const version = new SemVer('1.0.0-alpha.beta.1.2.3');
      expect(version.prerelease).toBe('alpha.beta.1.2.3');
    });

    it('should allow complex build identifiers', () => {
      const version = new SemVer('1.0.0+20130313144700.git.abc123');
      expect(version.build).toBe('20130313144700.git.abc123');
    });
  });
});