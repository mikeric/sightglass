(function() {
  // Public sightglass interface.
  function sightglass(obj, keypath, callback) {
    return new Observer(obj, keypath, callback)
  }

  // Batteries not included.
  sightglass.adapters = {}

  // Constructs a new keypath observer and kicks things off.
  function Observer(obj, keypath, callback) {
    this.obj = obj
    this.keypath = keypath
    this.callback = callback
    this.objectPath = []
    this.parse()

    if(typeof (this.target = this.realize()) !== 'undefined') {
      this.set(true, this.key, this.target, this.callback)
    }
  }

  // Tokenizes the provided keypath string into interface + path tokens for the
  // observer to work with.
  Observer.tokenize = function(keypath, interfaces, root) {
    tokens = []
    current = {interface: root, path: ''}

    for (index = 0; index < keypath.length; index++) {
      char = keypath.charAt(index)

      if(!!~interfaces.indexOf(char)) {
        tokens.push(current)
        current = {interface: char, path: ''}
      } else {
        current.path += char
      }
    }

    tokens.push(current)
    return tokens
  }

  // Parses the keypath using the interfaces defined on the view. Sets variables
  // for the tokenized keypath as well as the end key.
  Observer.prototype.parse = function() {
    interfaces = Object.keys(sightglass.adapters)

    if(!interfaces.length) {
      error('Must define at least one adapter interface.')
    }

    if(!!~interfaces.indexOf(this.keypath[0])) {
      root = this.keypath[0]
      path = this.keypath.substr(1)
    } else {
      if(typeof (root = sightglass.root) === 'undefined') {
        error('Must define a default root adapter.')
      }

      path = this.keypath
    }

    this.tokens = Observer.tokenize(path, interfaces, root)
    this.key = this.tokens.pop()
  }

  // Realizes the full keypath, attaching observers for every key and correcting
  // old observers to any changed objects in the keypath.
  Observer.prototype.realize = function() {
    current = this.obj
    unreached = false

    this.tokens.forEach(function(token, index) {
      if(typeof current !== 'undefined') {
        if(typeof this.objectPath[index] !== 'undefined') {
          if(current !== (prev = this.objectPath[index])) {
            this.set(false, token, prev, this.update.bind(this))
            this.set(true, token, current, this.update.bind(this))
            this.objectPath[index] = current
          }
        } else {
          this.set(true, token, current, this.update.bind(this))
          this.objectPath[index] = current
        }
        
        current = this.get(token, current)
      } else {
        if(unreached === false) unreached = index

        if(prev = this.objectPath[index]) {
          this.set(false, token, prev, this.update.bind(this))
        }
      }
    }, this)

    if(unreached !== false) {
      this.objectPath.splice(unreached)
    }

    return current
  }

  // Updates the keypath. This is called when any intermediary key is changed.
  Observer.prototype.update = function() {
    if((next = this.realize()) !== this.target) {
      if(typeof this.target !== 'undefined') {
        this.set(false, this.key, this.target, this.callback)
      }

      if(typeof next !== 'undefined') {
        this.set(true, this.key, next, this.callback)
      }

      oldValue = this.value()
      this.target = next

      if(this.value() !== oldValue) this.callback()
    }
  }

  // Reads the current end value of the observed keypath. Returns undefined if
  // the full keypath is unreachable.
  Observer.prototype.value = function() {
    if(typeof this.target !== 'undefined') {
      return this.get(this.key, this.target)
    }
  }

  // Sets the current end value of the observed keypath. Calling setValue when
  // the full keypath is unreachable is a no-op.
  Observer.prototype.setValue = function(value) {
    if(typeof this.target !== 'undefined') {
      this.adapter(this.key).set(this.target, this.key.path, value)
    }
  }

  // Gets the provided key on an object.
  Observer.prototype.get = function(key, obj) {
    return this.adapter(key).get(obj, key.path)
  }

  // Observes or unobserves a callback on the object using the provided key.
  Observer.prototype.set = function(active, key, obj, callback) {
    action = active ? 'observe' : 'unobserve'
    this.adapter(key)[action](obj, key.path, callback)
  }

  // Convenience function to grab the adapter for a specific key.
  Observer.prototype.adapter = function(key) {
    return sightglass.adapters[key.interface]
  }

  // Unobserves the entire keypath.
  Observer.prototype.unobserve = function() {
    this.tokens.forEach(function(token, index) {
      if(obj = this.objectPath[index]) {
        this.set(false, token, obj, this.update.bind(this))
      }
    }, this)

    if(typeof this.target !== 'undefined') {
      this.set(false, this.key, this.target, this.callback)
    }
  }

  // Error thrower.
  function error(message) {
    throw new Error('[sightglass] ' + message)
  }

  // Export module for Node and the browser.
  if(typeof module !== 'undefined' && module.exports) {
    module.exports = sightglass
  } else {
    this.sightglass = sightglass
  }
}).call(this)
