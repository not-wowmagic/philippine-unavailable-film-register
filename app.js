/* ─────────────────────────────────────────────────────────────
   Philippine Unavailable Film Register - register logic
   Plain JavaScript. No dependencies.
   ───────────────────────────────────────────────────────────── */

const DATA_URL = "data/films.json";

const STATUS_ORDER = [
  "banned",
  "withdrawn",
  "unreleased",
  "unavailable",
  "lost",
  "found",
  "partially_found",
];

const CAUSE_ORDER = [
  "never_distributed",
  "distribution_ended",
  "rights_unclear",
  "archive_only",
  "no_known_rights_holder",
];

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

const CONFIDENCE_LABELS = {
  confirmed: "Confirmed",
  reported: "Reported",
  unverified: "Unverified",
};

const CONFIDENCE_DEFINITIONS = {
  confirmed: "Primary, archive or regulator evidence.",
  reported: "News report.",
  unverified: "Forum, rumour or community database.",
};

const TYPE_LABELS = {
  feature: "Feature",
  documentary: "Documentary",
  short: "Short",
  "short documentary": "Short documentary",
};

const CHANGELOG = [
  {
    date: "2026-10-31",
    filmId: "live-show",
    title: "Live Show",
    from: "banned",
    to: "found",
    note: "A legal uncut version appears for rent and purchase on Amazon US. The 2001 Philippine theatrical ban remains on record; this is a change in access, not a lifting of the ban.",
    source: {
      publisher: "Amazon Prime Video",
      url: "https://www.amazon.com/Live-Show-Uncut-Javier-Reyes/dp/B0FVCPXHKR",
    },
  },
  {
    date: "2026-10-31",
    filmId: "paglaki-ko-gusto-kong-maging-pornstar",
    title: "Paglaki Ko, Gusto Kong Maging Pornstar",
    from: "banned",
    to: "found",
    note: "Prime Video lists a legal rental edition in the Philippines. The MTRCB X rating for cinemas remains on record.",
    source: {
      publisher: "Prime Video",
      url: "https://www.primevideo.com/detail/0TYNEOXS77Z1M9OC3G6ALULRAC/",
    },
  },
  {
    date: "2025-03-12",
    filmId: "food-delivery-2025",
    title: "Food Delivery, Fresh from the West Philippine Sea",
    from: null,
    fromLabel: "Scheduled",
    to: "withdrawn",
    note: "The documentary is pulled from CinePanalo two days before its gala premiere; the filmmakers say external factors played a role.",
    source: {
      publisher: "Philstar Life",
      url: "https://philstarlife.com/geeky/848540-west-philippine-sea-documentary-withdraws-2025-cinepanalo-film-festival",
    },
  },
  {
    date: "2024-09-06",
    filmId: "dear-satan-2024",
    title: "Dear Satan",
    from: null,
    fromLabel: "None",
    to: "banned",
    note: "The MTRCB upholds its final X rating, even after the film is retitled Dear Santa.",
    source: {
      publisher: "PEP.ph",
      url: "https://www.pep.ph/news/local/mtrcb-x-rating-dear-satan-final-a718-20240906",
    },
  },
  {
    date: "2019-11-07",
    filmId: "metamorphosis-2019",
    title: "Metamorphosis",
    from: "banned",
    to: "unavailable",
    note: "The MTRCB reclassifies the film from X to R-16 without cuts. It screens at Cinema One Originals and later streams on iWant; that stream has ended.",
    source: {
      publisher: "ABS-CBN News",
      url: "https://www.abs-cbn.com/2019/11/7/fresh-scoops/cinema-one-originals-entry-metamorphosis-reclass-39769",
    },
  },
  {
    date: "2010-03-25",
    filmId: "ganito-tayo-ngayon",
    title: "Ganito Tayo Noon, Paano na Tayo Bukas?",
    from: null,
    fromLabel: "None",
    to: "banned",
    note: "The MTRCB rates the short X for cinemas; it is later allowed on ANC and screened at the CCP gala.",
    source: {
      publisher: "PEP.ph",
      url: "https://www.pep.ph/news/local/33550/short-films-of-brillante-mendoza-and-jeffrey-jeturian-are-x-rated",
    },
  },
  {
    date: "2010-03-25",
    filmId: "ayos-ka",
    title: "Ayos Ka?",
    from: null,
    fromLabel: "None",
    to: "banned",
    note: "The MTRCB rates Brillante Mendoza's music video X for being injurious to the prestige of the Republic.",
    source: {
      publisher: "PEP.ph",
      url: "https://www.pep.ph/news/local/33550/short-films-of-brillante-mendoza-and-jeffrey-jeturian-are-x-rated",
    },
  },
  {
    date: "2005",
    filmId: "darna-1951",
    title: "Darna",
    from: "lost",
    to: "partially_found",
    note: "Howie Severino and i-Witness find a 40-minute, silent, incomplete copy in Thailand. The original film remains incomplete.",
    source: {
      publisher: "Wikipedia",
      url: "https://en.wikipedia.org/wiki/Darna_(1951_film)",
    },
  },
  {
    date: "2008-12-01",
    filmId: "ang-mabuhay-para-sa-masa",
    title: "Ang Mabuhay para sa Masa",
    from: null,
    fromLabel: "None",
    to: "banned",
    note: "The Court of Appeals affirms the MTRCB and Office of the President ban on Estrada's biographical documentary.",
    source: {
      publisher: "GMA News Online",
      url: "https://www.gmanetwork.com/news/topstories/nation/136781/erap-bioflick-subject-to-mtrcb-review-ca-rules/story/",
    },
  },
  {
    date: "1999-09-27",
    filmId: "butakal-sugapa-sa-laman",
    title: "Butakal: Sugapa sa Laman",
    from: null,
    fromLabel: "None",
    to: "banned",
    note: "The MTRCB orders the film recalled before its scheduled release after the Chiong family objects; the Supreme Court later orders the master copy returned.",
    source: {
      publisher: "Lawphil / Supreme Court of the Philippines",
      url: "https://lawphil.net/judjuris/juri2007/dec2007/gr_161422_2007.html",
    },
  },
  {
    date: "1965-09-03",
    filmId: "iginuhit-ng-tadhana",
    title: "Iginuhit ng Tadhana",
    from: null,
    fromLabel: "None",
    to: "banned",
    note: "The Board of Censors suspends the release; the suspension is temporary and the film later resumes its theatrical run.",
    source: {
      publisher: "Video 48",
      url: "https://video48.blogspot.com/2008/05/september-3-1965-movie-on-marcos.html",
    },
  },
  {
    date: "2025-11-01",
    filmId: "diwata-ng-karagatan",
    title: "Diwata ng Karagatan",
    from: "lost",
    to: "found",
    note: "CINEMATEK identifies a 35mm print catalogued as Ligaya, fille des îles. It is the only known surviving copy, and it is a shortened French-language version.",
    source: {
      publisher: "CINEMATEK",
      url: "https://cinematek.be/en/dossiers/2025/rediscovery-of-lost-filipino-classic-film-in-the-cinematek-archive",
    },
  },
  {
    date: "2024-11-09",
    filmId: "lost-sabungeros",
    title: "Lost Sabungeros",
    from: "withdrawn",
    to: "unavailable",
    note: "After Cinemalaya cancels its premiere, the film screens at QCinema. It remains unrated and without streaming or commercial distribution.",
    source: {
      publisher: "GMA Network",
      url: "https://www.gmanetwork.com/entertainment/photos/lost-sabungeros-finally-shown-to-public-via-qcinema-international-film-festival/21995/",
    },
  },
  {
    date: "2024-09-05",
    filmId: "alipato-at-muog",
    title: "Alipato at Muog",
    from: "banned",
    to: "unavailable",
    note: "The MTRCB reclassifies the film from X to R-16 after an appeal. The ban is lifted, but no streaming or commercial release follows.",
    source: {
      publisher: "GMA News Online",
      url: "https://www.gmanetwork.com/news/showbiz/chikaminute/919453/alipato-at-muog-reclassified-to-r-16-following-second-review-of-mtrcb/story/",
    },
  },
  {
    date: "2024-08-22",
    filmId: "alipato-at-muog",
    title: "Alipato at Muog",
    from: null,
    fromLabel: "None",
    to: "banned",
    note: "The MTRCB's first review committee refuses public exhibition, citing the film's tendency to undermine faith and confidence in government.",
    source: {
      publisher: "PEP.ph",
      url: "https://www.pep.ph/pepalerts/pep-troika/182505/alipato-at-muog-rated-x-mtrcb-a4118-20240823-lfrm",
    },
  },
  {
    date: "2024-08-04",
    filmId: "lost-sabungeros",
    title: "Lost Sabungeros",
    from: null,
    fromLabel: "Scheduled",
    to: "withdrawn",
    note: "Cinemalaya cancels the 8 to 9 August screenings four days before the premiere, citing security concerns.",
    source: {
      publisher: "The Philippine Star",
      url: "https://www.philstar.com/entertainment/2024/08/04/2375389/gma-docu-lost-sabungeros-cinemalaya-premiere-canceled",
    },
  },
  {
    date: "2001-04-03",
    filmId: "live-show",
    title: "Live Show",
    from: null,
    fromLabel: "None",
    to: "banned",
    note: "A Malacañang appeals committee orders the permanent ban and revokes the MTRCB permit for public exhibition.",
    source: {
      publisher: "The Philippine Star",
      url: "https://www.philstar.com/news-feature/91980/live-show-now-dead-show",
    },
  },
];

