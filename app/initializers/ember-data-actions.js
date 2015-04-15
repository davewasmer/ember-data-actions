import StoreMixin from 'ember-data-actions/mixins/store';

export default {
  name: 'ember-data-actions',
  after: 'store',
  initialize(container) {
    var store = container.lookup('store:main');
    store.reopen(StoreMixin);
  }
};
