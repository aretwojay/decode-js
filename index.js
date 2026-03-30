const generateStructure = function (structure) {
  const element = document.createElement(structure.type);
  if (structure.attributes) {
    for (let attribute of structure.attributes) {
      if (attribute[0] === "class") {
        for (let className of attribute[1]) {
          element.classList.add(className);
        }
      } else if (attribute[0] === "style") {
        const customStyle = Object.fromEntries(attribute[1]);
        element.style = Object.assign(element.style, customStyle);
      } else if (attribute[0].startsWith("data-")) {
        const dataKey = attribute[0].replace("data-", "");
        element.dataset[dataKey] = attribute[1];
      } else {
        element.setAttribute(attribute[0], attribute[1]);
      }
    }
  }

  if (structure.events) {
    for (let event of structure.events) {
      element.addEventListener(event[0], event[1]);
    }
  }

  if (structure.children) {
    for (let child of structure.children) {
      let childElement;
      if (typeof child === "string") {
        childElement = document.createTextNode(child);
      } else {
        childElement = generateStructure(child);
      }
      element.appendChild(childElement);
    }
  }

  return element;
};

function HashRouter(rootElement, routes) {
  function refreshPage() {
    const pathname = window.location.hash.slice(1);
    const generator = routes[pathname] ?? routes["*"];
    if (rootElement.childNodes[0]) {
      rootElement.replaceChild(
        generateStructure(generator()),
        rootElement.childNodes[0],
      );
    } else {
      rootElement.appendChild(generateStructure(generator()));
    }
  }
  window.addEventListener("hashchange", refreshPage);
  refreshPage();
}

function HashLink(url, title) {
  const a = document.createElement("a");
  a.href = "#" + url;
  const aTextNode = document.createTextNode(title);
  a.appendChild(aTextNode);
  return a;
}

function BrowserRouter(rootElement, routes) {
  function refreshPage() {
    const pathname = window.location.pathname;
    const generator = routes[pathname] ?? routes["*"];
    if (rootElement.childNodes[0]) {
      rootElement.replaceChild(
        generateStructure(generator()),
        rootElement.childNodes[0],
      );
    } else {
      rootElement.appendChild(generateStructure(generator()));
    }
  }
  window.addEventListener("popstate", refreshPage);
  window.addEventListener("pushstate", refreshPage);
  refreshPage();
}

function BrowserLink(url, title) {
  return {
    type: "a",
    attributes: [["href", url]],
    children: [title],
    events: [
      [
        "click",
        (event) => {
          event.preventDefault();
          window.history.pushState({}, undefined, url);
          window.dispatchEvent(new Event("pushstate"));
        },
      ],
    ],
  };
}

const Link = BrowserLink;

function PageTable() {
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

function PageGallery() {
  return {
    type: "div",
    attributes: [
      ["class", ["foo", "frezger"]],
      ["id", "gallery"],
    ],
    children: [
      Link("/table", "Table Page"),
      {
        type: "div",
        attributes: [["id", "gallery-content"]],
        children: Array.from({ length: 100 }, (_, index) => ({
          type: "img",
          attributes: [["src", "https://picsum.photos/200?random=" + index]],
        })),
      },
    ],
  };
}

const rootElement = document.getElementById("root");
const routes = {
  "/table": PageTable,
  "/gallery": PageGallery,
  "*": () => ({
    type: "h1",
    children: ["Page 404"],
  }),
};
/* rootElement.appendChild(generateStructure({
  type: BrowserRouter,
  attributes: [["routes", routes]],
})); */
BrowserRouter(rootElement, routes);
