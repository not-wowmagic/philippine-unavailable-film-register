/* Static build for The Unseen. Node standard library only. */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");
const ASSETS = path.join(ROOT, "assets");
const FONTS = path.join(ASSETS, "fonts");
const DATA = path.join(ROOT, "data");
const SITE_URL = (process.env.SITE_URL || "").trim().replace(/\/+$/, "");

const STATUS_ORDER = ["banned", "withdrawn", "unreleased", "unavailable", "lost", "found", "partially_found"];
const CAUSE_ORDER = ["never_distributed", "distribution_ended", "rights_unclear", "archive_only", "no_known_rights_holder"];
const TYPE_ORDER = ["feature", "documentary", "short"];
const STATUS_LABELS = {
  banned: "Banned",
  withdrawn: "Withdrawn",
  unreleased: "Unreleased",
  unavailable: "Unavailable",
  lost: "Lost",
  found: "Found",
  partially_found: "Partially found",
};
const STATUS_DEFINITIONS = {
  banned: "A regulator or court blocked exhibition.",
  withdrawn: "Accepted or scheduled, then pulled before public screening.",
  unreleased: "Finished or partly finished, never publicly exhibited.",
  unavailable: "Screened publicly, with no current legal way to watch.",
  lost: "No known copy in any archive, studio or private collection.",
  found: "A copy has been located.",
  partially_found: "Part of a copy has been located.",
};
const CAUSE_LABELS = {
  never_distributed: "Never distributed",
  distribution_ended: "Distribution ended",
  rights_unclear: "Rights unclear",
  archive_only: "Archive only",
  no_known_rights_holder: "No known rights holder",
};
const CONFIDENCE_LABELS = { confirmed: "Confirmed", reported: "Reported", unverified: "Unverified" };
const TYPE_LABELS = { feature: "Feature", documentary: "Documentary", short: "Short", "short documentary": "Short documentary" };

const films = JSON.parse(fs.readFileSync(path.join(DATA, "films.json"), "utf8"));
const hard = JSON.parse(fs.readFileSync(path.join(DATA, "hard-to-find.json"), "utf8"));
const changelog = JSON.parse(fs.readFileSync(path.join(DATA, "changelog.json"), "utf8"));
const hardFilms = Array.isArray(hard.films) ? hard.films : [];
const FAVICON_DATA = fs.readFileSync(path.join(ROOT, "favicon.svg")).toString("base64");
const datasetChecked = films.reduce((latest, film) => {
  const value = film.availability_last_checked || "";
  return value > latest ? value : latest;
}, "");

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => {
    switch (character) {
      case "&": return "&amp;";
      case "<": return "&lt;";
      case ">": return "&gt;";
      case '"': return "&quot;";
      case "'": return "&#39;";
      default: return character;
    }
  });
}

function safeUrl(value, fallback = "#") {
  try {
    const url = new URL(String(value), "https://the-unseen.invalid/");
    if (url.protocol === "http:" || url.protocol === "https:") return url.href;
  } catch {}
  return fallback;
}

