import Link from "../components/router/link.js";
import createState from "../lib/create-state.js";
import reactive from "../lib/reactive.js";

const dataState = createState(
  JSON.parse(sessionStorage.getItem("zaza")) || {},
);

function renderTable(data) {
  function onTdClick(event) {
    const td = event.currentTarget;
    const textNode = td.childNodes[0];
    const text = textNode.textContent;
    const input = document.createElement("input");
    input.value = text;
    td.removeChild(textNode);
    td.appendChild(input);
    input.focus();

    input.addEventListener("blur", function (event) {
      const input = event.currentTarget;
      const newText = input.value;
      const key = td.dataset.key;
      const newData = { ...data, [key]: newText };
      sessionStorage.setItem("zaza", JSON.stringify(newData));
      dataState.set(newData);
    });

  }

  return {
    type: "table",
    children: [
      {
        type: "tbody",
        children: Array.from({ length: 20 }, (_, i) => ({
          type: "tr",
          children: Array.from({ length: 20 }, (_, j) => ({
            type: "td",
            events: [["click", onTdClick]],
            attributes: [["data-key", `${i},${j}`]],
            children: [data[`${i},${j}`] ?? "Default"],
          })),
        })),
      },
    ],
  };
}

export default function PageTable() {
  return {
    type: "div",
    children: [Link("/gallery", "Gallery Page"), reactive(dataState, renderTable)],
  };
}
