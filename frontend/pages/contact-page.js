import Header from "../components/header.js";
import { renderContactSection } from "../utils/contact-section.js";

export default function PageContact() {
  return {
    type: "div",
    attributes: [["class", ["page", "page-contact"]]],
    children: [
      Header("/contact"),
      {
        type: "main",
        children: [renderContactSection({ headingTag: "h1" })],
      },
    ],
  };
}
