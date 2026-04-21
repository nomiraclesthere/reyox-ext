// ==UserScript==
// @name         Reyox
// @namespace    https://nomiraclesthere.github.io/reyox/
// @homepage     https://nomiraclesthere.github.io/reyox/
// @version      1.0
// @description  Open Reyox player directly from kinopoisk.ru, shikimori.one, imdb.com
// @author       reyox
// @match        *://*.kinopoisk.ru/*
// @match        *://shikimori.one/animes/*
// @match        *://*.imdb.com/title/*
// @grant        GM_addStyle
// @run-at       document-end
// ==/UserScript==

const SITE_URL = 'https://nomiraclesthere.github.io/reyox/';
const TAIL_ID = 'reyox-player-tail';
let lastUrl = location.href;

GM_addStyle(`
  #${TAIL_ID} {
    width: 32px;
    height: 128px;
    top: -128px;
    left: 8px;
    outline: none;
    cursor: pointer;
    position: fixed;
    z-index: 8888;
    transition: top 0.2s ease;
  }
`);

function mountPlayer(url) {
  window.open(url, '_blank');
}

function createTail(movieId) {
  let existing = document.getElementById(TAIL_ID);
  if (existing) existing.remove();

  const tail = document.createElement('div');
  tail.id = TAIL_ID;
  tail.addEventListener('click', () => mountPlayer(SITE_URL + '#' + movieId));
  tail.addEventListener('mouseover', () => { tail.style.top = '0px'; });
  tail.addEventListener('mouseout', () => { tail.style.top = '-32px'; });
  setTimeout(() => { tail.style.top = '-32px'; }, 100);
  document.body.appendChild(tail);
}

function removeTail() {
  const el = document.getElementById(TAIL_ID);
  if (el) el.remove();
}

function getKinopoiskId() {
  const parts = window.location.pathname.substr(1).split('/');
  const type = parts[0];
  const id = parts[1];
  if (['film', 'series'].includes(type) && /^\d+$/.test(id)) {
    return id;
  }
  return null;
}

function getShikimoriId() {
  const match = window.location.pathname.match(/^\/animes\/[a-z]*(\d+)/);
  return match ? 'shiki' + match[1] : null;
}

function getImdbId() {
  const match = window.location.pathname.match(/^\/title\/(tt\d+)/);
  return match ? 'imdb=' + match[1] : null;
}

function pageHandler() {
  const host = location.hostname;
  let movieId = null;

  if (host.includes('kinopoisk.ru')) {
    movieId = getKinopoiskId();
  } else if (host.includes('shikimori.one')) {
    movieId = getShikimoriId();
  } else if (host.includes('imdb.com')) {
    movieId = getImdbId();
  }

  if (movieId) {
    createTail(movieId);
  } else {
    removeTail();
  }
}

new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    pageHandler();
  }
}).observe(document, { subtree: true, childList: true });

window.addEventListener('load', pageHandler);
