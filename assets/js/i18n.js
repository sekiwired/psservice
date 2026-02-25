/* assets/js/i18n.js ------------------------------------------------------ */
/*
   Lightweight multilingual helper for static sites.
   - Detects the visitor's preferred language (with a fallback).
   - Loads the matching <lang>.json file from assets/lang/.
   - Replaces every element that carries a data‑i18n attribute.
   - Elements with data‑i18n‑placeholder get their placeholder updated.
   - Flag buttons with data‑lang attribute act as language switchers.
   - Optional language selector (<select id="langSwitcher">) remembers the
     user's choice via localStorage.
*/

(() => {
  const DEFAULT_LANG = 'en';            // fallback if detection fails
  const LANG_STORAGE_KEY = 'siteLang';  // key used in localStorage

  /**
   * Detect the language code to use.
   *
   * 1️⃣ Prefer a language the user explicitly selected earlier (localStorage).
   * 2️⃣ Otherwise use the first entry of navigator.languages (ordered list).
   * 3️⃣ Fallback to navigator.language (single value) if the array isn't present.
   * 4️⃣ Strip any region/sub‑tag (e.g. "en‑US" → "en").
   * 5️⃣ Normalise to lower‑case and handle both hyphens and underscores.
   *
   * @returns {string} Two‑letter ISO‑639‑1 code (e.g. "en", "fr").
   */
  function detectLang() {
    // 1️⃣ Saved manual choice?
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (saved) return saved;

    // 2️⃣ Preferred list (modern browsers)
    const rawFromList = navigator.languages?.[0];

    // 3️⃣ Single‑value fallback (older browsers)
    const raw = rawFromList ?? navigator.language ?? '';

    // Trim whitespace, force lower‑case
    const cleaned = raw.trim().toLowerCase();

    // 4️⃣ Split on hyphen or underscore, take the language part
    const langPart = cleaned.split(/[-_]/)[0];

    // 5️⃣ If everything failed, return the default language
    return langPart || DEFAULT_LANG;
  }

  /**
   * Load the JSON dictionary for a given language code.
   *
   * @param {string} lang - Two‑letter language code.
   * @returns {Promise<Object>} Resolved dictionary (empty object on error).
   */
  async function loadTranslations(lang) {
    try {
      const response = await fetch(`assets/lang/${lang}.json`);
      if (!response.ok) throw new Error('missing file. ', response);
      console.log(`loaded ${lang} file`);
      return await response.json();
    } catch (_) {
      console.error(_, `file /assets/lang/${lang}.json missing`)
      // If the requested file is missing, gracefully fall back to the default.
      if (lang !== DEFAULT_LANG) return loadTranslations(DEFAULT_LANG);
      console.error(`i18n: No translation files could be loaded. lang is ${lang} and DEFAULT_LANG is ${DEFAULT_LANG}`);
      return {};
    }
  }

  /**
   * Apply a translation dictionary to the DOM.
   *
   * Elements marked with `data-i18n="key"` will receive the corresponding
   * string from the dictionary. Handles normal elements and input/button
   * controls that display a value instead of innerText.
   *
   * Elements marked with `data-i18n-placeholder="key"` get their placeholder
   * attribute updated.
   *
   * @param {Object} dict - Mapping of keys → translated strings.
   */
  function applyTranslations(dict) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (!dict.hasOwnProperty(key)) return; // missing key → leave original
      // Input buttons (value attribute) need special handling
      if (
        el.tagName === 'INPUT' &&
        (el.type === 'button' || el.type === 'submit')
      ) {
        el.value = dict[key];
      } else {
        const text = dict[key];
        const looksLikeHtml = /<\/?[a-z][\w-]*\b[^>]*>/i.test(text);
        if (looksLikeHtml) {
          // The string contains markup → render it as HTML
          el.innerHTML = text;
        } else {
          // Plain text → keep it safe as text
          el.textContent = text;
        }
      }
    });

    // Handle placeholder translations
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (dict.hasOwnProperty(key)) {
        el.placeholder = dict[key];
      }
    });
  }

  /**
   * Initialise the optional language selector dropdown.
   *
   * The selector must have `id="langSwitcher"` and contain <option> elements
   * whose values match the language codes (e.g. "en", "fr").
   *
   * @param {string} currentLang - The language currently in use.
   */
  function initSwitcher(currentLang) {
    const selector = document.getElementById('langSwitcher');
    if (!selector) return; // No selector on this page → nothing to do

    selector.value = currentLang; // reflect the detected/selected language

    selector.addEventListener('change', e => {
      const newLang = e.target.value;
      localStorage.setItem(LANG_STORAGE_KEY, newLang);
      // Simple reload ensures the new JSON file is fetched and applied
      location.reload();
    });
  }

  /**
   * Initialise flag buttons as language switchers.
   *
   * Any element with a `data-lang="xx"` attribute will:
   *  - receive a `lang-active` class if it matches the current language,
   *    or a `lang-inactive` class otherwise.
   *  - trigger a language switch and page reload on click.
   *
   * @param {string} currentLang - The language currently in use.
   */
  function initFlagSwitcher(currentLang) {
    document.querySelectorAll('[data-lang]').forEach(btn => {
      const lang = btn.getAttribute('data-lang');
      btn.classList.add(lang === currentLang ? 'lang-active' : 'lang-inactive');

      btn.addEventListener('click', () => {
        if (lang === currentLang) return; // already active
        localStorage.setItem(LANG_STORAGE_KEY, lang);
        location.reload();
      });
    });
  }

  /**
   * Bootstrap the whole process once the DOM is ready.
   */
  window.addEventListener('DOMContentLoaded', async () => {
    const lang = detectLang();                // <-- locale detection happens here
    const dict = await loadTranslations(lang); // fetch the appropriate JSON
    applyTranslations(dict);                  // swap in all strings
    initSwitcher(lang);                       // wire up the dropdown (if any)
    initFlagSwitcher(lang);                   // wire up flag buttons (if any)
    document.dispatchEvent(new CustomEvent('i18nApplied', { detail: { lang } }));

    // Set the <html lang="xx"> attribute – good for accessibility & SEO
    document.documentElement.lang = lang;
  });
})();
