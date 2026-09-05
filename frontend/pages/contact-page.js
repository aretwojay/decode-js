import Header from "../components/header.js";
import { renderContactSection } from "../utils/contact-section.js";
import { fetchProfile } from "../lib/api.js";
import { getTheme } from "../lib/theme.js";
import { resolveCandidateProfile } from "../utils/home.js";
import useOffline from "../lib/use-offline.js";

export default async function PageContact() {
  const offline = useOffline({
    defaultMessage: "Mode hors-ligne : serveur distant indisponible.",
  });

  const profile = await offline.execute(
    () => fetchProfile({ theme: getTheme() }),
    { fallback: null },
  );

  const candidateData = resolveCandidateProfile(profile, null);

  return {
    type: "div",
    attributes: [["class", ["page", "page-contact"]]],
    children: [
      Header("/contact"),
      {
        type: "main",
        children: [
          ...offline.getBannerChildren(),
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
