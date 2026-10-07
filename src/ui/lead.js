import { cta } from '../content.js';

// LEAD FORM — every CTA ([data-cta]) opens this pop-up. On submit the lead is
// posted to the n8n webhook (→ RD Station) and the visitor continues to the
// Hubla checkout. The webhook has no CORS, so the data goes as a plain form
// post (x-www-form-urlencoded, "no-cors"): it reaches n8n, we just can't read
// the reply. The sale is never blocked: after at most ~3 s we go to checkout.

const UTM = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'];
const digits = (s) => s.replace(/\D/g, '');
const maskPhone = (v) => {
  const d = digits(v).replace(/^55(?=\d{10,11}$)/, '').slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};

export function initLead() {
  const f = cta.form;
  const root = document.createElement('div');
  root.className = 'lead';
  root.hidden = true;
  root.innerHTML = `
    <div class="lead__scrim" data-close></div>
    <div class="lead__card" role="dialog" aria-modal="true" aria-labelledby="lead-title">
      <button class="lead__x" type="button" data-close aria-label="Fechar">×</button>
      <p class="kicker">${f.kicker}</p>
      <h2 class="lead__title" id="lead-title">${f.title}</h2>
      <p class="lead__text">${f.text}</p>
      <form class="lead__form" novalidate>
        <label class="field"><span>Nome completo</span><input name="nome" autocomplete="name" required></label>
        <label class="field"><span>E-mail</span><input name="email" type="email" autocomplete="email" inputmode="email" required></label>
        <label class="field"><span>WhatsApp</span><input name="telefone" type="tel" autocomplete="tel" inputmode="tel" placeholder="(11) 91234-5678" required></label>
        <label class="field"><span>Você é</span>
          <select name="perfil" required>
            <option value="">Selecione</option>
            <option>Empreendedor(a)</option>
            <option>Diretor(a) ou executivo(a)</option>
            <option>Outro</option>
          </select>
        </label>
        <label class="check"><input type="checkbox" name="consentimento" required><span>${f.consent}</span></label>
        <p class="lead__err" role="alert" aria-live="assertive"></p>
        <button class="btn btn--solid lead__go" type="submit"><span>${f.button}</span><i class="arrow"></i></button>
        <p class="lead__safe">${f.safe}</p>
      </form>
    </div>`;
  document.body.appendChild(root);

  const form = root.querySelector('form'), err = root.querySelector('.lead__err'), go = root.querySelector('.lead__go span');
  const phone = form.elements.telefone;
  phone.addEventListener('input', () => { phone.value = maskPhone(phone.value); });
  let lastFocus = null, sending = false;

  function open(e) {
    if (e) e.preventDefault();
    lastFocus = document.activeElement;
    root.hidden = false;
    document.documentElement.classList.add('lead-open');
    void root.offsetWidth;            // commit the hidden state so the entrance animates
    root.classList.add('is-open');
    setTimeout(() => form.elements.nome.focus({ preventScroll: true }), 60);
  }
  function close() {
    if (sending) return;
    root.classList.remove('is-open');
    document.documentElement.classList.remove('lead-open');
    setTimeout(() => { root.hidden = true; }, 300);
    lastFocus?.focus?.({ preventScroll: true });
  }
  root.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) close(); });
  document.addEventListener('keydown', (e) => {
    if (root.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') {   // keep focus inside the pop-up
      const els = [...root.querySelectorAll('button, input, select')].filter((x) => !x.disabled);
      const i = els.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); els[els.length - 1].focus(); }
      else if (!e.shiftKey && i === els.length - 1) { e.preventDefault(); els[0].focus(); }
    }
  });

  // every CTA on the page opens the form (href stays = checkout, as a no-JS fallback)
  document.querySelectorAll('[data-cta]').forEach((a) => {
    a.href = cta.checkout;
    a.addEventListener('click', (e) => { cta.onClick?.(e, a.className); open(e); });
  });

  function validate() {
    const el = form.elements;
    if (el.nome.value.trim().split(/\s+/).length < 2) return [el.nome, 'Digite seu nome completo.'];
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(el.email.value.trim())) return [el.email, 'Confira o seu e-mail.'];
    if (digits(el.telefone.value).length < 10) return [el.telefone, 'Confira o seu WhatsApp com DDD.'];
    if (!el.perfil.value) return [el.perfil, 'Selecione o seu perfil.'];
    if (!el.consentimento.checked) return [el.consentimento, 'Para continuar, aceite o contato.'];
    return null;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (sending) return;
    const bad = validate();
    form.querySelectorAll('.is-bad').forEach((x) => x.classList.remove('is-bad'));
    if (bad) { err.textContent = bad[1]; bad[0].closest('.field, .check')?.classList.add('is-bad'); bad[0].focus(); return; }
    err.textContent = '';
    sending = true; root.classList.add('is-sending'); go.textContent = f.sending;

    const el = form.elements, qs = new URLSearchParams(location.search);
    const data = new URLSearchParams({
      nome: el.nome.value.trim(),
      email: el.email.value.trim().toLowerCase(),
      telefone: '+55' + digits(el.telefone.value),
      perfil: el.perfil.value,
      consentimento: 'sim',
      curso: cta.course,
      origem: cta.source,
      pagina: location.origin + location.pathname,
      data: new Date().toISOString(),
    });
    UTM.forEach((k) => { if (qs.get(k)) data.set(k, qs.get(k)); });

    // send to n8n (no-cors form post), but never hold the sale for more than ~3 s
    const post = fetch(cta.webhook, { method: 'POST', mode: 'no-cors', body: data, keepalive: true })
      .catch(() => { try { navigator.sendBeacon(cta.webhook, data); } catch { /* ignore */ } });
    await Promise.race([post, new Promise((r) => setTimeout(r, 3000))]);

    const out = new URL(cta.checkout);
    UTM.forEach((k) => { if (qs.get(k)) out.searchParams.set(k, qs.get(k)); });
    location.href = out.toString();
  });

  // coming back from the checkout with the browser's back button: reset the form state
  window.addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    sending = false; root.classList.remove('is-sending'); go.textContent = f.button;
  });
}
