// scratch/verify_theme_system.mjs
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

console.log("\n=======================================================");
console.log("   VÉRIFICATION : Système Thème par Défaut Portfolio   ");
console.log("=======================================================\n");

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  [FAIL] ${name}`);
    console.error(`         ${err.message}`);
    failed++;
  }
}

async function asyncTest(name, fn) {
  try {
    await fn();
    console.log(`  [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  [FAIL] ${name}`);
    console.error(`         ${err.message}`);
    failed++;
  }
}

// 1. Check Header does not include on-the-fly ThemeSwitcher
test("Header does not render on-the-fly ThemeSwitcher", () => {
  const headerSrc = fs.readFileSync("frontend/components/header.js", "utf-8");
  assert.ok(!headerSrc.includes("import ThemeSwitcher"), "Header must not import ThemeSwitcher");
  assert.ok(!headerSrc.includes("ThemeSwitcher()"), "Header must not call ThemeSwitcher()");
  assert.ok(headerSrc.includes("MobileMenuToggle()"), "Header must preserve MobileMenuToggle");
  assert.ok(headerSrc.includes("logo"), "Header must preserve logo");
  assert.ok(headerSrc.includes("nav"), "Header must preserve nav");
});

// 2. Check ProfileForm in admin-profile.js has live theme selection
test("admin-profile.js enables instant theme application on change", () => {
  const profileSrc = fs.readFileSync("frontend/utils/admin/admin-profile.js", "utf-8");
  assert.ok(profileSrc.includes('["id", "profile-theme"]'), "Must have profile-theme select");
  assert.ok(profileSrc.includes('"change"'), "Must listen to change event on select");
  assert.ok(profileSrc.includes("setTheme("), "Must call setTheme on change and submit");
  assert.ok(profileSrc.includes("showToast("), "Must display feedback toast");
});

// 3. Unit test theme.js functions with mocked DOM
await asyncTest("theme.js applies theme stylesheet and synchronizes from profile", async () => {
  const headChildren = [];
  const mockLink = {
    id: "",
    rel: "",
    href: "",
  };

  global.document = {
    body: { dataset: {} },
    head: {
      appendChild(el) {
        headChildren.push(el);
      },
    },
    getElementById(id) {
      if (id === "theme-stylesheet") return mockLink.id ? mockLink : null;
      return null;
    },
    createElement(tag) {
      if (tag === "link") return mockLink;
      return {};
    },
  };

  const localStorageData = new Map();
  global.localStorage = {
    getItem(key) {
      return localStorageData.get(key) || null;
    },
    setItem(key, val) {
      localStorageData.set(key, String(val));
    },
    removeItem(key) {
      localStorageData.delete(key);
    },
  };

  const { getTheme, setTheme, applyTheme, syncThemeFromProfile, AvailablesThemes } = await import(
    `../frontend/lib/theme.js?t=${Date.now()}`
  );

  assert.deepEqual(AvailablesThemes, ["iris", "yaniss", "ruben"]);

  // Test applyTheme
  applyTheme("yaniss");
  assert.equal(document.body.dataset.theme, "yaniss");
  assert.equal(mockLink.href, "/themes/yaniss.css");

  // Test setTheme
  setTheme("iris");
  assert.equal(getTheme(), "iris");
  assert.equal(document.body.dataset.theme, "iris");
  assert.equal(mockLink.href, "/themes/iris.css");
  assert.equal(localStorage.getItem("site-theme"), "iris");

  // Test syncThemeFromProfile
  syncThemeFromProfile({ theme: "ruben" });
  assert.equal(getTheme(), "ruben");
  assert.equal(document.body.dataset.theme, "ruben");
  assert.equal(mockLink.href, "/themes/ruben.css");
});

console.log("\n-------------------------------------------------------");
console.log(`  RÉSULTATS : ${passed} passés, ${failed} échoués`);
console.log("-------------------------------------------------------\n");

if (failed > 0) {
  process.exit(1);
}
