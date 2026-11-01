/* Progressive enhancement for the pre-rendered pages. No data fetches. */
(() => {
  const normalize = (value) =>
    String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  const isEditable = (element) =>
    element &&
    (element.isContentEditable ||
      element.tagName === "INPUT" ||
      element.tagName === "TEXTAREA" ||
      element.tagName === "SELECT");

  document.addEventListener("keydown", (event) => {
    if (event.key !== "/" || isEditable(event.target)) return;
    const search = document.getElementById("search") || document.getElementById("unverified-search");
    if (!search) return;
    event.preventDefault();
    search.focus();
  });

  if (document.body.dataset.page === "home") initHome();
  if (document.body.dataset.page === "index") initIndex();
  if (document.body.dataset.page === "detail") initDetail();

  function initHome() {
    const cards = [...document.querySelectorAll("#cards .card")];
    const cardsBox = document.getElementById("cards");
    const empty = document.getElementById("empty");
    const search = document.getElementById("search");
    const searchCount = document.getElementById("search-count");
    const summary = document.getElementById("results-summary");
    const sort = document.getElementById("sort");
    const filterGroups = document.getElementById("filter-groups");
    const clear = document.getElementById("clear-filters");
    const emptyReset = document.getElementById("empty-reset");
    const toggles = [...document.querySelectorAll("[data-toggle]")];
    if (!cards.length || !search || !sort) return;

    const filters = {
      status: new Set(),
      cause: new Set(),
      decade: new Set(),
      type: new Set(),
      festival: new Set(),
    };
    const state = { search: "", sort: "year-desc" };

    function activeCount() {
      let count = 0;
      for (const set of Object.values(filters)) count += set.size;
      for (const input of toggles) count += input.checked ? 1 : 0;
      if (search.value.trim()) count += 1;
      return count;
    }

    function compare(a, b) {
      const yearA = Number(a.dataset.year) || 0;
      const yearB = Number(b.dataset.year) || 0;
      switch (state.sort) {
        case "year-asc":
          return yearA - yearB || a.dataset.title.localeCompare(b.dataset.title, "en");
        case "title":
          return a.dataset.title.localeCompare(b.dataset.title, "en");
        case "checked":
          return (
            (b.dataset.checked || "").localeCompare(a.dataset.checked || "") ||
            yearB - yearA
          );
        case "year-desc":
        default:
          return yearB - yearA || a.dataset.title.localeCompare(b.dataset.title, "en");
      }
    }

    function apply() {
      const query = normalize(search.value);
      let visible = 0;

      for (const card of cards) {
        let match = !query || card.dataset.search.includes(query);

        if (match && filters.status.size) {
          match = filters.status.has(card.dataset.status);
        }
        if (match && filters.cause.size) {
          match = filters.cause.has(card.dataset.cause);
        }
        if (match && filters.decade.size) {
          match = filters.decade.has(card.dataset.decade);
        }
        if (match && filters.type.size) {
          match = filters.type.has(card.dataset.type);
        }
        if (match && filters.festival.size) {
          const festivals = card.dataset.festivals.split("|").filter(Boolean);
          match = festivals.some((festival) => filters.festival.has(festival));
        }
        if (match && document.querySelector('[data-toggle="quote"]').checked) {
          match = card.dataset.quote === "true";
        }
        if (match && document.querySelector('[data-toggle="noCopy"]').checked) {
          match = card.dataset.nocopy === "true";
        }
        if (match && document.querySelector('[data-toggle="recent"]').checked) {
          match = card.dataset.recent === "true";
        }

        card.hidden = !match;
        if (match) visible += 1;
      }

      for (const card of [...cards].sort(compare)) cardsBox.append(card);
      cardsBox.hidden = visible === 0;
      empty.hidden = visible !== 0;

      const active = activeCount();
      summary.textContent =
        active === 0 && visible === cards.length
          ? `${cards.length} records in the register.`
          : `Showing ${visible} of ${cards.length} records` +
            (active ? ` · ${active} filter${active === 1 ? "" : "s"} active` : "");
      searchCount.textContent = search.value.trim()
        ? `${visible} match${visible === 1 ? "" : "es"}`
        : "";
      clear.disabled = active === 0;
      emptyReset.disabled = active === 0;
    }

    filterGroups.addEventListener("click", (event) => {
      const chip = event.target.closest(".chip");
      if (!chip || !filterGroups.contains(chip)) return;
      const group = chip.dataset.group;
      const value = chip.dataset.value;
      const set = filters[group];
      if (!set) return;
      const active = set.has(value);
      if (active) set.delete(value);
      else set.add(value);
      chip.setAttribute("aria-pressed", String(!active));
      apply();
    });

    search.addEventListener("input", apply);
    sort.addEventListener("change", () => {
      state.sort = sort.value;
      apply();
    });
    for (const input of toggles) input.addEventListener("change", apply);

    function reset() {
      for (const set of Object.values(filters)) set.clear();
      search.value = "";
      for (const input of toggles) input.checked = false;
      for (const chip of filterGroups.querySelectorAll(".chip")) {
        chip.setAttribute("aria-pressed", "false");
      }
      apply();
      search.focus();
    }

    clear.addEventListener("click", reset);
    emptyReset.addEventListener("click", reset);
  }

  function initIndex() {
    const input = document.getElementById("unverified-search");
    const count = document.getElementById("unverified-count");
    const rows = [...document.querySelectorAll("#unverified-rows tr")].map((row) => ({
      row,
      text: normalize(`${row.cells[1]?.textContent || ""} ${row.cells[2]?.textContent || ""}`),
    }));
    if (!input || !count || !rows.length) return;

    function update() {
      const query = normalize(input.value);
      let matches = 0;
      for (const { row, text } of rows) {
        const match = !query || text.includes(query);
        row.hidden = !match;
        if (match) matches += 1;
      }
      count.textContent = query
        ? `${matches.toLocaleString("en-US")} match${matches === 1 ? "" : "es"} · ${rows.length.toLocaleString("en-US")} indexed`
        : `${rows.length.toLocaleString("en-US")} titles`;
    }

    input.addEventListener("input", update);
  }

  function initDetail() {
    const button = document.getElementById("copy-link");
    if (!button) return;
    button.addEventListener("click", async () => {
      const original = button.textContent;
      try {
        await navigator.clipboard.writeText(location.href);
        button.textContent = "Copied";
      } catch {
        button.textContent = "Copy failed";
      }
      setTimeout(() => {
        button.textContent = original;
      }, 1600);
    });
  }
})();
