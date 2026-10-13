/* SMILE · check-in with proof photo + SMILE Postcard QR + up to 2 stamps; QR scanner; deep links (#redeem/CODE) */
(() => {
  'use strict';
  const S = window.SMILE;
  const { $, esc, ic, state, store, DEMO } = S;
  const CODE_RE = /\b(PC|ST)-[A-Z0-9]{4,12}\b/;
  const parseCode = v => { const m = String(v || '').toUpperCase().match(CODE_RE); return m ? m[0] : ''; };
  const maxStamps = () => state.settings.maxStamps || 2;
  const stampPts = () => state.settings.stampPoints || 5;

  /* ================= Demo-mode code registry ================= */
  // Demo codes so the flow can be tried without the backend: PC-DEMO01…PC-DEMO20, ST-DEMO01…ST-DEMO40
  const demoExists = code => {
    const m = code.match(/^(PC|ST)-DEMO(\d{2})$/); if (!m) return false;
    const n = Number(m[2]); return m[1] === 'PC' ? n >= 1 && n <= 20 : n >= 1 && n <= 40;
  };
  const demoUsed = () => store.get('usedCodes', {});
  function demoCheck(code) {
    if (!demoExists(code)) return { ok: true, valid: false, code, status: 'notfound', message: 'Code not found. Demo codes: PC-DEMO01 to PC-DEMO20, ST-DEMO01 to ST-DEMO40.' };
    const used = demoUsed()[code], type = code.startsWith('PC') ? 'postcard' : 'stamp';
    if (!used) return { ok: true, valid: true, code, type, status: 'unused', message: type === 'postcard' ? 'Valid postcard. Ready for check-in!' : `Valid stamp: +${stampPts()} points.` };
    if (type === 'postcard') {
      const n = Object.values(demoUsed()).filter(u => u.postcard === code).length;
      return { ok: true, valid: false, code, type, status: 'used', mine: true, placeId: used.placeId, stamps: n,
        message: 'You already used this postcard' + (n < maxStamps() ? `. You can still add ${maxStamps() - n} stamp(s).` : '.') };
    }
    return { ok: true, valid: false, code, type, status: 'used', message: 'This stamp was already used.' };
  }
  async function checkCode(code) {
    if (DEMO) return demoCheck(code);
    try { return await S.apiGet({ action: 'code', code, userId: state.userId }); }
    catch { return { ok: false, valid: false, code, status: 'offline', message: 'You seem to be offline. Connect to validate the code.' }; }
  }

  /* ================= QR scanner ================= */
  const sc = { stream: null, timer: null, detector: null, resolve: null, expect: null, exclude: [], busy: false, last: '' };
  let jsqrLoading = null;
  function loadJsQR() {
    if (window.jsQR) return Promise.resolve();
    if (!jsqrLoading) jsqrLoading = new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'vendor/jsQR.min.js'; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
    return jsqrLoading;
  }
  async function makeDetector() {
    try {
      if ('BarcodeDetector' in window) {
        const fm = await window.BarcodeDetector.getSupportedFormats?.();
        if (!fm || fm.includes('qr_code')) return new window.BarcodeDetector({ formats: ['qr_code'] });
      }
    } catch {}
    return null;
  }
  async function decodeFrom(source, w, h) {
    if (sc.detector) {
      try { const r = await sc.detector.detect(source); if (r && r[0]) return r[0].rawValue; } catch {}
    }
    await loadJsQR();
    const cv = $('#scanCanvas'), scale = Math.min(1, 720 / Math.max(w, h));
    cv.width = Math.round(w * scale); cv.height = Math.round(h * scale);
    const ctx = cv.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(source, 0, 0, cv.width, cv.height);
    const d = ctx.getImageData(0, 0, cv.width, cv.height);
    const r = window.jsQR(d.data, cv.width, cv.height, { inversionAttempts: 'attemptBoth' });
    return r ? r.data : '';
  }

  /** Opens the scanner. expect: 'postcard' | 'stamp'. Resolves with a validated code, or null if closed. */
  function openScanner({ expect = 'postcard', exclude = [] } = {}) {
    return new Promise(async resolve => {
      sc.resolve = resolve; sc.expect = expect; sc.exclude = exclude; sc.busy = false; sc.last = '';
      $('#scanTitle').textContent = expect === 'stamp' ? 'Scan stamp QR' : 'Scan postcard QR';
      $('#scanHint').textContent = expect === 'stamp' ? 'Point the camera at the QR code on your SMILE Stamp' : 'Point the camera at the QR code on your SMILE Postcard';
      $('#scanInput').placeholder = expect === 'stamp' ? 'Or type the code, e.g. ST-ABC1234' : 'Or type the code, e.g. PC-ABC1234';
      $('#scanInput').value = ''; $('#scanResult').hidden = true;
      $('#scanner').hidden = false; document.body.style.overflow = 'hidden';
      sc.detector = await makeDetector();
      if (!sc.detector) loadJsQR().catch(() => {});
      startScanCamera();
    });
  }
  async function startScanCamera() {
    stopScanCamera();
    if (!navigator.mediaDevices?.getUserMedia) { $('#scanHint').textContent = 'Camera not available. Type the code below or scan from a photo.'; return; }
    try {
      sc.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1280 } }, audio: false });
      const v = $('#scanVideo'); v.srcObject = sc.stream; await v.play().catch(() => {});
      sc.timer = setInterval(async () => {
        if (sc.busy || !v.videoWidth) return;
        sc.busy = true;
        try { const txt = await decodeFrom(v, v.videoWidth, v.videoHeight); if (txt && txt !== sc.last) { sc.last = txt; await handleScanned(txt); } }
        catch {} finally { sc.busy = false; }
      }, 280);
    } catch { $('#scanHint').textContent = 'Camera blocked. Type the code below or scan from a photo.'; }
  }
  function stopScanCamera() { clearInterval(sc.timer); sc.timer = null; if (sc.stream) { sc.stream.getTracks().forEach(t => t.stop()); sc.stream = null; } }
  function closeScanner(result = null) {
    stopScanCamera(); $('#scanner').hidden = true;
    if ($('#sheet').hidden) document.body.style.overflow = '';
    const r = sc.resolve; sc.resolve = null; if (r) r(result);
  }
  async function handleScanned(text) {
    const code = parseCode(text);
    const box = $('#scanResult');
    const show = (ok, title, msg, actions) => {
      box.className = 'scan-result ' + (ok ? 'ok' : 'bad');
      box.innerHTML = `<span class="sr-ic">${ic(ok ? 'check' : 'x')}</span><div class="sr-body"><b>${esc(title)}</b><div class="muted">${esc(msg)}</div><div class="sr-actions">${actions}</div></div>`;
      box.hidden = false;
      if (navigator.vibrate) navigator.vibrate(ok ? 60 : [40, 40, 40]);
    };
    const again = '<button type="button" class="btn btn-ghost btn-sm" data-scan-again>Scan again</button>';
    if (!code) return show(false, 'Not a SMILE code', 'This QR code is not a SMILE Postcard or Stamp.', again);
    const isPC = code.startsWith('PC-');
    if (sc.expect === 'postcard' && !isPC) return show(false, code, 'This is a stamp. Scan the postcard first.', again);
    if (sc.expect === 'stamp' && isPC) return show(false, code, 'This is a postcard. Scan a stamp code.', again);
    if (sc.exclude.includes(code)) return show(false, code, 'You already added this code.', again);
    stopScanCamera();
    box.className = 'scan-result'; box.innerHTML = `<span class="sr-ic" style="background:var(--amber)">${ic('clock')}</span><div class="sr-body"><b>${esc(code)}</b><div class="muted">Checking…</div></div>`; box.hidden = false;
    const r = await checkCode(code);
    if (r.valid) show(true, code, r.message, `<button type="button" class="btn btn-green btn-sm" data-scan-use="${esc(code)}">${ic('check')} Use this code</button>${again}`);
    else show(false, code, r.message || 'Code not valid.', again);
  }
  $('#scanClose').addEventListener('click', () => closeScanner(null));
  $('#scanManual').addEventListener('submit', e => { e.preventDefault(); const v = $('#scanInput').value.trim(); if (v) { sc.last = ''; handleScanned(v); } });
  $('#scanFile').addEventListener('change', async e => {
    const f = e.target.files[0]; e.target.value = ''; if (!f) return;
    const img = new Image();
    img.onload = async () => {
      let txt = '';
      try { txt = await decodeFrom(img, img.naturalWidth, img.naturalHeight); } catch {}
      URL.revokeObjectURL(img.src);
      if (txt) { sc.last = ''; handleScanned(txt); } else S.toast('No QR code found in that photo.', 2600, 'info');
    };
    img.src = URL.createObjectURL(f);
  });
  document.addEventListener('click', e => {
    const use = e.target.closest('[data-scan-use]');
    if (use) { closeScanner(use.dataset.scanUse); return; }
    if (e.target.closest('[data-scan-again]')) { $('#scanResult').hidden = true; sc.last = ''; if (!sc.stream) startScanCamera(); }
  });

  /* ================= Check-in flow ================= */
  const ck = { placeId: '', photoBlob: null, photoUrl: '', postcard: '', stamps: [], busy: false };
  function resetCk(placeId) {
    if (ck.photoUrl) URL.revokeObjectURL(ck.photoUrl);
    Object.assign(ck, { placeId, photoBlob: null, photoUrl: '', postcard: '', stamps: [], busy: false });
  }

  function choosePlace(presetPostcard) {
    const recent = state.lastPlace ? [S.placeById(state.lastPlace)].filter(Boolean) : [];
    const draw = q => {
      q = (q || '').toLowerCase();
      const list = state.places.filter(p => !q || [p.name, p.area].join(' ').toLowerCase().includes(q)).slice(0, 60);
      document.getElementById('cpList').innerHTML = list.map(p => { const c = S.catById[p.category]; return `
        <button class="ml-item" style="--c:${c.color}" data-ck-place="${esc(p.id)}"><span class="ml-ic">${ic(c.icon)}</span><span><b>${esc(p.name)}</b><small>${esc(p.area)} · +${S.pointsFor(p)} pts</small></span></button>`; }).join('');
    };
    S.openSheet(`<div class="sheet-title"><span class="pill pill-green">${ic('qr')} Check in</span><h3>Where are you now?</h3>
      <p class="muted" style="margin:4px 0 0">${presetPostcard ? `Postcard <b>${esc(presetPostcard)}</b> is ready. ` : ''}Pick the place you are visiting.</p></div>
      <div class="sheet-content" style="padding-top:10px">
        ${recent.length ? `<small class="muted">Last viewed</small><div class="map-list" style="margin:6px 0 10px">${recent.map(p => `<button class="ml-item on" style="--c:${S.catById[p.category].color}" data-ck-place="${esc(p.id)}"><span class="ml-ic">${ic(S.catById[p.category].icon)}</span><span><b>${esc(p.name)}</b><small>${esc(p.area)}</small></span></button>`).join('')}</div>` : ''}
        <label class="search" style="margin:0 0 10px">${ic('search')}<input id="cpSearch" placeholder="Search places and events…" autocomplete="off"></label>
        <div class="map-list" id="cpList"></div></div>`);
    draw('');
    document.getElementById('cpSearch').addEventListener('input', e => draw(e.target.value));
    ck.presetPostcard = presetPostcard || '';
  }

  function startCheckin(placeId) {
    if (!placeId) return choosePlace();
    const preset = ck.presetPostcard; ck.presetPostcard = '';
    if (ck.placeId !== placeId) resetCk(placeId);
    if (preset) ck.postcard = preset;
    state.lastPlace = placeId;
    renderCheckin();
  }

  function renderCheckin() {
    const p = S.placeById(ck.placeId); if (!p) return;
    const c = S.catById[p.category], needPhoto = state.settings.requireProofPhoto !== false, needCard = state.settings.requirePostcard !== false;
    const base = S.pointsFor(p), total = base + ck.stamps.length * stampPts();
    const ready = (!needPhoto || ck.photoBlob) && (!needCard || ck.postcard);
    const slots = Array.from({ length: maxStamps() }, (_, i) => ck.stamps[i]
      ? `<span class="stamp-slot filled">${ic('stamp')} ${esc(ck.stamps[i])} <button type="button" class="btn-x" style="width:24px;height:24px" data-ck-unstamp="${i}" aria-label="Remove stamp">${ic('x')}</button></span>`
      : `<button type="button" class="stamp-slot" data-ck="stamp" ${ck.postcard ? '' : 'disabled'}>${ic('scan')} Scan stamp +${stampPts()}</button>`).join('');
    S.openSheet(`<div class="sheet-title"><span class="pill pill-green">${ic('qr')} Check in</span><h3>${esc(p.name)}</h3>
        <span class="meta"><span>${ic(c.icon)} ${esc(c.name)}</span><span>${ic('pin')} ${esc(p.area)}</span></span></div>
      <div class="sheet-content" style="padding-top:6px">
        <div class="ck-step ${ck.photoBlob ? 'ok' : ''}"><span class="ck-num">${ck.photoBlob ? ic('check') : 1}</span>
          <div class="ck-body"><b>Proof photo</b><small>Take a photo at ${esc(p.name)}. It is stamped with the place, date and time.</small></div>
          ${ck.photoUrl ? `<img class="ck-thumb" src="${ck.photoUrl}" alt="Proof photo">` : ''}
          <button type="button" class="btn ${ck.photoBlob ? 'btn-ghost' : 'btn-primary'} btn-sm" data-ck="photo">${ic('camera')} ${ck.photoBlob ? 'Retake' : 'Take'}</button></div>
        <div class="ck-step ${ck.postcard ? 'ok' : ''}"><span class="ck-num">${ck.postcard ? ic('check') : 2}</span>
          <div class="ck-body"><b>SMILE Postcard</b><small>Scan the QR on a postcard you bought from a <a class="link" href="#market/merchants">SMILE Merchant</a>. One postcard = one check-in.</small>
            ${ck.postcard ? `<div class="code-chip">${ic('postcard')} ${esc(ck.postcard)}</div>` : ''}</div>
          <button type="button" class="btn ${ck.postcard ? 'btn-ghost' : 'btn-primary'} btn-sm" data-ck="postcard">${ic('scan')} ${ck.postcard ? 'Change' : 'Scan'}</button></div>
        <div class="ck-step ${ck.stamps.length ? 'ok' : ''}"><span class="ck-num">${ck.stamps.length ? ic('check') : 3}</span>
          <div class="ck-body"><b>Stamps <span class="muted" style="font-weight:500">(optional)</span></b><small>Add up to ${maxStamps()} stamps on this postcard, +${stampPts()} points each.</small>
            <div class="stamp-slots">${slots}</div></div></div>
        <div class="ck-total"><span>Check-in ${base}${ck.stamps.length ? ` + stamps ${ck.stamps.length * stampPts()}` : ''}</span><b>+${total} pts</b></div>
        ${DEMO ? '<div class="demo-note">Demo mode: try postcard <b>PC-DEMO01</b> to <b>PC-DEMO20</b> and stamps <b>ST-DEMO01</b> to <b>ST-DEMO40</b>.</div>' : ''}
        <div class="sheet-actions"><button type="button" class="btn btn-ghost" data-place="${esc(p.id)}">${ic('back')} Place info</button>
          <button type="button" class="btn btn-green" data-ck="submit" ${ready && !ck.busy ? '' : 'disabled'}>${ck.busy ? 'Submitting…' : `${ic('check')} Submit check-in`}</button></div>
      </div>`);
  }

  async function blobToDataUrl(blob, maxW = 720, q = 0.72) {
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = URL.createObjectURL(blob); });
    const s = Math.min(1, maxW / img.naturalWidth), cv = document.createElement('canvas');
    cv.width = Math.round(img.naturalWidth * s); cv.height = Math.round(img.naturalHeight * s);
    cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height); URL.revokeObjectURL(img.src);
    return cv.toDataURL('image/jpeg', q);
  }
  function getPosition() {
    return new Promise(res => {
      if (!navigator.geolocation) return res(null);
      navigator.geolocation.getCurrentPosition(p => res({ lat: p.coords.latitude, lng: p.coords.longitude }), () => res(null), { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 });
    });
  }

  async function submitCheckin() {
    if (ck.busy) return;
    if (!(await S.ensureName())) return;
    const p = S.placeById(ck.placeId);
    ck.busy = true; renderCheckin();
    let res;
    try {
      if (DEMO) res = demoCheckin(p);
      else {
        const [photo, pos] = await Promise.all([ck.photoBlob ? blobToDataUrl(ck.photoBlob) : '', getPosition()]);
        res = await S.apiPost({ action: 'checkin', userId: state.userId, name: state.name, placeId: p.id, postcard: ck.postcard, stamps: ck.stamps, photo, ...(pos || {}) });
      }
    } catch { res = { ok: false, error: 'You seem to be offline. Your check-in was not sent. Try again when connected.' }; }
    ck.busy = false;
    if (!res.ok) { if (res.profile) S.setProfile(res.profile); renderCheckin(); S.toast(res.error || 'Check-in failed.', 4200, 'info'); return; }
    const card = ck.postcard, stamps = ck.stamps.length;
    resetCk('');
    S.celebrateResult(res, `at ${p.name}!`);
    S.openSheet(`<div class="success"><div class="big-ic">${ic('check')}</div><span class="eyebrow">Checked in</span><h3>${esc(p.name)}</h3>
      <div class="big-points">+${res.earned} pts</div>
      <p class="muted">Postcard <b>${esc(card)}</b>${stamps ? ` with ${stamps} stamp${stamps > 1 ? 's' : ''}` : ''}.${stamps < maxStamps() ? ` You can add ${maxStamps() - stamps} more stamp${maxStamps() - stamps > 1 ? 's' : ''} later from your passport.` : ''}</p>
      <div class="sheet-actions"><a class="btn btn-ghost" href="#rank">${ic('trophy')} My passport</a><button type="button" class="btn btn-primary" data-camera="${esc(p.id)}">${ic('camera')} Souvenir photo</button></div></div>`);
  }

  function demoCheckin(p) {
    const log = store.get('log', []);
    if (log.some(r => (r.type || 'checkin') === 'checkin' && r.placeId === p.id && r.date === S.today())) return { ok: false, error: 'Already checked in here today. Come back tomorrow!' };
    const pc = demoCheck(ck.postcard);
    if (!pc.valid) return { ok: false, error: pc.message };
    for (const s of ck.stamps) { const r = demoCheck(s); if (!r.valid) return { ok: false, error: `${s}: ${r.message}` }; }
    const used = demoUsed();
    used[ck.postcard] = { by: state.userId, placeId: p.id };
    ck.stamps.forEach(s => used[s] = { by: state.userId, placeId: p.id, postcard: ck.postcard });
    store.set('usedCodes', used);
    const rows = [{ type: 'checkin', placeId: p.id, category: p.category, points: S.pointsFor(p), postcard: ck.postcard, proofUrl: 'on-device' }]
      .concat(ck.stamps.map(s => ({ type: 'stamp', placeId: p.id, category: p.category, points: stampPts(), postcard: ck.postcard, stamp: s })));
    return S.localAppend(rows, S.pointsFor(p) + ck.stamps.length * stampPts(), 'checkin', { postcard: ck.postcard });
  }

  /* ================= Add a stamp later ================= */
  function openPostcardsNeedingStamps() { return (state.profile?.postcards || []).filter(c => c.stamps < maxStamps()); }
  async function addStampFlow(postcard, presetStamp) {
    if (!postcard) {
      const list = openPostcardsNeedingStamps();
      if (!list.length) { S.toast('No postcard with free stamp slots. Check in with a new postcard first.', 3600, 'info'); return; }
      if (list.length > 1) {
        S.openSheet(`<div class="sheet-title"><span class="pill pill-pink">${ic('stamp')} Add a stamp</span><h3>Which postcard?</h3></div>
          <div class="sheet-content"><div class="map-list">${list.map(c => { const pl = S.placeById(c.placeId); return `
            <button class="ml-item" style="--c:var(--s-pink)" data-stamp-on="${esc(c.code)}" ${presetStamp ? `data-preset="${esc(presetStamp)}"` : ''}><span class="ml-ic">${ic('postcard')}</span>
            <span><b>${esc(pl ? pl.name : c.placeId)}</b><small>${esc(c.code)} · ${c.stamps}/${maxStamps()} stamps</small></span></button>`; }).join('')}</div></div>`);
        return;
      }
      postcard = list[0].code;
    }
    S.closeSheet();
    let stamp = presetStamp;
    if (stamp) { const r = await checkCode(stamp); if (!r.valid) { S.toast(r.message, 3600, 'info'); return; } }
    else stamp = await openScanner({ expect: 'stamp' });
    if (!stamp) return;
    if (!(await S.ensureName())) return;
    let res;
    try {
      if (DEMO) {
        const used = demoUsed(), n = Object.values(used).filter(u => u.postcard === postcard).length;
        const r = demoCheck(stamp);
        if (n >= maxStamps()) res = { ok: false, error: `This postcard already has ${maxStamps()} stamps.` };
        else if (!r.valid) res = { ok: false, error: r.message };
        else {
          const pcInfo = used[postcard] || {}, pl = S.placeById(pcInfo.placeId) || {};
          used[stamp] = { by: state.userId, placeId: pcInfo.placeId, postcard }; store.set('usedCodes', used);
          res = S.localAppend([{ type: 'stamp', placeId: pcInfo.placeId, category: pl.category, points: stampPts(), postcard, stamp }], stampPts(), 'stamp');
        }
      } else res = await S.apiPost({ action: 'stamp', userId: state.userId, postcard, stamp });
    } catch { res = { ok: false, error: 'You seem to be offline. Try again when connected.' }; }
    if (!res.ok) { if (res.profile) S.setProfile(res.profile); S.toast(res.error, 3600, 'info'); return; }
    S.celebrateResult(res, 'for your stamp!');
  }

  /* ================= Deep link: #redeem/CODE (QR printed on postcards/stamps) ================= */
  S.routeHooks.redeem = async raw => {
    history.replaceState(null, '', '#' + (S.currentView || 'home'));
    const code = parseCode(raw);
    if (!code) { S.toast('That link is not a SMILE code.', 2600, 'info'); return; }
    const r = await checkCode(code);
    if (code.startsWith('PC-')) {
      if (r.valid) { S.toast('Postcard is valid! Pick the place you are visiting.', 3000, 'check'); resetCk(''); choosePlace(code); }
      else if (r.mine && r.stamps < maxStamps()) addStampFlow(code);
      else S.toast(r.message, 3600, 'info');
    } else {
      if (!r.valid) { S.toast(r.message, 3600, 'info'); return; }
      addStampFlow(null, code);
    }
  };

  /* ================= events ================= */
  document.addEventListener('click', async e => {
    const t = e.target, on = s => t.closest(s);
    let el;
    if ((el = on('[data-checkin-start]'))) { resetCk(''); choosePlace(); return; }
    if ((el = on('[data-checkin]'))) { startCheckin(el.dataset.checkin); return; }
    if ((el = on('[data-ck-place]'))) { startCheckin(el.dataset.ckPlace); return; }
    if ((el = on('[data-ck-unstamp]'))) { ck.stamps.splice(Number(el.dataset.ckUnstamp), 1); renderCheckin(); return; }
    if ((el = on('[data-ck]'))) {
      const a = el.dataset.ck;
      if (a === 'photo') S.openCamera(ck.placeId, { proof: { onUse: (blob, url) => { if (ck.photoUrl) URL.revokeObjectURL(ck.photoUrl); ck.photoBlob = blob; ck.photoUrl = url; renderCheckin(); } } });
      if (a === 'postcard') { const code = await openScanner({ expect: 'postcard' }); if (code) { ck.postcard = code; renderCheckin(); } }
      if (a === 'stamp') { const code = await openScanner({ expect: 'stamp', exclude: ck.stamps }); if (code && ck.stamps.length < maxStamps()) { ck.stamps.push(code); renderCheckin(); } }
      if (a === 'submit') submitCheckin();
      return;
    }
    if ((el = on('[data-add-stamp]'))) { addStampFlow(el.dataset.addStamp); return; }
    if ((el = on('[data-stamp-on]'))) { addStampFlow(el.dataset.stampOn, el.dataset.preset); return; }
    if (on('[data-scan-stamp]')) { addStampFlow(); return; }
  });

  Object.assign(S, { openScanner, startCheckin, addStampFlow, parseCode });
})();