const UNVERIFIED_PAGE_SIZE = 50;

const state = {
  films: [],
  filters: {
    status: new Set(),
    cause: new Set(),
    decade: new Set(),
    type: new Set(),
    festival: new Set(),
  },
  search: "",
  toggles: {
    quote: false,
    noCopy: false,
    recent: false,
  },
  sort: "year-desc",
};

let unverifiedFilms = [];
let unverifiedPage = 0;
let unverifiedQuery = "";
let unverifiedShowAll = false;

const els = {
  stats: document.getElementById("stats"),
  search: document.getElementById("search"),
  searchCount: document.getElementById("search-count"),
  filterGroups: document.getElementById("filter-groups"),
  clearFilters: document.getElementById("clear-filters"),
  sort: document.getElementById("sort"),
  resultsSummary: document.getElementById("results-summary"),
  cards: document.getElementById("cards"),
  empty: document.getElementById("empty"),
  emptyReset: document.getElementById("empty-reset"),
  detail: document.getElementById("detail"),
  detailIndex: document.getElementById("detail-index"),
  detailBody: document.getElementById("detail-body"),
  closeDetail: document.getElementById("close-detail"),
  copyLink: document.getElementById("copy-link"),
  coverageOpen: document.getElementById("coverage-open"),
  unverifiedSearch: document.getElementById("unverified-search"),
  unverifiedCount: document.getElementById("unverified-count"),
  unverifiedRows: document.getElementById("unverified-rows"),
  unverifiedPrev: document.getElementById("unverified-prev"),
  unverifiedNext: document.getElementById("unverified-next"),
  unverifiedPage: document.getElementById("unverified-page"),
  unverifiedPager: document.getElementById("unverified-pager"),
  unverifiedAll: document.getElementById("unverified-all"),
  unverifiedSection: document.getElementById("unverified-index"),
  indexClose: document.getElementById("index-close"),
  unverifiedRetrieved: document.getElementById("unverified-retrieved"),
  heroIndexCount: document.getElementById("hero-index-count"),
  coverageOpenCount: document.getElementById("coverage-open-count"),
  changelog: document.getElementById("changelog-list"),
};

