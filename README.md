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
    runs-on: ubuntu-latest # or macos-latest, or windows-latest
    steps:
      # ...

      - name: Install Ninja 🥷
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

| Name    | Description                                              |
| ------- | -------------------------------------------------------- |
| `which` | Full (absolute) path to the installed `ninja` executable |

## `ditto-lang/actions/install-ditto@main`

Install the [ditto] compiler.

```yaml
jobs:
  do-something-with-ditto:
    runs-on: ubuntu-latest # or macos-latest, or windows-latest
    steps:
      # ...

      - name: Install ditto
        uses: ditto-lang/actions/install-ditto@main
        with:
          release-version: 0.0.3
          platform: linux

      - run: ditto --version
```

See [action.yml](./install-ninja/action.yml).

### Inputs

| Name              | Description                       | Type                        | Default    |
| ----------------- | --------------------------------- | --------------------------- | ---------- |
| `release-version` | Version tag from [ditto releases] | string                      | v0.0.3     |
| `platform`        | Override platform detection logic | `linux \| macos \| windows` | (detected) |

### Outputs

| Name    | Description                                              |
| ------- | -------------------------------------------------------- |
| `which` | Full (absolute) path to the installed `ditto` executable |

## `ditto-lang/actions/setup-ditto@main`

> Coming soon: run `ditto` commands with proper env setup etc.

[ditto]: https://github.com/ditto-lang/ditto
[ditto releases]: https://github.com/ditto-lang/ditto/releases
[ninja releases]: https://github.com/ninja-build/ninja/releases
