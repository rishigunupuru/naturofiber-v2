/* NaturoFiber — site script. Plain JavaScript, no dependencies. */
(function () {
  'use strict';

  // Contact form: paste the Web3Forms access key here once the company inbox has received it.
  // While it is empty, the form opens the visitor's email app, addressed to the company e-mail.
  var WEB3FORMS_KEY = '';
  var COMPANY_EMAIL = 'naturofiberbits@gmail.com';

  document.documentElement.classList.add('js');

  // Mobile menu
  var btn = document.getElementById('menu-btn');
  var menu = document.getElementById('mobile-menu');
  var icon = document.getElementById('menu-icon');
  var BARS = '<path d="M2 5h16M2 10h16M2 15h16" stroke="currentColor" stroke-width="2"/>';
  var CROSS = '<path d="M3 3l14 14M17 3L3 17" stroke="currentColor" stroke-width="2"/>';
  function setMenu(open) {
    menu.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    icon.innerHTML = open ? CROSS : BARS;
  }
  if (btn && menu) {
    btn.addEventListener('click', function () { setMenu(!menu.classList.contains('open')); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  }

  // Header shadow on scroll
  var header = document.getElementById('site-header');
  function onScroll() { if (header) header.classList.toggle('scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Reveal on scroll
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  // Footer year
  var yr = document.getElementById('year');
  if (yr) yr.textContent = new Date().getFullYear();

  // Enquiry form
  var form = document.getElementById('enquiry');
  if (!form) return;
  var note = document.getElementById('form-note');
  var submit = form.querySelector('button[type="submit"]');

  function say(text, cls) { note.textContent = text; note.className = cls || ''; }
  function validate() {
    var ok = true;
    ['name', 'email', 'message'].forEach(function (n) {
      var f = form.elements[n], wrap = f.closest('.fld');
      var good = f.value.trim() !== '' && (n !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim()));
      wrap.classList.toggle('bad', !good);
      if (!good) ok = false;
    });
    return ok;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (form.elements.botcheck && form.elements.botcheck.checked) return;
    if (!validate()) { say('Please fill in your name, a valid e-mail and a message.', 'fail'); return; }
    var d = {
      name: form.elements.name.value.trim(),
      organisation: form.elements.organisation.value.trim(),
      email: form.elements.email.value.trim(),
      role: form.elements.role.value,
      message: form.elements.message.value.trim()
    };

    if (!WEB3FORMS_KEY) {
      var body = 'Name: ' + d.name + '\nOrganisation: ' + d.organisation + '\nE-mail: ' + d.email + '\nI am a: ' + d.role + '\n\n' + d.message;
      window.location.href = 'mailto:' + COMPANY_EMAIL + '?subject=' + encodeURIComponent('Website enquiry from ' + d.name) + '&body=' + encodeURIComponent(body);
      say('Opening your e-mail app. If nothing opens, write to ' + COMPANY_EMAIL + '.', 'ok');
      return;
    }

    submit.disabled = true; say('Sending…');
    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: WEB3FORMS_KEY,
        subject: 'NaturoFiber website enquiry from ' + d.name,
        from_name: 'NaturoFiber website',
        name: d.name, organisation: d.organisation, email: d.email, role: d.role, message: d.message
      })
    }).then(function (r) { return r.json(); }).then(function (j) {
      if (j && j.success) { form.reset(); say('Thank you. Your message has been sent; we reply within two working days.', 'ok'); }
      else { say('Sorry, that did not send. Please e-mail ' + COMPANY_EMAIL + ' directly.', 'fail'); }
    }).catch(function () {
      say('Sorry, that did not send. Please e-mail ' + COMPANY_EMAIL + ' directly.', 'fail');
    }).then(function () { submit.disabled = false; });
  });
})();
