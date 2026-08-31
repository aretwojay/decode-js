/**
 * Formats a date string to French locale (DD mois YYYY)
 * @param {string} dateStr - ISO date string
 * @returns {string}
 */
export function formatCVDate(dateStr) {
  if (!dateStr) return "";

  try {
    const date = new Date(dateStr);
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Intl.DateTimeFormat("fr-FR", options).format(date);
  } catch {
    return dateStr;
  }
}

/**
 * Formats a date period for CV display (e.g. "Jan 2020 - Present" in French)
 * @param {string} startDate - ISO date string
 * @param {string} endDate - ISO date string (optional)
 * @returns {string}
 */
export function formatCVPeriod(startDate, endDate) {
  const start = formatCVDate(startDate);
  if (!endDate) {
    return `${start} - Présent`;
  }
  const end = formatCVDate(endDate);
  return `${start} - ${end}`;
}

/**
 * Extracts plain text from description (handles Strapi blocks or plain strings)
 * @param {Array|string} description
 * @returns {string}
 */
export function formatDescriptionText(description) {
  if (!description) return "";
  if (typeof description === "string") return description;

  if (Array.isArray(description)) {
    return description
      .map((block) => {
        if (block?.children && Array.isArray(block.children)) {
          return block.children.map((child) => child.text || "").join("");
        }
        return "";
      })
      .filter(Boolean)
      .join("\n");
  }

  return "";
}

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function buildInterpolatedText(template, data) {
  return String(template).interpolate(data);
}

function resolveProfileValue(profile, key, fallback = "") {
  const value = profile?.[key];
  return value === undefined || value === null || value === ""
    ? fallback
    : value;
}

/**
 * Renders CV Profile Header Section
 * @param {Object} profile - Profile data from API or store
 * @returns {Object} Vanilla-engine structure
 */
export function renderProfileHeader(profile = {}) {
  const {
    avatar = null,
    nom = "Nom de candidat",
    titre = "Titre professionnel",
    bio = "",
    email = "",
    telephone = "",
    ville = "",
    lien_website = "",
    lien_github = "",
    lien_linkedin = "",
  } = profile;

  const contactItems = [
    email
      ? buildInterpolatedText("✉️ {{ profile.email }}", { profile: { email } })
      : "",
    telephone
      ? buildInterpolatedText("📞 {{ profile.telephone }}", {
          profile: { telephone },
        })
      : "",
    ville
      ? buildInterpolatedText("📍 {{ profile.ville }}", { profile: { ville } })
      : "",
    lien_website
      ? buildInterpolatedText("🌐 {{ profile.lien_website }}", {
          profile: { lien_website },
        })
      : "",
    lien_github
      ? buildInterpolatedText("GitHub {{ profile.lien_github }}", {
          profile: { lien_github },
        })
      : "",
    lien_linkedin
      ? buildInterpolatedText("LinkedIn {{ profile.lien_linkedin }}", {
          profile: { lien_linkedin },
        })
      : "",
  ].filter(Boolean);

  return {
    type: "header",
    attributes: [["class", ["cv-profile-header"]]],
    children: [
      avatar && avatar.url
        ? {
            type: "img",
            attributes: [
              ["src", avatar.url],
              ["alt", nom],
              ["class", ["cv-avatar"]],
            ],
          }
        : null,
      {
        type: "div",
        attributes: [["class", ["cv-profile-content"]]],
        children: [
          {
            type: "h1",
            attributes: [["class", ["cv-profile-name"]]],
            children: [nom],
          },
          {
            type: "p",
            attributes: [["class", ["cv-profile-title"]]],
            children: [titre],
          },
          bio && {
            type: "p",
            attributes: [["class", ["cv-profile-bio"]]],
            children: [bio],
          },
          {
            type: "div",
            attributes: [["class", ["cv-profile-contact"]]],
            children: contactItems.map((item) => ({
              type: "span",
              attributes: [["class", ["cv-contact-item"]]],
              children: [item],
            })),
          },
        ].filter(Boolean),
      },
    ].filter(Boolean),
  };
}

/**
 * Renders CV Formations/Education Section
 * @param {Array} formations - Array of formation objects
 * @returns {Object} Vanilla-engine structure
 */
