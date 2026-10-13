/* SMILE – See More of Iloilo's Landmarks and Events · core app (v3)
   Vanilla JS, no build step. Shared helpers are exposed on window.SMILE for checkin.js and market.js. */
(() => {
  'use strict';
  const CFG = window.SMILE_CONFIG || {};
  const D = window.SMILE_DATA;
  const ic = window.SMILE_ICON;
  const API = (CFG.API_URL || '').trim();
  const DEMO = !API;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const TAGLINE = "SMILE · See More of Iloilo's Landmarks and Events";
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- storage ---------- */
  const store = {
    get(k, d) { try { const v = localStorage.getItem('smile:' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem('smile:' + k, JSON.stringify(v)); } catch {} }
  };

  /* ---------- state ---------- */
  const catById = Object.fromEntries(D.categories.map(c => [c.id, c]));
  const normCat = c => (String(c || '').toLowerCase() === 'experiences' ? 'events' : String(c || '').toLowerCase());
  const cleanPlaces = list => list.map(p => ({ ...p, category: normCat(p.category) })).filter(p => catById[p.category]);
  const state = {
    userId: store.get('userId') || (crypto.randomUUID ? crypto.randomUUID() : 'u' + Date.now() + Math.random().toString(36).slice(2)),
    name: store.get('name', ''),
    places: cleanPlaces(DEMO ? D.places : (store.get('places', null) || D.places)),
    challenges: (!DEMO && store.get('challenges', null)) || D.challenges,
    ranks: (!DEMO && store.get('ranks', null)) || D.ranks,
    settings: Object.assign({}, D.settings, (!DEMO && store.get('settings', null)) || {}),
    catalog: (!DEMO && store.get('catalog', null)) || { sellers: D.sellers, products: D.products, services: D.services },
    profile: null, cat: 'landmarks', query: '', lastPlace: '', mapCat: 'all', mapQuery: '', mapSel: ''
  };
  store.set('userId', state.userId);
  if (!store.get('log', null) && store.get('checkins', null)) store.set('log', store.get('checkins', []).map(c => ({ ...c, type: 'checkin', category: normCat(c.category) })));

  /* ---------- API ---------- */
  async function apiGet(params) {
    const r = await fetch(API + '?' + new URLSearchParams(params), { redirect: 'follow' });
    return r.json();
  }
  async function apiPost(body) {
    const r = await fetch(API, { method: 'POST', redirect: 'follow', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body) });
    return r.json();
  }

  /* ---------- scoring (mirror of computeProfile_ in Code.gs) ---------- */
  function computeProfile(log) {
    const max = state.settings.maxStamps || 2;
    const s = { total: 0, checkins: 0, photos: 0, stamps: 0, postcards: 0, fullPostcards: 0, points: 0, landmarks: 0, restaurants: 0, shops: 0, events: 0, stays: 0 };
    const visited = {}, cards = {};
    let base = 0;
    log.forEach(r => {
      const type = r.type || 'checkin', cat = normCat(r.category);
      base += Number(r.points) || 0;
      if (type === 'photo') { s.photos++; return; }
      if (type === 'stamp') {
        s.stamps++;
        if (r.postcard) { cards[r.postcard] = cards[r.postcard] || { code: r.postcard, placeId: r.placeId, stamps: 0 }; cards[r.postcard].stamps++; }
        return;
      }
      s.checkins++;
      if (r.proofUrl) s.photos++;
      if (r.postcard) { s.postcards++; cards[r.postcard] = Object.assign(cards[r.postcard] || { stamps: 0 }, { code: r.postcard, placeId: r.placeId, date: r.date }); }
      if (!visited[r.placeId]) { visited[r.placeId] = true; s.total++; if (s[cat] !== undefined) s[cat]++; }
    });
    const postcards = Object.values(cards);
    s.fullPostcards = postcards.filter(c => c.stamps >= max).length;
    let bonus = 0;
    const ch = state.challenges.map(c => {
      let progress = 0, target = Number(c.count) || 1;
      if (c.type === 'places') {
        const ids = String(c.target).split(',').map(x => x.trim()).filter(Boolean);
        target = Math.min(target || ids.length, ids.length);
        progress = ids.filter(id => visited[id]).length;
      } else if (c.type === 'category') progress = s[normCat(c.target)] || 0;
      else if (c.type === 'photos') progress = s.photos;
      else if (c.type === 'checkins') progress = s.total;
      else if (c.type === 'stamps') progress = s.stamps;
      else if (c.type === 'fullpostcards') progress = s.fullPostcards;
      const done = progress >= target;
      if (done) bonus += Number(c.bonus) || 0;
      return { id: c.id, progress: Math.min(progress, target), target, done };
    });
    s.points = base + bonus;
    const ranks = [...state.ranks].sort((a, b) => a.minPoints - b.minPoints);
    let rank = ranks[0], next = ranks[1] || null;
    ranks.forEach((r, i) => { if (s.points >= r.minPoints) { rank = r; next = ranks[i + 1] || null; } });
    return { userId: state.userId, name: state.name || 'Explorer', points: s.points, basePoints: base, bonusPoints: bonus, stats: s,
      visited: Object.keys(visited), postcards, badges: D.badges.filter(b => D.badgeTests[b.id] && D.badgeTests[b.id](s)).map(b => b.id),
      challenges: ch, rank, nextRank: next };
  }
  const localProfile = () => computeProfile(store.get('log', []));
  const today = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
  function diffResult(before, after, earned, type, extra) {
    return Object.assign({ ok: true, earned, type,
      newBadges: after.badges.filter(b => !before.badges.includes(b)),
      newChallenges: after.challenges.filter(c => c.done && !before.challenges.find(x => x.id === c.id && x.done)).map(c => c.id),
      rankUp: after.rank.id !== before.rank.id ? after.rank : null, profile: after }, extra || {});
  }
  /** Demo-mode: append rows to the local log and return a backend-shaped result. */
  function localAppend(rows, earned, type, extra) {
    const before = localProfile();
    store.set('log', store.get('log', []).concat(rows.map(r => ({ date: today(), ts: Date.now(), ...r }))));
    return diffResult(before, localProfile(), earned, type, extra);
  }

  async function loadRemote() {
    if (DEMO) return;
    try {
      const res = await apiGet({ action: 'places' });
      if (!res.ok) return;
      if (res.places?.length) { state.places = cleanPlaces(res.places); store.set('places', state.places); }
      if (res.challenges?.length) { state.challenges = res.challenges; store.set('challenges', res.challenges); }
      if (res.ranks?.length) { state.ranks = res.ranks; store.set('ranks', res.ranks); }
      if (res.settings) { state.settings = Object.assign({}, D.settings, res.settings); store.set('settings', res.settings); }
      if (res.products) { state.catalog = { sellers: res.sellers || [], products: res.products, services: res.services || [] }; store.set('catalog', state.catalog); }
    } catch (e) { console.warn('Offline: using cached data', e); }
  }
  async function loadProfile() {
    if (DEMO) { setProfile(localProfile()); return; }
    try { const res = await apiGet({ action: 'profile', userId: state.userId }); if (res.ok) setProfile(res.profile); }
    catch { const p = store.get('profile', null); setProfile(p && p.rank ? p : localProfile()); }
  }
  function setProfile(p) {
    state.profile = p; store.set('profile', p);
    $('#pointsValue').textContent = p.points;
    const chip = $('#rankChip'); chip.textContent = p.rank.id; chip.style.setProperty('--rc', p.rank.color); chip.classList.toggle('sss', p.rank.id === 'SSS');
    renderHomeRank(); renderRank(); renderChallenges();
    if (currentView === 'rank') loadLeaderboard();
  }
  const pointsFor = p => Number(p.points) || state.settings.points?.[p.category] || D.settings.points[p.category] || 10;
  const visited = id => !!state.profile?.visited?.includes(id);
  const placeById = id => state.places.find(p => p.id === id);
  const money = n => (state.settings.currency || '₱') + Number(n || 0).toLocaleString('en-PH');

  /* ---------- maps (Google Maps embed, no API key needed) ---------- */
  const mapQuery = p => p.lat != null && p.lng != null ? `${p.lat},${p.lng}` : (p.mapQuery || `${p.name}, ${p.area}, Iloilo`);
  const embedUrl = (q, z = 16) => `https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=${z}&output=embed`;
  const dirUrl = q => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(q)}`;

  /* ---------- router ---------- */
  const VIEWS = ['home', 'explore', 'map', 'market', 'challenges', 'rank'];
  const routeHooks = {};
  let currentView = 'home';
  function route(noScroll) {
    const parts = (location.hash.replace('#', '') || 'home').split('/').map(decodeURIComponent);
    let [view, arg, arg2] = parts;
    if (view === 'badges') view = 'rank';
    if (view === 'place' && arg) {           // open a place over the current (or explore) view
      const p = placeById(arg);
      if (!p) { location.hash = '#home'; return; }
      if (currentView === 'home' && !$('#view-home').hidden) { openPlace(arg); return; }
      state.cat = p.category; showView('explore'); renderExplore(); openPlace(arg); return;
    }
    if (view === 'redeem' && arg) { showView(currentView); routeHooks.redeem?.(arg); return; }
    const v = VIEWS.includes(view) ? view : 'home';
    showView(v);
    if (v === 'explore') {
      if (arg === 'experiences') arg = 'events';
      if (arg && catById[arg]) state.cat = arg;
      if (arg2 !== undefined) { state.query = arg2; $('#searchInput').value = arg2; }
      renderExplore();
    }
    if (v === 'map') renderMap(arg);
    if (v === 'challenges') renderChallenges();
    if (v === 'rank') { renderRank(); loadLeaderboard(); }
    routeHooks[v]?.(arg);
    if (noScroll !== true && !document.body.classList.contains('is-splashing')) window.scrollTo({ top: 0, behavior: 'instant' });
  }
  function showView(v) {
    currentView = v;
    $$('.view').forEach(s => s.hidden = s.dataset.view !== v);
    $$('[data-nav]').forEach(a => a.classList.toggle('active', a.dataset.nav === v));
    document.body.dataset.view = v;
  }

  /* ---------- render helpers ---------- */
  const emblem = (r, cls = '') => `<span class="rank-emblem ${cls} ${r.id === 'SSS' ? 'sss' : ''}" style="--rc:${esc(r.color)}">${esc(r.id)}</span>`;
  const pct = (a, b) => Math.max(0, Math.min(100, b ? (a / b) * 100 : 100));
  const iconFor = name => (window.SMILE_ICONS.includes(name) ? ic(name) : ic('flag'));
  function rankProgress(p) {
    if (!p.nextRank) return { pct: 100, text: 'Highest rank reached!' };
    return { pct: pct(p.points - p.rank.minPoints, p.nextRank.minPoints - p.rank.minPoints), text: `${p.nextRank.minPoints - p.points} pts to ${p.nextRank.name}` };
  }

  function renderHomeRank() {
    const p = state.profile; if (!p) return;
    const pr = rankProgress(p);
    $('#homeRank').innerHTML = `${emblem(p.rank)}
      <div class="rs-body"><strong>${esc(p.rank.name)} · ${esc(p.rank.title || '')}</strong>
        <div class="bar"><i style="width:${pr.pct}%;--rc:${esc(p.rank.color)}"></i></div>
        <small class="muted">${p.points} pts · ${esc(pr.text)}</small></div>
      <span class="rs-go">${ic('chev')}</span>`;
  }

  function renderQuick() {
    const count = c => state.places.filter(p => p.category === c).length;
    $('#quickTiles').innerHTML = D.categories.map(c => `
      <a class="qt" href="#explore/${c.id}" style="--c:${c.color}"><span>${ic(c.icon)}</span><div>${esc(c.short)}<small>${count(c.id)} ${c.id === 'events' ? 'events' : 'places'}</small></div></a>`).join('') +
      `<a class="qt" href="#market" style="--c:var(--green)"><span>${ic('store')}</span><div>Shop<small>Merch & services</small></div></a>`;
  }

  function renderTabs(el, active, all) {
    el.innerHTML = (all ? `<button class="tab" style="--c:var(--orange)" aria-selected="${active === 'all'}" data-mapcat="all">${ic('pin')} All</button>` : '') +
      D.categories.map(c => `<button class="tab" role="tab" style="--c:${c.color}" aria-selected="${c.id === active}" ${all ? 'data-mapcat' : 'data-cat'}="${c.id}">${ic(c.icon)} ${esc(all ? c.short : c.name)}</button>`).join('');
  }

  function placeCard(p, i) {
    const c = catById[p.category];
    return `<button class="place card" style="--c:${c.color};animation-delay:${i * 40}ms" data-place="${esc(p.id)}">
      <div class="place-img" style="background-image:url('${esc(p.image || c.img)}')">
        <span class="tag">${ic(c.icon)} ${esc(c.short)}</span>
        ${visited(p.id) ? `<span class="done">${ic('check')} Visited</span>` : ''}
      </div>
      <div class="place-body">
        <strong>${esc(p.name)}</strong>
        <span class="meta"><span>${ic('pin')} ${esc(p.area)}</span>${p.schedule ? `<span>${ic('calendar')} ${esc(p.schedule)}</span>` : ''}${p.priceRange ? `<span>${esc(p.priceRange)}</span>` : ''}</span>
        ${p.merchant ? `<span><span class="merchant-badge">${ic('postcard')} SMILE Merchant</span></span>` : ''}
        <p>${esc(p.description)}</p>
        <div class="place-foot"><span>+${pointsFor(p)} pts</span><span>View ${ic('chev')}</span></div>
      </div>
    </button>`;
  }

  function renderExplore() {
    const c = catById[state.cat];
    $('#exploreTitle').textContent = c.name;
    renderTabs($('#catTabs'), state.cat, false);
    const q = state.query.toLowerCase();
    const list = state.places.filter(p => p.category === state.cat &&
      (!q || [p.name, p.area, p.description, p.schedule, ...(p.tags || [])].join(' ').toLowerCase().includes(q)));
    $('#placeGrid').innerHTML = list.length ? list.map(placeCard).join('') : `<div class="empty">Nothing matches “${esc(state.query)}”. <button class="link" data-clear-search>Clear search</button></div>`;
  }

  /* ---------- map view ---------- */
  function renderMap(sel) {
    renderTabs($('#mapTabs'), state.mapCat, true);
    const q = state.mapQuery.toLowerCase();
    const list = state.places.filter(p => (state.mapCat === 'all' || p.category === state.mapCat) &&
      (!q || [p.name, p.area, ...(p.tags || [])].join(' ').toLowerCase().includes(q)));
    if (sel) state.mapSel = sel;
    $('#mapList').innerHTML = list.map(p => { const c = catById[p.category]; return `
      <button class="ml-item ${state.mapSel === p.id ? 'on' : ''}" style="--c:${c.color}" data-mapsel="${esc(p.id)}">
        <span class="ml-ic">${ic(c.icon)}</span><span><b>${esc(p.name)}</b><small>${esc(p.area)}</small></span></button>`; }).join('') || '<div class="empty">No places found.</div>';
    const p = placeById(state.mapSel);
    const src = p ? embedUrl(mapQuery(p)) : embedUrl(state.mapCat === 'stays' ? 'hotels in Iloilo City' : 'Iloilo City, Philippines', 13);
    const frame = $('#bigMap'); if (frame.getAttribute('src') !== src) frame.setAttribute('src', src);
    const card = $('#mapCard');
    if (p) {
      const c = catById[p.category];
      card.style.setProperty('--c', c.color);
      card.innerHTML = `<div class="mc-img" style="background-image:url('${esc(p.image || c.img)}')"></div>
        <div class="mc-body"><strong>${esc(p.name)}</strong><small class="muted">${esc(p.area)}</small>
          <div class="mc-actions"><button class="btn btn-ghost btn-sm" data-place="${esc(p.id)}">${ic('info')} Details</button>
          <a class="btn btn-primary btn-sm" href="${dirUrl(mapQuery(p))}" target="_blank" rel="noopener">${ic('nav')} Directions</a></div></div>`;
      card.hidden = false;
    } else card.hidden = true;
  }

  /* ---------- challenges ---------- */
  function challengeCard(c, prog, compact) {
    const ids = c.type === 'places' ? String(c.target).split(',').map(x => x.trim()).filter(Boolean) : [];
    const steps = ids.length && !compact ? `<div class="ch-steps">${ids.map(id => {
      const pl = placeById(id); if (!pl) return '';
      return `<button type="button" class="ch-step ${visited(id) ? 'ok' : ''}" data-place="${esc(id)}">${ic(visited(id) ? 'check' : 'pin')} ${esc(pl.name)}</button>`;
    }).join('')}</div>` : '';
    const hint = { category: `Check in at ${catById[normCat(c.target)]?.name || c.target}.`, photos: 'Take Photo at tagged places, or check in.',
      checkins: 'Every new place counts.', stamps: 'Add stamps to your postcards.', fullpostcards: '2 stamps on each postcard.' }[c.type] || '';
    return `<div class="challenge card ${prog.done ? 'done' : ''}">
      <div class="ch-head"><span class="ch-ico">${iconFor(c.icon)}</span>
        <div><strong>${esc(c.name)}</strong><small class="muted">${esc(c.description)}</small></div>
        <span class="ch-bonus">${prog.done ? ic('check') : '+'}${c.bonus}</span></div>
      <div class="bar"><i style="width:${pct(prog.progress, prog.target)}%"></i></div>
      <div class="ch-meta"><span>${prog.progress} / ${prog.target}</span><span>${prog.done ? 'Completed! Bonus earned' : esc(hint)}</span></div>
      ${steps}</div>`;
  }
  function renderChallenges() {
    const p = state.profile; if (!p) return;
    const progOf = id => p.challenges.find(x => x.id === id) || { progress: 0, target: 1, done: false };
    const sorted = [...state.challenges].sort((a, b) => progOf(a.id).done - progOf(b.id).done);
    $('#challengeGrid').innerHTML = sorted.map(c => challengeCard(c, progOf(c.id), false)).join('');
    $('#homeChallenges').innerHTML = sorted.slice(0, 3).map(c => challengeCard(c, progOf(c.id), true)).join('');
  }

  /* ---------- rank & passport ---------- */
  function renderRank() {
    const p = state.profile; if (!p) return;
    const s = p.stats || {}, pr = rankProgress(p), nick = state.name || p.name || 'Explorer';
    $('#rankHero').innerHTML = `
      <div class="rh-top">${emblem(p.rank, 'lg')}
        <div class="rh-info"><span class="eyebrow" style="color:${esc(p.rank.color)}">${esc(p.rank.title || '')}</span><h3>${esc(p.rank.name)}</h3>
          <span class="muted">${esc(nick)} · <button class="link" type="button" id="editName">${ic('edit')} ${state.name ? 'Change nickname' : 'Set nickname'}</button></span></div>
        <div class="rh-pts"><div class="big-points">${p.points}</div><small class="muted">points</small></div></div>
      <div class="bar lg"><i style="width:${pr.pct}%;--rc:${esc(p.rank.color)}"></i></div>
      <div class="ch-meta"><span>${esc(pr.text)}</span><span>${p.bonusPoints} bonus pts from challenges</span></div>
      <div class="stats">
        ${D.categories.map(c => `<div class="stat" style="--c:${c.color}"><b>${s[c.id] || 0}</b><small>${esc(c.short)}</small></div>`).join('')}
        <div class="stat" style="--c:var(--green)"><b>${s.postcards || 0}</b><small>Postcards</small></div>
        <div class="stat" style="--c:var(--c-badges)"><b>${s.stamps || 0}</b><small>Stamps</small></div>
        <div class="stat" style="--c:var(--s-blue)"><b>${s.photos || 0}</b><small>Photos</small></div>
        <div class="stat" style="--c:var(--orange)"><b>${p.challenges.filter(c => c.done).length}/${p.challenges.length}</b><small>Challenges</small></div>
        <div class="stat" style="--c:var(--rust)"><b>${p.badges.length}/${D.badges.length}</b><small>Badges</small></div>
      </div>
      ${DEMO ? '<small class="muted">Demo mode: progress is saved on this device.</small>' : ''}`;
    const max = state.settings.maxStamps || 2;
    const cards = [...(p.postcards || [])].reverse();
    $('#postcardGrid').innerHTML = cards.length ? cards.map(c => {
      const pl = placeById(c.placeId);
      const slots = Array.from({ length: max }, (_, i) => i < c.stamps
        ? `<span class="stamp-slot filled">${ic('stamp')} +${state.settings.stampPoints}</span>`
        : `<button type="button" class="stamp-slot" data-add-stamp="${esc(c.code)}">${ic('plus')} Stamp</button>`).join('');
      return `<div class="pcard"><b>${esc(pl ? pl.name : c.placeId)}</b><span class="pc-code">${esc(c.code)}${c.date ? ' · ' + esc(c.date) : ''}</span><div class="stamp-slots">${slots}</div></div>`;
    }).join('') : `<div class="pcard-empty">${ic('postcard')} No postcards yet. Buy a SMILE Postcard from a <a class="link" href="#market/merchants">SMILE Merchant</a> and check in at any place.</div>`;
    const ranks = [...state.ranks].sort((a, b) => a.minPoints - b.minPoints);
    $('#rankLadder').innerHTML = ranks.map(r => `<div class="rung ${p.points >= r.minPoints ? 'got' : ''} ${r.id === p.rank.id ? 'cur' : ''}">${emblem(r, 'sm')}
      <div><strong>${esc(r.name)}</strong><small>${esc(r.title || '')}</small></div><span>${r.minPoints}+</span></div>`).reverse().join('');
    $('#badgeGrid').innerHTML = D.badges.map(b => `<div class="badge card ${p.badges.includes(b.id) ? 'on' : ''}">
      <div class="b-ico">${iconFor(b.icon)}</div><strong>${esc(b.name)}</strong><small>${esc(b.desc)}</small></div>`).join('');
  }
  async function loadLeaderboard() {
    const el = $('#leaderboard');
    const row = u => `<li>${emblem({ id: u.rank, color: u.color || '#999' }, 'xs')}<span class="lb-name">${esc(u.name)}</span><b>${u.points} pts</b></li>`;
    if (DEMO) {
      const me = state.profile;
      el.innerHTML = row({ name: state.name || 'You', points: me.points, rank: me.rank.id, color: me.rank.color }) + '<li class="muted">Connect the Apps Script backend to see other explorers.</li>';
      return;
    }
    try {
      const res = await apiGet({ action: 'leaderboard' });
      el.innerHTML = res.ok && res.leaderboard.length ? res.leaderboard.map(row).join('') : '<li class="muted">No explorers yet. Be the first!</li>';
    } catch { el.innerHTML = '<li class="muted">Leaderboard unavailable offline.</li>'; }
  }

  /* ---------- sheet ---------- */
  function openSheet(html) {
    $('#sheetBody').innerHTML = html;
    $('#sheetBackdrop').hidden = false; $('#sheet').hidden = false;
    $('#sheet').scrollTop = 0;
    document.body.style.overflow = 'hidden';
  }
  function closeSheet() {
    $('#sheetBackdrop').hidden = true; $('#sheet').hidden = true; $('#sheetBody').innerHTML = '';
    document.body.style.overflow = '';
    if (location.hash.startsWith('#place/') || location.hash.startsWith('#redeem/')) history.replaceState(null, '', currentView === 'explore' ? `#explore/${state.cat}` : '#' + currentView);
  }

  function openPlace(id) {
    const p = placeById(id); if (!p) return;
    state.lastPlace = id;
    const c = catById[p.category], q = mapQuery(p);
    const inCh = state.challenges.filter(ch => ch.type === 'places' && String(ch.target).split(',').map(x => x.trim()).includes(id));
    const isStay = p.category === 'stays';
    openSheet(`
      <div class="sheet-hero" style="--c:${c.color};background-image:url('${esc(p.image || c.img)}')"></div>
      <div class="sheet-content">
        <span class="pill" style="background:${c.color};color:#fff">${ic(c.icon)} ${esc(c.name)}</span>
        <h3 id="sheetTitle">${esc(p.name)}</h3>
        <span class="meta"><span>${ic('pin')} ${esc(p.area)}, Iloilo</span>${p.priceRange ? `<span>${esc(p.priceRange)}</span>` : ''}${p.contact ? `<span>${ic('phone')} ${esc(p.contact)}</span>` : ''}</span>
        ${p.schedule ? `<div class="when">${ic('calendar')} ${esc(p.schedule)}</div>` : ''}
        <p>${esc(p.description)}</p>
        <div class="chips">${(p.tags || []).map(t => `<span class="chip">#${esc(t)}</span>`).join('')}
          <span class="chip g">${ic('star')} Check in +${pointsFor(p)}</span><span class="chip b">${ic('stamp')} Stamps +${state.settings.stampPoints} each</span></div>
        ${p.merchant ? `<span class="merchant-badge">${ic('postcard')} Sells SMILE Postcards & Stamps</span>` : ''}
        ${inCh.length ? `<div class="in-ch">${ic('flag')} Part of: ${inCh.map(ch => `<a href="#challenges">${esc(ch.name)}</a>`).join(', ')}</div>` : ''}
        <iframe class="mini-map" title="Map of ${esc(p.name)}" loading="lazy" src="${embedUrl(q)}" referrerpolicy="no-referrer-when-downgrade"></iframe>
        <div class="sheet-actions">
          <a class="btn btn-ghost" href="#map/${esc(p.id)}">${ic('map')} Big map</a>
          <a class="btn btn-ghost" href="${dirUrl(q)}" target="_blank" rel="noopener">${ic('nav')} Directions</a>
          <button class="btn btn-ghost" type="button" data-camera="${esc(p.id)}">${ic('camera')} Take Photo</button>
          ${isStay && p.bookable ? `<button class="btn btn-ghost" type="button" data-book-stay="${esc(p.id)}">${ic('bed')} Request stay</button>` : `<a class="btn btn-ghost" href="#market/merchants">${ic('store')} Buy postcard</a>`}
          <button class="btn btn-green span2" type="button" data-checkin="${esc(p.id)}">${ic('qr')} ${visited(p.id) ? 'Check in again' : 'Check in'} with SMILE Postcard</button>
        </div>
        <div class="ext-note">${ic('external')} Directions open Google Maps in a new tab. SMILE stays open.</div>
      </div>`);
  }

  /* ---------- toast, confetti, rank-up ---------- */
  let toastT;
  function toast(msg, ms = 2800, icon) {
    const t = $('#toast'); t.innerHTML = (icon ? ic(icon) : '') + `<span>${esc(msg)}</span>`; t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), ms);
  }
  function celebrate(n = 70) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const box = $('#confetti'), colors = ['#1D5CC8', '#FFB800', '#22A046', '#FF7814', '#EC2882'];
    for (let i = 0; i < n; i++) {
      const el = document.createElement('i');
      el.style.left = Math.random() * 100 + 'vw'; el.style.background = colors[i % colors.length];
      el.style.setProperty('--dx', (Math.random() * 160 - 80) + 'px'); el.style.setProperty('--r', (Math.random() * 720 - 360) + 'deg');
      el.style.animationDuration = 1.6 + Math.random() * 1.4 + 's'; el.style.animationDelay = Math.random() * .3 + 's';
      box.appendChild(el); setTimeout(() => el.remove(), 3600);
    }
  }
  function showRankUp(r) {
    const em = $('#rankupEmblem');
    em.textContent = r.id; em.style.setProperty('--rc', r.color); em.classList.toggle('sss', r.id === 'SSS');
    $('#rankupTitle').textContent = r.name; $('#rankupSub').textContent = `You are now ${r.title ? 'a ' + r.title : r.name}!`;
    $('#rankup').hidden = false; celebrate(140);
  }
  /** Shows points, finished challenges, badges and rank-ups from any backend/demo result. */
  function celebrateResult(res, label) {
    if (res.profile) setProfile(res.profile);
    celebrate();
    const pill = $('#pointsPill'); pill.classList.remove('bump'); void pill.offsetWidth; pill.classList.add('bump');
    const extras = [];
    (res.newChallenges || []).forEach(id => { const c = state.challenges.find(x => x.id === id); if (c) extras.push(`${c.name} complete! +${c.bonus}`); });
    (res.newBadges || []).forEach(id => { const b = D.badges.find(x => x.id === id); if (b) extras.push(`Badge: ${b.name}`); });
    toast(`+${res.earned} pts ${label}` + (extras.length ? ' · ' + extras.join(' · ') : ''), 4500, 'star');
    if (res.rankUp) setTimeout(() => showRankUp(res.rankUp), 900);
    renderQuick(); if (currentView === 'explore') renderExplore();
  }

  /* ---------- nickname ---------- */
  function askName() {
    return new Promise(resolve => {
      const dlg = $('#nameDialog'), input = $('#nameInput');
      input.value = state.name;
      const done = ok => { if (dlg.open) dlg.close(); resolve(ok); };
      $('#nameCancel').onclick = () => done(false);
      $('#nameForm').onsubmit = ev => {
        ev.preventDefault();
        const v = input.value.trim().slice(0, 40); if (!v) return;
        state.name = v; store.set('name', v);
        if (!DEMO) apiPost({ action: 'register', userId: state.userId, name: v }).then(r => r.ok && setProfile(r.profile)).catch(() => {});
        renderRank(); done(true);
      };
      if (dlg.showModal) dlg.showModal(); else { const v = prompt('Your nickname'); if (v) { state.name = v; store.set('name', v); } resolve(!!v); }
      setTimeout(() => input.focus(), 50);
    });
  }
  async function ensureName() { return state.name ? true : askName(); }

  /* ---------- camera (souvenir photos + proof photos) ---------- */
  const cam = { stream: null, facing: 'environment', blob: null, url: null, proof: null };
  const logoImg = new Image(); logoImg.src = 'assets/logo-circle.png';

  function fillPlaceSelect(selected, allowNone) {
    const sel = $('#camPlace');
    sel.innerHTML = (allowNone ? '<option value="">No place tagged</option>' : '') + D.categories.map(c =>
      `<optgroup label="${esc(c.name)}">${state.places.filter(p => p.category === c.id).map(p => `<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('')}</optgroup>`).join('');
    sel.value = selected || '';
    updateGuide();
  }
  function updateGuide() {
    const p = placeById($('#camPlace').value);
    $('#camGuidePlace').textContent = p ? p.name : 'Iloilo';
    $('#camPts').textContent = p && !cam.proof ? `+${state.settings.photoPoints}` : '';
  }
  /** opts.proof = { onUse(blob, url) } switches to proof-photo mode for check-in. */
  async function openCamera(placeId, opts = {}) {
    cam.proof = opts.proof || null;
    if (!cam.proof) closeSheet();
    fillPlaceSelect(placeId || state.lastPlace, !cam.proof);
    $('#camPlace').disabled = !!cam.proof;
    $('#camMode').hidden = !cam.proof;
    $('#camera').hidden = false; document.body.style.overflow = 'hidden';
    showShoot(); await startStream();
  }
  async function startStream() {
    stopStream(); $('#camMsg').hidden = true;
    if (!navigator.mediaDevices?.getUserMedia) return cameraFallback('Live camera is not available in this browser.');
    try {
      cam.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: cam.facing, width: { ideal: 1920 }, height: { ideal: 1440 } }, audio: false });
      const v = $('#camVideo'); v.srcObject = cam.stream; v.classList.toggle('mirror', cam.facing === 'user');
      await v.play().catch(() => {});
    } catch (e) { cameraFallback(e && e.name === 'NotAllowedError' ? 'Camera permission was blocked.' : 'Could not start the camera.'); }
  }
  function cameraFallback(reason) {
    const msg = $('#camMsg');
    msg.innerHTML = `<p>${esc(reason)}</p><button type="button" class="btn btn-primary" id="camNative">${ic('camera')} Open phone camera</button><small>or choose a photo from your gallery</small>`;
    msg.hidden = false;
  }
  function stopStream() { if (cam.stream) { cam.stream.getTracks().forEach(t => t.stop()); cam.stream = null; } }
  function closeCamera() {
    stopStream(); $('#camera').hidden = true;
    if ($('#sheet').hidden) document.body.style.overflow = '';
    cam.proof = null;
  }
  function showShoot() {
    $('#camResult').hidden = true; $('#camVideo').hidden = false; $('.cam-frame-guide').hidden = false;
    $('#camShootControls').hidden = false; $('#camResultControls').hidden = true;
  }
  function drawCover(ctx, src, sw, sh, W, H, mirror) {
    const s = Math.max(W / sw, H / sh), dw = sw * s, dh = sh * s;
    ctx.save(); if (mirror) { ctx.translate(W, 0); ctx.scale(-1, 1); }
    ctx.drawImage(src, (W - dw) / 2, (H - dh) / 2, dw, dh); ctx.restore();
  }
  function wrapLines(ctx, text, maxW, maxLines) {
    const words = text.split(' '), lines = []; let line = '';
    words.forEach(w => { const t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; });
    if (line) lines.push(line);
    if (lines.length > maxLines) { lines.length = maxLines; lines[maxLines - 1] = lines[maxLines - 1].replace(/\s*\S*$/, '…'); }
    return lines;
  }
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  async function composePhoto(src, sw, sh, mirror) {
    try { await document.fonts.ready; } catch {}
    const W = 1080, H = 1350, cv = $('#camCanvas'); cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d');
    drawCover(ctx, src, sw, sh, W, H, mirror);
    const place = placeById($('#camPlace').value);
    const font = (w, s) => `${w} ${s}px Poppins, system-ui, sans-serif`;
    let g = ctx.createLinearGradient(0, 0, 0, 260); g.addColorStop(0, 'rgba(0,0,0,.35)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, 260);
    if (logoImg.complete && logoImg.naturalWidth) { ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 24; ctx.drawImage(logoImg, 40, 40, 190, 190); ctx.restore(); }
    ctx.font = font(700, 34); const tag = '#SMILEIloilo', tw = ctx.measureText(tag).width;
    ctx.fillStyle = 'rgba(255,255,255,.92)'; roundRect(ctx, W - tw - 96, 70, tw + 56, 64, 32); ctx.fill();
    ctx.fillStyle = '#C2410C'; ctx.fillText(tag, W - tw - 68, 114);
    g = ctx.createLinearGradient(0, H - 420, 0, H); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(.45, 'rgba(20,10,0,.55)'); g.addColorStop(1, 'rgba(20,10,0,.85)');
    ctx.fillStyle = g; ctx.fillRect(0, H - 420, W, 420);
    ctx.fillStyle = '#fff'; ctx.font = font(800, 64);
    const lines = wrapLines(ctx, place ? place.name : 'Iloilo City', W - 120, 2);
    let y = H - 174 - (lines.length - 1) * 74;
    lines.forEach(l => { ctx.fillText(l, 56, y); y += 74; });
    ctx.font = font(600, 34); ctx.fillStyle = '#FFD889';
    ctx.fillText(place ? `${place.area}, Iloilo` : 'Iloilo, Philippines', 56, y + 2);
    ctx.font = font(500, 26); ctx.fillStyle = 'rgba(255,255,255,.9)';
    const stamp = new Date().toLocaleString('en-PH', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    ctx.fillText(`${stamp} · ${TAGLINE}`, 56, H - 52);
    const r = state.profile?.rank;
    if (r) { ctx.font = font(800, 30); const rw = ctx.measureText(r.name).width; ctx.fillStyle = r.color; roundRect(ctx, W - rw - 96, H - 160, rw + 48, 56, 28); ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillText(r.name, W - rw - 72, H - 121); }
    ['#1D5CC8', '#FFB800', '#22A046', '#FF7814', '#EC2882'].forEach((col, i) => { ctx.fillStyle = col; ctx.fillRect(i * W / 5, H - 18, W / 5 + 1, 18); });
    cam.blob = await new Promise(res => cv.toBlob(res, 'image/jpeg', 0.9));
    if (cam.url) URL.revokeObjectURL(cam.url);
    cam.url = URL.createObjectURL(cam.blob);
    const img = $('#camResult'); img.src = cam.url; img.hidden = false;
    $('#camVideo').hidden = true; $('.cam-frame-guide').hidden = true; $('#camMsg').hidden = true;
    $('#camShootControls').hidden = true; $('#camResultControls').hidden = false;
    $('#camSave').hidden = $('#camShare').hidden = !!cam.proof; $('#camUse').hidden = !cam.proof;
    stopStream();
    if (!cam.proof) { if (place) recordPhoto(place.id); else toast('Photo ready! Tag a place next time to earn points.', 2800, 'camera'); }
  }
  async function recordPhoto(placeId) {
    if (!(await ensureName())) return;
    const place = placeById(placeId);
    let res;
    try {
      if (DEMO) {
        const dup = store.get('log', []).some(r => r.type === 'photo' && r.placeId === placeId && r.date === today());
        res = dup ? { ok: false, error: 'Photo points already claimed here today. Your photo is still saved!' }
          : localAppend([{ type: 'photo', placeId, category: place.category, points: state.settings.photoPoints }], state.settings.photoPoints, 'photo');
      } else res = await apiPost({ action: 'photo', userId: state.userId, name: state.name, placeId });
    } catch { toast('Offline: photo saved, but points were not added.', 3000, 'info'); return; }
    if (!res.ok) { if (res.profile) setProfile(res.profile); toast(res.error, 3000, 'info'); return; }
    celebrateResult(res, 'for your photo!');
  }
  function shoot() {
    const v = $('#camVideo');
    if (!cam.stream || !v.videoWidth) { $('#camCapture').click(); return; }
    const flash = document.createElement('div'); flash.className = 'flash'; $('.cam-stage').appendChild(flash); setTimeout(() => flash.remove(), 400);
    composePhoto(v, v.videoWidth, v.videoHeight, cam.facing === 'user');
  }
  function fromFile(file) {
    if (!file) return;
    const img = new Image();
    img.onload = () => { composePhoto(img, img.naturalWidth, img.naturalHeight, false); URL.revokeObjectURL(img.src); };
    img.src = URL.createObjectURL(file);
  }
  const fileName = () => { const p = placeById($('#camPlace').value); return `SMILE-${(p ? p.name : 'Iloilo').replace(/[^\w]+/g, '-')}-${today()}.jpg`; };
  function savePhoto() {
    if (!cam.url) return;
    const a = document.createElement('a'); a.href = cam.url; a.download = fileName(); document.body.appendChild(a); a.click(); a.remove();
    toast('Photo saved!', 2200, 'download');
  }
  async function sharePhoto() {
    if (!cam.blob) return;
    const p = placeById($('#camPlace').value);
    const file = new File([cam.blob], fileName(), { type: 'image/jpeg' });
    const text = `${p ? p.name + ', ' + p.area + ', Iloilo. ' : ''}${TAGLINE} #SMILEIloilo #Iloilo`;
    if (navigator.canShare && navigator.canShare({ files: [file] })) { try { await navigator.share({ files: [file], title: 'SMILE Iloilo', text }); } catch {} }
    else { savePhoto(); toast('Saved! Share it from your gallery with #SMILEIloilo', 3000, 'share'); }
  }
  function useProof() {
    const cb = cam.proof; const blob = cam.blob, url = cam.url;
    cam.url = null; closeCamera();
    if (cb && blob) cb.onUse(blob, url);
  }

  /* ---------- install banner ---------- */
  let deferredPrompt = null, bannerWanted = false;
  const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredPrompt = e; $('#installLink').hidden = false; if (bannerWanted) showInstallBanner(); });
  window.addEventListener('appinstalled', () => { hideInstallBanner(); store.set('installDismissed', true); $('#installLink').hidden = true; toast('SMILE installed!', 2500, 'check'); });
  function maybeShowInstallBanner() { if (isStandalone() || store.get('installDismissed', false)) return; bannerWanted = true; showInstallBanner(); }
  function showInstallBanner() {
    const b = $('#installBanner'), btn = $('#installBtn'), msg = $('#installMsg');
    if (isIOS) { msg.innerHTML = `Tap ${ic('share')} <b>Share</b>, then <b>Add to Home Screen</b>.`; btn.textContent = 'Got it'; }
    else if (deferredPrompt) { msg.textContent = 'Add SMILE to your home screen for faster, offline-ready exploring.'; btn.textContent = 'Install'; }
    else { msg.textContent = 'Use your browser menu (⋮) and choose "Install app" or "Add to Home screen".'; btn.textContent = 'OK'; }
    b.classList.remove('out'); b.hidden = false;
  }
  function hideInstallBanner(remember = true) {
    const b = $('#installBanner'); if (b.hidden) return;
    b.classList.add('out'); setTimeout(() => { b.hidden = true; }, 300);
    if (remember) store.set('installDismissed', true); bannerWanted = false;
  }
  async function doInstall() {
    if (deferredPrompt) { deferredPrompt.prompt(); const { outcome } = await deferredPrompt.userChoice; deferredPrompt = null; if (outcome === 'accepted') $('#installLink').hidden = true; }
    hideInstallBanner();
  }

  /* ---------- splash ---------- */
  function runSplash() {
    const splash = $('#splash'), reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.body.classList.add('is-splashing');
    let ended = false;
    const end = () => {
      if (ended) return; ended = true;
      splash.classList.add('leave'); document.body.classList.remove('is-splashing'); document.body.classList.add('reveal');
      setTimeout(() => splash.remove(), 800); setTimeout(maybeShowInstallBanner, 1400);
    };
    splash.addEventListener('click', end);
    setTimeout(end, reduce ? 300 : (CFG.SPLASH_MS || 2300));
  }

  /* ---------- events ---------- */
  document.addEventListener('click', e => {
    const t = e.target, on = s => t.closest(s);
    let el;
    if ((el = on('[data-camera]'))) { openCamera(el.dataset.camera || ''); return; }
    if ((el = on('[data-cat]'))) { state.query = ''; $('#searchInput').value = ''; location.hash = '#explore/' + el.dataset.cat; return; }
    if ((el = on('[data-mapcat]'))) { state.mapCat = el.dataset.mapcat; state.mapSel = ''; renderMap(); return; }
    if ((el = on('[data-mapsel]'))) { state.mapSel = el.dataset.mapsel; renderMap(); if (innerWidth <= 860) scrollTo({ top: 0, behavior: 'smooth' }); return; }
    if ((el = on('[data-place]'))) { openPlace(el.dataset.place); return; }
    if (on('[data-clear-search]')) { state.query = ''; $('#searchInput').value = ''; renderExplore(); return; }
    if (on('#editName')) { askName(); return; }
    if (on('#pointsPill')) { location.hash = '#rank'; return; }
    if (on('#camNative')) { $('#camCapture').click(); return; }
    if ((el = on('.sheet a[href^="#"]')) && !el.hasAttribute('target')) { closeSheet(); return; }
  });
  $('#sheetClose').addEventListener('click', closeSheet);
  $('#sheetBackdrop').addEventListener('click', closeSheet);
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (!$('#camera').hidden) closeCamera(); else if (!$('#sheet').hidden) closeSheet();
  });
  $('#searchInput').addEventListener('input', e => { state.query = e.target.value; renderExplore(); });
  $('#mapSearch').addEventListener('input', e => { state.mapQuery = e.target.value; renderMap(); });
  $('#installBtn').addEventListener('click', doInstall);
  $('#installClose').addEventListener('click', () => hideInstallBanner());
  $('#installLink').addEventListener('click', () => { if (deferredPrompt) doInstall(); else showInstallBanner(); });
  $('#camClose').addEventListener('click', closeCamera);
  $('#camFlip').addEventListener('click', () => { cam.facing = cam.facing === 'user' ? 'environment' : 'user'; showShoot(); startStream(); });
  $('#camShutter').addEventListener('click', shoot);
  $('#camPlace').addEventListener('change', updateGuide);
  $('#camFile').addEventListener('change', e => { fromFile(e.target.files[0]); e.target.value = ''; });
  $('#camCapture').addEventListener('change', e => { fromFile(e.target.files[0]); e.target.value = ''; });
  $('#camRetake').addEventListener('click', () => { showShoot(); startStream(); });
  $('#camSave').addEventListener('click', savePhoto);
  $('#camShare').addEventListener('click', sharePhoto);
  $('#camUse').addEventListener('click', useProof);
  $('#rankupClose').addEventListener('click', () => { $('#rankup').hidden = true; });
  window.addEventListener('hashchange', () => route());
  window.addEventListener('online', () => { loadRemote().then(() => { renderQuick(); route(true); }); loadProfile(); });

  if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(err => console.warn('SW failed', err)));

  /* ---------- public API for checkin.js / market.js ---------- */
  window.SMILE = { CFG, D, DEMO, API, state, store, $, $$, esc, ic, apiGet, apiPost, catById, placeById, pointsFor, money, today,
    computeProfile, localProfile, localAppend, setProfile, celebrateResult, toast, celebrate, openSheet, closeSheet, openPlace,
    openCamera, ensureName, askName, embedUrl, dirUrl, mapQuery, routeHooks, route, renderRank, loadProfile, get currentView() { return currentView; } };

  /* ---------- boot (after checkin.js and market.js have registered) ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    runSplash();
    renderQuick();
    setProfile(DEMO ? localProfile() : ((p => (p && p.rank ? p : localProfile()))(store.get('profile', null))));
    route();
    Promise.all([loadRemote(), loadProfile()]).then(() => { renderQuick(); route(true); });
  });
})();
