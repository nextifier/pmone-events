# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Prospective visitors and buyers** are the primary audience: trade professionals and consumers deciding whether an exhibition is worth a day of their time and a ticket. They arrive from search, social, or a WhatsApp forward, usually on a phone, usually knowing nothing about the organizer. They are looking for a small set of facts fast: what this event is, when and where, who exhibits, and how to get in.

**Prospective exhibitors and sponsors** arrive with a commercial question: is this the right audience for our booth, and what does space cost. They convert through the book-space, sponsorship, and media-partner forms, and they judge credibility from the exhibitor list and past-edition evidence more than from copy.

**Existing exhibitors and their visitors** use the sites during the event itself: rundown, hall map, brand pages, gallery, and short links printed on physical material.

**Media partners and press** need factual, quotable material and downloadable assets.

Content is not authored in this repository. The organizer's marketing team writes and publishes everything through the PM One admin, and these sites render it.

## Product Purpose

Sixteen event websites, each on its own domain and brand, built from one shared Nuxt layer and fed by one API. They exist to turn attention into a decision: a ticket bought, a booth enquiry sent, a date saved.

Success is measured per event, not per site: registrations and enquiries generated, and the exhibition's own audience finding what it came for without asking the organizer.

## Positioning

Sixteen genuinely distinct event brands operate without sixteen content systems. Each site owns its domain, palette, display typeface, and voice, while sharing one page structure, one component set, and one source of truth in PM One. An organizer adding a seventeenth event gets a complete site, not a blank CMS.

The corollary matters as much: because content lives in PM One, these sites can only be as truthful as the record. They present what exists and stay silent about what does not.

## Operating Context

- **One repository, sixteen apps.** `layers/base` holds roughly 85% of the code (21 shared pages, ~70 components, composables, plugins); each app in `apps/*` carries only its config, assets, and genuinely unique components. Two events (ICC, INACON) keep guests and cosplay pages in their own app folder.
- **Editions.** Events repeat annually. A site rolls over to a new edition while the previous one still has to remain coherent and indexed, which is why edition-aware routing and empty-state honesty both matter.
- **Clusters.** Several events are co-located and share a project in PM One (CBE, ICF, and Cokelat Expo all read from `cbe`; Outing Expo reads from `ioe`). The folder name is not the data source; `dataSourceUsername || projectUsername` is.
- **Deployment.** Each app deploys separately to Cloudflare Workers with prerendered HTML and edge caching. A data model change is a multi-site rebuild and a cache purge, not a hot fix.
- **Reading conditions.** Phones on mobile data, often in a hurry, often at the venue. Weight and time to first meaningful content are product features here, not engineering preferences.

## Capabilities and Constraints

**Confirmed capabilities:** event home with hero and countdown; brands/exhibitor directory with search, filters, and multiple view modes; news/blog with multi-language posts; tickets and checkout; hotel reservation flow where enabled; rundown and programs; gallery; partners and credits; guests (pop-culture events); FAQ, help center, and policy pages; contact, book-space, sponsorship, and media-partner forms; short links and link pages; generated sitemaps; announcements and banners.

**Constraints that future work must respect:**
- `layers/base` must never name a brand. Anything event-specific belongs to the app.
- `components/ui` is kept identical across three repositories (this one, pmone's frontend, levenium) and changes must propagate to all of them.
- CDN images use `<img>` or `<BlurImage>`, never `NuxtImg`.
- Pages are prerendered; anything that must be fresh has to be explicitly excluded or revalidated, and transactional pages stay out of the index.
- Relative paths inside a layer's `nuxt.config.ts` resolve from the app, not the layer; layer config uses absolute paths.

**Open decisions:** none recorded at product level. Per-event content gaps are content problems, not product decisions.

## Brand Commitments

- Sixteen apps, each with its own domain, name, and legal entity, bound to a PM One project: megabuild, keramika, renex, flei, cafeexpo, icf, cokelatexpo, morefood, outingexpo, icc, inacon, campx, iicc, panorama-events, panorama-media, global-ai-expo.
- Every app declares its own identity in `app/app.config.ts` (name, project binding, URL, company, routes) and its own palette and display typeface in `app/assets/css/app.css`. That file is the only sanctioned place for brand-specific visual truth.
- Language: Indonesian and English are the working pair, with Japanese, Korean, and Chinese available for foreign exhibitors and visitors. Interface copy is written in English in the codebase; user-facing translation goes through i18n.

## Evidence on Hand

- `PROJECTS.md` in the PM One repository is the factual portfolio: legal entities, categories, venues, and event clusters. It is the source for anything naming an event.
- Live production data for every event flows from `api.pmone.id`. Past editions carry real exhibitor lists, galleries, and press.
- **An edition with no exhibitors must render as empty.** Never backfill a brand list from another edition or another event to make a page look populated. An empty state that tells the truth is the product working correctly.
- No testimonials, visitor-count claims, or ROI figures exist as reusable assets. Numbers shown on a site must come from the record or from material the organizer supplied.

## Product Principles

1. **The record is the site.** These are rendering surfaces over PM One. If something isn't in the record, it isn't on the page, and no interface should imply otherwise.
2. **Sixteen brands, one chassis.** Structure, components, and behavior are shared; identity is a slot each app fills. Divergence in the base layer is a defect, sameness in the brand layer is a missed opportunity.
3. **Decide fast on a phone.** A visitor should get date, place, and entry route within one screen, on mobile data, without interacting.
4. **Credibility is built from real material.** Exhibitor lists, galleries, and past editions persuade; adjectives do not.
5. **An edition is a moving object.** Every surface must stay coherent before, during, and after the event, and across the rollover to the next one.

## Accessibility & Inclusion

No formal standard has been established for this product yet; recording it as an open decision rather than an omission. Two needs are confirmed and binding: full usability on low-end phones over mobile data, and multi-language support for foreign exhibitors and visitors on every public surface.
