// scratch/verify_auth_ui.mjs
import assert from "node:assert/strict";
import fs from "node:fs";

console.log("\n=======================================================");
console.log("   VÉRIFICATION : Amélioration UI Connexion & Inscription ");
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

test("Header navigation links are translated to French", () => {
  const headerSrc = fs.readFileSync("frontend/components/header.js", "utf-8");
  assert.ok(headerSrc.includes('"Connexion"'), "Must have 'Connexion' nav link");
  assert.ok(headerSrc.includes('"Inscription"'), "Must have 'Inscription' nav link");
  assert.ok(!headerSrc.includes('"Login"'), "Must not have 'Login' English nav link");
  assert.ok(!headerSrc.includes('"Signup"'), "Must not have 'Signup' English nav link");
});

test("Login page contains modern card layout and accessible form controls", () => {
  const loginSrc = fs.readFileSync("frontend/pages/login-page.js", "utf-8");
  assert.ok(loginSrc.includes('"auth-card"'), "Must include auth-card container");
  assert.ok(loginSrc.includes('"auth-form"'), "Must include auth-form class");
  assert.ok(loginSrc.includes('"form-control"'), "Must include form-control inputs");
  assert.ok(loginSrc.includes('"login-identifier"'), "Must link label with id login-identifier");
  assert.ok(loginSrc.includes('"login-password"'), "Must link label with id login-password");
  assert.ok(loginSrc.includes('"current-password"'), "Must include autocomplete current-password");
  assert.ok(loginSrc.includes('Footer()'), "Must render Footer component");
  assert.ok(!loginSrc.includes('style: [["display", "flex"]]'), "Must not use raw inline style flex containers");
});

test("Signup page contains modern card layout and accessible form controls", () => {
  const signupSrc = fs.readFileSync("frontend/pages/signup-page.js", "utf-8");
  assert.ok(signupSrc.includes('"auth-card"'), "Must include auth-card container");
  assert.ok(signupSrc.includes('"auth-form"'), "Must include auth-form class");
  assert.ok(signupSrc.includes('"form-control"'), "Must include form-control inputs");
  assert.ok(signupSrc.includes('"signup-username"'), "Must link label with id signup-username");
  assert.ok(signupSrc.includes('"signup-email"'), "Must link label with id signup-email");
  assert.ok(signupSrc.includes('"signup-password"'), "Must link label with id signup-password");
  assert.ok(signupSrc.includes('"new-password"'), "Must include autocomplete new-password");
  assert.ok(signupSrc.includes('Footer()'), "Must render Footer component");
  assert.ok(!signupSrc.includes('style: [["display", "flex"]]'), "Must not use raw inline style flex containers");
});

test("index.css defines complete responsive auth card styles", () => {
  const css = fs.readFileSync("frontend/index.css", "utf-8");
  assert.ok(css.includes(".auth-main"), "Must define .auth-main");
  assert.ok(css.includes(".auth-card"), "Must define .auth-card");
  assert.ok(css.includes(".btn-auth-submit"), "Must define .btn-auth-submit");
  assert.ok(css.includes(".auth-feedback-error"), "Must define .auth-feedback-error");
  assert.ok(css.includes(".auth-feedback-loading"), "Must define .auth-feedback-loading");
});

console.log("\n-------------------------------------------------------");
console.log(`  RÉSULTATS : ${passed} passés, ${failed} échoués`);
console.log("-------------------------------------------------------\n");

if (failed > 0) {
  process.exit(1);
}
