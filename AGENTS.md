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