let datasetChecked = "";
let lastFocused = null;
let copyTimer = null;

document.addEventListener("DOMContentLoaded", init);

async function init() {
  bindStaticEvents();
  renderChangelog();

  try {
    const response = await fetch(DATA_URL, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} while loading ${DATA_URL}`);
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error("films.json must contain an array of records.");
    }

    state.films = data;
    datasetChecked = getDatasetChecked(data);
    renderAll();
    handleHash();
    loadUnverifiedIndex();
  } catch (error) {
    showLoadError(error);
  }
}

function bindStaticEvents() {
  els.search.addEventListener("input", () => {
    state.search = els.search.value;
    renderResults();
    updateResetState();
  });

  els.clearFilters.addEventListener("click", resetFilters);
  els.emptyReset.addEventListener("click", resetFilters);

  els.sort.addEventListener("change", () => {
    state.sort = els.sort.value;
    renderResults();
  });

  els.filterGroups.addEventListener("click", (event) => {
    const chip = event.target.closest(".chip");
    if (!chip || !els.filterGroups.contains(chip)) return;

    const group = chip.dataset.group;
    const value = chip.dataset.value;
    const set = state.filters[group];
    if (!set) return;

    if (set.has(value)) {
      set.delete(value);
      chip.setAttribute("aria-pressed", "false");
    } else {
      set.add(value);
      chip.setAttribute("aria-pressed", "true");
    }

    renderResults();
    updateResetState();
  });

  document.querySelectorAll("[data-toggle]").forEach((input) => {
    input.addEventListener("change", () => {
      const key = input.dataset.toggle;
      if (!(key in state.toggles)) return;
      state.toggles[key] = input.checked;
      renderResults();
      updateResetState();
    });
  });

  els.cards.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-open]");
    if (!trigger || !els.cards.contains(trigger)) return;
    openDetail(trigger.dataset.open);
  });

  els.closeDetail.addEventListener("click", () => {
    if (els.detail.open) els.detail.close();
  });

  els.copyLink.addEventListener("click", copyRecordLink);

  els.detail.addEventListener("click", (event) => {
    if (event.target === els.detail) els.detail.close();
  });

  els.detail.addEventListener("close", () => {
    document.body.classList.remove("dialog-open");
    if (location.hash.startsWith("#film-")) {
      history.replaceState(null, "", location.pathname + location.search);
    }
    if (lastFocused && lastFocused.isConnected) lastFocused.focus();
    lastFocused = null;
  });

  document.querySelectorAll("[data-open-index]").forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      showUnverifiedIndex();
    });
  });

  if (els.indexClose) {
    els.indexClose.addEventListener("click", hideUnverifiedIndex);
  }

  if (els.unverifiedSearch) {
    els.unverifiedSearch.addEventListener("input", () => {
      unverifiedQuery = els.unverifiedSearch.value;
      unverifiedPage = 0;
      renderUnverified();
    });
  }

  if (els.unverifiedPrev) {
    els.unverifiedPrev.addEventListener("click", () => {
      if (unverifiedPage > 0) {
        unverifiedPage -= 1;
        renderUnverified();
      }
    });
  }

  if (els.unverifiedNext) {
    els.unverifiedNext.addEventListener("click", () => {
      unverifiedPage += 1;
      renderUnverified();
    });
  }

  if (els.unverifiedAll) {
    els.unverifiedAll.addEventListener("click", () => {
      unverifiedShowAll = !unverifiedShowAll;
      unverifiedPage = 0;
      renderUnverified();
    });
  }

  window.addEventListener("hashchange", handleHash);

  document.addEventListener("keydown", (event) => {
    if (document.querySelector("dialog[open]")) return;
    if (event.key === "/" && !isEditable(event.target)) {
      event.preventDefault();
      els.search.focus();
    }
  });
}

function renderAll() {
  renderStats();
  renderFilters();
  renderResults();
  updateResetState();

  els.cards.setAttribute("aria-busy", "false");
}

function renderStats() {
  const counts = countByStatus(state.films);
  const items = [
    ["Last checked", formatShortDate(datasetChecked), true],
    ["Entries", state.films.length, false],
    ["Unavailable", counts.get("unavailable") || 0, false],
    ["Banned", counts.get("banned") || 0, false],
    ["Lost", counts.get("lost") || 0, false],
    ["Found", counts.get("found") || 0, false],
    ["Partially found", counts.get("partially_found") || 0, false],
    ["Withdrawn", counts.get("withdrawn") || 0, false],
  ];

  els.stats.innerHTML = items
    .map(([label, value, labelFirst]) => {
      const labelHtml = `<span class="stat__label">${escapeHtml(label)}</span>`;
      const valueHtml = `<span class="stat__num">${value}</span>`;
      return `<div class="stat">${labelFirst ? labelHtml + valueHtml : valueHtml + labelHtml}</div>`;
    })
    .join("");
}

function renderFilters() {
  const statusCounts = countByStatus(state.films);
  const causeCounts = countBy(state.films, (film) => film.cause);
  const decadeCounts = countBy(state.films, (film) => decadeOf(film.year));
  const typeCounts = countBy(state.films, (film) => film.type);

  const festivalCounts = new Map();
  for (const film of state.films) {
    const seen = new Set();
    for (const entry of film.festivals || []) {
      if (!entry || !entry.festival || seen.has(entry.festival)) continue;
      seen.add(entry.festival);
      festivalCounts.set(entry.festival, (festivalCounts.get(entry.festival) || 0) + 1);
    }
  }

  const decades = [...decadeCounts.keys()]
    .filter(Boolean)
    .sort((a, b) => Number.parseInt(a, 10) - Number.parseInt(b, 10));

  const types = TYPE_ORDER.filter((type) => typeCounts.has(type));
  const festivals = [...festivalCounts.keys()].sort((a, b) => a.localeCompare(b, "en"));

  const groups = [
    {
      name: "status",
      label: "Status",
      values: STATUS_ORDER,
      counts: statusCounts,
      labelFn: statusLabel,
    },
    {
      name: "cause",
      label: "Cause",
      values: CAUSE_ORDER,
      counts: causeCounts,
      labelFn: causeLabel,
    },
    {
      name: "decade",
      label: "Decade",
      values: decades,
      counts: decadeCounts,
      labelFn: (value) => value,
    },
    {
      name: "type",
      label: "Type",
      values: types,
      counts: typeCounts,
      labelFn: typeLabel,
    },
    {
      name: "festival",
      label: "Festival",
      values: festivals,
      counts: festivalCounts,
      labelFn: (value) => value,
    },
  ];

  els.filterGroups.innerHTML = groups
    .filter((group) => group.name !== "festival" || group.values.length > 0)
    .map((group) => {
      const chips = group.values
        .map((value) => {
          const count = group.counts.get(value) || 0;
          const active = state.filters[group.name].has(value);
          return `
            <button
              type="button"
              class="chip"
              data-group="${group.name}"
              data-value="${escapeHtml(value)}"
              data-zero="${count === 0 ? "true" : "false"}"
              aria-pressed="${active ? "true" : "false"}"
            >${escapeHtml(group.labelFn(value))} <span class="chip__count">${count}</span></button>`;
        })
        .join("");

      return `
        <fieldset class="filter-group" id="filter-${group.name}">
          <legend>${escapeHtml(group.label)}</legend>
          <div class="chips">${chips}</div>
        </fieldset>`;
    })
    .join("");
}

function renderResults() {
  if (!state.films.length) return;

  const filtered = getFilteredFilms();
  const sorted = sortFilms(filtered);
  const active = activeFilterCount();

  els.cards.innerHTML = sorted.map(cardHtml).join("");
  els.cards.hidden = sorted.length === 0;
  els.empty.hidden = sorted.length !== 0;
  els.cards.setAttribute("aria-busy", "false");

  if (active === 0 && sorted.length === state.films.length) {
    els.resultsSummary.textContent = `${state.films.length} records in the register.`;
  } else {
    const filterWord = active === 1 ? "filter" : "filters";
    els.resultsSummary.textContent =
      `Showing ${sorted.length} of ${state.films.length} records` +
      (active ? ` · ${active} ${filterWord} active` : "");
  }

  els.searchCount.textContent = state.search.trim()
    ? `${sorted.length} match${sorted.length === 1 ? "" : "es"}`
    : "";

  updateResetState();
}

function getFilteredFilms() {
  const query = normalize(state.search);

  return state.films.filter((film) => {
    if (query) {
      const haystack = normalize(
        [film.title, film.original_title, film.director].filter(Boolean).join(" ")
      );
      if (!haystack.includes(query)) return false;
    }

    for (const group of Object.keys(state.filters)) {
      const selected = state.filters[group];
      if (!selected.size) continue;

      if (group === "decade") {
        if (!selected.has(decadeOf(film.year))) return false;
      } else if (group === "festival") {
        if (!(film.festivals || []).some((entry) => selected.has(entry.festival))) {
          return false;
        }
      } else if (!selected.has(film[group])) {
        return false;
      }
    }

    if (state.toggles.quote && !film.quoted_reason) return false;
    if (state.toggles.noCopy && film.known_copy) return false;
    if (state.toggles.recent && !isRecentlyChecked(film.availability_last_checked)) {
      return false;
    }

    return true;
  });
}

function sortFilms(films) {
  const sorted = [...films];

  switch (state.sort) {
    case "year-asc":
      sorted.sort((a, b) => (a.year ?? 0) - (b.year ?? 0) || a.title.localeCompare(b.title, "en"));
      break;
    case "title":
      sorted.sort((a, b) => a.title.localeCompare(b.title, "en"));
      break;
    case "checked":
      sorted.sort(
        (a, b) =>
          (b.availability_last_checked || "").localeCompare(a.availability_last_checked || "") ||
          (b.year ?? 0) - (a.year ?? 0)
      );
      break;
    case "year-desc":
    default:
      sorted.sort((a, b) => (b.year ?? 0) - (a.year ?? 0) || a.title.localeCompare(b.title, "en"));
      break;
  }

  return sorted;
}

function cardHtml(film) {
  const index = String(state.films.indexOf(film) + 1).padStart(2, "0");
  const screening = film.last_verified_screening
    ? formatShortDate(film.last_verified_screening.date)
    : "No screening recorded";
  const cause = film.cause
    ? `<span class="badge badge--cause">${escapeHtml(causeLabel(film.cause))}</span>`
    : "";
  const meta = [
    film.year ? String(film.year) : "",
    film.director ? `dir. ${film.director}` : "",
  ].filter(Boolean).join(" · ");

  return `
    <article class="card status--${film.status}" aria-labelledby="card-title-${escapeHtml(film.id)}">
      <div class="card__top">
        <span class="card__index">No. ${index}</span>
        <span class="card__stamp">${escapeHtml(statusLabel(film.status))}</span>
      </div>
      <div class="card__badges">
        <span class="badge badge--conf confidence--${film.confidence}">${escapeHtml(confidenceLabel(film.confidence))}</span>
        ${cause}
      </div>
      <h3 id="card-title-${escapeHtml(film.id)}">
        <button type="button" class="card__title" data-open="${escapeHtml(film.id)}">${escapeHtml(film.title)}</button>
      </h3>
      ${film.original_title ? `<p class="card__original">${escapeHtml(film.original_title)}</p>` : ""}
      <p class="card__meta">${escapeHtml(meta)}</p>
      <p class="card__reason">${escapeHtml(film.status_detail)}</p>
      <div class="card__foot">
        <div>
          <span>Screened</span>
          <span>${escapeHtml(screening)}</span>
        </div>
        <button type="button" class="card__open" data-open="${escapeHtml(film.id)}">View record →</button>
      </div>
    </article>`;
}

function openDetail(id, options = {}) {
  const film = state.films.find((item) => item.id === id);
  if (!film) return;

  const fromHash = Boolean(options.fromHash);

  if (!els.detail.open) {
    lastFocused = document.activeElement;
    els.detail.showModal();
    document.body.classList.add("dialog-open");
  }

  const index = String(state.films.indexOf(film) + 1).padStart(2, "0");
  els.detailIndex.textContent = `Record ${index} of ${String(state.films.length).padStart(2, "0")}`;
  els.detailBody.innerHTML = detailHtml(film);
  els.detailBody.scrollTop = 0;

  if (!fromHash) {
    history.replaceState(null, "", `#film-${film.id}`);
  }

  requestAnimationFrame(() => els.closeDetail.focus());
}

