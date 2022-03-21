# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

### Added

-   Setting key `args` to pass arguments to `reorder-python-imports` call.

### Changed

-   Path to python executable is now discovered using the settings key
    `python.defaultInterpreterPath` instead of deprecated key
    `python.pythonPath`.

## v0.1.0 - 7 May 2020

### Added

-   Ability to specify `source.organizeImports.reorder-python-imports` for more fine
    grained control over which extensions are invoked when organizing imports on save.
-   Added documentation for how to configure vscode to reorder on save

## v0.0.3 - 7 May 2020

### Added

-   Changelog

## v0.0.2 - 7 May 2020

### Added

-   Links to relevant sites

## v0.0.1 - 7 May 2020

### Added

-   First working version
-   Context menu
-   `reorder-python-imports.reorderImports` command, named
    `Python Refactor: Reorder Imports`
-   `SourceOrganizeImports` code action for `reorder-python-imports.reorderImports`
