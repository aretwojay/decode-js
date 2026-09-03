import Header, { NavLink } from "../components/header.js";
import { fetchProfile, fetchProjects } from "../lib/api.js";
import { appStore } from "../lib/store.js";
import { getTheme } from "../lib/theme.js";
import {
  resolveCandidateProfile,
  resolveProjectsToDisplay,
  renderHeroSection,
  renderAboutSection,
  renderServicesSection,
  renderFeaturedSection,
  renderOverviewSection,
  renderSiteFooter,
} from "../utils/home.js";
import { renderContactSection } from "../utils/contact-section.js";

/**
 * Single-Page Landing View (T0014)
 * Complete root route featuring Hero, Featured Projects, Quick Actions, Theme Switcher, and Auth Status
 * @returns {Promise<Object>} Vanilla-engine structure object
 */
export default async function PageHome() {
  // 1. Fetch live data with graceful offline/store fallback
  let profile = null;
  let featuredProjects = [];
  let allProjects = [];

  const currentTheme = getTheme();

  try {
    const [fetchedProfile, fetchedFeatured, fetchedAll] = await Promise.all([
      fetchProfile({ theme: currentTheme }),
      fetchProjects({ featured: true, theme: currentTheme }),
      fetchProjects({ theme: currentTheme }),
    ]);

    profile = fetchedProfile;
    featuredProjects = fetchedFeatured || [];
    allProjects = fetchedAll || [];
  } catch (err) {
    console.warn("[PageHome] API offline, falling back to appStore:", err);
  }

  const storeState = appStore.getState ? appStore.getState() : appStore.get();
  const isIris = currentTheme === "iris";

  // Resolve Candidate Profile & Showcase Projects
  const candidateData = resolveCandidateProfile(profile, storeState?.profile);
  const { projectsToDisplay, hasFeatured } = resolveProjectsToDisplay(
    featuredProjects,
    allProjects,
    storeState?.projects
  );

  return {
    type: "div",
    attributes: [["class", ["page", "page-home"]]],
    children: [
      // Top Header & Navigation Bar
      Header("/"),

      // Main Content Area
      {
        type: "main",
        children: [
          // Hero Introduction Section
          renderHeroSection(candidateData),

          ...(isIris ? [renderAboutSection(candidateData)] : []),

          ...(isIris ? [renderServicesSection()] : []),

          // Featured Projects Showcase Section
          renderFeaturedSection(projectsToDisplay, hasFeatured),

          ...(isIris
            ? [
                renderContactSection({
                  headingTag: "h2",
                  phone: candidateData.candidatePhone,
                  email: candidateData.candidateEmail || undefined,
                  location: candidateData.candidateLocation,
                }),
              ]
            : []),

          // Quick Navigation & Overview Section
          ...(isIris
            ? []
            : [
                renderOverviewSection(),

                // Demos & Technical Modules Section
                {
                  type: "section",
                  attributes: [["class", ["section", "demos-section"]]],
                  children: [
                    {
                      type: "p",
                      attributes: [
                        [
                          "style",
                          [
                            ["color", "var(--text-muted)"],
                            ["fontSize", "0.85rem"],
                          ],
                        ],
                      ],
                      children: [
                        "Démos techniques du moteur Vanilla : ",
                        NavLink("/table", "Table Réactive", ["footer-link"]),
                        { type: "span", children: [" • "] },
                        NavLink("/gallery", "Galerie d'Images", ["footer-link"]),
                        { type: "span", children: [" • "] },
                        NavLink("/admin", "Espace Admin Strapi", ["footer-link"]),
                      ],
                    },
                  ],
                },
              ]),
        ],
      },

      // Site Footer
      renderSiteFooter(
        candidateData.candidateName,
        candidateData.githubUrl,
        candidateData.linkedinUrl
      ),
    ],
  };
}