function detailHtml(film) {
  const fullDate = formatDate(film.availability_last_checked);
  const runtime = film.runtime_min ? `${film.runtime_min} min` : "";
  const type = typeLabel(film.type);
  const quote = quoteHtml(film);
  const watch = watchHtml(film, fullDate);
  const sources = sourcesHtml(film);
  const festivals = festivalsHtml(film);
  const screening = screeningHtml(film);
  const knownCopy = knownCopyHtml(film);
  const details = film.original_title || (film.festivals && film.festivals.length)
    ? `<section class="detail-section">
          <h3>Details</h3>
          <dl class="record-grid">
            ${film.original_title ? `<div><dt>Original title</dt><dd>${escapeHtml(film.original_title)}</dd></div>` : ""}
            <div><dt>Festivals</dt><dd>${festivals}</dd></div>
          </dl>
        </section>`
    : "";
  const notes = film.notes
    ? `<section class="detail-section"><h3>Notes</h3><p>${escapeHtml(film.notes)}</p></section>`
    : "";
  const metaParts = [];
  if (film.year) metaParts.push(String(film.year));
  if (film.director) metaParts.push(`dir. ${film.director}`);
  if (runtime) metaParts.push(runtime);
  if (type) metaParts.push(type);
  const metaLine = metaParts.join(" · ");

  return `
    <header class="detail__head status--${film.status}">
      <div class="detail__kicker">
        <span class="stamp">${escapeHtml(statusLabel(film.status))}</span>
        <span class="badge badge--conf confidence--${film.confidence}">${escapeHtml(confidenceLabel(film.confidence))}</span>
        ${film.cause ? `<span class="badge badge--cause">${escapeHtml(causeLabel(film.cause))}</span>` : ""}
      </div>
      <h2 id="detail-title">${escapeHtml(film.title)}</h2>
      ${film.original_title ? `<p class="detail__original">${escapeHtml(film.original_title)}</p>` : ""}
      ${metaLine ? `<p class="detail__meta">${escapeHtml(metaLine)}</p>` : ""}
      <p class="detail__lede">${escapeHtml(film.status_detail)}</p>
    </header>

    <div class="detail__grid">
      <div class="detail__main">
        <section class="detail-section">
          <h3>Status</h3>
          <p>${escapeHtml(STATUS_DEFINITIONS[film.status] || "")}</p>
          <p class="muted">Availability checked ${escapeHtml(fullDate)}.</p>
        </section>

        ${quote}

        <section class="detail-section">
          <h3>Where to watch</h3>
          ${watch}
        </section>

        ${details}

        ${notes}

        <section class="detail-section">
          <h3>Sources</h3>
          <ol class="sources">${sources}</ol>
        </section>
      </div>

      <aside class="detail__aside" aria-label="Record summary">
        <section class="fact">
          <span>Last verified screening</span>
          ${screening}
        </section>
        <section class="fact">
          <span>Known copy</span>
          ${knownCopy}
        </section>
      </aside>
    </div>`;
}

