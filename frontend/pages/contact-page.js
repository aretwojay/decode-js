import Header from "../components/header.js";
import { renderContactSection } from "../utils/contact-section.js";
import { fetchProfile } from "../lib/api.js";
import { getTheme } from "../lib/theme.js";
import { resolveCandidateProfile } from "../utils/home.js";

export default async function PageContact() {
  let profile = null;
  try {
    profile = await fetchProfile({ theme: getTheme() });
  } catch (err) {
    console.warn("[PageContact] API offline:", err);
  }

  const candidateData = resolveCandidateProfile(profile, null);

  return {
    type: "div",
    attributes: [["class", ["page", "page-contact"]]],
    children: [
      Header("/contact"),
      {
        type: "main",
        children: [
          renderContactSection({
            headingTag: "h1",
            phone: candidateData.candidatePhone,
            email: candidateData.candidateEmail || undefined,
            location: candidateData.candidateLocation,
          }),
        ],
      },
    ],
  };
}
