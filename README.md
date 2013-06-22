Ember.String.interpolate
=================

Adds string interpolation to Ember.String (i.e. no more unreadable getter concatenation)

##Examples

```javascript
App.PersonController = Ember.ObjectController.extend({
    firstName: 'Bilbo',
    lastName: 'Baggins',
    fullName: '$firstName $lastName'.interpolate(),
    welcomeMessage: 'Welcome, $fullName! I can use expressions too like: ${fullName.toUpperCase()}'.interpolate()
});
```
##Features
* Inline property getter evaluation and observing
* Inline expression evaluation

##License
MIT Licensed

