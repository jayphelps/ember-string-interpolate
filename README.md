Ember.String.interpolate v2.0
=================

Adds string interpolation as a computed property to Ember.js (i.e. no more unreadable getter concatenation).

##Features
* Inline property getter evaluation and observing/bindings!
* Inline expression evaluation

##Usage
The syntax follows a similar convention to many languages with built-in interpolation. The dollar sign ($) is used to identify a property: `$firstName`, while the dollar sign followed by curly brackets allows evaluation of any JavaScript expression. `${firstName.toUpperCase()}`.

If you want to get really crazy, it even supports variable variables. i.e. `$$propertyName` is roughly equivalent to this.get(this.get('propertyName')).
##Examples
```javascript
App.PersonController = Ember.ObjectController.extend({
    firstName: 'Bilbo',
    lastName: 'Baggins',
    // Since .interpolate() returns a computed property,
    // you can chain any of the other methods like .volatile(), .meta(), etc
    fullName: '$firstName $lastName'.interpolate().readOnly(),
    
    // Old way
    welcomeMessage: function () {
        return 'Welcome, ' + this.get('fullName').toUpperCase() + '!';
    }.property('fullName'),
    
    // New way
    welcomeMessage: 'Welcome, ${fullName.toUpperCase()}!'.interpolate()
});
```

```handlebars
<script type="text/x-handlebars" data-template-name="person">
    <h1>{{welcomeMessage}}</h1>
 </script>
```

Output:

```html
<div>
    <h1>Welcome, BILBO BAGGINS!</h1>
</div>
```

## Other Usage:
Interpolation works with global variables. This is handy for localization if you're using an i18n library.

```javascript
window.status = 'online';

var Robot = Ember.Object.extend({
    statusMessage: 'Robot status is: $status'.interpolate()
});
```

Interpolation works outside of properties as well using the `Ember.String.interpolate` helper:

```javascript
var Robot = Ember.Object.extend({
    status: 'online',
    
    alertStatusMessage: function () {
    	var message = Ember.String.interpolate('Robot status is: $status', this);
        alert(message);
    }
});

```

##EXTEND_PROTOTYPES = false
If you've told Ember not to extend the native prototypes, this library will honor that as well.

In that case, you can use it similiar to normal computed properties:

```javascript
var Robot = Ember.Object.extend({
    status: 'offline',
    statusMessage2: Ember.computed.interpolate('robot is $status')
});
```

##Under The Hood
This library is basically an Ember wrapper for my generic [String.interpolate.js](https://github.com/jayphelps/string.interpolate.js) library. This library adds all the Ember-goodness like properties, etc.
See [String.interpolate.js](https://github.com/jayphelps/string.interpolate.js) documentation for additional configuration options like changing the identifier symbol to something other than `$`

## Security Considerations
Keep in mind that since it supports dynamic expression evaluation `${expression}`, the .`interpolate()` function should **never** be called directly on user-generated strings (unless you know exactly what you're doing). But since properties looked up are not themselves interpolated, you can safely reference properties that contain un-safe strings. In practice, there aren't a lot of cases where you could run into this since you usually define the string to be interpolated, but it was worth noting.

##### Unsafe!
```javascript
var userGeneratedString = prompt('Please enter exploitative code');
userGeneratedString.interpolate();
```
##### Perfectly Safe!
```javascript
var userGeneratedString = prompt('Please enter exploitative code');
'$userGeneratedString or even ${userGeneratedString.toUpperCase()}'.interpolate({
    userGeneratedString: userGeneratedString
});
```

##Contributing/Issues
Forks, pull requests and issue tickets are encouraged.

##License
MIT Licensed
