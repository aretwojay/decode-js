export default function createState(initialValue) {
  let value = initialValue;
  const listeners = [];

  function get() {
    return value;
  }

  function set(newValue) {
    value = newValue;
    listeners.forEach((listener) => listener(value));
  }

  function subscribe(listener) {
    listeners.push(listener);
  }

  return { get, set, subscribe };
}
