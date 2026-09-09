import assert from "node:assert/strict";
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}) });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on("pageerror", error => errors.push(error.message));
const base = process.env.TEST_BASE_URL || "http://localhost:3000";
try {
  await page.goto(`${base}/play/discovery?pack=couple-adult&players=2`);
  await page.getByRole("button", { name: "Commencer", exact: true }).click();
  await page.getByRole("heading", { name: "Adultes uniquement · participation volontaire" }).waitFor();
  assert.equal(await page.getByRole("button", { name: "Afficher la carte", exact: true }).count(), 0);
  await page.getByRole("checkbox").nth(0).check();
  assert.equal(await page.getByRole("button", { name: "Afficher la carte", exact: true }).count(), 0);
  // The final checkbox disappears immediately once all players have consented.
  await page.getByRole("checkbox").nth(1).click();
  await page.getByRole("button", { name: "Afficher la carte", exact: true }).click();
  await page.getByRole("button", { name: "Masquer / garder pour moi", exact: true }).waitFor();
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem("Agorax-discovery-seen-v1") ?? "[]").length), 1);
  await page.getByRole("button", { name: "Passer / suite", exact: true }).click();
  await page.getByRole("heading", { name: "Joueur 2", exact: true }).waitFor();
  assert.equal(await page.getByRole("button", { name: "Masquer / garder pour moi", exact: true }).count(), 0);
  await page.getByRole("button", { name: "Retirer mon consentement / masquer", exact: true }).click();
  assert.equal(await page.getByRole("checkbox").count(), 2);
  await page.getByRole("button", { name: "Arrêter / changer de thème", exact: true }).click();
  await page.getByRole("button", { name: "English", exact: true }).click();
  await page.getByRole("button", { name: /Astro · Traditions quiz/ }).click();
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await page.getByRole("button", { name: "Show card", exact: true }).click();
  await page.getByRole("button", { name: "Show answer", exact: true }).click();
  assert.equal(await page.getByRole("button", { name: "Afficher la carte", exact: true }).count(), 0);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false);
  await page.goto(`${base}/play/local`);
  await page.getByRole("heading", { name: "Connection & well-being", exact: true }).waitFor();
  await page.getByRole("button", { name: "Everyone on their device", exact: true }).click();
  const href = await page.getByRole("link", { name: /Couples · Connection/ }).getAttribute("href");
  assert.match(href, /device=online/);
  assert.deepEqual(errors, []);
  console.log("PASS: 18+ gates, withdrawal, private handoff, English quiz, mobile layout, remote discovery links.");
} finally {
  await browser.close();
}
