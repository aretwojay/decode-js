import Link from "../components/router/link.js";

export default function PageTable() {
  const dataStringified = sessionStorage.getItem("zaza");
  const data = JSON.parse(dataStringified) || {};

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
      const text = input.value;
      const textNode = document.createTextNode(text);
      const td = input.parentNode;
      td.replaceChild(textNode, input);
      const key = td.dataset.key;
      data[key] = text;
      sessionStorage.setItem("zaza", JSON.stringify(data));
    });

    td.removeEventListener("click", onTdClick);
  }

  return {
    type: "div",
    children: [
      Link("/gallery", "Gallery Page"),
      /* {
        type: Link,
        attributes: [["url", "/gallery"], ["title", "Gallery Page"]],
      }, */
      {
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
      },
    ],
  };
}
