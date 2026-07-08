import generateStructure from "./generate-structure.js";

export default function reactive(state, render) {
  let element = generateStructure(render(state.get()));

  state.subscribe((value) => {
    const newElement = generateStructure(render(value));
    element.replaceWith(newElement);
    element = newElement;
  });

  return element;
}
