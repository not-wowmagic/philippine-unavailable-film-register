#!/usr/bin/env node
/**
 * Validate data/films.json against the register's evidence rules.
 * No dependencies. Run with: node scripts/validate.mjs
 */

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.resolve(here, "../data/films.json");

const STATUSES = new Set([
  "banned",
  "withdrawn",
  "unreleased",
  "unavailable",
  "lost",
  "found",
  "partially_found",
]);

const CAUSES = new Set([
  "never_distributed",
  "distribution_ended",
  "rights_unclear",
  "archive_only",
  "no_known_rights_holder",
]);

const CONFIDENCES = new Set(["confirmed", "reported", "unverified"]);
const TYPES = new Set(["feature", "short", "documentary", "short documentary"]);

const TODAY = new Date().toISOString().slice(0, 10);
const FULL_DATE = /^\d{4}-\d{2}-\d{2}$/;
const PARTIAL_DATE = /^\d{4}(?:-\d{2})?(?:-\d{2})?$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const errors = [];

function fail(record, message) {
  const label = record && record.id ? record.id : "(unknown record)";
  errors.push(`${label}: ${message}`);
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isHttpUrl(value) {
  if (!isNonEmptyString(value)) return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isFullDate(value) {
  return isNonEmptyString(value) && FULL_DATE.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

function isPartialDate(value) {
  return isNonEmptyString(value) && PARTIAL_DATE.test(value);
}

function sourceUrls(record) {
  return new Set((record.sources || []).map((source) => source && source.url).filter(Boolean));
}

function checkSourceRef(record, value, field) {
  if (!isHttpUrl(value)) {
    fail(record, `${field} must be an http(s) URL`);
    return;
  }
  if (!sourceUrls(record).has(value)) {
    fail(record, `${field} must also appear in sources[]`);
  }
}

function checkSource(record, source, index) {
  const field = `sources[${index}]`;
  if (!isObject(source)) {
    fail(record, `${field} must be an object`);
    return;
  }
  if (!isHttpUrl(source.url)) fail(record, `${field}.url must be an http(s) URL`);
  if (!isNonEmptyString(source.publisher)) fail(record, `${field}.publisher is required`);
  if (!isFullDate(source.retrieved)) fail(record, `${field}.retrieved must be YYYY-MM-DD`);
  if (isFullDate(source.retrieved) && source.retrieved > TODAY) {
    fail(record, `${field}.retrieved is in the future (${source.retrieved})`);
  }
}

function checkQuotedReason(record) {
  const quote = record.quoted_reason;
  if (quote == null) {
    if (record.status === "banned" || record.status === "lost") {
      fail(record, `status "${record.status}" requires a quoted_reason`);
    }
    return;
  }

  if (!isObject(quote)) {
    fail(record, "quoted_reason must be an object or null");
    return;
  }
  if (!isNonEmptyString(quote.text)) fail(record, "quoted_reason.text is required");
  if (!isNonEmptyString(quote.attributed_to)) {
    fail(record, "quoted_reason.attributed_to is required");
  }
  checkSourceRef(record, quote.source_url, "quoted_reason.source_url");
}

function checkScreening(record) {
  const screening = record.last_verified_screening;
  if (screening == null) {
    if (record.status === "unavailable") {
      fail(record, 'status "unavailable" requires a documented last_verified_screening');
    }
    return;
  }

  if (!isObject(screening)) {
    fail(record, "last_verified_screening must be an object or null");
    return;
  }
  if (screening.date != null && !isPartialDate(screening.date)) {
    fail(record, "last_verified_screening.date must be YYYY, YYYY-MM, YYYY-MM-DD, or null");
  }
  if (!isNonEmptyString(screening.venue)) {
    fail(record, "last_verified_screening.venue is required");
  }
  checkSourceRef(record, screening.source_url, "last_verified_screening.source_url");
}

function checkKnownCopy(record) {
  const copy = record.known_copy;
  if (copy == null) {
    if (record.status === "lost") return;
    return;
  }

  if (!isObject(copy)) {
    fail(record, "known_copy must be an object or null");
    return;
  }
  if (!isNonEmptyString(copy.holder)) fail(record, "known_copy.holder is required");
  if (!isNonEmptyString(copy.format)) fail(record, "known_copy.format is required");
  if (!isNonEmptyString(copy.access)) fail(record, "known_copy.access is required");

  if (record.status === "lost") {
    fail(record, 'status "lost" cannot have a known_copy');
  }
}

function checkWhereToWatch(record) {
  if (!Array.isArray(record.where_to_watch)) {
    fail(record, "where_to_watch must be an array");
    return;
  }

  record.where_to_watch.forEach((entry, index) => {
    const field = `where_to_watch[${index}]`;
    if (!isObject(entry)) {
      fail(record, `${field} must be an object`);
      return;
    }
    if (!isNonEmptyString(entry.platform)) fail(record, `${field}.platform is required`);
    if (!isHttpUrl(entry.url)) fail(record, `${field}.url must be an http(s) URL`);
    if (entry.note != null && !isNonEmptyString(entry.note)) {
      fail(record, `${field}.note must be a non-empty string when present`);
    }
  });

  if (record.status === "found" || record.status === "partially_found") {
    if (record.where_to_watch.length === 0 && !record.known_copy) {
      fail(record, `status "${record.status}" must record a known_copy or where_to_watch entry`);
    }
  }
}

function checkRecord(record, index) {
  if (!isObject(record)) {
    errors.push(`record[${index}] is not an object`);
    return;
  }

  if (!isNonEmptyString(record.id) || !SLUG.test(record.id)) {
    fail(record, "id must be a lowercase slug");
  }
  if (!isNonEmptyString(record.title)) fail(record, "title is required");
  if (record.original_title != null && !isNonEmptyString(record.original_title)) {
    fail(record, "original_title must be a non-empty string or null");
  }
  if (record.year != null && (!Number.isInteger(record.year) || record.year < 1900 || record.year > 2100)) {
    fail(record, "year must be an integer between 1900 and 2100, or null");
  }
  if (!TYPES.has(record.type)) fail(record, `type must be one of: ${[...TYPES].join(", ")}`);
  if (!isNonEmptyString(record.director)) fail(record, "director is required");
  if (record.runtime_min != null && (!Number.isInteger(record.runtime_min) || record.runtime_min <= 0)) {
    fail(record, "runtime_min must be a positive integer or null");
  }

  if (!Array.isArray(record.festivals)) {
    fail(record, "festivals must be an array");
  } else {
    record.festivals.forEach((festival, festivalIndex) => {
      const field = `festivals[${festivalIndex}]`;
      if (!isObject(festival)) {
        fail(record, `${field} must be an object`);
        return;
      }
      if (!isNonEmptyString(festival.festival)) fail(record, `${field}.festival is required`);
      if (festival.year != null && (!Number.isInteger(festival.year) || festival.year < 1900 || festival.year > 2100)) {
        fail(record, `${field}.year must be an integer or null`);
      }
      if (festival.section != null && !isNonEmptyString(festival.section)) {
        fail(record, `${field}.section must be a non-empty string or null`);
      }
    });
  }

  if (!STATUSES.has(record.status)) fail(record, `status must be one of: ${[...STATUSES].join(", ")}`);
  if (record.cause != null && !CAUSES.has(record.cause)) {
    fail(record, `cause must be one of: ${[...CAUSES].join(", ")} or null`);
  }
  if (record.status === "unavailable" && record.cause == null) {
    fail(record, 'status "unavailable" requires a cause');
  }
  if (record.status !== "unavailable" && record.cause != null) {
    fail(record, 'cause only applies to status "unavailable"');
  }
  if (!isNonEmptyString(record.status_detail)) fail(record, "status_detail is required");
  if (!CONFIDENCES.has(record.confidence)) {
    fail(record, `confidence must be one of: ${[...CONFIDENCES].join(", ")}`);
  }
  if (!isNonEmptyString(record.notes)) fail(record, "notes is required");
  if (!isFullDate(record.availability_last_checked)) {
    fail(record, "availability_last_checked must be YYYY-MM-DD");
  } else if (record.availability_last_checked > TODAY) {
    fail(record, "availability_last_checked is in the future");
  }

  if (!Array.isArray(record.sources) || record.sources.length === 0) {
    fail(record, "sources must contain at least one source");
  } else {
    const seen = new Set();
    record.sources.forEach((source, sourceIndex) => {
      checkSource(record, source, sourceIndex);
      if (source && source.url) {
        if (seen.has(source.url)) fail(record, `duplicate source URL: ${source.url}`);
        seen.add(source.url);
      }
    });
  }

  checkQuotedReason(record);
  checkScreening(record);
  checkKnownCopy(record);
  checkWhereToWatch(record);
}

async function main() {
  let raw;
  try {
    raw = await readFile(dataPath, "utf8");
  } catch (error) {
    console.error(`Could not read ${dataPath}: ${error.message}`);
    process.exitCode = 1;
    return;
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch (error) {
    console.error(`Invalid JSON in ${dataPath}: ${error.message}`);
    process.exitCode = 1;
    return;
  }

  if (!Array.isArray(data)) {
    console.error("data/films.json must contain an array of records.");
    process.exitCode = 1;
    return;
  }

  const ids = new Set();
  data.forEach((record, index) => {
    checkRecord(record, index);
    if (record && record.id) {
      if (ids.has(record.id)) fail(record, "duplicate id");
      ids.add(record.id);
    }
  });

  const indexRecord = { id: "public-index" };
  let indexCount = 0;
  let hardCount = 0;
  let removedCount = 0;
  let unmatchedCount = 0;
  try {
    const indexPath = path.resolve(here, "../data/unverified.json");
    const indexRaw = await readFile(indexPath, "utf8");
    const indexData = JSON.parse(indexRaw);

    if (!isObject(indexData)) {
      fail(indexRecord, "public index must be an object with meta and films");
    } else {
      if (!isObject(indexData.meta)) fail(indexRecord, "public index meta is required");
      else {
        if (!isFullDate(indexData.meta.retrieved)) {
          fail(indexRecord, "public index meta.retrieved must be YYYY-MM-DD");
        }
        if (!isNonEmptyString(indexData.meta.source)) {
          fail(indexRecord, "public index meta.source is required");
        }
      }

      if (!Array.isArray(indexData.films)) {
        fail(indexRecord, "public index films must be an array");
      } else {
        indexCount = indexData.films.length;
        if (indexData.meta && indexData.meta.count !== indexCount) {
          fail(indexRecord, `public index meta.count (${indexData.meta.count}) does not match films.length (${indexCount})`);
        }

        const indexIds = new Set();
        indexData.films.forEach((film, filmIndex) => {
          if (!isObject(film)) {
            fail(indexRecord, `public index films[${filmIndex}] must be an object`);
            return;
          }
          if (!isNonEmptyString(film.id)) fail(indexRecord, `public index films[${filmIndex}].id is required`);
          if (!isNonEmptyString(film.title)) fail(indexRecord, `public index films[${filmIndex}].title is required`);
          if (film.year != null && (!Number.isInteger(film.year) || film.year < 1800 || film.year > 2100)) {
            fail(indexRecord, `public index films[${filmIndex}].year must be an integer or null`);
          }
          if (film.imdb != null && !/^tt\d+$/.test(film.imdb)) {
            fail(indexRecord, `public index films[${filmIndex}].imdb must be an IMDb ID or null`);
          }
          if (!isHttpUrl(film.source)) {
            fail(indexRecord, `public index films[${filmIndex}].source must be an http(s) URL`);
          }
          if (film.id) {
            if (indexIds.has(film.id)) fail(indexRecord, `duplicate public-index id: ${film.id}`);
            indexIds.add(film.id);
          }
        });
      }
    }
  } catch (error) {
    fail(indexRecord, `public index could not be read or parsed: ${error.message}`);
  }

  try {
    const hardPath = path.resolve(here, "../data/hard-to-find.json");
    const hardData = JSON.parse(await readFile(hardPath, "utf8"));
    const hardRecord = { id: "hard-to-find-index" };

    if (!isObject(hardData) || !isObject(hardData.meta) || !Array.isArray(hardData.films)) {
      fail(hardRecord, "hard-to-find index must be an object with meta and films");
    } else {
      hardCount = hardData.films.length;
      removedCount = hardData.meta.removed_count;
      unmatchedCount = Number(hardData.meta.unmatched_count) || 0;
      if (hardData.meta.count !== hardCount) {
        fail(hardRecord, `meta.count (${hardData.meta.count}) does not match films.length (${hardCount})`);
      }
      if (!Number.isInteger(removedCount) || removedCount < 0) {
        fail(hardRecord, "meta.removed_count must be a non-negative integer");
      }
      if (!Number.isInteger(unmatchedCount) || unmatchedCount < 0) {
        fail(hardRecord, "meta.unmatched_count must be a non-negative integer");
      }
      if (!isFullDate(hardData.meta.availability_checked) || hardData.meta.availability_checked > TODAY) {
        fail(hardRecord, "meta.availability_checked must be a valid past date");
      }
      if (!Array.isArray(hardData.meta.availability_countries) || hardData.meta.availability_countries.length === 0) {
        fail(hardRecord, "meta.availability_countries must list at least one country");
      }
      if (hardData.meta.total_checked !== hardCount + removedCount) {
        fail(hardRecord, "meta.total_checked must equal listed plus removed titles");
      }

      const hardIds = new Set();
      hardData.films.forEach((film, filmIndex) => {
        if (!isObject(film)) {
          fail(hardRecord, `films[${filmIndex}] must be an object`);
          return;
        }
        if (!isNonEmptyString(film.id)) fail(hardRecord, `films[${filmIndex}].id is required`);
        if (!isNonEmptyString(film.title)) fail(hardRecord, `films[${filmIndex}].title is required`);
        if (film.year != null && (!Number.isInteger(film.year) || film.year < 1800 || film.year > 2100)) {
          fail(hardRecord, `films[${filmIndex}].year must be an integer or null`);
        }
        if (film.imdb != null && !/^tt\d+$/.test(film.imdb)) {
          fail(hardRecord, `films[${filmIndex}].imdb must be an IMDb ID or null`);
        }
        if (!isHttpUrl(film.source)) fail(hardRecord, `films[${filmIndex}].source must be an http(s) URL`);
        if (!isFullDate(film.availability_last_checked) || film.availability_last_checked > TODAY) {
          fail(hardRecord, `films[${filmIndex}].availability_last_checked must be a valid past date`);
        }
        if (!isNonEmptyString(film.availability_note)) {
          fail(hardRecord, `films[${filmIndex}].availability_note is required`);
        }
        if (film.id) {
          if (hardIds.has(film.id)) fail(hardRecord, `duplicate hard-to-find id: ${film.id}`);
          hardIds.add(film.id);
        }
      });
    }
  } catch (error) {
    fail(indexRecord, `hard-to-find index could not be read or parsed: ${error.message}`);
  }

  try {
    const removedPath = path.resolve(here, "../data/digitally-available.json");
    const removedData = JSON.parse(await readFile(removedPath, "utf8"));
    const removedRecord = { id: "digitally-available" };

    if (!isObject(removedData) || !isObject(removedData.meta) || !Array.isArray(removedData.films)) {
      fail(removedRecord, "digitally-available file must be an object with meta and films");
    } else {
      if (removedData.meta.count !== removedData.films.length) {
        fail(removedRecord, "meta.count must match films.length");
      }
      if (!isFullDate(removedData.meta.checked) || removedData.meta.checked > TODAY) {
        fail(removedRecord, "meta.checked must be a valid past date");
      }
      const seen = new Set();
      removedData.films.forEach((film, filmIndex) => {
        if (!isObject(film)) {
          fail(removedRecord, `films[${filmIndex}] must be an object`);
          return;
        }
        if (!isNonEmptyString(film.id)) fail(removedRecord, `films[${filmIndex}].id is required`);
        if (!isNonEmptyString(film.title)) fail(removedRecord, `films[${filmIndex}].title is required`);
        if (!isHttpUrl(film.source)) fail(removedRecord, `films[${filmIndex}].source must be an http(s) URL`);
        if (!isObject(film.checks)) {
          fail(removedRecord, `films[${filmIndex}].checks is required`);
        } else {
          const available = Object.values(film.checks).some((check) => check && check.available);
          if (!available) fail(removedRecord, `films[${filmIndex}] must have at least one available check`);
        }
        if (film.id) {
          if (seen.has(film.id)) fail(removedRecord, `duplicate removed id: ${film.id}`);
          seen.add(film.id);
        }
      });
    }
  } catch (error) {
    fail(indexRecord, `digitally-available file could not be read or parsed: ${error.message}`);
  }

  try {
    const unmatchedPath = path.resolve(here, "../data/not-screened.json");
    const unmatchedData = JSON.parse(await readFile(unmatchedPath, "utf8"));
    const unmatchedRecord = { id: "not-screened" };
    if (!isObject(unmatchedData) || !isObject(unmatchedData.meta) || !Array.isArray(unmatchedData.films)) {
      fail(unmatchedRecord, "not-screened file must be an object with meta and films");
    } else if (unmatchedData.meta.count !== unmatchedData.films.length) {
      fail(unmatchedRecord, "meta.count must match films.length");
    } else if (unmatchedData.films.length !== unmatchedCount) {
      fail(unmatchedRecord, "not-screened count must match the hard-to-find meta.unmatched_count");
    }
  } catch (error) {
    fail(indexRecord, `not-screened file could not be read or parsed: ${error.message}`);
  }

  if (errors.length) {
    console.error(`Validation failed with ${errors.length} error(s):\n`);
    for (const error of errors) console.error(`  ✗ ${error}`);
    process.exitCode = 1;
    return;
  }

  const statusCounts = data.reduce((counts, record) => {
    counts[record.status] = (counts[record.status] || 0) + 1;
    return counts;
  }, {});

  const confidenceCounts = data.reduce((counts, record) => {
    counts[record.confidence] = (counts[record.confidence] || 0) + 1;
    return counts;
  }, {});

  console.log(`✓ ${data.length} records validated against the register schema.`);
  console.log(
    `  status: ${Object.entries(statusCounts)
      .map(([key, value]) => `${key} ${value}`)
      .join(" · ")}`
  );
  console.log(
    `  confidence: ${Object.entries(confidenceCounts)
      .map(([key, value]) => `${key} ${value}`)
      .join(" · ")}`
  );
  console.log(`  data last checked: ${data.reduce((latest, record) => (record.availability_last_checked > latest ? record.availability_last_checked : latest), "")}`);
  console.log(`  public index: ${indexCount.toLocaleString("en-US")} titles (Wikidata)`);
  console.log(`  hard-to-find index: ${hardCount.toLocaleString("en-US")} titles (${removedCount.toLocaleString("en-US")} removed; ${unmatchedCount.toLocaleString("en-US")} not fully screened)`);
}

await main();
