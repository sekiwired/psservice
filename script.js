document.addEventListener('DOMContentLoaded', function() {
  // Set current year in footer
  document.getElementById('current-year').textContent = new Date().getFullYear();
  // Mobile menu toggle
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuIcon = document.getElementById('menu-icon');
  const closeIcon = document.getElementById('close-icon');
  const logo2home = document.getElementById('logo-home');
  const footer2home = document.getElementById('footer-title');
  menuToggle.addEventListener('click', function(e) {
    e.stopPropagation();
    mobileMenu.classList.toggle('hidden');
    menuIcon.classList.toggle('hidden');
    closeIcon.classList.toggle('hidden');
  });
  logo2home.addEventListener('click', function(e) {
    e.stopPropagation();
    window.location.href = "/";
  });
  footer2home.addEventListener('click', function(e) {
    e.stopPropagation();
    window.location.href = "/";
  });
  document.addEventListener('click', (e) => {
    if (!mobileMenu.classList.contains('hidden')) {
          e.stopPropagation();
          mobileMenu.classList.add('hidden');
          menuIcon.classList.remove('hidden');
          closeIcon.classList.add('hidden');
        }
  });
  
  // Parallax effect for hero section
  const parallaxBg = document.getElementById('parallax-bg');
  window.addEventListener('scroll', function() {
    const scrollPosition = window.scrollY;
    parallaxBg.style.transform = `translateY(${scrollPosition * 0.4}px)`;
  });
  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop, // Offset for header height
          behavior: 'smooth'
        });
        // Close mobile menu if open
        if (!mobileMenu.classList.contains('hidden')) {
          mobileMenu.classList.add('hidden');
          menuIcon.classList.remove('hidden');
          closeIcon.classList.add('hidden');
        }
      }
    });
  });

  // Service cards: click any card to open one compact overlay with all services.
  const serviceCards = Array.from(document.querySelectorAll('.service-card'));
  const servicesOverlay = document.getElementById('services-overlay');
  const servicesOverlayClose = document.getElementById('services-overlay-close');
  const servicesOverlayList = document.getElementById('services-overlay-list');
  const servicesGrid = document.getElementById('services-grid');

  if (serviceCards.length && servicesOverlay && servicesOverlayClose && servicesOverlayList) {
    const openOverlay = () => {
      servicesGrid.style.display = 'none';
      servicesOverlay.classList.remove('hidden');
      servicesOverlay.setAttribute('aria-hidden', 'false');
    };

    const closeOverlay = () => {
      servicesOverlay.classList.add('hidden');
      servicesOverlay.setAttribute('aria-hidden', 'true');
      servicesGrid.style.display = '';
    };

    // Build compact overlay from current card DOM text (called on load + after i18n).
    function buildOverlayContent() {
      servicesOverlayList.innerHTML = '';
      serviceCards.forEach((card) => {
        const title = card.querySelector('.service-title')?.textContent.trim() || '';
        const summary = card.querySelector('.service-summary .service-description')?.textContent.trim() || '';
        const iconSvg = card.querySelector('.service-icon svg');
        const points = Array.from(card.querySelectorAll('.service-detail-list li'))
          .map((li) => li.textContent.trim())
          .filter(Boolean);
        const note = card.querySelector('.service-note')?.textContent.trim();
        if (note) points.push(note);

        const item = document.createElement('article');
        item.className = 'overlay-service-item';

        const head = document.createElement('div');
        head.className = 'overlay-service-head';

        const icon = document.createElement('span');
        icon.className = 'overlay-service-icon';
        if (iconSvg) icon.appendChild(iconSvg.cloneNode(true));

        const titleEl = document.createElement('h4');
        titleEl.className = 'overlay-service-title';
        titleEl.textContent = title;

        head.append(icon, titleEl);

        const listEl = document.createElement('ul');
        listEl.className = 'overlay-service-points';
        points.forEach((line) => {
          const li = document.createElement('li');
          li.textContent = line;
          listEl.appendChild(li);
        });

        item.append(head, listEl);
        servicesOverlayList.appendChild(item);
      });
    }

    // Build once immediately (covers English / cached lang with no i18n swap).
    buildOverlayContent();

    // Rebuild after i18n applies translations so overlay reflects the active language.
    document.addEventListener('i18nApplied', buildOverlayContent);

    // Wire up click/keyboard handlers once (separate from content building).
    serviceCards.forEach((card) => {
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.addEventListener('click', openOverlay);
      card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openOverlay();
        }
      });
    });

    servicesOverlayClose.addEventListener('click', closeOverlay);
    servicesOverlay.addEventListener('click', (event) => {
      if (event.target === servicesOverlay) closeOverlay();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !servicesOverlay.classList.contains('hidden')) {
        closeOverlay();
      }
    });
  }
  
// Form submission handling (prevent default for demo)
const contactForm = document.querySelector('.contact-form');

