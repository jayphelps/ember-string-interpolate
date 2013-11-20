module('Ember.String.interpolate');

test('Returns a string when given an string and object as arguments', function () {
    var output = Ember.String.interpolate('', {});
    ok(output === '', 'Strict === equals empty string');
    ok(!(output instanceof String), 'Is NOT an instanceof String');
    ok(typeof output === 'string', 'typeof equals "string"');
});

test('Replaces all $identifiers inside a provided string w/ context', function () {
    var data = {
        foo: 'hello',
        bar: 'world'
    },
    context = Ember.copy(data, true);

    var output = Ember.String.interpolate('$foo $bar', context);

    ok(output === 'hello world', 'Expected output matches');
    deepEqual(context, data, 'Provided context object is unchanged');
});

test('.toString() is used on resolved values', function () {
    var output, callCount = 0;
    var context = {
        foo: {
            _value: 'hello world',
            toString: function () {
                callCount++;
                return this._value;
            }
        }
    };

    output = Ember.String.interpolate('$foo', context);
    ok(output === 'hello world', 'Expected output matches');
    ok(callCount === 1, '.toString() is only called once');
});

test('$identifiers are replaced when followed by non-identifier characters', function () {
    var output;
    var context = {
        foo: 'hello'
    };

    output = Ember.String.interpolate('$foo! $foo^ ($foo) "$foo" $foo-$foo', context);
    ok(output === 'hello! hello^ (hello) "hello" hello-hello', 'Expected output matches for common characters');

    output = Ember.String.interpolate('$foo. $foo..', context);
    ok(output === 'hello. hello..', '$identifier followed by a period is not mistaken for a property path');
});

test('Nested objects paths are resolved', function () {
    var output;
    var context = {
        message: 'base',
        first: {
            message: 'first',
            second: {
                message: 'second'
            }
        }
    };

    output = Ember.String.interpolate('$message', context);
    ok(output === 'base', 'Base level resolves correctly');

    output = Ember.String.interpolate('$first.message', context);
    ok(output === 'first', 'First level resolves correctly');

    output = Ember.String.interpolate('$first.second.message', context);
    ok(output === 'second', 'Second level resolves correctly');
});

/**
 * This will be the expected behavior in 2.0
 */
test('$identifiers with unmatched context values are simply removed (KNOWN FAILING)', function () {
    var output;
    var context = {
        foo: 'hello'
    };

    output = Ember.String.interpolate('$foo $bar', context);
    ok(output === 'hello ', 'Replaced with nothing');

    context.bar = 'world';
    output = Ember.String.interpolate('$foo $bar', context);
    ok(output === 'hello world', 'Replaced with correct value after added');
});