## Documentation rule

Docs live in /docs and are the spec of record.

After ANY change to a route, flow, permission rule, automation trigger,
or settings field:
1. Update the matching /docs/features/ file IN THE SAME TURN as the code
   change. Never batch doc updates to end of session.
2. Append one line to /docs/CHANGELOG.md: what behavior changed and why.
3. If a decision was made between options, record the rejected option and
   reason in the feature doc's Decisions section.

Document behavior, not implementation. Flows, rules, state transitions,
permissions, rationale — not component trees or prop lists.

Mark every feature: [Implemented] / [Mock] / [Planned].
Never upgrade a marker without verifying against code.
If unsure whether something is implemented or mocked, write [Unverified]
and flag it. Never guess.
