# Instructions for AI Coding Agents

## Project context

Before making changes, read `BRIEFING.md`. It is the source of truth for the product requirements, confirmed decisions, MVP scope, and open questions.

## General rules

- Do not assume that an undecided requirement has been approved.
- Distinguish confirmed requirements from hypotheses and implementation suggestions.
- If a product decision materially affects the implementation and cannot be safely deferred, ask one concise question before proceeding.
- Prefer the simplest implementation that satisfies the confirmed requirements.
- Avoid implementing features outside the MVP unless explicitly requested.
- Do not choose or introduce a technology stack without considering the project requirements and discussing material trade-offs.
- Do not add dependencies unless they provide clear value.
- Do not introduce unnecessary abstractions or premature architecture.

## Development workflow

- Inspect the existing repository before modifying it.
- Make small, focused changes that can be reviewed independently.
- Follow the conventions already established in the codebase.
- Run relevant tests, linting, formatting, and build checks after making changes.
- Never claim that a check passed unless it was actually executed successfully.
- Explain important trade-offs and any checks that could not be run.
- Update documentation when implementation changes affect documented behavior or decisions.

## Product-specific constraints

- The daily challenge must have a stable answer once published.
- All players must receive the same daily challenge.
- The core game must remain usable without an account.
- Listing content must not be published without the required permissions.
- Shared results must not reveal the answer to players who have not played.
- Keep scoring rules and other undecided mechanics configurable or isolated until they are finalized.

## Working style

- Start by understanding the task and the current code.
- Before large changes, present a short plan and identify important assumptions.
- Do not rewrite unrelated code.
- At the end of a task, summarize what changed, which checks were run, and what remains unresolved.