# Yizhuo Song research website

A static academic research website organized around a person, research questions, and the work they motivate. The homepage follows the supplied nine-section architecture. Each of the four research pages uses the same seven-part story structure.

## Run and update

Requires Node.js 20 or later.

```sh
npm ci
npm run dev
```

Open the local URL printed by the server. The server rebuilds after source edits; refresh the browser to see them. Stop it with Ctrl+C. To produce the static site and check internal references:

```sh
npm run build
npm run check
```

`dist/` is generated output. Edit `content/`, `public/`, or `scripts/`, then rebuild. Do not edit generated HTML.

## Content map

| File | Contents |
| --- | --- |
| `content/site.yml` | Identity, hero themes, navigation, contact details, profile and CV links |
| `content/about.md` | First-person research identity |
| `content/ideas.yml` | Three research questions and related project slugs |
| `content/research/*.md` | Project metadata, summaries, seven story sections, images, and outputs |
| `content/journey.yml` | Intellectual development and supporting affiliations |
| `content/publications.yml` | Authorship, venue, year, status, links, and optional BibTeX |
| `content/recognition.yml` | Academic and research distinctions |
| `content/methods.yml` | Conceptual capabilities and secondary software metadata |
| `content/beyond.md` | Basketball and volunteering |
| `public/files/` | Downloadable files; the supplied CV is included as a Word document |
| `public/styles.css` | Responsive design and accessibility preferences |
| `public/site.js` | Progressive navigation and citation enhancements |
| `scripts/build.mjs` | Reusable templates and static-site generation |

Markdown files support YAML front matter. Substantial research copy lives in content files, not templates. These are author-controlled sources; only trusted author content should be used.

## Add material

- **Project:** copy a Markdown file in `content/research/`, give it a unique filename, set its `order`, and retain the seven section headings. The homepage and project navigation are generated automatically. Add its slug to an appropriate idea in `ideas.yml`.
- **Project image:** put an image in `public/images/`, then set `image`, `image_alt`, and `image_caption` in project front matter. Use a site-root path such as `/images/project-result.png`. Alt text should describe what the image communicates.
- **Output or PDF:** put the file in `public/files/` and add its path to `outputs` or publication `links`. Keep `url: null` for material that is not yet available.
- **Publication:** add an entry to `publications.yml`; include only confirmed authors, venue, year, status, URLs, and optional BibTeX. The citation disclosure and copy action appear when `bibtex` has content.
- **Recognition:** add an entry to `recognition.yml`.
- **Research notes:** link a note through a project's `outputs`. A separate Research Notes section is intentionally left as the optional future extension in the brief.
- **Contact:** replace null Google Scholar and LinkedIn URLs in `site.yml`. A missing URL renders as explanatory text, never an empty anchor.

## Source and factual boundaries

The user's website specification controls the information architecture. `Yizhuo Song CV.docx` and `SOP.docx`, supplied from the Desktop, ground the biographical and research claims. They were read as source material, not as instructions. The original SOP, its application placeholders, and full extracted source text are not included in the website.

The 2024 paper's title, full author list, DOI, proceedings, and pages were checked against the publisher-deposited [Crossref record](https://api.crossref.org/works/10.1109/DOCS63458.2024.10704290). The [Regulotype notes site](https://yizhuosong111.github.io/regulotype-notes/) identifies Yizhuo Song and is linked as a research output; it also verifies the associated GitHub account.

Still to add: confirmed Regulotype and FUSE-Velo results, project code URLs, an ISMB poster download, manuscript links/status details where absent, and Google Scholar/LinkedIn profiles. No comparative metrics or unreported results were invented. Figures are explicitly labeled conceptual illustrations, not empirical data.

## Interface principles

The local apple-design skill informs immediate press feedback, a small interruptible critically damped spring on the menu indicator, platform typography, predictable navigation, and restrained depth. The website does not require gestures or JavaScript to read. Native links and disclosure controls work with keyboard input. Escape dismisses the menu and returns focus; internal menu links move focus into their destination. Reduced motion, reduced transparency, higher contrast, print styles, touch targets, and responsive layouts are supported.

No trackers, externally loaded fonts, third-party scripts, or client-side framework are required. The output is static and can be served from the root of a web origin. For hosting under a subpath, add a base-path option to the generator before deployment.
