import Ember from 'ember';

export default Ember.Mixin.create({

  /**
   * Add your action handlers to the actions object. Handlers are functions that
   * take 2 arguments (type, params), and the return value is handed back to the
   * model action handler, and eventually, to the original caller.
   *
   * Adapter action handlers are great for when you need to customize how the
   * action is invoked on the server.
   */

  /**
   * Lookup the action handler for this particular action. If none exists, fall
   * back to the default action handler.
   *
   * @param {DS.Model} type
   * @param {String} actionName - the name of the collection action to trigger
   * @param {DS.Model} snapshot - the snapshot to invoke the action against
   */
  actionFor(type, actionName, record) {
    var snapshot;
    if (record) {
      snapshot = record._createSnapshot();
    }
    var handler = this.get('actions.' + actionName);

    if (handler) {
      return handler.bind(this, type, snapshot);
    } else {
      handler = this.get('defaultAction');
      return handler.bind(this, type, actionName, snapshot);
    }
  },

  /**
   * Route to the default resource or collection action, depending on whether
   * or not there is a snapshot.
   *
   * @param {DS.Model} type
   * @param {String} actionName - the name of the collection action to trigger
   * @param {DS.Model} snapshot
   * @param {Object} params - arbitrary params for this action, passed to server
   */
  defaultAction(type, actionName, snapshot, params) {
    if (snapshot) {
      return this.defaultResourceAction(type, actionName, snapshot, params);
    } else {
      return this.defaultCollectionAction(type, actionName, params);
    }
  },

  /**
   * The default action is to append the action name (dasherized) to the
   * resource URL and submit a POST, returning the raw body.
   *
   * @param {DS.Model} type
   * @param {String} actionName - the name of the collection action to trigger
   * @param {DS.Model} snapshot
   * @param {Object} params - arbitrary params for this action, passed to server
   */
  defaultResourceAction(type, actionName, snapshot, params) {
    var actionURL = '/' + Ember.String.dasherize(actionName);
    var url = this.buildURL(type.typeKey, snapshot.id, snapshot) + actionURL;
    var method = 'POST';
    var options = { data: params };
    return this.ajax(url, method, options);
  },

  /**
   * The default action is to append the action name (dasherized) to the
   * collection URL and submit a POST, returning the raw body.
   *
   * @param {DS.Model} type
   * @param {String} actionName - the name of the collection action to trigger
   * @param {Object} params - arbitrary params for this action, passed to server
   */
  defaultCollectionAction(type, actionName, params) {
    var actionURL = '/' + Ember.String.dasherize(actionName);
    var url = this.buildURL(type.typeKey) + actionURL;
    var method = 'POST';
    var options = { data: params };
    return this.ajax(url, method, options);
  }

});
