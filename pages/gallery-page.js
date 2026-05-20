import Link from "../components/router/link.js";

export default function PageGallery() {
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
