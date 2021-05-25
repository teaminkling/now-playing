# Contributing

## Getting Started

- [Ensure you have a GitHub account][join].
- Feel free to [open an issue][report] to report any bugs.
  - Before you do this, try to look for similar issues that report the same thing.
    - If there are, don't respond `+1` but react to the post to indicate your support!
  - When you open the issue, make sure you read the template and follow it, replacing sections as needed.

## The Basics

> Maintainers may push directly to `main` for minor documentation fixes.

1. Fork the repository.
2. Branch from `main` in your fork.
3. Open pull requests (PRs) from your fork's new branch to our repository's `main` branch.
  a. A branch has exactly one corresponding issue and contributor.
4. The branch should be named `issue-#-description_in_snake_case`, e.g., `issue-31-fix_some_bug`.

Note that any code must be in American English and any comments should be in Australian English. Errors will not be
rejected in PR but likely will be overwritten in later code changes.

## Issue Correspondence

An issue has:

- Exactly one assignee (if worked on internally).
  - If you're an external collaborator, please comment you're working on an issue!
- Ideally one branch.
- A milestone.
  - Added by the maintainer after merging and before closing.

## Slightly More Advanced Rules

> You don't have to read this bit for the most part.

1. Nobody else will modify your branch.
  a. If you want to hand over the branch to somebody else, they must rebase your changes on their own branch. You
     will then either close your own branch, or it will be closed when stale.
2. (Optional) If upstream `main` has changes you don't have, make yourself level by rebasing before submitting a PR.
3. Once it is on `main`, that's the truth. No more rewriting history!
4. If anything goes stale, it may be closed at the maintainer's discretion.

## Quality Control

There are quality control standards.

- Run your code under as many code quality checks as possible.
- Make sure it is readable and well-documented.
- Make sure it adheres to language/framework-specific conventions.

## Maintainer's Guide

> Unless you're a maintainer, you don't need to continue reading. This section is based on [Inkling Flow][flow].

### Sprint Planning

1. Each Release is planned in advance, and a Milestone is created for that release.
2. When a set amount of tasks are completed for that Milestone, a Release is made.

It is up to the maintainers to ensure milestones exist before assigning Issues to them.

### Release Documentation

1. On each `git tag`, a GitHub Release is created as a draft.
2. The maintainer must write a human-readable changelog for that version before publishing the Release.

Changelogs are for humans, and it should be a human process to perform the release.

[join]: https://github.com/join
[report]: /issues/new
[flow]: https://github.com/teaminkling/doc-flow
