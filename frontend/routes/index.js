import PageHome from "../pages/home-page.js";
import PageRegister from "../pages/register-page.js";
import PageLogin from "../pages/login-page.js";
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
import Page404 from "../pages/not-found-page.js";

export default {
  "/": PageHome,
  "/inscription": PageRegister,
  "/connexion": PageLogin,
  "/portfolio": PagePortfolio,
  "/portfolio/:slug": PageProjectDetail,
  "/cv": PageCV,
  "/contact": PageContact,
  "/dashboard": PageAdmin,
  "/table": PageTable,
  "/gallery": PageGallery,
  "/experiences": PageExperience,
  "/signup": PageSignup,
  "/login": PageLogin,
  "*": Page404,
};

