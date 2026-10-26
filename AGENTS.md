<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Application architecture
- Keep municipal modules in a central configuration shared by public queries and the administrative editor, so fields stay consistent.
- Public route loaders prime TanStack Query through publishable-client server functions; private operations use authenticated functions and database RLS.
- Store profile fields separately from protected user roles; never grant staff access automatically at signup.
- Mount one session subscriber in the root and share it with the header and account screens to keep identity transitions consistent.
- Keep PoC navigation grouped by tender module in a shared catalog; evaluation-sheet URL aliases resolve to canonical modules so they reuse existing fields, data and RLS.
- Public content queries refresh while mounted and admin mutations invalidate shared public caches; resolve publication periods server-side in the municipal timezone to keep SSR and visitors consistent.
- Generate downloadable PDF reports from structured data using the shared lazy-loaded PDF exporter; public relations and conditional filters derive from the central module fields, and process timelines belong to the filtered record view.

## PoC checklist maintenance
- When a code change affects a requirement's implementation classification, update both `docs/poc/09_ESTADO_IMPLEMENTACAO.json` and the existing Google Sheets checklist: https://docs.google.com/spreadsheets/d/19OCXec6gPubvd0RXAOXf78aVK_-U8SFKG70d_fUS9I0/edit . Keep the same spreadsheet, its 168 requirement IDs, five columns, user checkboxes and unrelated notes.
- In Observação, keep clickable route(s), classification, a short usage instruction and the concrete finding, followed by the tested commit/CI evidence. Classifications describe implementation; they do not certify deployment or official homologation. Change them only after appropriate tests, and state any remaining limitation.
- Develop on `Vette`. Integrate into `main` through an explicitly authorized merge after CI. Do not rewrite published history. The user authorized the current PoC fixes to reach main; this does not authorize unrelated work.
- Keep all 23 M16 webmail requirements under the external provider. Items 1.5 and 15.6 need contractual/service evidence; a code test cannot establish future support or pricing commitments.
- Use existing Cloud only within the user's authorization. Never send Lovable prompts or invoke paid AI. Local semantic inference is permitted and must not automatically certify legal compliance.