export function renderFormationsSection(formations = []) {
  const normalized = toArray(formations);

  if (normalized.length === 0) {
    return {
      type: "section",
      attributes: [["class", ["cv-formations-section"]]],
      children: [
        { type: "h2", children: ["Formation"] },
        {
          type: "p",
          attributes: [["class", ["cv-empty-state"]]],
          children: ["Aucune formation enregistrée"],
        },
      ],
    };
  }

  return {
    type: "section",
    attributes: [["class", ["cv-formations-section"]]],
    children: [
      { type: "h2", children: ["Formation"] },
      {
        type: "div",
        attributes: [["class", ["cv-timeline"]]],
        children: normalized.map((formation) => ({
          type: "div",
          attributes: [["class", ["cv-timeline-item"]]],
          children: [
            {
              type: "div",
              attributes: [["class", ["cv-timeline-header"]]],
              children: [
                {
                  type: "h3",
                  attributes: [["class", ["cv-timeline-title"]]],
                  children: [formation.titre || "Formation"],
                },
                {
                  type: "span",
                  attributes: [["class", ["cv-timeline-period"]]],
                  children: [
                    formatCVPeriod(formation.date_debut, formation.date_fin),
                  ],
                },
              ],
            },
            formation.etablissement && {
              type: "p",
              attributes: [["class", ["cv-timeline-subtitle"]]],
              children: [formation.etablissement],
            },
            formation.description && {
              type: "p",
              attributes: [["class", ["cv-timeline-description"]]],
              children: [formatDescriptionText(formation.description)],
            },
          ].filter(Boolean),
        })),
      },
    ],
  };
}

/**
 * Renders CV Experiences Section
 * @param {Array} experiences - Array of experience objects
 * @returns {Object} Vanilla-engine structure
 */
export function renderExperiencesSection(experiences = []) {
  const normalized = toArray(experiences);

  if (normalized.length === 0) {
    return {
      type: "section",
      attributes: [["class", ["cv-experiences-section"]]],
      children: [
        { type: "h2", children: ["Expériences Professionnelles"] },
        {
          type: "p",
          attributes: [["class", ["cv-empty-state"]]],
          children: ["Aucune expérience enregistrée"],
        },
      ],
    };
  }

  return {
    type: "section",
    attributes: [["class", ["cv-experiences-section"]]],
    children: [
      { type: "h2", children: ["Expériences Professionnelles"] },
      {
        type: "div",
        attributes: [["class", ["cv-timeline"]]],
        children: normalized.map((exp) => ({
          type: "div",
          attributes: [["class", ["cv-timeline-item"]]],
          children: [
            {
              type: "div",
              attributes: [["class", ["cv-timeline-header"]]],
              children: [
                {
                  type: "h3",
                  attributes: [["class", ["cv-timeline-title"]]],
                  children: [exp.titre || "Expérience"],
                },
                {
                  type: "span",
                  attributes: [["class", ["cv-timeline-period"]]],
                  children: [formatCVPeriod(exp.date_debut, exp.date_fin)],
                },
              ],
            },
            exp.entreprise && {
              type: "p",
              attributes: [["class", ["cv-timeline-subtitle"]]],
              children: [exp.entreprise],
            },
            exp.description && {
              type: "p",
              attributes: [["class", ["cv-timeline-description"]]],
              children: [formatDescriptionText(exp.description)],
            },
            exp.competences &&
              Array.isArray(exp.competences) &&
              exp.competences.length > 0 && {
                type: "div",
                attributes: [["class", ["cv-skills-tags"]]],
                children: exp.competences.map((skill) => ({
                  type: "span",
                  attributes: [["class", ["cv-skill-tag"]]],
                  children: [skill.titre || skill],
                })),
              },
          ].filter(Boolean),
        })),
      },
    ],
  };
}

/**
 * Renders CV Skills/Competences Section
 * @param {Array} skills - Array of skill objects
 * @returns {Object} Vanilla-engine structure
 */
