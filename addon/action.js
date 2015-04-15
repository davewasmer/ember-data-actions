export default function computedAction(actionName) {
  return function(...args) {
    var action = this.actionFor(actionName);
    return action(...args);
  };
}
