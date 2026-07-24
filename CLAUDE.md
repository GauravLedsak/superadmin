## Documentation rule (always active)

Every code change that affects user-facing behavior MUST include a
matching doc update in the SAME commit. No exceptions, no batching.

### What triggers a doc update
- Any route added, removed, or renamed
- Any flow change (new step, removed step, reordered steps)
- Any filter, column, tab, modal, or action added/removed/changed
- Any permission or role logic changed
- Any automation trigger or rule changed
- Any settings field added/removed/changed
- Any business rule or threshold changed
- Any bug fix that changes visible behavior

### How to update
1. Edit the matching file in /docs/features/<feature>.md
2. Update the [Implemented] / [Mock] / [Planned] marker if status changed
3. Append one line to /docs/CHANGELOG.md:
   `YYYY-MM-DD · <feature> · <what changed and why>`
4. If a decision was made between options, add it to the Decisions section
   with the rejected alternative and reasoning

### What to document
- Behavior, not implementation (what the user sees and can do)
- Flows: step-by-step primary path + edge cases
- Every visible element: tabs, columns, filters, buttons, modals, actions
- Business rules, thresholds, validation
- Permission gates (who sees what, who can do what)
- Automation triggers and their effects
- Mock vs implemented status for each section

### What NOT to document
- Component names, prop types, CSS classes
- Internal function signatures
- Import paths or file structure (except the Source line in the header)

### If unsure
Mark it [Unverified] and add to Open Questions. Never guess.