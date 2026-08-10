# Issue tracker: GitHub

Issues and PRDs for this repo live as GitHub issues. Use the `gh` CLI for all operations.

The `origin` remote is `https://github.com/BigBigGrandG/my-pi-rpg.git`. Run `gh` commands from this repository so the CLI discovers the target automatically.

## Conventions

- **Create an issue**: `gh issue create --title "..." --body "..."`.
- **Read an issue**: `gh issue view <number> --comments`.
- **List issues**: `gh issue list --state open --json number,title,body,labels,comments`.
- **Comment on an issue**: `gh issue comment <number> --body "..."`.
- **Apply/remove labels**: `gh issue edit <number> --add-label "..."` or `--remove-label "..."`.
- **Complete an issue**: apply `completed`, add a completion comment, then close it.
- **Close without completion**: close with an explanatory comment and do not apply `completed`.

Infer the repository from `git remote -v`; `gh` does this automatically inside the clone.

## Pull requests as a triage surface

**PRs as a request surface: no.**

GitHub shares one number space across issues and pull requests. Resolve an ambiguous `#42` using `gh pr view 42`, falling back to `gh issue view 42`.

## When a skill says "publish to the issue tracker"

Create a GitHub issue.

## When a skill says "fetch the relevant ticket"

Run `gh issue view <number> --comments`.

## Wayfinding operations

The map is a single issue with child issues as tickets.

- Label the map `wayfinder:map`.
- Label child tickets `wayfinder:research`, `wayfinder:prototype`, `wayfinder:grilling`, or `wayfinder:task`.
- Use GitHub sub-issues and native issue dependencies when available.
- When unavailable, use task lists and `Blocked by: #<number>` lines.
- Claim work with `gh issue edit <number> --add-assignee @me`.
- Resolve work by commenting with the result, applying `completed`, and closing the issue.
