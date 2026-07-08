function HashRouter(rootElement, routes) {
  function refreshPage() {
    const pathname = window.location.hash.slice(1);
    const generator = routes[pathname] ?? routes["*"];
    if (rootElement.childNodes[0]) {
      rootElement.replaceChild(generator(), rootElement.childNodes[0]);
    } else {
      rootElement.appendChild(generator());
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
      rootElement.replaceChild(generator(), rootElement.childNodes[0]);
    } else {
      rootElement.appendChild(generator());
    }
  }
  window.addEventListener("popstate", refreshPage);
  window.addEventListener("pushstate", refreshPage);
  refreshPage();
}

function BrowserLink(url, title) {
  const a = document.createElement("a");
  a.href = url;
  const aTextNode = document.createTextNode(title);
  a.appendChild(aTextNode);
  a.addEventListener("click", (event) => {
    event.preventDefault();
    window.history.pushState({}, undefined, url);
    window.dispatchEvent(new Event("pushstate"));
  });
  return a;
}

const Link = BrowserLink;

function generateTablePage() {
  const div = document.createElement("div");
  const a = Link("/gallery", "Gallery Page");
  div.appendChild(a);

  const table = document.createElement("table");
  div.appendChild(table);
  const tbody = document.createElement("tbody");
  table.appendChild(tbody);
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

  for (let i = 0; i < 20; i++) {
    const line = document.createElement("tr");
    tbody.appendChild(line);
    for (let j = 0; j < 20; j++) {
      const td = document.createElement("td");
      line.appendChild(td);
      const key = `${i},${j}`;
      const text = data[key] ?? "Default";
      const textNode = document.createTextNode(text);
      td.appendChild(textNode);
      td.dataset.key = key;

      td.addEventListener("click", onTdClick);
    }
  }

  return div;
}

function generateGalleryPage() {
  const div = document.createElement("div");
  const a = Link("/table", "Table Page");
  div.appendChild(a);
  for (let i = 0; i < 100; i++) {
    const img = document.createElement("img");
    img.src = "https://picsum.photos/200?random=" + i;
    div.appendChild(img);
  }
  return div;
}

function generatePage404() {
  const h1 = document.createElement("h1");
  const textNode = document.createTextNode("Page 404");
  h1.appendChild(textNode);
  return h1;
}

const routes = {
  "/table": generateTablePage,
  "/gallery": generateGalleryPage,
  "*": generatePage404,
};

const root = document.getElementById("root");
BrowserRouter(root, routes);
