# sightglass

Observable keypath engine. Facilitaties building your own composable keypaths by way of defining adapters. This component was originally extracted from the [Rivets.js](http://rivetsjs.com) data binding + templating library.

## Installation

Install with [component(1)](http://component.io):

```
$ component install mikeric/sightglass
```

## API

#### sg(obj, keypath, callback)

Observes the full keypath on the provided object. The callback is called whenever the end value of the keypath changes (this could happen from any intermediary objects in the keypath changing, in addition to the property at the end of the keypath changing).

```
sg(obj, 'user.address:city', function() {})
```

This returns an `Observer` instance that you can hold on to for later (see the observer API below).

#### sg.adapters

Before being able to observe an object with sightglass, you need to define at least one adapter to compose your keypaths with. Adapters are just objects that respond to `observe`, `unobserve` and `get`. Keys on the `sg.adapters` object are the interfaces / separators to use when composing your keypaths.

```
sg.adapters['.'] = {
  observe: function(obj, key, callback) {},
  unobserve: function(obj, key, callback) {},
  get: function(obj, key) {}
}
```

#### sg.root

Sightglass also needs to know about a default root adapter. This is only required for keypaths that aren't prepended with an adapter key. For example, if your default root adapter is set to `.`, then the keypath `hello:world` will get parsed as `.hello:world`.

```
sg.root = '.'
```

#### observer.value()

Reads the current end value of the observed keypath. Returns `undefined` if the full keypath is unreachable.

#### observer.update()

Recomputes the entire keypath, attaching observers for every key or correcting old observers on objects in the keypath that have since changed.

If your adapter's `subscribe` function is implemented properly, this function will get called automatically when any intermediary key in the keypath changes, so you shouldn't need to call this function. However, if your keypath makes use of an adapter that does not subscribe for changes, then you will need to call this function manually after making changes to that segment in your keypath.

#### observer.unobserve()

Unobserves the entire keypath.

## Contributing

#### Bug Reporting

1. Ensure the bug can be reproduced on the latest master.
2. Open an issue on GitHub and include an isolated [JSFiddle](http://jsfiddle.net/) demonstration of the bug. The more information you provide, the easier it will be to validate and fix.

#### Pull Requests

1. Fork the repository and create a topic branch.
2. Be sure to associate commits to their corresponding issue using `[#1]` or `[Closes #1]` if the commit resolves the issue.
5. Push to your fork and submit a pull-request with an explanation and reference to the original issue (if there is one).
