const includes = Array.from(document.querySelectorAll("[data-include]"));

Promise.all(
  includes.map((el) =>
    fetch(el.dataset.include)
      .then((res) => res.text())
      .then((html) => {
        el.outerHTML = html;
      })
  )
).then(() => {
  document.dispatchEvent(new CustomEvent("partials:loaded"));
});
