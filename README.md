# Philippine Unavailable Film Register

The Philippine Unavailable Film Register lists Philippine films that are hard to watch. Most are shorts and festival titles. Each record says what happened to the film, whether a legal copy exists, and where the evidence comes from. A few films have been found, and they stay in the register because access can change.

**Live:** [philippine-unavailable-film-register.pages.dev](https://philippine-unavailable-film-register.pages.dev)

The site is a static build with no backend and no database. The verified records are in [`data/films.json`](data/films.json). A separate hard-to-find index is in [`data/hard-to-find.json`](data/hard-to-find.json). The index lists 1,752 titles that had no active digital offer in a check of JustWatch Philippines on 1 November 2026.

## Pages

| Path | What you see |
| --- | --- |
| `/` | The register |
| `/film/<id>/` | One record |
| `/hard-to-find/` | The full index |

## How to read a record

A record starts with the film's title, year, director and type. The status says whether a legal copy exists and what happened to the film. The confidence badge says how strong the evidence is. Each record also lists the last documented public screening, any known copy, legal places to watch, and the sources used. Every availability claim has a check date.

## What the statuses mean

| Status | Meaning |
| --- | --- |
| `banned` | A regulator or court blocked exhibition. It needs a quotable decision, or a report quoting one. |
| `withdrawn` | Accepted or scheduled, then pulled before public screening. It needs a dated report. |
| `unreleased` | Finished or partly finished, never publicly exhibited. |
| `unavailable` | Screened at least once publicly, but there is no current legal way to watch it. It needs a documented screening and an availability search that found nothing. |
| `lost` | No known copy in any archive, studio or private collection. It needs an archive or historian statement, not "I can't find it". |
| `found` or `partially_found` | A copy has been located. The record says where and when. |

## Causes for unavailable records

`cause` applies only to `unavailable` records.

| Value | Meaning |
| --- | --- |
| `never_distributed` | Screened publicly, but never commercially distributed. |
| `distribution_ended` | Formerly available, but the legal edition or stream has ended. |
| `rights_unclear` | Rights are unknown or disputed. |
| `archive_only` | A copy is held by an archive without public access. |
| `no_known_rights_holder` | No rights holder has been identified. |

## How confidence works

| Badge | Meaning |
| --- | --- |
| `confirmed` | The core status claim comes from a primary, archive or regulator source. Examples are an archive holding, a regulator statement or a legal VOD listing. |
| `reported` | News reporting, festival pages or film databases support the core facts, but not every claim has a primary record. |
| `unverified` | The record relies on a forum, rumour or community database, or the identity of a circulating copy is unresolved. |

A `confirmed` record can still change when a catalog, region or archive policy changes.

## The lost rule

Do not use `lost` for a film that only has no streaming link. `lost` requires an archive or historian statement that no copy is known. Most films with no stream are `unavailable`, not lost.

The register leaves several films at `unavailable` rather than `lost` because the sources do not meet that bar. The "no known copy" filter shows the same fact without overstating it. Dyesebel is the clearest case. ABS-CBN Film Restoration says no copy survives, while a 2005 report describes a print in a Thai archive. The conflict is recorded, and the film stays `unavailable`.

## What counts as evidence

- A screening needs a date, a venue and a source.
- An availability claim needs a check date and a note about what was searched.
- A legal streaming, VOD, home video or archive copy means the film is `found` or `partially_found`, not `unavailable`.
- A trailer or an unauthorized upload is not a legal copy.
- A search that finds nothing is still a result. It is not proof that no copy exists.
- Quotes must be verbatim. Use an ellipsis for an omission. Name the person or body quoted and link the source.

## What is in the register

34 records, last checked 31 October 2026. 21 are unavailable, 7 are banned, 3 are found, 1 is partially found, 1 is lost and 1 is withdrawn. There are no unreleased records.

<details>
<summary>All 34 records</summary>

| Title | Year | Status | Confidence |
| --- | ---: | --- | --- |
| Food Delivery, Fresh from the West Philippine Sea | 2025 | withdrawn | reported |
| Walk With Jesus | 2025 | banned | reported |
| Alipato at Muog | 2024 | unavailable | reported |
| Dear Satan | 2024 | banned | reported |
| Kono Basho | 2024 | unavailable | reported |
| Lost Sabungeros | 2024 | unavailable | confirmed |
| The Hearing | 2024 | unavailable | reported |
| Under a Piaya Moon | 2024 | unavailable | reported |
| Paglaki Ko, Gusto Kong Maging Pornstar | 2021 | found | confirmed |
| Metamorphosis | 2019 | unavailable | reported |
| DOTA: Nakakabaliw | 2014 | unavailable | reported |
| Ayos Ka? | 2010 | banned | reported |
| Ganito Tayo Noon, Paano na Tayo Bukas? | 2010 | banned | reported |
| Aurora | 2009 | banned | reported |
| Ang Mabuhay para sa Masa | 2006 | banned | reported |
| Mga Pusang Gala | 2005 | unavailable | reported |
| Live Show | 2000 | found | confirmed |
| Butakal: Sugapa sa Laman | 1999 | banned | confirmed |
| Orapronobis | 1989 | unavailable | reported |
| Milagro sa Porta Vaga | 1982 | unavailable | unverified |
| Agent 00 | 1981 | unavailable | unverified |
| Scotch on the Rocks to Remember, Black Coffee to Forget | 1976 | unavailable | unverified |
| Pinagbuklod ng Langit | 1969 | unavailable | unverified |
| Batman Fights Dracula | 1967 | unavailable | reported |
| Iginuhit ng Tadhana | 1965 | unavailable | reported |
| Dyesebel | 1953 | unavailable | reported |
| Korea | 1952 | unavailable | unverified |
| Darna | 1951 | partially_found | reported |
| Secreto de Confesión | 1939 | unavailable | reported |
| Ang Batang Tulisan | 1938 | unavailable | unverified |
| Tiniente Rosario | 1937 | unavailable | unverified |
| Diwata ng Karagatan | 1936 | found | confirmed |
| Dalagang Bukid | 1919 | lost | confirmed |
| La Venganza de Don Silvestre | 1919 | unavailable | unverified |

</details>

## The hard-to-find index

A separate section below the verified register lists 1,752 films with a Wikidata item and the Philippines as their sole country of origin. It was checked against JustWatch Philippines on 1 November 2026. It is not part of the verified register and makes no status claim.

The screen started with 2,034 titles. JustWatch Philippines listed an active streaming, free, ad-supported, rental or purchase offer for 282, so those were removed and recorded with their evidence in [`data/digitally-available.json`](data/digitally-available.json). The remaining 1,752 had no active offer. Titles with no year or no exact JustWatch match stay in the list, marked `unchecked`, and are recorded in [`data/not-screened.json`](data/not-screened.json). They are not evidence of availability or unavailability.

The 8,000+ estimate is not this list. It covers films shot on film stock, most of which have no public title record. The figure comes from [The Philippine Star, 17 August 2026](https://www.philstar.com/entertainment/2026/08/17/2549804/philippine-cinema-faces-urgent-preservation-challenge), citing Leo Katigbak of ABS-CBN Film Archives.

A JustWatch check is a point-in-time catalog check, not a worldwide rights audit. JustWatch does not index every archive holding, festival, DVD release or unofficial upload. A title missing from the list had an active JustWatch Philippines offer. A title in the list without an exact match is marked `unchecked`. Neither is a claim that a copy is available or unavailable everywhere.

Firecrawl was used to find the JustWatch source and to spot-check ten titles, five removed and five kept. All ten matched the screen.

The full 2,034-title source index is in [`data/unverified.json`](data/unverified.json). The per-title screen is in [`data/availability-audit.json`](data/availability-audit.json).

## Add or change a record

1. Check that the film belongs. It should have no current legal access, or be a resolved case with a located copy. A film that is screening or streaming legally belongs in a note, not the register.
2. Establish the film. Find a source for title, year, director and type. Add documented festival history.
3. Establish the status. A screening, ban, withdrawal or located copy must be documented before you assign a status.
4. Check availability. Search legal streaming, VOD, home video and archive catalogs. Record the date in `availability_last_checked`.
5. Write the record. Use `null` for anything unknown. Do not invent a date, venue, runtime or quote.
6. Add sources. Every source used for a quote or screening must also appear in `sources[]` with a publisher and retrieval date.
7. Set confidence and update the changelog. Use the definitions above. If the status changed, add an item to `CHANGELOG` in `app.js` with a date and source.
8. Validate and test. Run `node scripts/validate.mjs`. Check the new record in the cards, filters, search, detail dialog and deep link.

The evidence has to support the status. If it does not, leave the record out.

## Run the site locally

Build the static output, then serve `dist`.

```bash
npm run build
npm run serve
```

Open http://localhost:4173.

Validate the data with Node 18 or newer.

```bash
node scripts/validate.mjs
# or
npm run validate
```

Node 22 is pinned in `.nvmrc`. The build works on Node 18 and newer.

## Deploy to Cloudflare Pages

The site deploys to Cloudflare Pages as a static site. `dist/` is generated by the build and is not committed.

### Current production deployment

The project `philippine-unavailable-film-register` is live at <https://philippine-unavailable-film-register.pages.dev>. Its build command (`npm run build`), output directory (`dist`) and production `SITE_URL` are already configured.

The current build was uploaded directly with Wrangler, so pushes do not deploy automatically yet. To enable automatic builds, connect the repository once:

1. Open **Workers & Pages → philippine-unavailable-film-register → Settings → Builds & deployments**.
2. Choose **Connect to Git** and select `not-wowmagic/philippine-unavailable-film-register`.
3. Keep the production branch `main` and the configured build command and output directory.

Once connected, every push to `main` rebuilds the site and pull requests get preview deployments.

### Manual deploy

```bash
npm run deploy
```

That script validates the data, builds with `SITE_URL` set to the production origin, and uploads `dist/` to the `philippine-unavailable-film-register` project. Use `npm run build` if you only need the static files.

### What the build produces

- `404.html` is served for unknown paths.
- `_headers` sets security headers and the cache policy. HTML revalidates. Hashed files under `/assets/*` are immutable for one year.
- `robots.txt` allows crawling. It includes `Sitemap:` when `SITE_URL` is set.
- `sitemap.xml` is written only when `SITE_URL` is set.

The Content-Security-Policy is strict. Scripts, styles, fonts and images are same-origin, plus inline speculation rules. If you add third-party scripts such as analytics or embeds, update the CSP in `scripts/build.mjs`.

There are no Functions, no database and no runtime environment variables. `data/` is build input and is not served. Fonts are self-hosted, so there are no third-party font requests.

The build uses absolute paths rooted at `BASE_PATH`, which is empty by default. Cloudflare Pages serves from a domain root, so leave it unset. Set it only for a subpath, for example `BASE_PATH=/repo-name npm run build`.

## Data model

`data/films.json` is an array of film records. Every record has the same shape. Unknown values are `null` and are never guessed.

| Field | Rule |
| --- | --- |
| `id` | Lowercase slug, unique. Used in deep links. |
| `title` | The title used on the site. |
| `original_title` | Original-language or alternate title, or `null`. |
| `year` | Integer or `null`. Do not infer a year from a festival edition. |
| `type` | `feature`, `documentary`, `short` or `short documentary`. |
| `director` | Required. |
| `runtime_min` | Positive integer or `null`. |
| `festivals` | Array of `{ festival, year, section }`. `section` may be `null`. Empty array if none. |
| `status` | One of the six status values. |
| `cause` | Required for `unavailable`. Must be `null` for every other status. |
| `status_detail` | One-sentence public explanation. No speculation. |
| `quoted_reason` | Required for `banned` and `lost`. `null` otherwise if no quote is needed. |
| `last_verified_screening` | Required for `unavailable`. `null` if the film has no documented public screening. |
| `known_copy` | `null` if no archive, studio or private copy is recorded. |
| `where_to_watch` | Empty array if no legal streaming, VOD or archive access was found. |
| `sources` | At least one. Every entry needs a URL, publisher and retrieval date. |
| `confidence` | `confirmed`, `reported` or `unverified`. |
| `notes` | Research notes. Required. Should record the availability search. |
| `availability_last_checked` | Required. Every availability claim carries this date. |

`where_to_watch[].note` is optional. Use it for region locks and archive-access caveats.

## Validation

The validator checks the following.

- JSON shape and unique ids.
- Required fields and allowed values.
- `cause` only on `unavailable`, and required there.
- A `quoted_reason` on every `banned` and `lost` record.
- A documented screening on every `unavailable` record.
- `lost` records have no `known_copy`.
- `found` records have a `known_copy` or a `where_to_watch` entry.
- At least one source per record, with an HTTP or HTTPS URL, publisher and retrieval date.
- Quote and screening source URLs appear in `sources[]`.
- Dates are valid and not in the future.
- `availability_last_checked` is present on every record.
- The full source index has a valid count, unique Wikidata ids, source URLs and year and IMDb fields.
- The hard-to-find index has valid retained, removed and unmatched counts, per-title availability dates and source URLs.
- The digitally-available audit file has an available JustWatch check for every removed title.

Current output.

```text
✓ 34 records validated against the register schema.
  status: withdrawn 1 · banned 7 · unavailable 21 · found 3 · lost 1 · partially_found 1
  confidence: reported 20 · confirmed 6 · unverified 8
  data last checked: 2026-10-31
  public index: 2,034 titles (Wikidata)
  hard-to-find index: 1,752 titles (282 removed; 985 not fully screened)
```

## Notes on some records

- *Bloom Where You Are Planted*, 2025, is excluded because it is still in public circulation in 2026, not for lack of sources. It won Best Film at [Cinemalaya 2025](https://www.cinemalaya.org/bloom-where-you-are-planted/), where the festival lists it at 82 minutes. It screened at a [24 September 2026 campus event](https://astig.ph/bloom-where-you-are-planted-cinemalaya-documentary-pup-bantayog-2026/) and at a [27 October 2026 screening at UP Manila](https://www.facebook.com/altermidya/posts/bloom-where-you-are-planted-screening-sa-up-manila-october-27-2026-tuesday-100-p/1631495252350950/). If those screenings end and no legal streaming or archive access appears, it can be added as `unavailable` after a fresh availability check.
- The seed lists *Aurora* as 2008. PEP.ph, IMDb and MUBI date it to 2009. The record uses 2009 and notes the difference. The X rating was given twice. The 19 January 2009 UP Cine Adarna premiere took place where MTRCB ratings did not apply.
- The seed title *Pusang Gala* refers to *Mga Pusang Gala*, released internationally as *Stray Cats*. The record uses the Filipino title and records the English title as `original_title`.
- *Lost Sabungeros* was withdrawn from Cinemalaya 2024, then screened at QCinema on 9 November 2024 and on a 2026 campus tour. It is `unavailable`, not `withdrawn`. The withdrawal is in the changelog.
- *Orapronobis* has reports of a censors' ban that was never formally lifted. No quotable regulator or court decision was found, so it is `unavailable`, not `banned`. If a quotable decision turns up, change the status and add a changelog entry.
- *Agent 00*, *Batman Fights Dracula*, *Scotch on the Rocks to Remember, Black Coffee to Forget* and *Milagro sa Porta Vaga* have no located copy in the sources checked. None has the archive or historian statement that `lost` requires, so they are `unavailable` with `known_copy` set to `null`. The "no known copy" filter shows that without calling them lost.
- *Live Show* is `found` because a legal uncut edition is for rent and purchase on Amazon US. The 2001 ban on Philippine theaters remains on record, and the US region caveat is in the where-to-watch note.

## How the site is built

- Plain HTML, CSS and JavaScript with no framework or runtime dependency.
- Verified records are in one JSON file. The hard-to-find index loads on demand and never mixes with them.
- The detail view uses native `<dialog>` and supports deep links. Filters cover status, cause, decade, type and festival. Search covers title, original title and director.
- The taxonomy panel is static HTML, so it stays visible if the data fails to load. Controls are labelled, filter chips use `aria-pressed`, result counts use `aria-live`, and reduced motion is supported.
- There are no analytics, cookies or tracking.

## Limitations

This is desk research, not an archive visit or a rights-holder interview. Availability can vary by country, and a platform listing can disappear. Some release dates and runtimes come from IMDb or Letterboxd and carry lower confidence. Archive access may require institutional affiliation.

The pre-war survival picture is still being revised. CINEMATEK's 2025 identification of *Diwata ng Karagatan* is a good example of why `lost` must be an evidence claim, not a search result.

## No piracy

No unauthorized full-film uploads are linked. When unofficial copies appear in notes, they are described but not linked. `where_to_watch` is only for legal streaming, VOD, home video or archive access. A trailer is not the film.

If you find a legal copy or a better source, add it, update `availability_last_checked`, and record the change in the changelog.

## License

Original text and data in this repository are offered under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Linked sources retain their own rights.
