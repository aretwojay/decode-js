import PageHome from "../pages/home-page.js";
import PagePortfolio from "../pages/portfolio-page.js";
import PageProjectDetail from "../pages/project-detail-page.js";
import PageCV from "../pages/cv-page.js";
import PageContact from "../pages/contact-page.js";
import PageAdmin from "../pages/admin-page.js";
import PageTable from "../pages/table-page.js";
import PageGallery from "../pages/gallery-page.js";
import PageExperience from "../pages/experience-page.js";
import PageSignup from "../pages/signup-page.js";
import PageLogin from "../pages/login-page.js";
import PageMentionsLegales from "../pages/mentions-legales-page.js";
import PageConfidentialite from "../pages/confidentialite-page.js";
import Page404 from "../pages/not-found-page.js";

export default {
  "/": PageHome,
  "/portfolio": PagePortfolio,
  "/portfolio/:slug": PageProjectDetail,
  "/cv": PageCV,
  "/contact": PageContact,
  "/admin": PageAdmin,
  "/table": PageTable,
  "/gallery": PageGallery,
  "/experiences": PageExperience,
  "/signup": PageSignup,
  "/login": PageLogin,
  "/mentions-legales": PageMentionsLegales,
  "/confidentialite": PageConfidentialite,
  "*": Page404,
};

