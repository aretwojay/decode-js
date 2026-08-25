export default function createState(initialValue) {
  let value = initialValue;
  const listeners = [];

  function get() {
    return value;
  }

  function set(updaterOrValue) {
    const previousValue = value;
    if (typeof updaterOrValue === "function") {
      value = updaterOrValue(value);
    } else {
      value = updaterOrValue;
    }
    listeners.forEach((listener) => listener(value, previousValue));
  }

  function subscribe(listener) {
    if (typeof listener !== "function") {
      throw new TypeError("Le listener doit être une fonction.");
    }
    listeners.push(listener);
    return function unsubscribe() {
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    };
  }

  function select(selector) {
    if (typeof selector !== "function") {
      throw new TypeError("Le selector doit être une fonction.");
    }
    const subState = createState(selector(value));
    subscribe((newValue) => {
      const newSubValue = selector(newValue);
      if (newSubValue !== subState.get()) {
        subState.set(newSubValue);
      }
    });
    return subState;
  }

  return {
    get,
    set,
    getState: get,
    setState: set,
    subscribe,
    select,
  };
}

