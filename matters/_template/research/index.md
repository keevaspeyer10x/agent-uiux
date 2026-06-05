# Research Index

This file is the matter's retrieval map for reusable research context. Before researching or answering from matter context, search this file for relevant `Context hook`, `Useful for`, and `Key facts / extracts` content.

Agents should update this index whenever any command or workflow performs research, uses external data, or discovers reusable matter context. Do this even when the full source is not saved locally. Keep entries concise, searchable, and useful to a future agent returning to the matter.

V1 retrieval means reading or searching this whole Markdown file. If the index grows beyond roughly 50 entries or 500 lines, treat it as degraded and ask whether to split, archive, or introduce stronger indexing.

When updating, match existing entries by `Location` first, then by `Source`. Update an entry when the same source is being clarified, corrected, or made easier to retrieve. Append a new entry when the source is different or when the new information is a materially separate use of the same source.

Do not index trivia, one-off search results with no matter relevance, duplicate copies of already indexed sources, or material that cannot be relocated or meaningfully summarized.

## Entries

### [Source title or short label]

- **Context hook:** Write 1-3 dense, searchable sentences explaining what this source helps with. Use likely future task language and domain terms.
- **Source:** Human-readable title or label.
- **Location:** URL, local file path, Drive link, email/thread reference, or `not saved`.
- **Source type:** Internal note, client document, legislation, regulator guidance, external article, prior advice, search result, or another concise type.
- **Useful for:** Short tags or phrases describing likely reuse contexts.
- **Key facts / extracts:**
  - Concrete reusable fact, extract, or takeaway with a citation or pinpoint reference where available.
- **Caveats:** Freshness limits, jurisdiction limits, assumptions, confidence notes, or scope limits such as `skimmed only` or `Review by: YYYY-MM-DD`.
- **Indexed:** YYYY-MM-DD

## Example Entry

### ASIC guidance on conflicted remuneration

- **Context hook:** Explains ASIC's position on conflicted remuneration in financial product advice. Relevant when assessing whether referral fees, introducer arrangements, or CAR payment structures create AFSL compliance risk.
- **Source:** ASIC Regulatory Guide 246: Conflicted and other banned remuneration.
- **Location:** https://asic.gov.au/regulatory-resources/find-a-document/regulatory-guides/rg-246-conflicted-and-other-banned-remuneration/
- **Source type:** Regulator guidance.
- **Useful for:** AFSL scope; CAR agreements; conflicted remuneration; referral fees.
- **Key facts / extracts:**
  - Conflicted remuneration analysis turns on whether a benefit could reasonably be expected to influence financial product advice or recommendations.
  - The guidance distinguishes banned conflicted remuneration from some operational or administrative benefits, depending on the facts.
- **Caveats:** Example only; check current ASIC guidance and legislation before relying on it. Review by: YYYY-MM-DD.
- **Indexed:** YYYY-MM-DD
