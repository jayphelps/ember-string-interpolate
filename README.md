Ember.String.interpolate
=================

Adds string interpolation to Ember.String (i.e. no more unreadable getter concatenation)

##Examples

```javascript
App.PersonController = Ember.ObjectController.extend({
    firstName: 'Bilbo',
    lastName: 'Baggins',
    fullName: '$firstName $lastName'.interpolate(),
    
    // Old way (many times even worse than this!)
    welcomeMessage: function () {
        return 'Welcome, ' + this.get('fullName') + '! Expressions too: ' + this.get('fullName').toUpperCase();
    }.property('fullName'),
    
    // New way!
    welcomeMessage: 'Welcome, $fullName! Expressions too: ${fullName.toUpperCase()}'.interpolate()
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

## Other Usage:

Interpolation works outside of properties too. Just pass the context you want to use:

```javascript
var Robot = Ember.Object.extend({
    status: 'ready',
    
    alertStatusMessage: function () {
        alert('Robot status is: $status'.interpolate(this));
    }
});

```

##Features
* Inline property getter evaluation and observing/bindings!
* Inline expression evaluation

##License
MIT Licensed

