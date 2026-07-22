import PageGallery from "../pages/gallery-page.js";
import PageTable from "../pages/table-page.js";
import PageExperience from "../pages/experience-page.js";
import Page404 from "../pages/not-found-page.js";

export default {
  "/": PageExperience,
  "/table": PageTable,
  "/gallery": PageGallery,
  "/experiences": PageExperience,
  "*": Page404,
};