function quoteHtml(film) {
  if (!film.quoted_reason) return "";

  return `
    <section class="quote-block">
      <p class="quote__label">Quoted reason</p>
      <blockquote>"${escapeHtml(film.quoted_reason.text)}"</blockquote>
      <footer>
        ${escapeHtml(film.quoted_reason.attributed_to)}
        · <a href="${escapeHtml(safeUrl(film.quoted_reason.source_url))}" target="_blank" rel="noopener noreferrer">source</a>
      </footer>
    </section>`;
}

function watchHtml(film, fullDate) {
  if (!film.where_to_watch || film.where_to_watch.length === 0) {
    return `
      <div class="watch watch--finding">
        <p>No legal streaming, VOD or archive access was found as of ${escapeHtml(fullDate)}.</p>
      </div>`;
  }

  const items = film.where_to_watch
    .map(
      (entry) => `
        <li>
          <div class="watch__platform">${escapeHtml(entry.platform)}</div>
          <a href="${escapeHtml(safeUrl(entry.url))}" target="_blank" rel="noopener noreferrer">${escapeHtml(prettyUrl(entry.url))}</a>
          ${entry.note ? `<p>${escapeHtml(entry.note)}</p>` : ""}
        </li>`
    )
    .join("");

  return `
    <ul class="watch-list">${items}</ul>`;
}

