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

- Keep public copy in centralized typed language dictionaries and share a language provider across all routes, so navigation preserves the selected language.
- Build public pages from reusable presentation components with no data-service dependency, so verified integrations can be added independently later.
- Reference uploaded photographs through Lovable Assets pointers and optimize them before upload to keep the website lightweight.
- Keep public announcement lists and the homepage ticker on the same publication-date-descending collection, so newly published articles appear first everywhere.
- Events are static typed records in src/lib/events.ts (no database); the homepage highlight and Events list both read upcomingEvents(), so ended events drop off automatically.
