import PageGallery from "../pages/gallery-page.js";
import PageTable from "../pages/table-page.js";
import Page404 from "../pages/not-found-page.js";

export default {
  "/table": PageTable,
  "/gallery": PageGallery,
  "*": Page404,
};