export function renderSkillsSection(skills = []) {
  const normalized = toArray(skills);

  if (normalized.length === 0) {
    return {
      type: "section",
      attributes: [["class", ["cv-skills-section"]]],
      children: [
        { type: "h2", children: ["Compétences"] },
        {
          type: "p",
          attributes: [["class", ["cv-empty-state"]]],
          children: ["Aucune compétence enregistrée"],
        },
      ],
    };
  }

  const skillsByLevel = {
    expert: [],
    avance: [],
    intermediaire: [],
    debutant: [],
  };

  normalized.forEach((skill) => {
    const level = String(skill.niveau || "debutant").toLowerCase();
    if (skillsByLevel[level]) {
      skillsByLevel[level].push(skill);
    }
  });

  const levelLabels = {
    expert: "Expert",
    avance: "Avancé",
    intermediaire: "Intermédiaire",
    debutant: "Débutant",
  };

  return {
    type: "section",
    attributes: [["class", ["cv-skills-section"]]],
    children: [
      { type: "h2", children: ["Compétences"] },
      ...Object.entries(skillsByLevel)
        .filter(([_, skillList]) => skillList.length > 0)
        .map(([level, skillList]) => ({
          type: "div",
          attributes: [["class", ["cv-skill-level"]]],
          children: [
            {
              type: "h3",
              attributes: [["class", ["cv-skill-level-title"]]],
              children: [levelLabels[level]],
            },
            {
              type: "div",
              attributes: [["class", ["cv-skills-grid"]]],
              children: skillList.map((skill) => ({
                type: "div",
                attributes: [["class", ["cv-skill-item"]]],
                children: [skill.titre || "Compétence"],
              })),
            },
          ],
        })),
    ],
  };
}

/**
 * Build a CV template based on the existing interpolate primitive.
 * This keeps the implementation aligned with the repo's contract and shows
 * the real data injection expected by T0017.
 */
export function renderCVTemplate(state = {}) {
  const profile = state.profile || {};
  const formations = toArray(state.formations);
  const experiences = toArray(state.experiences);
  const skills = toArray(state.skills);
  const themeName = state.theme || "iris";

  const safeProfile = {
    nom: resolveProfileValue(profile, "nom", "Candidat"),
    titre: resolveProfileValue(profile, "titre", "Titre professionnel"),
    bio: resolveProfileValue(
      profile,
      "bio",
      "Aucune bio disponible pour le moment.",
    ),
    email: resolveProfileValue(profile, "email", ""),
    ville: resolveProfileValue(profile, "ville", ""),
    telephone: resolveProfileValue(profile, "telephone", ""),
  };

  const data = {
    profile: safeProfile,
    formations,
    experiences,
    skills,
    themeName,
  };

  if (state.loading) {
    return {
      type: "section",
      attributes: [["class", ["cv-template-shell", "cv-status-shell"]]],
      children: [
        { type: "h2", children: ["Chargement du CV…"] },
        {
          type: "p",
          attributes: [["class", ["cv-empty-state"]]],
          children: ["Synchronisation des données Strapi / store en cours."],
        },
      ],
    };
  }

  if (state.error) {
    return {
      type: "section",
      attributes: [
        ["class", ["cv-template-shell", "cv-status-shell", "cv-error-shell"]],
      ],
      children: [
        { type: "h2", children: ["Erreur de chargement"] },
        {
          type: "p",
          children: [
            buildInterpolatedText("{{ state.error }}", {
              state: { error: state.error },
            }),
          ],
        },
      ],
    };
  }

  const profileLead = buildInterpolatedText(
    "{{ profile.nom }} · {{ profile.titre }} · {{ profile.email }} · {{ profile.ville }}",
    data,
  );
  const profileSummary = buildInterpolatedText("{{ profile.bio }}", data);

  const formationList = formations.length
    ? formations.map((formation) => {
        const formationData = {
          formation: {
            ...formation,
            date_fin: formation.date_fin || "Présent",
          },
        };
        return {
          type: "li",
          children: [
            buildInterpolatedText(
              "{{ formation.titre }} · {{ formation.etablissement }} · {{ formation.date_debut }} → {{ formation.date_fin }}",
              formationData,
            ),
          ],
        };
      })
    : [{ type: "li", children: ["Aucune formation enregistrée."] }];

  const experienceList = experiences.length
    ? experiences.map((exp) => {
        const expData = {
          exp: {
            ...exp,
            date_fin: exp.date_fin || "Présent",
          },
        };
        return {
          type: "li",
          children: [
            buildInterpolatedText(
              "{{ exp.titre }} · {{ exp.entreprise }} · {{ exp.date_debut }} → {{ exp.date_fin }}",
              expData,
            ),
          ],
        };
      })
    : [{ type: "li", children: ["Aucune expérience enregistrée."] }];

  const skillList = skills.length
    ? skills.map((skill) => ({
        type: "li",
        children: [
          buildInterpolatedText("{{ skill.titre }} ({{ skill.niveau }})", {
            skill,
          }),
        ],
      }))
    : [{ type: "li", children: ["Aucune compétence enregistrée."] }];

  return {
    type: "section",
    attributes: [["class", ["cv-template-shell"]]],
    children: [
      {
        type: "header",
        attributes: [["class", ["cv-profile-header"]]],
        children: [
          {
            type: "div",
            attributes: [["class", ["cv-profile-content"]]],
            children: [
              {
                type: "p",
                attributes: [["class", ["cv-kicker"]]],
                children: [
                  buildInterpolatedText("Thème {{ themeName }}", data),
                ],
              },
              {
                type: "h1",
                attributes: [["class", ["cv-profile-name"]]],
                children: [buildInterpolatedText("{{ profile.nom }}", data)],
              },
              {
                type: "p",
                attributes: [["class", ["cv-profile-title"]]],
                children: [buildInterpolatedText("{{ profile.titre }}", data)],
              },
              {
                type: "p",
                attributes: [["class", ["cv-profile-bio"]]],
                children: [profileSummary],
              },
              {
                type: "div",
                attributes: [["class", ["cv-profile-contact"]]],
                children: [
                  safeProfile.email
                    ? {
                        type: "span",
                        attributes: [["class", ["cv-contact-item"]]],
                        children: [
                          buildInterpolatedText("✉️ {{ profile.email }}", data),
                        ],
                      }
                    : null,
                  safeProfile.ville
                    ? {
                        type: "span",
                        attributes: [["class", ["cv-contact-item"]]],
                        children: [
                          buildInterpolatedText("📍 {{ profile.ville }}", data),
                        ],
                      }
                    : null,
                  safeProfile.telephone
                    ? {
                        type: "span",
                        attributes: [["class", ["cv-contact-item"]]],
                        children: [
                          buildInterpolatedText(
                            "📞 {{ profile.telephone }}",
                            data,
                          ),
                        ],
                      }
                    : null,
                ].filter(Boolean),
              },
            ],
          },
        ],
      },
      { type: "hr", attributes: [["class", ["cv-divider"]]] },
      {
        type: "section",
        attributes: [["class", ["cv-section-block"]]],
        children: [
          { type: "h2", children: ["Présentation"] },
          { type: "p", children: [profileLead] },
        ],
      },
      { type: "hr", attributes: [["class", ["cv-divider"]]] },
      {
        type: "section",
        attributes: [["class", ["cv-section-block"]]],
        children: [
          { type: "h2", children: ["Formation"] },
          { type: "ul", children: formationList },
        ],
      },
      { type: "hr", attributes: [["class", ["cv-divider"]]] },
      {
        type: "section",
        attributes: [["class", ["cv-section-block"]]],
        children: [
          { type: "h2", children: ["Expériences professionnelles"] },
          { type: "ul", children: experienceList },
        ],
      },
      { type: "hr", attributes: [["class", ["cv-divider"]]] },
      {
        type: "section",
        attributes: [["class", ["cv-section-block"]]],
        children: [
          { type: "h2", children: ["Compétences"] },
          { type: "ul", children: skillList },
        ],
      },
    ],
  };
}

