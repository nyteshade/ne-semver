# SemVer

A flexible single class, zero dependency, class for managing semantic versions.

## Features

 * Allows programmatic management of semantic version strings. 
 * Fully compliant with semantic versions conforming to the 2.0 spec
 * Testing and separation of strings purported to be in semver format can be statically
   tested without creating a SemVer instance. 
 * Version adjustments for each of the parts of a semantic version can be performed
   on each instance.

## Future Features

 * `SemVer.compare(SemVer)` and `SemVer.compare(string)`

## Installation

### NodeJS

In a nodejs or compatible engine project, perform the following npm install

```sh
npm install @nejs/semver
```

### Browser

In a browser, a script tag pointed here can get you a CDN served version of the latest build

```html
<script type="module">
  const { SemVer } = await import('https://cdn.jsdelivr.net/gh/nyteshade/ne-semver@main/dist/semver.mjs')

  // ... use SemVer here
</script>
```

Or if you want it to automatically be injected into the window, you can use the iffy variant.

```html
<script src="'https://cdn.jsdelivr.net/gh/nyteshade/ne-semver@main/dist/semver.js'"></script>
```

## Usage

### Statically

Extracting a semantic version into its parts can be done in the following manner. It
will also allow you to determine if it fails to be parsed through the return of a `null`
value.

```js
// This is an invalid version, and will result in a null
let bad = SemVer.test('1.2')

// This is a simple semantic version
let ver = SemVer.test('1.2.0')

console.log(ver.major)       // 1
console.log(ver.minor)       // 2
console.log(ver.patch)       // 0
console.log(ver.prerelease)  // undefined
console.log(ver.build)       // undefined
console.log(ver.toString())  // "1.2.0"
console.log(String(ver))     // "1.2.0"

// This is a more complex variant
let ver = SemVer.test('1.2.32-prod.124+arm64')

console.log(ver.major)       // 1
console.log(ver.minor)       // 2
console.log(ver.patch)       // 32
console.log(ver.prerelease)  // "prod.124"
console.log(ver.build)       // "arm64"
console.log(ver.toString())  // "1.2.32-prod.124+arm64"
console.log(String(ver))     // "1.2.32-prod.124+arm64"
```

### Instance variants

More functionally, an instance of `SemVer` will allow you to manipulate the 
versions.

```js
// This is an invalid version with instances. These will throw a TypeError
let bad = new SemVer("1.2")

// Similar to the static test() output, the five parts of a semantic version
// can be accessed directly. 
//   `.major`
//   `.minor`
//   `.patch`
//   `.prerelease`
//   `.build`
let ver = new SemVer('1.2.32-prod.124+arm64')

// Additionally, however we can manipulate the parts. The numeric portions
// can be mathematically adjusted
ver.adjustBy('major', 2, '*')
conosle.log(ver.major)         // 2
ver.adjustBy('major', 2, '/')  // 1
ver.adjustBy('major', 2, '-')  // -1; note this is actually an invalid semver now
ver.adjustBy('major', 1, '+')  // 1; addition is the default, so '+' can be omitted

// If addition is the only option needed, a shorter variant is 'bump'
ver.bump('major')              // now 2

// Numeric and non-numeric parts can be directly set with 'adjustTo'
ver.adjustTo('major', 1)
ver.adjustTo('build', 'x86_64')

// Conversion to string can be achieved in several ways
ver.toString()    // "2.2.32-prod.124+x86_64"
String(ver)       // "2.2.32-prod.124+x86_64"
`Version ${ver}`  // "Version 2.2.32-prod.124+x86_64"
```

## License

MIT

## Contributing

Contributors are welcome! Please submit a Pull Request.
