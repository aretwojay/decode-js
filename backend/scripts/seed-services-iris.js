/**
 * One-off seed: migrates the hardcoded "Ce que je fais" cards into the CMS
 * for the iris profil, so the home page reads them from Strapi.
 * Usage: node scripts/seed-services-iris.js
 */
const strapiFactory = require("@strapi/strapi");

const SERVICES = [
  {
    titre: "Langages & Frameworks",
    description:
      "Les technos avec lesquelles je construis, du front au back. HTML, CSS, JavaScript, Angular, Vue.js, Node.js, PHP / Laravel, PostgreSQL, MySQL.",
    icone: "code",
    ordre: 1,
    affichage_large: false,
  },
  {
    titre: "Interfaces graphiques & multimédia",
    description:
      "Je conçois et j'intègre des interfaces soignées, du visuel jusqu'au code, sur tous les écrans. Figma, Canva, intégration responsive, maquettage, visuels & mise en page.",
    icone: "palette",
    ordre: 2,
    affichage_large: false,
  },
  {
    titre: "SEO & performance",
    description:
      "Je construis des sites avec une structure propre et des pages rapides, deux bases essentielles pour être bien référencé sur Google.",
    icone: "search",
    ordre: 3,
    affichage_large: false,
  },
  {
    titre: "Déploiement & cloud",
    description:
      "Développer une appli, c'est bien ; la mettre en ligne et la faire tourner de façon fiable, c'est ce qui compte vraiment. Mise en production de bout en bout : hébergement, services cloud, envoi d'emails et sécurisation de l'application une fois en ligne. Git / GitHub • Docker • Mise en production • Webhooks • Sécurité des accès.",
    icone: "cloud",
    ordre: 4,
    affichage_large: true,
  },
];

async function main() {
  const app = await strapiFactory.createStrapi({ distDir: "./dist" }).load();
  try {
    const profils = await app.documents("api::profil.profil").findMany({
      filters: { theme: "iris" },
      status: "published",
    });

    if (!profils.length) {
      console.error("Aucun profil avec theme=iris trouvé. Rien n'a été créé.");
      process.exitCode = 1;
      return;
    }

    const profilDocId = profils[0].documentId;

    const existing = await app.documents("api::service.service").findMany({
      filters: { profil: { documentId: profilDocId } },
      status: "published",
    });

    if (existing.length > 0) {
      console.log(`Déjà ${existing.length} service(s) publié(s) pour ce profil, rien à faire.`);
      return;
    }

    for (const service of SERVICES) {
      await app.documents("api::service.service").create({
        data: { ...service, profil: profilDocId, statut: "publie" },
        status: "published",
      });
    }

    console.log(`${SERVICES.length} services créés et publiés pour le profil iris (${profilDocId}).`);
  } finally {
    await app.destroy();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
