# ember-data-actions

Introduces resource and collection actions to the Ember Data API, a la Rails. Actions are non-CRUD based endpoints in your RESTful API. Resource actions are actions performed on a single resource (i.e. "publish a book"), while collection actions are performed on the collection of resources (i.e. "a list of published books").

## Setup

To use resource or collection actions, you must include the appropriate mixins in your models and adapters.

Your adapters should apply the `ember-data-actions/mixins/adapter` mixin:

```js
// app/adapters/application.js
import DS from 'ember-data';
import AdapterActionsMixin from 'ember-data-actions/mixins/adapter';

export default DS.RESTAdapter.extend(AdapterActionsMixin);
```

Then, on any models with resource actions, use the resource mixin:

```js
// app/models/book.js
import DS from 'ember-data';
import ResourceActionsMixin from 'ember-data-actions/mixins/resource';

export default DS.Model.extend(ResourceActionsMixin);
```

Finally, for any collection actions, use the collection mixin applied **to the model class itself**:

```js
// app/models/book.js
import DS from 'ember-data';
import CollectionActionsMixin from 'ember-data-actions/mixins/collection';

var BookModel = DS.Model.extend();
BookModel.reopenClass(CollectionActionsMixin);

export default BookModel;
```

## Invoking Actions

### Resource Actions

```js
// Assuming an API that responds to POSTs to /books/:id/publish, ...

var book = this.store.getById('1');
book.publish({ publishingHouse: 'Tomster, Inc.' }).then(function(result) {
  if (result.wasPublished) {
    alert('Yay!');
  }
});

//
// Results in:
//
// Request:
// POST /books/1/publish
// { publishingHouse: 'Tomster, Inc.' }
//
// Response:
// { wasPublished: 'Yay!' }
//
```

### Invoking Collection Actions

```js
store.action('book', 'createWithCover', { cover: cover })
.then(function(response) {
  // ...
}))

//
// Results in:
//
// Request:
// POST /books/create-with-cover
// { cover: cover }
//
```

## Defining Actions

By default, triggered actions will result in an HTTP POST to the endpoint with the action's name (i.e. `book.publish() -> /books/:id/publish`, `store.action('book', 'createWithOptions', options) -> /books/create-with-options`), and returns a promise that resolves with the API response.

You can override this, either at the adapter layer to control the network communication (e.g. call a different endpoint), and/or at the model layer (e.g. create models from the responses).

If the default behavior works for you, then all you need to do is use the `action` macro to define resource actions on your models. Collection actions don't need to be previously defined.

```js
import DS from 'ember-data';
import ResourceActionsMixin from 'ember-data-actions/mixins/resource';
import action from 'ember-data-actions/action';

var BookModel = DS.Model.extend(ResourceActionsMixin, {
  publish: action('publish')
});
```


### Custom Resource Actions

If the default POST behavior isn't enough, you can customize the behavior of the action by defining an action handler on either the model or the adapter (or both):

```js
// app/models/book.js
export default DS.Model.extend(ResourceActionsMixin, {
  publish: action('publish'),

  actions: {
    publish: function(adapterAction, params) {
      // params = the params object passed in when the action is invoked
      // Default implementation is to invoke adapterAction(params)
      //
      // Overriding this is useful if you want to do things like take a
      // response and insert a record into the store via
      // this.store.createRecord
    }
  }
});

// app/adapters/book.js or app/adapters/application.js
export default DS.RESTAdapter.extend(AdapterActionsMixin, {
  actions: {
    publish: function(type, snapshot, params) {
      // default implementation is to POST to /books/snapshot.id/publish
    }
  }
});
```

### Custom Collection Actions

Similarly, you can create custom collection actions at the adapter or the model class layer, with just two key differences:

1. Use Model.reopenClass to add the actions as static properties of the class, rather an a Model instance. This ensures they operate on the collection as a whole rather than a particular instance.
2. Because they operate on a collection, your adapter won't be passed a snapshot argument. Also, your collection action handler will be passed the instance of the store, since Model classes themselves don't have a reference to the store.

```js
// app/models/book.js
export default DS.Model.reopenClass(CollectionActionsMixin, {
  actions: {
    createWithOptions: function(adapterAction, store, params) {
      // params = the params object passed in when the action is invoked
      // Default implementation is to invoke adapterAction(params)
      //
      // Overriding this is useful if you want to do things like take a
      // response and insert a record into the store via
      // this.store.createRecord
    }
  }
});

// app/adapters/book.js or app/adapters/application.js
export default DS.RESTAdapter.extend(AdapterActionsMixin, {
  actions: {
    publish: function(type, params) {
      // default implementation is to POST to /books/publish
    }
  }
});
```
