/* Fastaqim, new iPhone-style build (Framework7, iOS theme). Home preview.
   Reads your saved data on this device but never changes it: taps here only change a preview copy. */
var LANG = 'en';
(function () {
  const KEY = 'launchpad.v1';
  const LANGS = [['en', 'English', 'EN'], ['ar', 'العربية', 'AR'], ['om', 'Afaan Oromoo', 'OM'], ['so', 'Soomaali', 'SO']];
  const SQK = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'], SQ5 = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
  let TX = {}, S = {}, app, timer;
  const X = { // strings the old site did not have yet
    'Your list is clear': ['قائمتك فارغة', 'Tarreen kee qulqulluu dha', 'Liiskaagu waa bannaan yahay'],
    "Qur'an, Surah": ['القرآن، سورة', "Qur'aana, Suuraa", "Qur'aanka, Suuradda"],
    'Next salah': ['الصلاة القادمة', "Salaata itti aanu", 'Salaadda xigta'],
    'in': ['بعد', 'keessatti', 'kadib'],
    'Today': ['اليوم', "Har'a", 'Maanta'],
    'Preview: taps here are not saved': ['معاينة: ما تضغطه هنا لا يُحفظ', "Agarsiisa: kan asitti tuqxu hin olkaa'amu", 'Muuqaal: waxa aad halkan ku taabato lama kaydiyo'],
    'Clear': ['مسح', 'Haqi', 'Tirtir'],
    'Mark': ['سجّل', 'Galmeessi', 'Calaamadee'],
    'Coming in the next step': ['قريبًا في الخطوة التالية', 'Tarkaanfii itti aanu keessatti', 'Tallaabada xigta ayuu imanayaa'],
    'Read on Quran.com': ['اقرأ على Quran.com', 'Quran.com irratti dubbisi', 'Ka akhri Quran.com'],
    'Istighfar 100×': ['الاستغفار ١٠٠ مرة', 'Istighfaara ×100', 'Istiqfaar ×100'],
    'Not yet': ['ليس بعد', 'Ammaaf miti', 'Weli maya'],
    'days in a row': ['أيام متتالية', 'guyyoota walitti aanan', 'maalmood oo isku xigta']
  };
  const tl = s => { if (LANG === 'en') return s; const i = { ar: 0, om: 1, so: 2 }[LANG]; if (X[s]) return X[s][i]; const t = TX[s]; return (t && t[LANG]) || s; };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const dkey = d => { d = d || new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const loc = () => (LANG === 'ar' ? 'ar' : LANG === 'so' ? 'so' : LANG === 'om' ? 'om' : 'en-US');
  const tm = d => { try { return new Intl.DateTimeFormat(LANG === 'ar' ? 'ar-u-nu-latn' : 'en-US', { hour: 'numeric', minute: '2-digit' }).format(d); } catch (e) { return d.toLocaleTimeString(); } };
  const salahFor = d => { const L = S.loc; if (!L || !isFinite(L.lat)) return null; const P = prayerTimes(d, L.lat, L.lng, L.meth || 'mwl', L.hanafi), A = L.adj || {}; for (const k in A) if (P[k] && A[k]) P[k] = new Date(P[k].getTime() + A[k] * 60000); return P; };
  const salQ = d => (S.salQ || {})[dkey(d)] || {};

  function load() { try { S = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { S = {}; } S = JSON.parse(JSON.stringify(S)); /* preview copy */
    const q = new URLSearchParams(location.search); LANG = q.get('lang') || localStorage.getItem('fq.lang') || S.lang || 'en'; if (!LANGS.some(l => l[0] === LANG)) LANG = 'en'; }

  function greet() { const h = new Date().getHours(), g = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; return tl(g) + (S.name ? (LANG === 'ar' ? ' يا ' : ', ') + S.name : ''); }
  function dateLine() { const d = new Date(); let a = ''; try { a = new Intl.DateTimeFormat(LANG === 'ar' ? 'ar-u-nu-latn' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(d); } catch (e) {} let h = ''; try { h = hijri(d); } catch (e) {} return a + (h ? ' · ' + h : ''); }
  function streak() { let n = 0; const d = new Date(); const full = q => [0, 1, 2, 3, 4].every(i => q[i] === 'on' || q[i] === 'late' || q[i] === 'exc'); if (!full(salQ(d))) d.setDate(d.getDate() - 1); while (full(salQ(d)) && n < 999) { n++; d.setDate(d.getDate() - 1); } return n; }
  function nextSalah() { const now = new Date(), P = salahFor(now); if (!P) return null; for (let i = 0; i < 5; i++) if (P[SQK[i]] > now) return { i, at: P[SQK[i]], P }; const t = new Date(now); t.setDate(t.getDate() + 1); const P2 = salahFor(t); return { i: 0, at: P2.fajr, P, tomorrow: true }; }
  function inTxt(ms) { const m = Math.max(0, Math.round(ms / 60000)), h = Math.floor(m / 60), r = m % 60; const s = (h ? h + (LANG === 'ar' ? 'س ' : 'h ') : '') + r + (LANG === 'ar' ? 'د' : 'm'); return tl('in') + ' ' + s; }

  function heroHTML() {
    const n = nextSalah(), q = salQ();
    if (!n) return `<div class="fq-hero"><div class="k">${esc(tl('Next salah'))}</div><div class="in">${esc(tl('Settings'))} → 📍</div></div>`;
    const cells = SQK.map((k, i) => { const v = q[i], cl = v === 'on' ? 'on' : v === 'late' ? 'late' : '', ic = v === 'on' || v === 'late' ? 'ph-fill ph-check-circle' : v === 'miss' ? 'ph ph-x-circle' : 'ph ph-circle';
      return `<div class="${cl}${!n.tomorrow && n.i === i ? ' nx' : ''}"><i class="${ic}"></i><b>${esc(tl(SQ5[i]))}</b><span>${esc(tm(n.P[k]))}</span></div>`; }).join('');
    return `<div class="fq-hero"><div class="k">${esc(tl('Next salah'))}</div><div class="n"><b>${esc(tl(SQ5[n.i]))}</b><span>${esc(tm(n.at))}</span></div><div class="in" id="fqIn">${esc(inTxt(n.at - new Date()))}</div><div class="fq-row">${cells}</div></div>`;
  }
  function stTxt(v) { return v === 'on' ? ['on', tl('On time')] : v === 'late' ? ['late', tl('Late')] : v === 'miss' ? ['miss', tl('Missed')] : v === 'exc' ? ['exc', tl('Excused')] : null; }
  function checkHTML() {
    const q = salQ(), P = salahFor(new Date()), now = new Date(); const got = [0, 1, 2, 3, 4].filter(i => q[i] === 'on' || q[i] === 'late' || q[i] === 'exc').length, sk = streak();
    const rows = SQK.map((k, i) => { const s = stTxt(q[i]), fut = P && P[k] > now && !q[i];
      return `<li><a class="item-link item-content" data-sal="${i}"><div class="item-inner"><div class="item-title">${esc(tl(SQ5[i]))}</div><div class="item-after">${s ? `<span class="st ${s[0]}">${esc(s[1])}</span>` : `<span class="st">${esc(fut ? tl('Not yet') : tl('Mark'))}</span>`}</div></div></a></li>`; }).join('');
    const ist = Math.min(100, (((S.ci || {})[dkey()] || {}).az || {}).p3 || 0);
    return `<div class="block-title block-title-medium" style="display:flex;justify-content:space-between;align-items:baseline">${esc(tl('Daily check-in'))}<span class="fq-pct">${Math.round(got / 5 * 100)}%</span></div>
      ${sk ? `<div class="block" style="margin:-4px 0 8px"><span class="fq-streak"><i class="ph-fill ph-star"></i>${sk} ${esc(tl('days in a row'))}</span></div>` : ''}
      <div class="list inset list-strong"><ul>${rows}</ul></div>
      <div class="list inset list-strong media-list-off"><ul>
        <li><a class="item-link item-content" data-soon="1"><div class="item-media"><i class="ph ph-sun-horizon"></i></div><div class="item-inner"><div class="item-title">${esc(tl('Morning adhkar'))}</div></div></a></li>
        <li><a class="item-link item-content" data-soon="1"><div class="item-media"><i class="ph ph-moon-stars"></i></div><div class="item-inner"><div class="item-title">${esc(tl('Evening adhkar'))}</div></div></a></li>
        <li><a class="item-link item-content" data-soon="1"><div class="item-media"><i class="ph ph-circles-three"></i></div><div class="item-inner"><div class="item-title">${esc(tl('Istighfar 100×'))}</div><div class="item-after"><bdi>${ist}/100</bdi></div></div></a></li>
      </ul></div>`;
  }
  function topHTML() {
    const T = (S.tasks || []).filter(t => !t.done).sort((a, b) => (b.top ? 1 : 0) - (a.top ? 1 : 0) || (a.pri || 9) - (b.pri || 9)).slice(0, 3);
    const rows = T.length ? T.map(t => `<li><label class="item-checkbox item-content"><input type="checkbox" data-task="${esc(t.id)}"><i class="icon icon-checkbox"></i><div class="item-inner"><div class="item-title">${esc(t.title)}</div></div></label></li>`).join('')
      : `<li><div class="item-content"><div class="item-inner"><div class="item-title" style="color:var(--fq-muted)">${esc(tl('Your list is clear'))}</div></div></div></li>`;
    return `<div class="block-title block-title-medium">${esc(tl('Top 3'))}</div><div class="list inset list-strong"><ul>${rows}</ul></div>`;
  }
  function verseHTML() {
    let v; try { v = vodToday(); } catch (e) { return ''; } if (!v) return '';
    const tr = LANG === 'ar' ? '' : (v[LANG] || v.en || ''), ref = (LANG === 'ar' ? 'سورة ' + v.sa : tl("Qur'an, Surah") + ' ' + v.s) + ' ' + v.k, [s, r] = v.k.split(':');
    return `<div class="block-title block-title-medium">${esc(tl('Verse of the day'))}</div><div class="fq-verse"><div class="k"><span>${esc(ref)}</span></div><p class="ar" lang="ar">${esc(v.ar)}</p>${tr ? `<p class="tr">${esc(tr)}</p>` : ''}<a class="external" target="_blank" rel="noopener" href="https://quran.com/${s}/${r.split('-')[0]}">${esc(tl('Read on Quran.com'))} <i class="ph ph-arrow-up-right"></i></a></div>`;
  }
  function homePage() {
    const L = LANGS.find(l => l[0] === LANG);
    return `<div class="page" data-name="home"><div class="navbar navbar-transparent"><div class="navbar-bg"></div><div class="navbar-inner">
        <div class="title">${esc(tl('Home'))}</div>
        <div class="right"><a class="link fq-lang popover-open" data-popover=".fq-langs"><i class="ph ph-globe"></i>${L[2]}<i class="ph ph-caret-down" style="font-size:14px"></i></a></div>
        </div></div>
      <div class="page-content">
        <h1 class="fq-hi">${esc(greet())}</h1><div class="fq-sub">${esc(dateLine())}</div>
        <div class="fq-preview"><i class="ph ph-info"></i>${esc(tl('Preview: taps here are not saved'))}</div>
        ${heroHTML()}${checkHTML()}${topHTML()}${verseHTML()}<div style="height:24px"></div>
      </div></div>`;
  }
  function soonPage(t, ic) { return `<div class="page"><div class="navbar navbar-large"><div class="navbar-bg"></div><div class="navbar-inner"><div class="title">${esc(tl(t))}</div><div class="title-large"><div class="title-large-text">${esc(tl(t))}</div></div></div></div><div class="page-content"><div class="fq-soon"><i class="ph ${ic}"></i>${esc(tl('Coming in the next step'))}</div></div></div>`; }
  const TABS = [['home', 'Home', 'ph-house'], ['stars', 'Stars', 'ph-star'], ['todo', 'To-do', 'ph-check-square'], ['dhikr', 'Dhikr', 'ph-circles-three'], ['game', 'Game', 'ph-game-controller'], ['menu', 'Menu', 'ph-list']];

  function shell() {
    document.documentElement.lang = LANG; document.documentElement.dir = LANG === 'ar' ? 'rtl' : 'ltr';
    document.getElementById('f7css').href = LANG === 'ar' ? 'v/framework7-bundle-rtl.min.css' : 'v/framework7-bundle.min.css';
    document.getElementById('app').innerHTML = `<div class="views tabs safe-areas">
      <div class="toolbar toolbar-bottom tabbar tabbar-icons"><div class="toolbar-inner">${TABS.map((t, i) => `<a href="#view-${t[0]}" class="tab-link${i ? '' : ' tab-link-active'}"><i class="ph${i ? '' : '-fill'} ${t[2]}" data-ic="${t[2]}"></i><span class="tabbar-label">${esc(tl(t[1]))}</span></a>`).join('')}</div></div>
      ${TABS.map((t, i) => `<div id="view-${t[0]}" class="view tab${i ? '' : ' view-main tab-active'}">${i ? soonPage(t[1], t[2]) : homePage()}</div>`).join('')}</div>
      <div class="popover fq-langs"><div class="popover-angle"></div><div class="popover-inner"><div class="list"><ul>${LANGS.map(l => `<li><a class="list-button item-link popover-close${l[0] === LANG ? ' active' : ''}" data-lang="${l[0]}" lang="${l[0]}">${l[1]}</a></li>`).join('')}</ul></div></div></div>`;
  }
  function boot() {
    shell();
    app = new Framework7({ el: '#app', theme: 'ios', darkMode: new URLSearchParams(location.search).get('dark') === '1' ? true : 'auto', colors: { primary: document.documentElement.classList.contains('dark') ? '#30b482' : '#1b7a5a' } });
    TABS.forEach(t => app.views.create('#view-' + t[0], { iosSwipeBack: true }));
    document.querySelectorAll('.tab-link').forEach(a => a.addEventListener('click', () => document.querySelectorAll('.tab-link i').forEach(i => { const on = i.closest('a') === a; i.className = (on ? 'ph-fill ' : 'ph ') + i.dataset.ic; })));
    clearInterval(timer); timer = setInterval(() => { const n = nextSalah(), e = document.getElementById('fqIn'); if (n && e) e.textContent = inTxt(n.at - new Date()); }, 30000);
  }
  function rerender() { const pc = document.querySelector('#view-home .page-content'); if (!pc) return; const t = document.createElement('div'); t.innerHTML = homePage(); pc.innerHTML = t.querySelector('.page-content').innerHTML; }
  document.addEventListener('click', e => {
    const lg = e.target.closest('[data-lang]'); if (lg) { localStorage.setItem('fq.lang', lg.dataset.lang); const u = new URL(location.href); u.searchParams.delete('lang'); setTimeout(() => location.replace(u.href), 200); return; }
    const sl = e.target.closest('[data-sal]'); if (sl) { const i = +sl.dataset.sal, P = salahFor(new Date()); if (P && P[SQK[i]] > new Date() && !salQ()[i]) { app.toast.create({ text: tl('Not yet'), closeTimeout: 1500, position: 'center' }).open(); return; }
      const set = v => { S.salQ = S.salQ || {}; const k = dkey(); S.salQ[k] = Object.assign({}, S.salQ[k]); if (v) S.salQ[k][i] = v; else delete S.salQ[k][i]; rerender(); };
      app.actions.create({ buttons: [[{ text: tl(SQ5[i]), label: true }, { text: tl('On time'), bold: true, onClick: () => set('on') }, { text: tl('Late'), onClick: () => set('late') }, { text: tl('Missed'), onClick: () => set('miss') }, { text: tl('Clear'), color: 'red', onClick: () => set(null) }], [{ text: tl('Close') }]] }).open(); return; }
    if (e.target.closest('[data-soon]')) { app.toast.create({ text: tl('Coming in the next step'), closeTimeout: 1500, position: 'center' }).open(); }
  });
  fetch('v/tx.json').then(r => r.json()).catch(() => ({})).then(t => { TX = t || {}; load(); boot(); });
})();