const WORKER_ENDPOINT = "KjY2MjF4bW0tJiZvLy0tLG8jdXIhbCg3LisnLG8lMCsvIy5sNS0wKScwMWwmJzRt";
function decodeEndpoint(encoded) {
  // 1️⃣  Base64 → binary string
  const xorString = atob(encoded);

  // 2️⃣  Reverse the XOR (same key you used when encoding)
  const KEY = 0x42;                 // ← must match the key from the encoder
  let url = '';
  for (let i = 0; i < xorString.length; i++) {
    url += String.fromCharCode(xorString.charCodeAt(i) ^ KEY);
  }
  return url;
};

const btnSubmit     = contactForm.querySelector('button[type="submit"]'); // the Send button

// Helper to set the button back to its original state
function resetButton() {
  btnSubmit.disabled = false;
  btnSubmit.innerHTML = 'Send Message';
  btnSubmit.classList.remove('btn-success', 'btn-error');
}

/* Build the three‑dot markup once – reuse it each time */
function createDots() {
  const container = document.createElement('span');
  container.className = 'dots';
  for (let i = 0; i < 3; i++) {
    const dot = document.createElement('span');
    container.appendChild(dot);
  }
  return container;
}

// Main submit logic
if (contactForm) {
  contactForm.addEventListener('submit', async e => {
    e.preventDefault();

    // ------- collect & validate inputs ---------------------------------
    const name    = document.getElementById('name').value.trim();
    const email   = document.getElementById('email').value.trim();
    const phone   = document.getElementById('phone').value.trim();
    const message = document.getElementById('message').value.trim();

    if (!name) {
      // quick inline feedback – we keep the button unchanged
      btnSubmit.innerHTML = '✗ Please fill out your name';
      btnSubmit.classList.add('btn-error');
      document.getElementById('name').focus();
      document.getElementById('name').style.outline='2px solid #d93025';
      setTimeout(() => {
          document.getElementById('name').style.outline = '';
      }, 3000);
      setTimeout(resetButton, 3000);
      return;
    }
    if (!message) {
      // quick inline feedback – we keep the button unchanged
      btnSubmit.innerHTML = '✗ Please enter your message';
      btnSubmit.classList.add('btn-error');
      document.getElementById('message').focus();
      document.getElementById('message').style.outline='2px solid #d93025';
      setTimeout(() => {
          document.getElementById('message').style.outline = '';
      }, 3000);
      setTimeout(resetButton, 3000);
      return;
    }
    if ( !(email || phone)) {
      // quick inline feedback – we keep the button unchanged
      btnSubmit.innerHTML = '✗ Please fill out a phone or an email or both';
      btnSubmit.classList.add('btn-error');
      document.getElementById('email').style.outline='2px solid #d93025';
      setTimeout(() => {
          document.getElementById('email').style.outline = '';
          document.getElementById('phone').style.outline='2px solid #d93025';
          setTimeout(() => {
              document.getElementById('phone').style.outline = '';
          }, 1500);
      }, 1500);
      
      setTimeout(resetButton, 3000);
      return;
    }

     // --- Show loading dots -------------------------------------------------
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '';               // clear existing text
    btnSubmit.appendChild(createDots());    // insert the three‑dot loader
    //btn.appendChild(document.createTextNode('Sending…'));
    btnSubmit.classList.remove('btn-success','btn-error');
    
    // ------- send request ---------------------------------------------
    try {
      const resp   = await fetch(decodeEndpoint(WORKER_ENDPOINT), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, message })
      });
      const result = await resp.json();

      if (resp.ok && result.success) {
        // SUCCESS -------------------------------------------------------
        btnSubmit.innerHTML = '✓ Thank you! I\'ll get back to you as soon as possible!';
        btnSubmit.classList.add('btn-success');
        contactForm.reset()
      } else {
        // SERVER‑SIDE error (Mailjet, validation, etc.) ---------------
        console.error('Worker error:', result);
        btnSubmit.innerHTML = '✗ Failed, please try again later 🙇‍♂️';
        btnSubmit.classList.add('btn-error');
      }
    } catch (err) {
      // NETWORK error ---------------------------------------------------
      console.error('Network error:', err);
      btnSubmit.innerHTML = '✗ Network issue, please try again later 🙇‍♂️';
      btnSubmit.classList.add('btn-error');
    }

    // Keep the status visible for a moment, then restore the button
    setTimeout(resetButton, 3000); // 3 seconds is usually enough
  });
}


// Grab every input/textarea that you want to protect
  const fields = document.querySelectorAll('#src, #out, textarea, input');

  fields.forEach(el => {
    el.addEventListener('focus', () => {
      // 1️⃣ Remember the viewport height *now*
      const initialVH = window.innerHeight;

      // 2️⃣ After the keyboard has had a chance to appear…
      const tryScroll = () => {
        // If the viewport height shrank, the keyboard is probably up
        if (window.innerHeight < initialVH) {
          // Scroll the element into the middle of the visible area
          el.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
          });
        } else {
          // Keyboard not yet visible – try again on the next frame
          requestAnimationFrame(tryScroll);
        }
      };

      // Kick off the check on the next animation frame
      requestAnimationFrame(tryScroll);
    });
  });

});
