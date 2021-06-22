# Contributing

Team Inkling is a business, though we often maintain open-source software as well. We all follow the same process!

## Getting Started

- [Ensure you have a GitHub account][join].
- Feel free to [open an issue][report] to report any bugs.
  - Before you do this, try to look for similar issues that report the same thing.
    - If there are, don't respond `+1`; instead _react_ to the post to indicate your support!
  - When you open the issue, make sure you read the template and follow it, replacing sections as needed.
- [The discussions page][discussions] (if applicable) is a free, safe, and open environment to discuss anything.
  - This includes feature requests and feedback.

If in doubt, feel free the open an issue. There is a prompt for bugs and features, but you can ignore that and write 
your own issue if you like.

## The Basics

> Maintainers may push directly to `main` for minor fixes (especially documentation) and before v0.1.0 is released.

1. Fork the repository.
2. Branch from `main` in your fork.
3. Open pull requests (PRs) from your fork's new branch to our repository's `main` branch.
  a. A branch has exactly one corresponding issue and contributor.
4. The branch should be named `<username>/issue-#-<description>`, e.g., `paced/issue-31-Fix_download_button`.
  a. This is a loose rule. We will align to our branch names in PR via rebase if required, so don't sweat it.

Note that any code must be in American English and any comments should be in Australian English. Errors will not be
rejected in PR but likely will be overwritten in later code changes.

## Issue Correspondence

An issue has:

- Exactly one assignee.
  - You should add a comment that you're working on something, and you might be assigned to the issue related to it.
  - If you are assigned, then a branch will be created for you on the main repository.
    - If you're not a contributor/don't have write access to branches, you can fork with upstream branches.
- Ideally one branch.

## More Advanced Rules

1. If `main` is ahead of your branch, make yourself level with `main` by rebasing before submitting a pull request.
  a. This is optional but appreciated.
2. Once it is on `main`, that's the truth. No more rewriting history!
3. If anything goes stale, it may be closed at the maintainer's discretion.

## Quality Control

There are quality control standards.

- Run your code under as many code quality checks as possible.
- Make sure it is readable and well-documented.
- Make sure it adheres to language/framework-specific conventions.

## Maintainer's Guide

> Unless you're a maintainer, you don't need to continue reading. This section is based on [Inkling Flow][flow].

### Sprint Planning

1. A sprint is planned in advance internally.
2. Hotfixes are immediately deployed when required.
3. Otherwise, versions are created every two weeks.

### Release Documentation

1. On each `git tag`, a GitHub Release is created as a draft.
2. The maintainer must write a human-readable changelog for that version before publishing the Release.

Changelogs are for humans; it should be a human process to perform the release.

[join]:        https://github.com/join
[report]:      /issues/new
[discussions]: /discussions
[flow]:        https://github.com/teaminkling/doc-flow