function sourcesHtml(film) {
  return (film.sources || [])
    .map(
      (source) => `
        <li>
          <span class="source__publisher">${escapeHtml(source.publisher || "Source")}</span>
          <a href="${escapeHtml(safeUrl(source.url))}" target="_blank" rel="noopener noreferrer">${escapeHtml(prettyUrl(source.url))}</a>
          <span class="source__date">retrieved ${escapeHtml(formatShortDate(source.retrieved))}</span>
        </li>`
    )
    .join("");
}

function festivalsHtml(film) {
  if (!film.festivals || film.festivals.length === 0) {
    return "None recorded";
  }

  return `<ul>${film.festivals
    .map((entry) => {
      const section = entry.section ? ` · ${escapeHtml(entry.section)}` : "";
      return `<li>${escapeHtml(entry.festival)}${entry.year ? ` ${entry.year}` : ""}${section}</li>`;
    })
    .join("")}</ul>`;
}

function screeningHtml(film) {
  if (!film.last_verified_screening) {
    return "<strong>No public screening recorded</strong>";
  }

  const screening = film.last_verified_screening;
  return `
    <strong>${escapeHtml(formatDate(screening.date))}</strong>
    <small>${escapeHtml(screening.venue || "venue unknown")}</small>
    <a href="${escapeHtml(safeUrl(screening.source_url))}" target="_blank" rel="noopener noreferrer">screening source</a>`;
}

function knownCopyHtml(film) {
  if (!film.known_copy) {
    return "<strong>No copy recorded</strong>";
  }

  const copy = film.known_copy;
  return `
    <strong>${escapeHtml(copy.holder || "Holder unknown")}</strong>
    <small>${escapeHtml(copy.format || "Format unknown")} · ${escapeHtml(copy.access || "Access unknown")}</small>`;
}

function renderChangelog() {
  if (!els.changelog) return;

  const items = [...CHANGELOG].sort((a, b) => b.date.localeCompare(a.date));

  els.changelog.innerHTML = items.map((item) => {
    const fromLabel = item.fromLabel || (item.from ? statusLabel(item.from) : "None");
    const toLabel = item.toLabel || statusLabel(item.to);
    const source = item.source
      ? `<a class="timeline__source" href="${escapeHtml(safeUrl(item.source.url))}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.source.publisher)} ↗</a>`
      : "";

    return `
      <article class="timeline__item">
        <p class="timeline__date">${escapeHtml(formatShortDate(item.date))}</p>
        <div class="timeline__headline">
          <h3 class="timeline__title"><a href="#film-${escapeHtml(item.filmId)}">${escapeHtml(item.title)}</a></h3>
          <span class="timeline__transition">
            <span class="from">${escapeHtml(fromLabel)}</span>
            <span aria-hidden="true">→</span>
            <span class="to">${escapeHtml(toLabel)}</span>
          </span>
        </div>
        <p class="timeline__note">${escapeHtml(item.note)}</p>
        ${source}
      </article>`;
  }).join("");
}

