(function () {

class SemVer {
  /**
   * Create a new instance of {@link SemVer}. If the supplied input is an
   * instance of {@link SemVer} then its input will be used to effectively
   * create a copy. Otherwise any input will be converted to a string
   * and tested.
   *
   * @param {string} string the input to be parsed as a semantic version
   * string
   *
   * @constructor
   */
  constructor(string) {
    // If the supplied 'string' is an instance of SemVer, duplicate it and
    // make a new variant.
    string = String(string)

    if (string == 'undefined')
      string = '0.0.0'

    // Attempt to parse the supplied string
    const result = SemVer.test(string)

    // Throw a TypeError if the parsing failed.
    if (!result)
      throw new TypeError('The supplied string is not a valid semver number.')

    // Store the input
    this.input = string

    // Extract the parsed variables from the result
    const { major, minor, patch, prerelease, build } = result

    // Assign the variables from the parsed result to this instance
    Object.assign(this, { major, minor, patch, prerelease, build })
  }

  // Instance properties

  /**
   * The major version portion of the semantic version. i.e. the first number
   *
   * @type number
   */
  major = 0;

  /**
   * The minor version portion of the semantic version. i.e. the second number
   *
   * @type number
   */
  minor = 0;

  /**
   * The patch version portion of the semantic version. i.e. the third number
   *
   * @type number
   */
  patch = 0;

  /**
   * The prerelease portion of the semantic version. This portion is prefixed
   * with a '-' character and can consist of numbers, letters, dashes. More
   * than one group can be present after the first, separated by periods.
   *
   * @type string | undefined
   */
  prerelease = undefined;

  /**
   * The build portion of the semantic version. This portion is prefixed
   * with a '+' character and can consist of numbers, letters, dashes. More
   * than one group can be present after the first, separated by periods.
   *
   * @type string | undefined
   */
  build = undefined;

  /**
   * Ensures that low level access to the name of this instance is seen as
   * `[object SemVer]` rather than `[object Object]`.
   *
   * @type string
   */
  get [Symbol.toStringTag]() {
    return this.constructor.name
  }

  // Instance methods

  /**
   * This function provides the ability to adjust one of the numeric version
   * parts by the indicated number. The default operator for the adjustment
   * is addition. Basic operators **+**, **-**, **\*** and **\/** are all
   * supported.
   *
   * Due to adjustments being numerically adjusted in this method, only the
   * numeric parts **major**, **minor**, and **patch** are supported. The part
   * names need to be called out specifically, but can be identified using the
   * constant variables as well.
   *
   *  * {@link SemVer.kMajor}
   *  * {@link SemVer.kMinor}
   *  * {@link SemVer.kPatch}
   *  * {@link SemVer.kPrerelease}
   *  * {@link SemVer.kBuild}
   *
   * @param {'major'|'minor'|'patch'} part the numeric part of semver to adjust
   * @param {number} by the value by which to adjust the version part
   * @param {'+'|'-'|'*'|'/'} [operator="+"] the operator to use when adjusting
   * the numeric part of the version.
   *
   * @returns {number} the newly adjusted version part
   */
  adjustBy(part, by, operator = '+') {
    const { kNumericParts, kOperatorNames, kOperators } = this.constructor

    if (
      !kNumericParts.some(numericPart => part == numericPart) ||
      !kOperatorNames.some(operatorName => operatorName == operator) ||
      !isFinite(by)
    ) {
      return null
    }

    const adjustor = kOperators[operator]

    this[part] = adjustor(this[part], by)

    return this[part]
  }

  /**
   * This function provides the ability to set the value of any part of the
   * semantic version to a new value. The part names need to be called out
   * specifically, but can be identified using the constant variables as well.
   *
   *  * {@link SemVer.kMajor}
   *  * {@link SemVer.kMinor}
   *  * {@link SemVer.kPatch}
   *  * {@link SemVer.kPrerelease}
   *  * {@link SemVer.kBuild}
   *
   * If a part name is incorrectly provided, or if a non-numeric value is
   * supplied for a numeric version part such that passing it to {@link Number}
   * results in a **NaN** value, then **null** is returned.
   *
   * @param {'major'|'minor'|'patch'|'prerelease'|'build'} part the name of the
   * semantic version part to be adjusted
   * @param {string|number} to the new value for the semantic version part. The
   * numeric portions, **major**, **minor**, **patch**, need to receive a
   * {@link Number} or value that converts into a number. The **prerelease**
   * or **build** values need to be strings.
   * @returns {string|number} the adjusted value, post adjustment
   *
   * @see {@link SemVer.major}
   * @see {@link SemVer.minor}
   * @see {@link SemVer.patch}
   * @see {@link SemVer.prerelease}
   * @see {@link SemVer.build}
   */
  adjustTo(part, to) {
    const { kAllParts, kNumericParts } = this.constructor

    if (!kAllParts.some(partName => part == partName))
      return null

    let value = to

    if (kNumericParts.some(numericPart => numericPart == part)) {
      value = Number(value)

      if (isNaN(value))
        return null
    }
    else {
      value = String(value)
    }

    return (this[part] = value)
  }

  /**
   * The {@link SemVer.bump} method is a short-hand variant of
   * {@link SemVer.adjustBy} that defaults to incrementing a numeric
   * version part by 1.
   *
   * @example
   * version.bump('minor')         // increments the minor part by 1
   * version.adjustBy('minor', 1)  // equivalent action
   *
   * @param {'major'|'minor'|'patch'} part the numeric version part to bump
   * @param {number} [by=1] the increment amount to add to the existing value
   * @return {number} the newly adjusted value of the specfied part, or
   * **null** if an incorrect **part** is supplied.
   */
  bump(part, by = 1) {
    return this.adjustBy(part, by)
  }

  /**
   * Converts the disparate parts of this semantic version back into a
   * compliant semantic version string. See https://semver.org. Given the
   * way JavaScript uses the **toString()** method, it will do the expected
   * thing in template strings and string concatenation.
   *
   * @returns {string} a string representation of the semantic version parts.
   */
  toString() {
    const major = this.major
    const minor = this.minor
    const patch = this.patch

    const prerelease = this.prerelease ? `-${this.prerelease}` : ''
    const build = this.build ? `+${this.build}` : ''

    return `${major}.${minor}.${patch}${prerelease}${build}`
  }

  // Static properties

  /**
   * A constant that returns an array with the string representation of
   * of the mathematical operation as its first element and a function to
   * perform the action as its second.
   *
   * @returns {[string, (number, number) => number]}
   */
  static get kAdd() {
    return ['+', (left, right) => left + right]
  }

  /**
   * A constant array of all the various part names of a semantic version.
   * These are **major**, **minor**, **patch**, **prerelease**, and **build**.\
   *
   * @type {['major'|'minor'|'patch'|'prerelease'|'build']}
   */
  static get kAllParts() {
    return [
      this.kMajor,
      this.kMinor,
      this.kPatch,
      this.kPrerelease,
      this.kBuild
    ]
  }

  /**
   * A constant with the name 'build' to represent its namesake in the
   * semantic version.
   *
   * @type {build'}
   */
  static get kBuild() {
    return 'build'
  }

  /**
   * A constant that returns an array with the string representation of
   * of the mathematical operation as its first element and a function to
   * perform the action as its second.
   *
   * @returns {[string, (number, number) => number]}
   */
  static get kDivide() {
    return ['/', (left, right) => left / right]
  }

  /**
   * A constant with the name 'major' to represent its namesake in the
   * semantic version.
   *
   * @type {build'}
   */
  static get kMajor() {
    return 'major'
  }

  /**
   * A constant with the name 'minor' to represent its namesake in the
   * semantic version.
   *
   * @type {build'}
   */
  static get kMinor() {
    return 'minor'
  }

  /**
   * A constant that returns an array with the string representation of
   * of the mathematical operation as its first element and a function to
   * perform the action as its second.
   *
   * @returns {[string, (number, number) => number]}
   */
  static get kMultiply() {
    return ['*', (left, right) => left * right]
  }

  /**
   * A constant array with the names of each of the three numeric portions
   * of the semantic version: **major**, **minor** and **patch**.
   *
   * @type {['major', 'minor', 'patch']}
   */
  static get kNumericParts() {
    return [this.kMajor, this.kMinor, this.kPatch]
  }

  /**
   * A constant array with the names of each of the two string portions
   * of the semantic version: **prerelease**, and **build**.
   *
   * @type {['prerelease', 'build']}
   */
  static get kStringParts() {
    return [this.kPrerelease, this.kBuild]
  }

  /**
   * A constant with the name 'build' to represent its namesake in the
   * semantic version.
   *
   * @type {'build'}
   */
  static get kPatch() {
    return 'patch'
  }

  /**
   * The names of the mathematical operation names. Namely **add**, **divide**,
   * **multiply**, and **subtract**.
   *
   * @type {['add', 'divide', 'multiply', 'subtract']}
   */
  static get kOperatorNames() {
    return [
      this.kAdd,
      this.kDivide,
      this.kMultiply,
      this.kSubtract
    ].map(([string, _]) => string)
  }

  /**
   * A constant array of the mathematical operation pairs. The keys will be
   * the name as seen in {@link SemVer.kOperatorNames}. The values of each
   * pair will be functions to perform the operations. The functions all take
   * a left and righthand operand and return post processed value.
   *
   * @type {Array<string, (number, number) => number>}
   */
  static get kOperators() {
    return Object.fromEntries([
      this.kAdd,
      this.kDivide,
      this.kMultiply,
      this.kSubtract
    ])
  }

  /**
   * A constant with the name 'prerelease' to represent its namesake in the
   * semantic version.
   *
   * @type {'prerelease'}
   */
  static get kPrerelease() {
    return 'prerelease'
  }

  /**
   * A constant that returns an array with the string representation of
   * of the mathematical operation as its first element and a function to
   * perform the action as its second.
   *
   * @returns {[string, (number, number) => number]}
   */
  static get kSubtract() {
    return ['-', (left, right) => left - right]
  }

  /**
   * Generates a Regular Expression that matches recommended parsing according
   * to semantic versioning 2.0; described here https://semver.org/
   *
   * @note A new instance of the regular expression is returned each time
   * this value is accessed. Keep a local copy of the returned instance if you
   * intend to parse a string for more than one match.
   *
   * @type RegExp
   */
  static get regexp() {
    // Regular Expression taken from Semantic Versioning 2.0 Spec
    // https://semver.org/
    const semverParts = [
      '^(0|[1-9]\\d*)',                                         // major
      '\\.(0|[1-9]\\d*)',                                       // minor
      '\\.(0|[1-9]\\d*)',                                       // patch
      '(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)',        // dash-release
      '(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?',
      '(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?$'           // plus-build
    ]

    return new RegExp(semverParts.join(''))
  }

  /**
   * Test a value, which will be converted to a string using the {@link String}
   * function. If parsing meets SemVer specifications, a plain JavaScript
   * object with the keys **major**, **minor**, **patch**, **prerelease**,
   * and **build** will be returned.
   *
   * @param {string} string the value to be parsed as a {@link SemVer} object
   * @returns {{
   *   major: number,
   *   minor: number,
   *   patch: number,
   *   prerelease: string,
   *   build: string
   * } | null} either an object with semantic versioning properties or null
   * if the input string could not be parsed.
   */
  static test(string) {
    const regexp = this.regexp
    const [input, major, minor, patch, prerelease, build] = (
      regexp.exec(String(string)) ?? []
    )

    if (input) {
      return {
        major: parseInt(major),
        minor: parseInt(minor),
        patch: parseInt(patch),
        prerelease,
        build,
        get [Symbol.toStringTag]() { return 'ParsedSemVer' },
      }
    }

    return null
  }
}


var target = (
(typeof globalThis != 'undefined') ? globalThis :
(typeof window != 'undefined') ? window :
(typeof global != 'undefined') ? global :
undefined
);

if (target) {
target.SemVer = SemVer;
}
})()