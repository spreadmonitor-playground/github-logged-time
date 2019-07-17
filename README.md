# github-logged-time

Aggregate logged time from Toggl and display it on GitHub issues.

## Installation

### Prerequesities

You need the [Tampermonkey][tampermonkey] browser extension installed. You can install it for the following browsers:

- Google Chrome - [download using Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
- Mozilla Firefox - [download using Firefox](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)
- Safari - [download using Safari](https://safari-extensions.apple.com/details/?id=net.tampermonkey.safari-G3XV72R5TC)
- Microsoft Edge (Chromium) - [download using Edge](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
- Microsoft Edge - [download using Edge](https://www.microsoft.com/store/apps/9NBLGGH5162S)
- and some [others][tampermonkey]

### Script installation

You can install this script via clicking the install button below or via manually copying the [content of the installation script](https://github.com/spreadmonitor-playground/github-logged-time/blob/master/src/install.user.js) to an empy script
created in the Trampermonkey dashboard.

[![install-url][badge-svg]][install-url]

### Configuration

After installation you need to add your personal Toggl access token from the [bottom of the profile page][toggl-profile-page] to the init script.

[tampermonkey]: https://www.tampermonkey.net/
[install-url]: https://cdn.jsdelivr.net/gh/spreadmonitor-playground/github-logged-time/src/install.user.js
[badge-svg]: https://badgen.net/badge/tampermonkey/install
[toggl-profile-page]: https://toggl.com/app/profile
