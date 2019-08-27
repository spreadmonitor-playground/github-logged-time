// ==UserScript==

// @name          SM - Toggl time chart for GitHub issues
// @description   Aggregate logged time from Toggl and display it on GitHub issues.
// @author        Spreadmonitor
// @namespace     spreadmonitor
// @website       https://github.com/spreadmonitor-playground/github-logged-time
// @iconURL       https://spreadmonitor.com/assets/logo.svg

// @version       0.2
// @downloadURL   https://cdn.jsdelivr.net/gh/spreadmonitor-playground/github-logged-time/src/install.user.js

// @noframes
// @run-at        document-end
// @match         https://github.com/**/issues/*

// @connect       toggl.com

// @grant         GM_addStyle
// @grant         GM_xmlhttpRequest

// @require       https://canvasjs.com/assets/script/canvasjs.min.js
// @require       https://cdn.jsdelivr.net/gh/spreadmonitor-playground/github-logged-time@0.2.0/src/add_style.js
// @require       https://cdn.jsdelivr.net/gh/spreadmonitor-playground/github-logged-time@0.2.0/src/main.js

// ==/UserScript==

(function() {
  'use strict';
  /**
   * Your personal Toggl API key from https://toggl.com/app/profile.
   * @type { string | null }
   */
  const togglApiKey = null;

  /**
   * A mapper object for pairing Github project names to Toggl project IDs.
   *
   * Note: One Github project maybe tracked in multiple Toggl projects. This scenario allows
   * you to have a meta repository on Github where all issues are handled for a customer, but
   * the time logging still happens per project basis.
   *
   * @type {{ [key: string]: number[] }}
   */
  const projectIdMap = {};

  new GithubLoggedTimeChart({ togglApiKey, projectIdMap });
})();
