// ==UserScript==
// @name         Amazon Vine Highlighter 2 Colors
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Track seen recommendations on Amazon Vine page
// @match        https://www.amazon.com/vine/vine-items*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @run-at       document-end
// ==/UserScript==

(function() {
  'use strict';

  const SEEN_RECOMMENDATIONS_KEY = 'seen_recommendations';
  const MAX_ITEMS = 200000;

  const trimOldEntries = (obj) => {
    const keys = Object.keys(obj);
    if (keys.length > MAX_ITEMS) {
      keys.sort((a, b) => obj[a] - obj[b]);
      for (let i = 0; i < keys.length - MAX_ITEMS; i++) {
        delete obj[keys[i]];
      }
    }
  };

  const applyNotSeenRecommendationsStyle = (items) => {
    const seenRecommendations = GM_getValue(SEEN_RECOMMENDATIONS_KEY, {});

    items.forEach(item => {
      const recommendationId = item.getAttribute('data-recommendation-id');
      const timestamp = seenRecommendations[recommendationId];

      if (timestamp) {
        const timeDiff = Date.now() - timestamp;
        // Modify colors based on timeDiff here:
        if (timeDiff < 1000) {
          const css = `div.vvp-item-tile[data-recommendation-id="${recommendationId}"] { background-color: #38FEA7; }`;
          GM_addStyle(css);
        } else if (timeDiff < 60000) {
          const css = `div.vvp-item-tile[data-recommendation-id="${recommendationId}"] { background-color: #FFF44D; }`;
          GM_addStyle(css);
        } else {
          // Reset to default color after 5 minutes
        }
      } else {
        // First seen, apply initial color and store timestamp
        const css = `div.vvp-item-tile[data-recommendation-id="${recommendationId}"] { background-color: #38FEA7; }`;
        GM_addStyle(css);
        seenRecommendations[recommendationId] = Date.now();
      }
    });

    trimOldEntries(seenRecommendations);
    GM_setValue(SEEN_RECOMMENDATIONS_KEY, seenRecommendations);
  };

  // Retrieve stored recommendations before processing:
  const storedRecommendations = GM_getValue(SEEN_RECOMMENDATIONS_KEY, {});
  const seenRecommendations = Object.assign({}, storedRecommendations);

  const firstPageItems = document.querySelectorAll('#vvp-items-grid .vvp-item-tile');
  applyNotSeenRecommendationsStyle(firstPageItems);

})();
