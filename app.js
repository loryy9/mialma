// Mi Alma: menu, phone screens, contact form -> WhatsApp
(function () {
  var WA_NUMBER = '393518279049';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Mobile menu
  var head = document.getElementById('site-head');
  var menuBtn = head && head.querySelector('.menu-btn');
  if (menuBtn) {
    var close = function () {
      head.classList.remove('is-open');
      menuBtn.setAttribute('aria-expanded', 'false');
    };
    menuBtn.addEventListener('click', function () {
      var open = head.classList.toggle('is-open');
      menuBtn.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && head.classList.contains('is-open')) { close(); menuBtn.focus(); }
    });
    document.addEventListener('click', function (e) {
      if (head.classList.contains('is-open') && !head.contains(e.target)) close();
    });
  }

  // Phone mockups: "Profilo" / "Post" switch the screen and follow manual scrolling
  document.querySelectorAll('[data-phone]').forEach(function (phone) {
    var screen = phone.querySelector('.phone__screen');
    var group = phone.parentElement.querySelector('.phone__views');
    if (!screen || !group) return;
    var buttons = group.querySelectorAll('button');
    var imgs = screen.querySelectorAll('img');
    function mark(i) {
      buttons.forEach(function (b, j) { b.setAttribute('aria-pressed', String(i === j)); });
    }
    buttons.forEach(function (b) {
      b.addEventListener('click', function () {
        var i = Number(b.dataset.view);
        if (!imgs[i]) return;
        imgs[i].loading = 'eager';
        screen.scrollTo({ top: imgs[i].offsetTop, behavior: reduce ? 'auto' : 'smooth' });
        mark(i);
      });
    });
    var t;
    screen.addEventListener('scroll', function () {
      clearTimeout(t);
      t = setTimeout(function () {
        var i = 0;
        imgs.forEach(function (img, j) { if (screen.scrollTop >= img.offsetTop - screen.clientHeight / 2) i = j; });
        mark(i);
      }, 80);
    }, { passive: true });
  });

  // Work rail: previous / next buttons
  document.querySelectorAll('[data-rail-nav]').forEach(function (nav) {
    var rail = document.getElementById(nav.getAttribute('data-rail-nav'));
    if (!rail) return;
    var prev = nav.querySelector('[data-dir="-1"]');
    var next = nav.querySelector('[data-dir="1"]');
    function update() {
      var max = rail.scrollWidth - rail.clientWidth - 2;
      prev.disabled = rail.scrollLeft <= 2;
      next.disabled = rail.scrollLeft >= max;
      nav.hidden = max <= 0;
    }
    nav.querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function () {
        var card = rail.querySelector('.work');
        var step = card ? card.getBoundingClientRect().width + 16 : rail.clientWidth * .8;
        rail.scrollBy({ left: step * Number(b.dataset.dir), behavior: reduce ? 'auto' : 'smooth' });
      });
    });
    rail.addEventListener('scroll', function () { window.requestAnimationFrame(update); }, { passive: true });
    window.addEventListener('resize', update);
    update();
  });

  // Respect reduced motion for background videos
  if (reduce) document.querySelectorAll('video[autoplay]').forEach(function (v) { v.removeAttribute('autoplay'); v.pause(); });

  // Contact form: compose the message and open WhatsApp (no server needed)
  var form = document.getElementById('modulo');
  if (form) {
    var status = document.getElementById('modulo-stato');
    var messages = {
      nome: 'Scrivi il tuo nome, così sappiamo chi ci contatta.',
      messaggio: 'Raccontaci in due righe di cosa hai bisogno.'
    };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstBad = null;
      Object.keys(messages).forEach(function (id) {
        var el = form.elements[id];
        var err = document.getElementById(id + '-err');
        if (!el.value.trim()) {
          el.setAttribute('aria-invalid', 'true');
          err.textContent = messages[id];
          firstBad = firstBad || el;
        } else {
          el.removeAttribute('aria-invalid');
          err.textContent = '';
        }
      });
      if (firstBad) { firstBad.focus(); return; }
      var f = form.elements;
      var lines = ['Ciao Gaia! Ti scrivo dal sito di Mi Alma.', '', 'Nome: ' + f.nome.value.trim()];
      if (f.attivita.value.trim()) lines.push('Attività: ' + f.attivita.value.trim());
      if (f.settore.value) lines.push('Settore: ' + f.settore.value);
      if (f.instagram.value.trim()) lines.push('Instagram: ' + f.instagram.value.trim());
      lines.push('', f.messaggio.value.trim());
      var url = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(lines.join('\n'));
      var win = window.open(url, '_blank', 'noopener');
      status.innerHTML = win
        ? 'WhatsApp si è aperto con il tuo messaggio già scritto: premi invia e ti rispondiamo.'
        : 'Il browser ha bloccato la nuova finestra. <a href="' + url + '" target="_blank" rel="noopener">Apri WhatsApp con il messaggio</a>.';
    });
    form.querySelectorAll('input, textarea').forEach(function (el) {
      el.addEventListener('input', function () {
        if (el.getAttribute('aria-invalid') === 'true' && el.value.trim()) {
          el.removeAttribute('aria-invalid');
          var err = document.getElementById(el.id + '-err');
          if (err) err.textContent = '';
        }
      });
    });
  }
})();
