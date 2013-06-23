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

```handlebars
<script type="text/x-handlebars" data-template-name="person">
    <h1>{{welcomeMessage}}</h1>
 </script>
```

Output:

```html
<div>
    <h1>Welcome, Bilbo Baggins! I can use expressions too like: BILBO BAGGINS</h1>
</div>
```

##Features
* Inline property getter evaluation and observing/bindings!
* Inline expression evaluation

##License
MIT Licensed