function prettyUrl(value) {
  if (!value) return "";
  let text = String(value).replace(/^https?:\/\//i, "").replace(/\/$/, "");
  if (text.length > 72) text = `${text.slice(0, 69)}…`;
  return text;
}

function normalize(value) {
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function formatDate(value) {
  if (!value) return "unknown";
  const parts = String(value).split("-");
  if (parts.length === 1) return parts[0];
  const year = Number(parts[0]);
  const month = Number(parts[1] || 1);
  const day = Number(parts[2] || 1);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return String(value);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (parts.length === 2) {
    return new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" }).format(date);
  }
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(date);
}

function formatShortDate(value) {
  if (!value) return "unknown";
  const parts = String(value).split("-");
  if (parts.length === 1) return parts[0];
  const year = Number(parts[0]);
  const month = Number(parts[1] || 1);
  const day = Number(parts[2] || 1);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return String(value);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (parts.length === 2) {
    return new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric", timeZone: "UTC" }).format(date);
  }
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(date);
}

function statusLabel(value) { return STATUS_LABELS[value] || capitalize(String(value || "unknown")); }
function causeLabel(value) { return CAUSE_LABELS[value] || capitalize(String(value || "unknown")); }
function confidenceLabel(value) { return CONFIDENCE_LABELS[value] || capitalize(String(value || "unknown")); }
function typeLabel(value) { return TYPE_LABELS[value] || capitalize(String(value || "unknown")); }
function capitalize(value) { return value ? value.charAt(0).toUpperCase() + value.slice(1) : value; }

function countBy(list, getValue) {
  const counts = new Map();
  for (const item of list) {
    const value = getValue(item);
    if (!value) continue;
    counts.set(value, (counts.get(value) || 0) + 1);
  }
  return counts;
}

function decadeOf(year) {
  if (!Number.isFinite(year)) return null;
  return `${Math.floor(year / 10) * 10}s`;
}

function isRecentlyChecked(value) {
  if (!value || !datasetChecked) return false;
  const checked = Date.parse(`${value}T00:00:00Z`);
  const reference = Date.parse(`${datasetChecked}T00:00:00Z`);
  if (Number.isNaN(checked) || Number.isNaN(reference)) return false;
  const days = (reference - checked) / 86400000;
  return days >= 0 && days <= 30;
}

function formatNumber(value) {
  return Number(value).toLocaleString("en-US");
}

function renderStats() {
  const counts = countBy(films, (film) => film.status);
  const items = [
    ["Unavailable", counts.get("unavailable") || 0],
    ["Banned", counts.get("banned") || 0],
    ["Lost", counts.get("lost") || 0],
    ["Found", counts.get("found") || 0],
    ["Partially found", counts.get("partially_found") || 0],
    ["Withdrawn", counts.get("withdrawn") || 0],
  ];
  return items.map(([label, value]) => `<div class="stat"><span class="stat__num">${value}</span><span class="stat__label">${escapeHtml(label)}</span></div>`).join("");
}

function renderFilterGroups() {
  const statusCounts = countBy(films, (film) => film.status);
  const causeCounts = countBy(films, (film) => film.cause);
  const decadeCounts = countBy(films, (film) => decadeOf(film.year));
  const typeCounts = countBy(films, (film) => film.type);
  const festivalCounts = new Map();
  for (const film of films) {
    const seen = new Set();
    for (const entry of film.festivals || []) {
      if (!entry || !entry.festival || seen.has(entry.festival)) continue;
      seen.add(entry.festival);
      festivalCounts.set(entry.festival, (festivalCounts.get(entry.festival) || 0) + 1);
    }
  }
  const decades = [...decadeCounts.keys()].filter(Boolean).sort((a, b) => Number.parseInt(a, 10) - Number.parseInt(b, 10));
  const types = TYPE_ORDER.filter((type) => typeCounts.has(type));
  const festivals = [...festivalCounts.keys()].sort((a, b) => a.localeCompare(b, "en"));
  const groups = [
    { name: "status", label: "Status", values: STATUS_ORDER, counts: statusCounts, labelFn: statusLabel },
    { name: "cause", label: "Cause", values: CAUSE_ORDER, counts: causeCounts, labelFn: causeLabel },
    { name: "decade", label: "Decade", values: decades, counts: decadeCounts, labelFn: (value) => value },
    { name: "type", label: "Type", values: types, counts: typeCounts, labelFn: typeLabel },
    { name: "festival", label: "Festival", values: festivals, counts: festivalCounts, labelFn: (value) => value },
  ];
  return groups
    .filter((group) => group.name !== "festival" || group.values.length > 0)
    .map((group) => {
      const chips = group.values.map((value) => {
        const count = group.counts.get(value) || 0;
        return `<button type="button" class="chip" data-group="${group.name}" data-value="${escapeHtml(value)}" data-zero="${count === 0 ? "true" : "false"}" aria-pressed="false">${escapeHtml(group.labelFn(value))} <span class="chip__count">${count}</span></button>`;
      }).join("");
      return `<fieldset class="filter-group" id="filter-${group.name}"><legend>${escapeHtml(group.label)}</legend><div class="chips">${chips}</div></fieldset>`;
    }).join("");
}

function cardHtml(film, index) {
  const screening = film.last_verified_screening ? formatShortDate(film.last_verified_screening.date) : "No screening recorded";
  const cause = film.cause ? `<span class="badge badge--cause">${escapeHtml(causeLabel(film.cause))}</span>` : "";
  const meta = [film.year ? String(film.year) : "", film.director ? `dir. ${film.director}` : ""].filter(Boolean).join(" · ");
  const festivals = [...new Set((film.festivals || []).map((entry) => entry.festival).filter(Boolean))];
  const search = normalize([film.title, film.original_title, film.director].filter(Boolean).join(" "));
  const attrs = [
    `data-film="${escapeHtml(film.id)}"`,
    `data-title="${escapeHtml(film.title)}"`,
    `data-search="${escapeHtml(search)}"`,
    `data-year="${film.year ?? ""}"`,
    `data-status="${escapeHtml(film.status)}"`,
    `data-cause="${escapeHtml(film.cause || "")}"`,
    `data-decade="${escapeHtml(decadeOf(film.year) || "")}"`,
    `data-type="${escapeHtml(film.type || "")}"`,
    `data-festivals="${escapeHtml(festivals.join("|"))}"`,
    `data-quote="${film.quoted_reason ? "true" : "false"}"`,
    `data-nocopy="${film.known_copy ? "false" : "true"}"`,
    `data-recent="${isRecentlyChecked(film.availability_last_checked) ? "true" : "false"}"`,
    `data-checked="${escapeHtml(film.availability_last_checked || "")}"`,
  ].join(" ");
  return `
    <article class="card status--${film.status}" aria-labelledby="card-title-${escapeHtml(film.id)}" ${attrs}>
      <div class="card__top">
        <span class="card__index">No. ${String(index).padStart(2, "0")}</span>
        <span class="card__stamp">${escapeHtml(statusLabel(film.status))}</span>
      </div>
      <div class="card__badges">
        <span class="badge badge--conf confidence--${film.confidence}">${escapeHtml(confidenceLabel(film.confidence))}</span>
        ${cause}
      </div>
      <h3 id="card-title-${escapeHtml(film.id)}">
        <a class="card__title" href="/film/${encodeURIComponent(film.id)}/">${escapeHtml(film.title)}</a>
      </h3>
      ${film.original_title ? `<p class="card__original">${escapeHtml(film.original_title)}</p>` : ""}
      <p class="card__meta">${escapeHtml(meta)}</p>
      <p class="card__reason">${escapeHtml(film.status_detail)}</p>
      <div class="card__foot">
        <div><span>Screened</span><span>${escapeHtml(screening)}</span></div>
        <a class="card__open" href="/film/${encodeURIComponent(film.id)}/">View record →</a>
      </div>
    </article>`;
}

function quoteHtml(film) {
  if (!film.quoted_reason) return "";
  return `<section class="quote-block"><p class="quote__label">Quoted reason</p><blockquote>"${escapeHtml(film.quoted_reason.text)}"</blockquote><footer>${escapeHtml(film.quoted_reason.attributed_to)} · <a href="${escapeHtml(safeUrl(film.quoted_reason.source_url))}" target="_blank" rel="noopener noreferrer">source</a></footer></section>`;
}

function watchHtml(film, fullDate) {
  if (!film.where_to_watch || film.where_to_watch.length === 0) {
    return `<div class="watch watch--finding"><p>No legal streaming, VOD or archive access was found as of ${escapeHtml(fullDate)}.</p></div>`;
  }
  const items = film.where_to_watch.map((entry) => `<li><div class="watch__platform">${escapeHtml(entry.platform)}</div><a href="${escapeHtml(safeUrl(entry.url))}" target="_blank" rel="noopener noreferrer">${escapeHtml(prettyUrl(entry.url))}</a>${entry.note ? `<p>${escapeHtml(entry.note)}</p>` : ""}</li>`).join("");
  return `<ul class="watch-list">${items}</ul><p class="watch__checked">Availability checked ${escapeHtml(fullDate)}.</p>`;
}

function sourcesHtml(film) {
  return (film.sources || []).map((source) => `<li><span class="source__publisher">${escapeHtml(source.publisher || "Source")}</span><a href="${escapeHtml(safeUrl(source.url))}" target="_blank" rel="noopener noreferrer">${escapeHtml(prettyUrl(source.url))}</a><span class="source__date">retrieved ${escapeHtml(formatShortDate(source.retrieved))}</span></li>`).join("");
}

function festivalsHtml(film) {
  if (!film.festivals || film.festivals.length === 0) return "None recorded";
  return `<ul>${film.festivals.map((entry) => `<li>${escapeHtml(entry.festival)}${entry.year ? ` ${entry.year}` : ""}${entry.section ? ` · ${escapeHtml(entry.section)}` : ""}</li>`).join("")}</ul>`;
}

function screeningHtml(film) {
  if (!film.last_verified_screening) return "<strong>No public screening recorded</strong>";
  const screening = film.last_verified_screening;
  return `<strong>${escapeHtml(formatDate(screening.date))}</strong><small>${escapeHtml(screening.venue || "venue unknown")}</small><a href="${escapeHtml(safeUrl(screening.source_url))}" target="_blank" rel="noopener noreferrer">screening source</a>`;
}

function knownCopyHtml(film) {
  if (!film.known_copy) return "<strong>No copy recorded</strong>";
  const copy = film.known_copy;
  return `<strong>${escapeHtml(copy.holder || "Holder unknown")}</strong><small>${escapeHtml(copy.format || "Format unknown")} · ${escapeHtml(copy.access || "Access unknown")}</small>`;
}

function detailHtml(film) {
  const fullDate = formatDate(film.availability_last_checked);
  const runtime = film.runtime_min ? `${film.runtime_min} min` : "";
  const type = typeLabel(film.type);
  const metaParts = [film.year ? String(film.year) : "", film.director ? `dir. ${film.director}` : "", runtime, type].filter(Boolean);
  const metaLine = metaParts.join(" · ");
  return `
    <header class="detail__head status--${film.status}">
      <div class="detail__kicker">
        <span class="stamp">${escapeHtml(statusLabel(film.status))}</span>
        <span class="badge badge--conf confidence--${film.confidence}">${escapeHtml(confidenceLabel(film.confidence))}</span>
        ${film.cause ? `<span class="badge badge--cause">${escapeHtml(causeLabel(film.cause))}</span>` : ""}
      </div>
      <h1 id="detail-title">${escapeHtml(film.title)}</h1>
      ${film.original_title ? `<p class="detail__original">${escapeHtml(film.original_title)}</p>` : ""}
      ${metaLine ? `<p class="detail__meta">${escapeHtml(metaLine)}</p>` : ""}
      <p class="detail__lede">${escapeHtml(film.status_detail)}</p>
    </header>
    <div class="detail__grid">
      <div class="detail__main">
        <section class="detail-section"><h3>Status</h3><p>${escapeHtml(STATUS_DEFINITIONS[film.status] || "")}</p><p class="muted">Availability checked ${escapeHtml(fullDate)}.</p></section>
        ${quoteHtml(film)}
        <section class="detail-section"><h3>Where to watch</h3>${watchHtml(film, fullDate)}</section>
        <section class="detail-section"><h3>Details</h3><dl class="record-grid">${film.original_title ? `<div><dt>Original title</dt><dd>${escapeHtml(film.original_title)}</dd></div>` : ""}<div><dt>Festivals</dt><dd>${festivalsHtml(film)}</dd></div><div><dt>Record ID</dt><dd class="mono">${escapeHtml(film.id)}</dd></div></dl></section>
        ${film.notes ? `<section class="detail-section"><h3>Notes</h3><p>${escapeHtml(film.notes)}</p></section>` : ""}
        <section class="detail-section"><h3>Sources</h3><ol class="sources">${sourcesHtml(film)}</ol></section>
      </div>
      <aside class="detail__aside" aria-label="Record summary">
        <section class="fact"><span>Last verified screening</span>${screeningHtml(film)}</section>
        <section class="fact"><span>Known copy</span>${knownCopyHtml(film)}</section>
      </aside>
    </div>`;
}

function changelogHtml() {
  return [...changelog].sort((a, b) => b.date.localeCompare(a.date)).map((item) => {
    const fromLabel = item.fromLabel || (item.from ? statusLabel(item.from) : "None");
    const toLabel = item.toLabel || statusLabel(item.to);
    const source = item.source ? `<a class="timeline__source" href="${escapeHtml(safeUrl(item.source.url))}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.source.publisher)} ↗</a>` : "";
    return `<article class="timeline__item"><p class="timeline__date">${escapeHtml(formatShortDate(item.date))}</p><div class="timeline__headline"><h3 class="timeline__title"><a href="/film/${encodeURIComponent(item.filmId)}/">${escapeHtml(item.title)}</a></h3><span class="timeline__transition"><span class="from">${escapeHtml(fromLabel)}</span><span aria-hidden="true">→</span><span class="to">${escapeHtml(toLabel)}</span></span></div><p class="timeline__note">${escapeHtml(item.note)}</p>${source}</article>`;
  }).join("");
}

function hardRowsHtml() {
  return hardFilms.map((film, index) => {
    const imdb = film.imdb ? `<a href="https://www.imdb.com/title/${encodeURIComponent(film.imdb)}/" target="_blank" rel="noopener noreferrer">IMDb ↗</a>` : "";
    return `<tr><td>${String(index + 1).padStart(4, "0")}</td><td>${escapeHtml(film.title)}</td><td>${film.year ?? "unknown"}</td><td><span class="unverified__links"><a href="${escapeHtml(safeUrl(film.source))}" target="_blank" rel="noopener noreferrer">Wikidata ↗</a>${imdb}</span></td></tr>`;
  }).join("");
}

function sha(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex").slice(0, 10);
}

function buildAssets() {
  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(path.join(DIST, "assets", "fonts"), { recursive: true });

  const fontMap = new Map();
  for (const file of fs.readdirSync(FONTS).filter((name) => name.endsWith(".woff2"))) {
    const buffer = fs.readFileSync(path.join(FONTS, file));
    const hash = sha(buffer);
    const hashed = file.replace(/\.woff2$/, `.${hash}.woff2`);
    fs.writeFileSync(path.join(DIST, "assets", "fonts", hashed), buffer);
    fontMap.set(file, hashed);
  }
  for (const file of fs.readdirSync(FONTS).filter((name) => name.endsWith(".txt"))) {
    fs.copyFileSync(path.join(FONTS, file), path.join(DIST, "assets", "fonts", file));
  }

  let css = fs.readFileSync(path.join(ROOT, "styles.css"), "utf8");
  css = css.replace(/url\("assets\/fonts\/([^"]+)"\)/g, (match, file) => {
    const hashed = fontMap.get(file);
    if (!hashed) throw new Error(`Missing font: ${file}`);
    return `url("fonts/${hashed}")`;
  });
  const cssHash = sha(Buffer.from(css));
  const cssName = `styles.${cssHash}.css`;
  fs.writeFileSync(path.join(DIST, "assets", cssName), css);

  const js = fs.readFileSync(path.join(ASSETS, "site.js"), "utf8");
  const jsHash = sha(Buffer.from(js));
  const jsName = `site.${jsHash}.js`;
  fs.writeFileSync(path.join(DIST, "assets", jsName), js);

  fs.copyFileSync(path.join(ROOT, "favicon.svg"), path.join(DIST, "favicon.svg"));

  fs.writeFileSync(path.join(DIST, "_headers"), `/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), geolocation=(), microphone=()
  Content-Security-Policy: default-src 'self'; script-src 'self' 'inline-speculation-rules'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'
  Cache-Control: public, max-age=0, must-revalidate

/assets/*
  Cache-Control: public, max-age=31536000, immutable
`);

  return {
    cssHref: `/assets/${cssName}`,
    jsHref: `/assets/${jsName}`,
    fontHref: (file) => `/assets/fonts/${fontMap.get(file)}`,
  };
}

