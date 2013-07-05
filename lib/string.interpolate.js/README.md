String.interpolate.js
=====================

A generic string interpolation helper that is library agnostic.

##Features
* Property lookup on the provided context (if object has a .get() method, it will be used instead!)
* Inline expression evaluation

##Usage
The syntax follows a similar convention to many languages with built-in interpolation. The dollar sign ($) is used to identify a property: `$firstName`, while the dollar sign followed by curly brackets allows evaluation of any JavaScript expression. `${firstName.toUpperCase()}`.

If you want to get really crazy, it even supports variable variables. i.e. `$$propertyName` is roughly equivalent to `context[context[propertyName]]`.
##Examples

```javascript

var context = {
  firstName: 'Bilbo',
  lastName: 'Baggins',
};

var fullName = '$firstName $lastName'.interpolate(context);
// 'Bilbo Baggins'

var welcomeMessage = 'Welcome, $fullName! Expressions too: ${fullName.toUpperCase()}'.interpolate(context);
// 'Welcome, Bilbo Baggins! Expressions too: BILBO BAGGINS'

```

##Disable String.prototype Extension
If you'd prefer not to have it extend the native String prototype, before loading the library create an `ENV` object with `EXTEND_PROTOTYPES` set to false:

```javascript

window.ENV = {
  EXTEND_PROTOTYPES: false
};

```
You can then use the library by creating an `InterpolatedString` directly:

```javascript
var result = new InterpolatedString('hello $name', { name: 'Bilbo Baggins' });
```

##Change Identifier Symbol
If you'd prefer a different symbol other than the dollar sign `$` as the symbol it looks for, you can use:

```javascript
InterpolatedString.setup({
    identifierSymbol: '#'
});

var foo = 'Using hash as example: #message'.interpolate({ message: 'hello world' });
var bar = 'Expressions with hash: #{message.toUpperCase()}'.interpolate({ message: 'hello world' });
```
