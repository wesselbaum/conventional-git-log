# conventional-git-log
[![Coverage Status](https://coveralls.io/repos/github/wesselbaum/conventional-git-log/badge.svg?branch=Unit_tests_%26_coverage)](https://coveralls.io/github/wesselbaum/conventional-git-log?branch=Unit_tests_%26_coverage)
[![Build Status](https://travis-ci.org/wesselbaum/conventional-git-log.svg?branch=master)](https://travis-ci.org/wesselbaum/conventional-git-log)
[![dependencies Status](https://david-dm.org/wesselbaum/conventional-git-log/status.svg)](https://david-dm.org/wesselbaum/conventional-git-log)

Extend git log with [conventional commits](https://www.conventionalcommits.org/en/v1.0.0-beta.2/), origin URL and custom replacements.
Best used for creating CHANGELOG.md the way __you__ want it!

# Install 

## Global
`npm install -g conventional-git-log`

## For one project
`npm install conventional-git-log`

# Usage

## Basic command line call
`conventional-git-log`

## Call with configuration
You can either specify a configuration location with the `config` option `conventional-git-log --config="path/to/config.json"` or you put a `cglconfig.json` somewhere up the tree structure. If you don't want the configuration up the tree to be used pass an empty string to the `config` option.

## `package.json` call
If you have installed this tool for the project you can reference it in your `package.json` in the `scripts` by calling `node_modules/.bin/convention-commit-log [parameters]`. Take a look in this projects `package.json` for more information.

## Options

The options can be either used in as CLI parameters or in the configuration file. 
I do definitely suggest you to use the configuration file since you will find typos more quickly.

| Option        | Description | Default |
|:------------------|:-------------|---------|
| `config` | Configuration JSON file. __CLI ONLY__ | `undefined` |
| `format` | Format based on [git log format](https://www.git-scm.com/docs/git-log#Documentation/git-log.txt-emnem). In addition there are **Custom placeholder**(see below) | `"* **%_hScope:** %_hSubject ([%h](%_o/commit/%h)) @%an%n  * %_b%n  * %_f"` |
| `since` | Since which tag commits should be crawled. Tag commit itself will not be included. `"package"` gets the current version from the `package.json` file and prepends an "v". `""` means no limitation. | `"package"` |
| `orderBy` | Custom placeholder which should be sorted by. | `"%_hScope"` |
| `order` | "ASC" for ascending and "DESC" for descending order. | `"ASC"` |
| `groupRegex` | Array of objects to create groups. If parsing of the groupRegex fails the following fallback will be used `[{regex: /.*/,headline: 'All commits'}]` which outputs all commits with the headline "All commits" | `{searchValue: {regexBody: "BREAKING CHANGE"}, headline: "Breaking changes"},{searchValue: {regexBody: "^feat"}, headline: "Features"},{searchValue: {regexBody: "^fix"}, headline: "Fixes"}` |
| `groupTemplate` | Template for the Headline. The groupRegex.headline will be inserted for %_headline placeholder available only here. | `"## %_headline"` |
| `outputEmptyGroup` | Should be a group without commits be outputted? | `true` |
| `replaceSubject` | Replaces the subject of the conventional commit. Array of objects with `searchValue` and `replaceValue` properties. Replace can be a String or a RegExp Object| `null` |
| `replaceBody` | Replaces the body of the conventional commit. Array of objects with `searchValue` and `replaceValue` properties. Replace can be a String or a RegExp Object | `null` |
| `replaceFooter` | Replaces the Footer of the conventional commit. Array of objects with `searchValue` and `replaceValue` properties. Replace can be a String or a RegExp Object | `null` |
| `replaceInterpolated` | Replaces the commit output after all interpolations and replacements of the conventional commit. Array of objects with `searchValue` and `replaceValue` properties. Replace can be a String or a RegExp Object| `null` |
| `q` | Should additional output will be suppressed?  | `false` |

## Custom placeholder
| Placeholder        | Description |
|:------------------|:-------------|
| `%_hScope` | Scope of conventional commit |
| `%_hSubject` | Subject of conventional commit |
| `%_hType` | Type of conventional commit | 
| `%_b` | Body of conventional commit |
| `%_f` | Footer of conventional commit |
| `%_o` | Origin remote as HTTPS url without '.git' |

## Replacements
The replacement elements are always an arrays containing objects with properties `searchValue` and `replaceValue`.

The `searchValue` can be either a String, or an object containing `regexBody`(required) and `regexFlags`(optional).

The `replaceValue` is always a String, which can have regex group placeholder (`$1`).