function head({ title, description, ogType = "website", noindex = false, cssHref, fontHref, preloadFonts }) {
  const preloads = preloadFonts.map((file) => `  <link rel="preload" href="${fontHref(file)}" as="font" type="font/woff2" crossorigin>`).join("\n");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
${noindex ? '  <meta name="robots" content="noindex">\n' : ""}  <meta name="theme-color" content="#1b1814">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:type" content="${ogType}">
  <link rel="icon" href="data:image/svg+xml;base64,${FAVICON_DATA}" type="image/svg+xml">
${preloads}
  <link rel="stylesheet" href="${cssHref}">
  <script type="speculationrules">
  {"prerender":[{"where":{"href_matches":"/film/*"},"eagerness":"moderate"}]}
  </script>
</head>`;
}

function brand() {
  return `<a class="brand" href="/" aria-label="The Unseen, home"><span class="brand__mark" aria-hidden="true">§</span><span class="brand__text">The Unseen</span></a>`;
}

function ticket() {
  return `<div class="dataset-ticket" aria-label="Dataset status"><span class="dataset-ticket__label">Last checked</span><strong>${escapeHtml(formatShortDate(datasetChecked))}</strong><span class="dataset-ticket__rule" aria-hidden="true"></span><span><strong>${films.length}</strong> entries</span></div>`;
}

function pageNav() {
  return `<nav class="page-nav" aria-label="Site"><a href="/#main">Register</a><a href="/#taxonomy">Statuses</a><a href="/#changelog">Changelog</a><a href="/hard-to-find/">Hard to find</a></nav>`;
}

function compactHeader() {
  return `<header class="masthead masthead--compact"><div class="wrap masthead__top">${brand()}${ticket()}</div><div class="wrap masthead__nav">${pageNav()}</div></header>`;
}

function homeHeader() {
  return `<header class="masthead">
    <div class="wrap masthead__top">${brand()}${ticket()}</div>
    <div class="wrap masthead__hero">
      <p class="eyebrow">Philippine film register</p>
      <h1>The <em>Unseen</em></h1>
      <p class="deck">A status register for Philippine films that cannot currently be watched, and for the few that have been found.</p>
      <nav class="hero-index" aria-label="Page sections">
        <a href="#main"><span>01</span> Register</a>
        <a href="#taxonomy"><span>02</span> Statuses</a>
        <a href="#changelog"><span>03</span> Changelog</a>
        <a href="/hard-to-find/"><span>04</span> Hard to find</a>
      </nav>
    </div>
    <div class="wrap"><div id="stats" class="stats" aria-label="Register summary">${renderStats()}</div></div>
  </header>`;
}

function footer() {
  return `<footer class="footer"><div class="wrap footer__grid"><div class="footer__brand"><span class="brand__mark" aria-hidden="true">§</span> The Unseen</div></div></footer>`;
}

function documentShell({ title, description, ogType, noindex, bodyClass, bodyAttrs = "", cssHref, jsHref, fontHref, preloadFonts, body }) {
  return `${head({ title, description, ogType, noindex, cssHref, fontHref, preloadFonts })}
<body class="${bodyClass}"${bodyAttrs ? ` ${bodyAttrs}` : ""}>
${body}
  <script src="${jsHref}" defer></script>
</body>
</html>
`;
}

function homePage(assets) {
  const sorted = [...films].sort((a, b) => (b.year ?? 0) - (a.year ?? 0) || a.title.localeCompare(b.title, "en"));
  const indexById = new Map(films.map((film, index) => [film.id, index + 1]));
  const cards = sorted.map((film) => cardHtml(film, indexById.get(film.id))).join("");
  const body = `<a class="skip-link" href="#main">Skip to the register</a>
${homeHeader()}
<main id="main">
  <section class="register wrap" aria-labelledby="results-heading">
    <aside class="filters" aria-label="Filter the register">
      <div class="filters__head"><h2>Filter</h2><button id="clear-filters" class="text-button" type="button" disabled>Reset</button></div>
      <a class="coverage-button" href="/hard-to-find/"><span class="coverage-button__label">Open hard-to-find index</span><span class="coverage-button__num">${formatNumber(hardFilms.length)}</span><span class="coverage-button__arrow" aria-hidden="true">↓</span></a>
      <div class="search-field">
        <label for="search">Search title or director</label>
        <div class="search-field__input"><svg class="icon" viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5"></circle><path d="M12.7 12.7 17 17"></path></svg><input id="search" type="search" placeholder="e.g. Brocka, 1989" autocomplete="off" spellcheck="false"></div>
        <span id="search-count" class="search-count"></span>
      </div>
      <div id="filter-groups" class="filter-groups">${renderFilterGroups()}</div>
      <div class="toggle-group">
        <p class="filter-label">Quick filters</p>
        <label class="toggle"><input type="checkbox" data-toggle="quote"><span>Has a quotable reason</span></label>
        <label class="toggle"><input type="checkbox" data-toggle="noCopy"><span>No known copy</span></label>
        <label class="toggle"><input type="checkbox" data-toggle="recent"><span>Recently checked <small>within 30 days</small></span></label>
      </div>
    </aside>
    <div class="results">
      <div class="results__bar">
        <div class="results__title"><h2 id="results-heading">Records</h2></div>
        <div class="results__tools">
          <p id="results-summary" class="results__summary" aria-live="polite">${films.length} records in the register.</p>
          <label class="sort-field" for="sort">Sort<select id="sort"><option value="year-desc">Year, newest first</option><option value="year-asc">Year, oldest first</option><option value="title">Title, A to Z</option><option value="checked">Recently checked</option></select></label>
        </div>
      </div>
      <div id="cards" class="cards" aria-busy="false">${cards}</div>
      <div id="empty" class="empty" hidden><h3>No records match those filters.</h3><p>Try removing a filter or using a shorter title.</p><button id="empty-reset" class="button" type="button" disabled>Clear all filters</button></div>
    </div>
  </section>
  <noscript><div class="wrap notice"><strong>Filtering and sorting need JavaScript.</strong> All ${films.length} records are listed below.</div></noscript>
  <section id="taxonomy" class="taxonomy" aria-labelledby="taxonomy-heading"><div class="wrap"><div class="section-head"><h2 id="taxonomy-heading">Status definitions</h2></div><div class="taxonomy__grid">
    <article class="taxonomy__item"><h3><span class="status-dot status-dot--banned" aria-hidden="true"></span>banned</h3><p>regulator or court blocked exhibition. Needs a quotable decision, or a report quoting one.</p></article>
    <article class="taxonomy__item"><h3><span class="status-dot status-dot--withdrawn" aria-hidden="true"></span>withdrawn</h3><p>accepted or scheduled, then pulled before public screening. Needs a dated report.</p></article>
    <article class="taxonomy__item"><h3><span class="status-dot status-dot--unreleased" aria-hidden="true"></span>unreleased</h3><p>finished or partly finished, never publicly exhibited.</p></article>
    <article class="taxonomy__item"><h3><span class="status-dot status-dot--unavailable" aria-hidden="true"></span>unavailable</h3><p>screened at least once publicly, but no current legal way to watch it. Needs a documented screening and an empty availability search.</p></article>
    <article class="taxonomy__item"><h3><span class="status-dot status-dot--lost" aria-hidden="true"></span>lost</h3><p>no known copy in any archive, studio or private collection. Needs an archive or historian statement, not "I can't find it".</p></article>
    <article class="taxonomy__item"><h3><span class="status-dot status-dot--found" aria-hidden="true"></span>found / partially_found</h3><p>a copy has been located. Record where and when.</p></article>
  </div><div class="taxonomy__lower"><div class="cause-box"><p class="filter-label">Cause, for unavailable records</p><p class="cause-line"><code>never_distributed</code> <span aria-hidden="true">|</span> <code>distribution_ended</code> <span aria-hidden="true">|</span> <code>rights_unclear</code> <span aria-hidden="true">|</span> <code>archive_only</code> <span aria-hidden="true">|</span> <code>no_known_rights_holder</code></p></div><div class="confidence-box"><p class="filter-label">Confidence</p><p><strong>Confirmed</strong> means a primary source, archive or regulator. <strong>Reported</strong> means news. <strong>Unverified</strong> means a forum or rumour.</p></div></div><div class="callouts"><div class="callout"><p class="callout__label">The lost rule</p><p>Never use "lost" for a film that merely has no streaming link. That is the most common error and it destroys credibility. "Unavailable" is the honest status for a film that screened but has no legal access.</p></div></div></div></section>
  <section id="changelog" class="changelog" aria-labelledby="changelog-heading"><div class="wrap"><div class="section-head"><h2 id="changelog-heading">Status changelog</h2><p class="section-deck">These are recorded changes, with the evidence that prompted them.</p></div><div id="changelog-list" class="timeline">${changelogHtml()}</div></div></section>
  <section id="about" class="about" aria-labelledby="about-heading"><div class="wrap about__grid"><div class="section-head"><h2 id="about-heading">About this register</h2></div><div class="about__body"><p class="lede">The Unseen is an independent reference work. It is not affiliated with any studio, archive, festival or regulator.</p><p>It covers Philippine films, especially shorts and festival titles, with no current legal access. A few resolved cases stay because the register tracks how films come back, through a print found in an archive or a legal edition released years after a ban.</p><p>Each record starts with a documented screening, production or regulatory fact. Availability is checked against legal streaming, VOD, home video and archive catalogues, and the check date is recorded.</p><p>The 8,000+ figure is an archive estimate for films shot on film stock from 1919 to 2012. It is not a title list. The hard-to-find index starts from 2,034 Wikidata titles, screened against <a href="https://www.justwatch.com/ph/" target="_blank" rel="noopener noreferrer">JustWatch Philippines</a> on 1 November 2026. The corpus estimate comes from <a href="https://www.philstar.com/entertainment/2026/08/17/2549804/philippine-cinema-faces-urgent-preservation-challenge" target="_blank" rel="noopener noreferrer">The Philippine Star, 17 August 2026</a>, citing Leo Katigbak of ABS-CBN Film Archives.</p><p class="small">This is desk research, not an archive visit. Catalogues and region locks change, so a negative finding is not proof that no copy exists. No unauthorized full-film links are included. Corrections should add a source and update the changelog.</p></div></div></section>
</main>
${footer()}`;
  return documentShell({
    title: "The Unseen, Philippine Film Status Register",
    description: "A sourced status register for hard-to-find Philippine films, plus a separate index screened against digital catalogs.",
    bodyClass: "home",
    bodyAttrs: `data-page="home" data-dataset-checked="${escapeHtml(datasetChecked)}"`,
    cssHref: assets.cssHref,
    jsHref: assets.jsHref,
    fontHref: assets.fontHref,
    preloadFonts: ["fraunces-normal-var.woff2", "fraunces-italic-unseen.woff2", "ibm-plex-mono-400.woff2", "ibm-plex-mono-500.woff2"],
    body,
  });
}

function detailPage(film, assets) {
  const body = `<a class="skip-link" href="#main">Skip to the record</a>
${compactHeader()}
<main id="main"><article class="detail-page wrap">
  <div class="detail-page__bar"><a class="text-button" href="/#main">← Back to register</a><button id="copy-link" class="button" type="button">Copy link</button></div>
  ${detailHtml(film)}
</article></main>
${footer()}`;
  return documentShell({
    title: `${film.title} — The Unseen`,
    description: film.status_detail,
    ogType: "article",
    bodyClass: "detail-record",
    bodyAttrs: `data-page="detail"`,
    cssHref: assets.cssHref,
    jsHref: assets.jsHref,
    fontHref: assets.fontHref,
    preloadFonts: ["fraunces-normal-var.woff2", "public-sans-var.woff2", "ibm-plex-mono-400.woff2", "ibm-plex-mono-500.woff2"],
    body,
  });
}

function hardPage(assets) {
  const meta = hard.meta || {};
  const body = `<a class="skip-link" href="#main">Skip to the index</a>
<header class="masthead masthead--page"><div class="wrap masthead__top">${brand()}${ticket()}</div><div class="wrap masthead__hero"><p class="eyebrow">Philippine film register</p><h1>Hard to find</h1><p class="deck">These titles come from Wikidata, and no active digital offer was found in the checked catalog. They are titles, not status records.</p><nav class="hero-index" aria-label="Page sections"><a href="/"><span>01</span> Register</a><a href="/#taxonomy"><span>02</span> Statuses</a><a href="/#changelog"><span>03</span> Changelog</a></nav></div></header>
<main id="main"><section id="unverified-index" class="unverified" aria-labelledby="unverified-heading"><div class="wrap">
  <div class="section-head unverified__head"><div class="unverified__head-copy"><h2 id="unverified-heading">Hard-to-find index</h2></div></div>
  <div class="unverified__toolbar"><div class="unverified__search"><label for="unverified-search">Search titles</label><input id="unverified-search" type="search" placeholder="Title or year…" autocomplete="off" spellcheck="false"></div><div class="unverified__meta"><p id="unverified-count" class="unverified__count" aria-live="polite">${formatNumber(hardFilms.length)} titles</p></div></div>
  <div class="unverified__table-wrap"><table class="unverified__table"><thead><tr><th scope="col">#</th><th scope="col">Title</th><th scope="col">Year</th><th scope="col">Source</th></tr></thead><tbody id="unverified-rows">${hardRowsHtml()}</tbody></table></div>
  <p class="unverified__note">Wikidata, retrieved <span>${escapeHtml(formatDate(meta.retrieved))}</span>. Availability checked against JustWatch Philippines on <span>${escapeHtml(formatDate(meta.availability_checked))}</span>. <span>${formatNumber(meta.removed_count || 0)}</span> titles with an active offer were removed. <span>${formatNumber(meta.unmatched_count || 0)}</span> had no exact match and are marked unchecked. No title here is claimed lost, banned or unavailable.</p>
</div></section></main>
${footer()}`;
  return documentShell({
    title: "Hard-to-find index — The Unseen",
    description: "A Wikidata-derived index of Philippine films with no active digital offer found in the checked catalog.",
    bodyClass: "index-page",
    bodyAttrs: `data-page="index"`,
    cssHref: assets.cssHref,
    jsHref: assets.jsHref,
    fontHref: assets.fontHref,
    preloadFonts: ["fraunces-normal-var.woff2", "public-sans-var.woff2", "ibm-plex-mono-400.woff2", "ibm-plex-mono-500.woff2"],
    body,
  });
}

function notFoundPage(assets) {
  const body = `<a class="skip-link" href="#main">Skip to the register</a>
${compactHeader()}
<main id="main"><section class="wrap detail-page">
  <div class="empty">
    <p class="empty__label">404</p>
    <h3>This page is not in the register.</h3>
    <p>The address may be mistyped, or the page may have moved. The register lists every record.</p>
    <a class="button" href="/">Back to the register</a>
  </div>
</section></main>
${footer()}`;
  return documentShell({
    title: "Page not found — The Unseen",
    description: "The requested page could not be found.",
    noindex: true,
    bodyClass: "not-found",
    bodyAttrs: `data-page="404"`,
    cssHref: assets.cssHref,
    jsHref: assets.jsHref,
    fontHref: assets.fontHref,
    preloadFonts: ["fraunces-normal-var.woff2", "public-sans-var.woff2"],
    body,
  });
}

function writeExtras(assets) {
  fs.writeFileSync(path.join(DIST, "404.html"), notFoundPage(assets));

  const robots = ["User-agent: *", "Allow: /"];
  if (SITE_URL) robots.push("", `Sitemap: ${SITE_URL}/sitemap.xml`);
  fs.writeFileSync(path.join(DIST, "robots.txt"), `${robots.join("\n")}\n`);

  if (!SITE_URL) return;
  const urls = ["/", "/hard-to-find/", ...films.map((film) => `/film/${film.id}/`)];
  const entries = urls.map((url) => `  <url><loc>${escapeHtml(`${SITE_URL}${url}`)}</loc></url>`).join("\n");
  fs.writeFileSync(path.join(DIST, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`);
}

const assets = buildAssets();
fs.writeFileSync(path.join(DIST, "index.html"), homePage(assets));
fs.mkdirSync(path.join(DIST, "hard-to-find"), { recursive: true });
fs.writeFileSync(path.join(DIST, "hard-to-find", "index.html"), hardPage(assets));
for (const film of films) {
  const dir = path.join(DIST, "film", film.id);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), detailPage(film, assets));
}
writeExtras(assets);
console.log(`Built ${films.length + 3} HTML pages; CSS ${assets.cssHref}; JS ${assets.jsHref}`);
