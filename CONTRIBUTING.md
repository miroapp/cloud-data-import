# Contributing to Miro's Cloud Data Import

Thank you for investing your time in contributing to Cloud Data Import! Any contribution you make will be reviewed by our team and is greatly appreciated.

Read our [Code of Conduct](./CODE_OF_CONDUCT.md) to keep our community approachable and respectable.

In this guide, you will get an overview of the contribution workflow from opening an issue, creating a PR, reviewing, and merging the PR.

## Table of Contents

- [New Contributor Guide](#new-contributor-guide)
- [Getting Started](#getting-started)
- [Issues](#issues)
- [Making Changes](#making-changes)
- [Commit Messages](#commit-messages)
- [Changesets](#changesets)
- [Pull Request Process](#pull-request-process)
- [Questions or Need Help?](#questions-or-need-help)

## New Contributor Guide

If you're new to contributing to open source projects, the following resources might be helpful:

- [Finding ways to contribute to open source on GitHub](https://docs.github.com/en/get-started/exploring-projects-on-github/finding-ways-to-contribute-to-open-source-on-github)
- [Set up Git](https://docs.github.com/en/get-started/quickstart/set-up-git)
- [GitHub flow](https://docs.github.com/en/get-started/quickstart/github-flow)
- [Collaborating with pull requests](https://docs.github.com/en/github/collaborating-with-pull-requests)

## Getting Started

1. Fork the repository on GitHub.
2. Clone your fork locally.
3. Create a new branch for your contribution.
4. Install dependencies with `npm install`.
5. Make your changes.
6. Run tests with `npm test`.
7. Ensure your code follows our style guidelines by running `npm run lint`.
8. Push your changes to your fork on GitHub.
9. Submit a pull request to the main repository.

## Issues

### Create a New Issue

If you spot a problem, [search if an issue already exists](https://docs.github.com/en/github/searching-for-information-on-github/searching-on-github/searching-issues-and-pull-requests#search-by-the-title-body-or-comments). If a related issue doesn't exist, you can open a new issue.

Please ensure that new issues are:

- Descriptive
- Thoughtful
- Organized

We recommend adding as many relevant links, minimal reproductions of the issue, and other materials that will help our team solve the issue quickly.

### Solve an Issue

If you're interested in solving an issue, scan through existing issues to find one that interests you. If you find an issue to work on, you are welcome to open a PR with a fix.

## Making Changes

When making changes:

1. Follow the [Getting Started](#getting-started) guide above.
2. Create a working branch and start with your changes.
3. Test your changes thoroughly.

## Changesets

We use [Changesets](https://github.com/changesets/changesets) for managing changes, versioning, and publishing. **ONLY if your changes should be published to npm**, follow these steps:

1. After making your changes, run `npx changeset`.
2. Choose the type of version bump:
   - `patch`: for backwards-compatible bug fixes, small improvements, and documentation changes
   - `minor`: for backwards-compatible new features
   - `major`: for breaking changes
3. Write a summary of your changes when prompted.
4. Commit the generated changeset file along with your changes.

## Pull Request Process

1. Ensure your code adheres to the existing style.
2. Update the README.md with details of changes to the interface, if applicable.
3. Add tests for your changes if possible.
4. Create a pull request with a clear title and description.
5. Link PR to issue if you are solving one.
6. We may ask for changes to be made before a PR can be merged, either using [suggested changes](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/incorporating-feedback-in-your-pull-request) or pull request comments. You can apply suggested changes directly through the UI. You can make any other changes in your fork, then commit them to your branch.
7. As you update your PR and apply changes, mark each conversation as [resolved](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/commenting-on-a-pull-request#resolving-conversations).
8. If you run into any merge issues, checkout this [git tutorial](https://lab.github.com/githubtraining/managing-merge-conflicts) to help you resolve merge conflicts and other issues.

## Questions or Need Help?

If you have any questions or need help with setting up, feel free to open an issue or reach out to the maintainers.

Thank you for contributing to Cloud Data Import! Happy Visualizing 🎉

Best,
Miro Team