async function loadUnverifiedIndex() {
  if (!els.unverifiedRows) return;

  try {
    const response = await fetch("data/hard-to-find.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    unverifiedFilms = Array.isArray(data.films) ? data.films : [];
    const meta = data.meta || {};
    const count = unverifiedFilms.length;
    const removed = Number(meta.removed_count) || 0;
    const unmatched = Number(meta.unmatched_count) || 0;

    if (els.coverageOpenCount) {
      els.coverageOpenCount.textContent = count.toLocaleString("en-US");
    }
    if (els.heroIndexCount) {
      els.heroIndexCount.textContent = count.toLocaleString("en-US");
    }
    if (els.unverifiedRetrieved && meta.retrieved) {
      els.unverifiedRetrieved.textContent = formatDate(meta.retrieved);
    }
    const checkedNode = document.getElementById("unverified-checked");
    if (checkedNode && meta.availability_checked) {
      checkedNode.textContent = formatDate(meta.availability_checked);
    }
    const removedNote = document.getElementById("unverified-removed-note");
    if (removedNote) removedNote.textContent = removed.toLocaleString("en-US");
    const uncheckedNode = document.getElementById("unverified-unchecked-note");
    if (uncheckedNode) {
      uncheckedNode.textContent = unmatched.toLocaleString("en-US");
    }

    renderUnverified();
  } catch (error) {
    els.unverifiedRows.innerHTML = `
      <tr><td colspan="4" class="unverified__empty">The hard-to-find index could not load. Reload the page.</td></tr>`;
    if (els.unverifiedCount) els.unverifiedCount.textContent = "Hard-to-find index unavailable";
  }
}

function renderUnverified() {
  if (
    !els.unverifiedRows ||
    !els.unverifiedPrev ||
    !els.unverifiedNext ||
    !els.unverifiedPage ||
    !els.unverifiedCount
  ) {
    return;
  }

  const query = normalize(unverifiedQuery);
  const filtered = query
    ? unverifiedFilms.filter((film) =>
        normalize(`${film.title} ${film.year ?? ""}`).includes(query)
      )
    : unverifiedFilms;
  const total = filtered.length;
  const pageSize = unverifiedShowAll ? Math.max(total, 1) : UNVERIFIED_PAGE_SIZE;
  const pages = Math.max(1, Math.ceil(total / pageSize));

  if (unverifiedPage >= pages) unverifiedPage = pages - 1;
  if (unverifiedPage < 0) unverifiedPage = 0;

  if (els.unverifiedPager) els.unverifiedPager.hidden = unverifiedShowAll;
  if (els.unverifiedAll) {
    els.unverifiedAll.textContent = unverifiedShowAll
      ? `Back to ${UNVERIFIED_PAGE_SIZE} per page`
      : "Show all titles";
    els.unverifiedAll.setAttribute("aria-pressed", String(unverifiedShowAll));
  }

  const start = unverifiedShowAll ? 0 : unverifiedPage * pageSize;
  const items = filtered.slice(start, start + pageSize);

  if (!items.length) {
    els.unverifiedRows.innerHTML =
      '<tr><td colspan="4" class="unverified__empty">No titles match that search.</td></tr>';
    els.unverifiedPage.textContent = "";
    els.unverifiedPrev.disabled = true;
    els.unverifiedNext.disabled = true;
    els.unverifiedCount.textContent = query
      ? `0 matches · ${unverifiedFilms.length.toLocaleString("en-US")} indexed`
      : "0 titles";
    return;
  }

  els.unverifiedRows.innerHTML = items
    .map((film, index) => {
      const imdb = film.imdb
        ? `<a href="https://www.imdb.com/title/${encodeURIComponent(film.imdb)}/" target="_blank" rel="noopener noreferrer">IMDb ↗</a>`
        : "";

      return `
        <tr>
          <td>${String(start + index + 1).padStart(4, "0")}</td>
          <td>${escapeHtml(film.title)}</td>
          <td>${film.year ?? "unknown"}</td>
          <td><span class="unverified__links"><a href="${escapeHtml(safeUrl(film.source))}" target="_blank" rel="noopener noreferrer">Wikidata ↗</a>${imdb}</span></td>
        </tr>`;
    })
    .join("");

  const end = Math.min(start + pageSize, total);
  els.unverifiedPage.textContent = `Page ${unverifiedPage + 1} of ${pages}`;
  els.unverifiedPrev.disabled = unverifiedPage === 0;
  els.unverifiedNext.disabled = unverifiedPage >= pages - 1;
  if (unverifiedShowAll) {
    els.unverifiedCount.textContent = query
      ? `${total.toLocaleString("en-US")} matches · all shown`
      : `${total.toLocaleString("en-US")} titles · all shown`;
  } else {
    els.unverifiedCount.textContent = query
      ? `${total.toLocaleString("en-US")} matches · ${unverifiedFilms.length.toLocaleString("en-US")} indexed`
      : `${unverifiedFilms.length.toLocaleString("en-US")} titles · showing ${start + 1} to ${end}`;
  }
}

function showUnverifiedIndex({ focus = true } = {}) {
  const section = els.unverifiedSection;
  if (!section) return;

  section.hidden = false;
  document.querySelectorAll("[data-open-index]").forEach((trigger) => {
    trigger.setAttribute("aria-expanded", "true");
  });

  section.scrollIntoView({ behavior: "instant", block: "start" });

  if (focus) {
    const search = document.getElementById("unverified-search");
    if (search) {
      setTimeout(() => search.focus({ preventScroll: true }), 350);
    }
  }
}

function hideUnverifiedIndex() {
  const section = els.unverifiedSection;
  if (!section) return;

  section.hidden = true;
  document.querySelectorAll("[data-open-index]").forEach((trigger) => {
    trigger.setAttribute("aria-expanded", "false");
  });

  if (location.hash === "#unverified-index") {
    history.replaceState(null, "", location.pathname + location.search);
  }
  if (els.coverageOpen) els.coverageOpen.focus();
}

function handleHash() {
  if (location.hash === "#unverified-index") {
    showUnverifiedIndex({ focus: false });
    return;
  }

  const match = location.hash.match(/^#film-(.+)$/);
  if (!match) {
    if (els.detail.open) els.detail.close();
    return;
  }

  const id = decodeURIComponent(match[1]);
  if (!state.films.length) return;

  if (state.films.some((film) => film.id === id)) {
    openDetail(id, { fromHash: true });
  }
}

async function copyRecordLink() {
  const url = location.href;
  const original = els.copyLink.textContent;

  try {
    await navigator.clipboard.writeText(url);
    flashCopyButton("Copied");
  } catch (error) {
    window.prompt("Copy this record link:", url);
  }

  function flashCopyButton(message) {
    els.copyLink.textContent = message;
    if (copyTimer) clearTimeout(copyTimer);
    copyTimer = setTimeout(() => {
      els.copyLink.textContent = original;
    }, 1600);
  }
}

function resetFilters() {
  for (const set of Object.values(state.filters)) set.clear();

  state.search = "";
  els.search.value = "";

  for (const key of Object.keys(state.toggles)) {
    state.toggles[key] = false;
  }
  document.querySelectorAll("[data-toggle]").forEach((input) => {
    input.checked = false;
  });

  renderFilters();
  renderResults();
  updateResetState();
  els.search.focus();
}

function updateResetState() {
  const active = activeFilterCount();
  els.clearFilters.disabled = active === 0;
  if (els.emptyReset) els.emptyReset.disabled = active === 0;
}

function activeFilterCount() {
  let count = 0;
  for (const set of Object.values(state.filters)) count += set.size;
  for (const value of Object.values(state.toggles)) count += value ? 1 : 0;
  if (state.search.trim()) count += 1;
  return count;
}

function getDatasetChecked(films) {
  return films.reduce((latest, film) => {
    const value = film.availability_last_checked || "";
    return value > latest ? value : latest;
  }, "");
}

function isRecentlyChecked(value) {
  if (!value || !datasetChecked) return false;
  const checked = Date.parse(`${value}T00:00:00Z`);
  const reference = Date.parse(`${datasetChecked}T00:00:00Z`);
  if (Number.isNaN(checked) || Number.isNaN(reference)) return false;
  const days = (reference - checked) / 86400000;
  return days >= 0 && days <= 30;
}

function countByStatus(films) {
  const counts = new Map();
  for (const film of films) {
    counts.set(film.status, (counts.get(film.status) || 0) + 1);
  }
  return counts;
}

function countBy(films, getValue) {
  const counts = new Map();
  for (const film of films) {
    const value = getValue(film);
    if (!value) continue;
    counts.set(value, (counts.get(value) || 0) + 1);
  }
  return counts;
}

function decadeOf(year) {
  if (!Number.isFinite(year)) return null;
  return `${Math.floor(year / 10) * 10}s`;
}

function statusLabel(value) {
  return STATUS_LABELS[value] || capitalize(String(value || "unknown"));
}

function causeLabel(value) {
  return CAUSE_LABELS[value] || capitalize(String(value || "unknown"));
}

function confidenceLabel(value) {
  return CONFIDENCE_LABELS[value] || capitalize(String(value || "unknown"));
}

function typeLabel(value) {
  return TYPE_LABELS[value] || capitalize(String(value || "unknown"));
}

function capitalize(value) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

function formatDate(value) {
  if (!value) return "unknown";

  const parts = String(value).split("-");
  if (parts.length === 1) return parts[0];

  const year = Number(parts[0]);
  const month = Number(parts[1] || 1);
  const day = Number(parts[2] || 1);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return String(value);
  }

  const date = new Date(Date.UTC(year, month - 1, day));

  if (parts.length === 2) {
    return new Intl.DateTimeFormat("en-GB", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(date);
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function formatShortDate(value) {
  if (!value) return "unknown";

  const parts = String(value).split("-");
  if (parts.length === 1) return parts[0];

  const year = Number(parts[0]);
  const month = Number(parts[1] || 1);
  const day = Number(parts[2] || 1);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return String(value);
  }

  const date = new Date(Date.UTC(year, month - 1, day));

  if (parts.length === 2) {
    return new Intl.DateTimeFormat("en-GB", {
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }).format(date);
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function prettyUrl(value) {
  if (!value) return "";
  let text = String(value).replace(/^https?:\/\//i, "").replace(/\/$/, "");
  if (text.length > 72) text = `${text.slice(0, 69)}…`;
  return text;
}

function safeUrl(value) {
  try {
    const url = new URL(String(value), window.location.href);
    if (url.protocol === "http:" || url.protocol === "https:") return url.href;
  } catch (error) {
    // Fall through to a harmless placeholder.
  }
  return "#";
}

function normalize(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => {
    switch (character) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return character;
    }
  });
}

function isEditable(element) {
  if (!element) return false;
  const tag = element.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    element.isContentEditable
  );
}

function showLoadError(error) {
  els.stats.innerHTML = "";
  els.cards.setAttribute("aria-busy", "false");
  els.cards.hidden = false;
  els.empty.hidden = true;
  els.resultsSummary.textContent = "Data unavailable";
  els.searchCount.textContent = "";
  els.cards.innerHTML = `
    <div class="load-error">
      <h3>The register could not load.</h3>
      <p>Reload the page. If it still fails, try again later.</p>
    </div>`;
}