/**
 * CV Live Preview Reactive Render Helper (State Management)
 * @param {Object} state - Current appStore state
 * @returns {Object} Vanilla-engine structure object
 */
export function renderCVPreview(state) {
  const { profile = {}, skills = [], experiences = [] } = state || {};
  const previewData = { profile, skills, experiences };

  return {
    type: "section",
    attributes: [["class", ["cv-live-preview"]]],
    children: [
      {
        type: "h2",
        children: [
          buildInterpolatedText("Aperçu live — {{ profile.nom }}", previewData),
        ],
      },
      {
        type: "p",
        children: [buildInterpolatedText("{{ profile.titre }}", previewData)],
      },
      {
        type: "p",
        children: [
          buildInterpolatedText("{{ profile.bio }}", {
            profile: { ...profile, bio: profile.bio || "(Bio vide)" },
          }),
        ],
      },
      {
        type: "ul",
        children: skills.map((skill) => ({
          type: "li",
          children: [
            buildInterpolatedText("{{ skill.titre }} ({{ skill.niveau }})", {
              skill,
            }),
          ],
        })),
      },
      {
        type: "ul",
        children: experiences.map((exp) => ({
          type: "li",
          children: [
            buildInterpolatedText("{{ exp.titre }} @ {{ exp.entreprise }}", {
              exp,
            }),
          ],
        })),
      },
    ],
  };
}
