# conventional-git-log
[![Coverage Status](https://coveralls.io/repos/github/wesselbaum/conventional-git-log/badge.svg?branch=Unit_tests_%26_coverage)](https://coveralls.io/github/wesselbaum/conventional-git-log?branch=Unit_tests_%26_coverage)
[![Build Status](https://travis-ci.org/wesselbaum/conventional-git-log.svg?branch=master)](https://travis-ci.org/wesselbaum/conventional-git-log)
[![dependencies Status](https://david-dm.org/wesselbaum/conventional-git-log/status.svg)](https://david-dm.org/wesselbaum/conventional-git-log)

Extend git log with [conventional commits](https://www.conventionalcommits.org/en/v1.0.0-beta.2/), origin URL and custom replacements

# Install 

`npm install conventional-git-log -g`

# Usage
First of all you need to navigate to your git directory.

## Basic call
`conventional-git-log`

## Options
| Option        | Description | Default |
|:------------------|:-------------|---------|
| `format` | Format based on [git log format](https://www.git-scm.com/docs/git-log#Documentation/git-log.txt-emnem). In addition there are **Custom placeholder**(see below) | `"* **%_hScope:** %_hSubject ([%h](%_o/commit/%h)) @%an%n  * %_b%n  * %_f"` |
| `since` | Since which tag commits should be crawled. Tag commit itself will not be included. `"package"` gets the current version from the package.json file and prepends an "v". `""` means no limitation. | `"package"` |
| `orderBy` | Custom placeholder which should be sorted by. | `"%_hSubject"` |
| `order` | "ASC" for ascending and "DESC" for descending order. | `"ASC"` |
| `groupRegex` | Array of objects to create groups. If eval of the groupRegex fails the following fallback will be used `[{regex: /.*/,headline: 'All commits'}]` which outputs all commits with the headline "All commits" | `"[{regex: 'BREAKING CHANGE',headline: 'Breaking changes'},{regex: '^feat',headline: 'Features'},{regex: '^fix',headline:'Fixes'}]"` |
| `groupTemplate` | Template for the Headline. The groupRegex.headline will be inserted for %_headline placeholder available only here. | `"## %_headline"` |
| `outputEmptyGroup` | Should be a group without commits be outputted? | `true` |
| `replaceSubject` | Replaces the subject of the conventional commit. Array of objects with `replace` and `substring` properties. Replace can be a String (_wrapped by Quotes_) or a RegExp Object (_wrapped by_ /) | `""` |
| `replaceBody` | Replaces the body of the conventional commit. Array of objects with `replace` and `substring` properties. Replace can be a String (_wrapped by Quotes_) or a RegExp Object (_wrapped by_ /) | `""` |
| `replaceFooter` | Replaces the Footer of the conventional commit. Array of objects with `replace` and `substring` properties. Replace can be a String (_wrapped by Quotes_) or a RegExp Object (_wrapped by_ /) | `"[{replace: /(BREAKING CHANGE)/,substring:'**$1**'}]"` |
| `replaceInterpolated` | Replaces the commit output after all interpolations and replacements of the conventional commit. Array of objects with `replace` and `substring` properties. Replace can be a String (_wrapped by Quotes_) or a RegExp Object (_wrapped by_ /) | `""` |
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
The replacement elements are always an arrays containing objects with properties `replace` and `substring`.
The replace property can be either a String or an RegExp. 

### String 
Starts and ends with quotation marks. Searches for all occurrences of the given string and replaces it with the `substring` property.

### RegExp
Starts and ends with `/` and may be followed with flags (`gim`). Searches for all occurrences according the RegExp and replaces it with the `substring` property. The `substring` property can contain the group placeholder (like `$1`).