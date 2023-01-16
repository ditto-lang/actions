# `ditto-lang/actions`

[![CI](https://github.com/ditto-lang/actions/actions/workflows/ci.yaml/badge.svg?branch=main)](https://github.com/ditto-lang/actions/actions/workflows/ci.yaml)
![GitHub tag (latest by date)](https://img.shields.io/github/v/tag/ditto-lang/actions)

> :warning: Very much a work-in-progress and no stable tags yet

A collection of GitHub actions to support ditto users. :octocat:

## `ditto-lang/actions/install-ninja@main`

Install the [ninja build tool](https://ninja-build.org/).

```yaml
jobs:
  do-something-with-ninja:
    runs-on: ubuntu-latest # or macos, or windows
    steps:
      # ...

      - name: Setup Ninja 🥷
        uses: ditto-lang/actions/install-ninja@main
        with:
          release-version: v1.10.2
          platform: linux

      - run: ninja --version
```

See [action.yml](./install-ninja/action.yml).

### Inputs

| Name              | Description                       | Type                  | Default    |
| ----------------- | --------------------------------- | --------------------- | ---------- |
| `release-version` | Version tag from [ninja releases] | string                | v1.10.2    |
| `platform`        | Override platform detection logic | `linux \| mac \| win` | (detected) |

### Outputs

| Name    | Description                                            |
| ------- | ------------------------------------------------------ |
| `which` | Full (absolute) path to the installed ninja executable |

## `ditto-lang/actions/setup-ditto@main`

> Coming soon: install `ditto`

## `ditto-lang/actions/ditto@main`

> Coming soon: run `ditto` commands with proper env setup etc.

[ninja releases]: https://github.com/ninja-build/ninja/releases
