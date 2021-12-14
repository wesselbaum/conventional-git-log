## 🐛 Fixes
* **audit:** audited packages ([5882654](https://github.com/wesselbaum/conventional-git-log/commit/5882654)) @awesselb
* **node:** removed shebang ([a77f4e3](https://github.com/wesselbaum/conventional-git-log/commit/a77f4e3)) @awesselb
* **package:** replaced not working version with a fork ([5fcda40](https://github.com/wesselbaum/conventional-git-log/commit/5fcda40)) @awesselb
# [2.0.0] - 2019-10-20 
## 💥 Breaking changes
* **Options:** Options get read from configuration and a new replace syntax. ([1529826](https://github.com/wesselbaum/conventional-git-log/commit/1529826)) @Aleksej Wesselbaum

## ✨ Features
* **Emoji:** Support for emoji-code for headlines added ([c346f95](https://github.com/wesselbaum/conventional-git-log/commit/c346f95)) @Aleksej Wesselbaum
* **Options:** -v outputs the current version (from package.json) ([d9d06ad](https://github.com/wesselbaum/conventional-git-log/commit/d9d06ad)) @Aleksej Wesselbaum
## 🐛 Fixes
* **Options:** Headline will use groupTemplate again ([169309c](https://github.com/wesselbaum/conventional-git-log/commit/169309c)) @Aleksej Wesselbaum
* **Release:** Small tweaks for a better release ([b6a2b03](https://github.com/wesselbaum/conventional-git-log/commit/b6a2b03)) @Aleksej Wesselbaum
  * Default sort is hScope instead of hSubject.
  * Fixed test cases.
## 📚 Documentation
* **Options:** Function Documentation ([34b36e5](https://github.com/wesselbaum/conventional-git-log/commit/34b36e5)) @wesselbaum
* **Readme:** New version descriptions ([8730a90](https://github.com/wesselbaum/conventional-git-log/commit/8730a90)) @Aleksej Wesselbaum
## ⚙️ Continuous Integrations
* **coveralls:** Istanbul to NYC ([c4b1fd9](https://github.com/wesselbaum/conventional-git-log/commit/c4b1fd9)) @Aleksej Wesselbaumxxx
## ♻️ Chores
* **Changelog:** Added a config for the changelog and changed the run script ([d947e69](https://github.com/wesselbaum/conventional-git-log/commit/d947e69)) @Aleksej Wesselbaum
# [1.0.2] - 2019-09-14 
## Features
* **replacements:** More consistent replacements ([4c18067](https://github.com/wesselbaum/conventional-git-log/commit/4c18067)) @Aleksej Wesselbaum
  * A sting won't be converted to a RegExp
