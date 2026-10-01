/* Atalayoun Beach Club · sombrilla de paja que se abre, sombra que sigue al cursor y solidifica la palabra (Climate Crisis) */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof gsap !== 'undefined';
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);
  const D = window.I18N;
  let LANG = 'fr';
  const store = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) { } } };

  function applyLang(l) {
    LANG = l;
    document.documentElement.lang = l;
    $$('[data-i18n]').forEach((el) => {
      if (el.dataset.fr === undefined) el.dataset.fr = el.innerHTML;
      el.innerHTML = l === 'fr' ? el.dataset.fr : (D.dom[l] && D.dom[l][el.dataset.i18n]) || el.dataset.fr;
    });
    $$('.lang button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === l)));
    store.set('ab-lang', l);
    $('#reviews').innerHTML = D.reviews[l].map(([t, w]) => `<figure class="rv"><p>${l === 'fr' ? '« ' + t + ' »' : '«' + t + '»'}</p><cite>${w}, Google</cite></figure>`).join('');
  }
  $$('.lang button').forEach((b) => b.addEventListener('click', () => applyLang(b.dataset.lang)));

  /* ---------- sombra que sigue al puntero ---------- */
  const hero = $('#hero'), solid = $('.hero__solid'), word = $('.hero__word');
  const target = { x: 0.5, y: 0.32 }, cur = { x: 0.5, y: 0.32 };
  let pointer = false, running = false, t0 = performance.now(), heroVisible = true;
  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect();
    target.x = (e.clientX - r.left) / r.width; target.y = (e.clientY - r.top) / r.height;
    pointer = true; wake();
  });
  hero.addEventListener('pointerleave', () => { pointer = false; });
  function frame(now) {
    if (!pointer) {
      // sin puntero, la sombra pasea despacio sobre la palabra (como el sol que se mueve)
      const k = (now - t0) / 1000;
      target.x = 0.5 + Math.sin(k * 0.45) * 0.32;
      target.y = 0.3 + Math.sin(k * 0.7) * 0.06;
    }
    cur.x += (target.x - cur.x) * 0.09;
    cur.y += (target.y - cur.y) * 0.09;
    const hr = hero.getBoundingClientRect(), wr = word.getBoundingClientRect();
    hero.style.setProperty('--x', `${(cur.x * 100).toFixed(2)}%`);
    hero.style.setProperty('--y', `${(cur.y * 100).toFixed(2)}%`);
    const px = cur.x * hr.width + hr.left - wr.left, py = cur.y * hr.height + hr.top - wr.top;
    solid.style.setProperty('--mx', `${px.toFixed(1)}px`);
    solid.style.setProperty('--my', `${py.toFixed(1)}px`);
    if (heroVisible) requestAnimationFrame(frame); else running = false;
  }
  function wake() { if (!running && !REDUCE) { running = true; requestAnimationFrame(frame); } }
  new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; if (heroVisible) wake(); }, { threshold: 0 }).observe(hero);
  if (REDUCE) { solid.style.setProperty('--mx', '50%'); solid.style.setProperty('--my', '50%'); }

  /* ---------- sombrilla de entrada ---------- */
  function heroIn() {
    if (!hasGsap || REDUCE) return;
    gsap.timeline()
      .from('.hero__melt', { opacity: 0, y: 40, duration: 1.2, ease: 'expo.out' })
      .from('.hero__row > *', { y: 20, opacity: 0, duration: 0.9, ease: 'expo.out', stagger: 0.08 }, '-=0.8')
      .from('.hero__strip img', { y: 60, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.07 }, '-=0.9');
  }
  const opening = $('#opening');
  let seen = false;
  try { seen = sessionStorage.getItem('ab-intro') === '1'; sessionStorage.setItem('ab-intro', '1'); } catch (e) { }
  if (!hasGsap || REDUCE || seen) { opening.remove(); heroIn(); wake(); }
  else {
    document.body.classList.add('is-locked');
    const tl = gsap.timeline({ onComplete: () => { opening.remove(); document.body.classList.remove('is-locked'); wake(); } });
    tl.fromTo('#umbrella', { clipPath: 'circle(3% at 50% 50%)', rotate: -40 }, { clipPath: 'circle(72% at 50% 50%)', rotate: 0, duration: 1.4, ease: 'expo.out' })
      .to('#umbrella', { scale: 1.5, yPercent: -60, duration: 1, ease: 'expo.in' }, '+=0.15')
      .to(opening, { backgroundColor: 'rgba(207,233,244,0)', duration: 0.6, ease: 'power2.out' }, '-=0.45')
      .add(heroIn, '-=0.4');
    opening.addEventListener('click', () => tl.progress(1));
  }

  /* ---------- scroll ---------- */
  function scrollFx() {
    if (!hasGsap || REDUCE) return;
    const nav = $('#nav');
    ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (s) => { const y = s.scroll(); nav.classList.toggle('is-solid', y > 40); nav.classList.toggle('is-hidden', s.direction === 1 && y > 700); } });
    ScrollTrigger.batch('.moment', { start: 'top 85%', once: true, onEnter: (els) => gsap.from(els, { y: 70, opacity: 0, rotate: (i) => (i % 2 ? 2 : -2), duration: 1.1, ease: 'expo.out', stagger: 0.12 }) });
    gsap.from('.ice__board', { y: 60, opacity: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: '.ice', start: 'top 75%' } });
    gsap.from('.ice__list li', { x: -20, opacity: 0, duration: 0.7, ease: 'expo.out', stagger: 0.07, scrollTrigger: { trigger: '.ice__list', start: 'top 85%' } });
    gsap.from('.ice__fig, .ice__fig2', { clipPath: 'inset(100% 0 0 0 round 26px)', duration: 1.3, ease: 'expo.inOut', stagger: 0.15, scrollTrigger: { trigger: '.ice', start: 'top 70%' } });
    gsap.from('.mo', { scale: 0.85, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: '.mosaic', start: 'top 80%' } });
    gsap.from('.lagoon__facts li', { x: -20, opacity: 0, duration: 0.8, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: '.lagoon__facts', start: 'top 85%' } });
    ScrollTrigger.batch('.rv', { start: 'top 90%', once: true, onEnter: (els) => gsap.from(els, { y: 30, opacity: 0, duration: 0.9, ease: 'expo.out', stagger: 0.1 }) });
  }

  const initial = [new URLSearchParams(location.search).get('lang'), store.get('ab-lang'), (navigator.language || '').slice(0, 2)].find((l) => l === 'fr' || l === 'es') || 'fr';
  applyLang(initial);
  scrollFx();
  addEventListener('load', () => hasGsap && ScrollTrigger.refresh());
})();
