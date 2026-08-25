import { getExperiences } from "../lib/api.js";
import Link from "../components/router/link.js";

export default async function PageExperience() {
  const experiences = await getExperiences();

  return {
    type: "div",
    attributes: [["id", "experiences"]],
    children: [
      Link("/gallery", "Gallery Page"),
      {
        type: "div",
        attributes: [["class", ["experience-list"]]],
        children: experiences.map((exp) => ({
          type: "div",
          attributes: [["class", ["experience-card"]]],
          children: [
            { type: "h3", children: [exp.titre] },
            { type: "p", children: [exp.entreprise] },
            { type: "p", children: [exp.description ?? ""] },
          ],
        })),
      },
    ],
  };
}