/* SMILE · Shop & Services: merchandise with delivery, bookable services, postcard merchants, stay requests, my orders */
(() => {
  'use strict';
  const S = window.SMILE;
  const { $, esc, ic, state, store, DEMO } = S;
  const PALETTE = ['#1D5CC8', '#E0263B', '#22A046', '#7B2FBE', '#F26A1B', '#0E8F86', '#EC2882', '#B7791F'];
  const m = { tab: 'merch', filter: 'all', svcFilter: 'all', cart: store.get('cart', []), fulfillment: 'delivery', loc: null, orders: null };

  const cat = () => state.catalog || { sellers: [], products: [], services: [] };
  const sellerById = id => cat().sellers.find(s => s.id === id) || { id, name: id, type: 'nano' };
  const productById = id => cat().products.find(p => p.id === id);
  const sellerColor = id => PALETTE[Math.abs([...String(id)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7)) % PALETTE.length];
  const sellerBadge = s => s.type === 'merchant' ? `<span class="merchant-badge">${ic('postcard')} SMILE Merchant</span>` : `<span class="chip g">${ic('users')} Nano entrepreneur</span>`;

  /* ---------- cart ---------- */
  const saveCart = () => { store.set('cart', m.cart); updateCartCount(); };
  const qtyOf = id => (m.cart.find(i => i.id === id) || {}).qty || 0;
  function setQty(id, qty) {
    qty = Math.max(0, Math.min(20, qty));
    const it = m.cart.find(i => i.id === id);
    if (!qty) m.cart = m.cart.filter(i => i.id !== id);
    else if (it) it.qty = qty; else m.cart.push({ id, qty });
    saveCart();
  }
  function updateCartCount() {
    const n = m.cart.reduce((t, i) => t + i.qty, 0);
    document.querySelectorAll('.cart-count').forEach(b => { b.textContent = n; b.hidden = !n; });
  }
  const bump = () => { const b = $('.cart-btn'); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); };

  /* ---------- renderers ---------- */
  function productCard(p) {
    const s = sellerById(p.sellerId), q = qtyOf(p.id);
    return `<div class="product card" style="--c:${sellerColor(p.sellerId)}">
      <div class="p-img" ${p.image ? `style="background-image:url('${esc(p.image)}')"` : ''}>${p.image ? '' : ic(p.icon || 'bag')}
        ${(p.tags || []).includes('official') ? '<span class="p-badge">Official</span>' : ''}</div>
      <div class="p-body"><strong>${esc(p.name)}</strong>
        <span class="p-seller">${ic(s.type === 'merchant' ? 'store' : 'users')} ${esc(s.name)}</span>
        <p class="p-desc">${esc(p.description || '')}</p>
        <span class="deliv ${p.deliverable ? '' : 'no'}">${ic(p.deliverable ? 'truck' : 'store')} ${p.deliverable ? 'Delivery available' : 'Pickup only'}${p.stock != null ? ` · ${p.stock} left` : ''}</span>
        <div class="p-foot"><span class="price">${S.money(p.price)}</span>
          ${q ? `<span class="qty"><button type="button" data-qty="${esc(p.id)}" data-d="-1" aria-label="Less">${ic('minus')}</button><span>${q}</span><button type="button" data-qty="${esc(p.id)}" data-d="1" aria-label="More">${ic('plus')}</button></span>`
              : `<button type="button" class="add-btn" data-add="${esc(p.id)}">${ic('cart')} Add</button>`}</div></div></div>`;
  }
  function renderHomeProducts() {
    const el = $('#homeProducts'); if (!el) return;
    el.innerHTML = cat().products.slice(0, 4).map(productCard).join('');
  }

  function renderMarket() {
    document.querySelectorAll('[data-mtab]').forEach(b => { b.setAttribute('aria-selected', b.dataset.mtab === m.tab); b.style.setProperty('--c', 'var(--green)'); });
    const body = $('#marketBody');
    if (m.tab === 'merch') {
      const tags = [...new Set(cat().products.flatMap(p => p.tags || []).filter(t => t !== 'checkin'))];
      const list = cat().products.filter(p => m.filter === 'all' || (p.tags || []).includes(m.filter));
      body.innerHTML = `<div class="nano-banner">${ic('users')}<div><b>Every purchase supports a local nano entrepreneur.</b><br><small>Delivered to your hotel, home or current location. Pay cash on delivery or by GCash.</small></div></div>
        <div class="filters">${['all', ...tags].map(t => `<button class="tab" style="--c:var(--green)" aria-selected="${m.filter === t}" data-mfilter="${esc(t)}">${t === 'all' ? 'All' : esc(t[0].toUpperCase() + t.slice(1))}</button>`).join('')}</div>
        <div class="product-grid">${list.map(productCard).join('') || '<div class="empty">No products yet.</div>'}</div>`;
    } else if (m.tab === 'services') {
      const types = [...new Set(cat().services.map(s => s.serviceType))];
      const list = cat().services.filter(s => m.svcFilter === 'all' || s.serviceType === m.svcFilter);
      body.innerHTML = `<div class="nano-banner">${ic('sparkles')}<div><b>Book local talent and home services.</b><br><small>Barbers, massage therapists, emcees, comedians and more. The provider confirms the schedule and you pay them directly.</small></div></div>
        <div class="filters">${['all', ...types].map(t => `<button class="tab" style="--c:var(--green)" aria-selected="${m.svcFilter === t}" data-sfilter="${esc(t)}">${t === 'all' ? 'All services' : esc(t)}</button>`).join('')}</div>
        <div class="svc-grid">${list.map(sv => { const s = sellerById(sv.sellerId); return `
          <div class="svc card" style="--c:${sellerColor(sv.sellerId)}">
            <div class="svc-head"><span class="svc-ic">${ic(sv.icon || 'sparkles')}</span><div><span class="svc-type">${esc(sv.serviceType)}</span><strong>${esc(sv.name)}</strong>
              <span class="p-seller">${ic('users')} ${esc(s.name)}</span></div></div>
            <p>${esc(sv.description || '')}</p>
            <div class="chips">${sv.homeService ? `<span class="chip g">${ic('home')} Home service</span>` : ''}<span class="chip">${ic('pin')} ${esc(sv.area || 'Iloilo')}</span></div>
            <div class="svc-foot"><span class="rate">${esc(sv.rate || '')}</span><button type="button" class="btn btn-green btn-sm" data-book-svc="${esc(sv.id)}">${ic('calendar')} Book</button></div>
          </div>`; }).join('') || '<div class="empty">No services yet.</div>'}</div>`;
    } else if (m.tab === 'merchants') {
      const sellers = cat().sellers.filter(s => s.type === 'merchant');
      const places = state.places.filter(p => p.merchant);
      const cardsFor = s => cat().products.filter(p => p.sellerId === s.id && (p.tags || []).includes('checkin') || p.sellerId === s.id && p.icon === 'stamp');
      body.innerHTML = `<div class="nano-banner">${ic('postcard')}<div><b>Buy SMILE Postcards & Stamps here.</b><br><small>Each postcard has a unique QR code good for one check-in. Add up to ${state.settings.maxStamps || 2} stamps per postcard for +${state.settings.stampPoints || 5} points each.</small></div></div>
        <div class="merch-list">${sellers.map(s => `
          <div class="merchant card"><div class="svc-head" style="--c:${sellerColor(s.id)}"><span class="svc-ic">${ic('store')}</span><div><strong>${esc(s.name)}</strong><span class="p-seller">${ic('pin')} ${esc(s.area || 'Iloilo')}</span></div></div>
            <p class="p-desc">${esc(s.description || '')}</p>
            ${cardsFor(s).map(p => `<div class="cart-item"><span class="ci-name">${ic(p.icon)} ${esc(p.name)}<small>${S.money(p.price)} · ${p.deliverable ? 'delivery or pickup' : 'pickup at the stall'}</small></span>
              <button type="button" class="add-btn" data-add="${esc(p.id)}">${ic('cart')} ${qtyOf(p.id) ? qtyOf(p.id) + ' in cart' : 'Add'}</button></div>`).join('')}
            <a class="btn btn-ghost btn-sm" href="${S.dirUrl(s.name.replace(/\s*\(sample\)/i, '') + ', ' + (s.area || '') + ', Iloilo')}" target="_blank" rel="noopener">${ic('nav')} Directions</a>
          </div>`).join('')}
          ${places.map(p => `<div class="merchant card"><div class="svc-head" style="--c:${S.catById[p.category].color}"><span class="svc-ic">${ic(S.catById[p.category].icon)}</span><div><strong>${esc(p.name)}</strong><span class="p-seller">${ic('pin')} ${esc(p.area)}</span></div></div>
            <span class="merchant-badge">${ic('postcard')} Postcards sold at the counter</span><button class="btn btn-ghost btn-sm" data-place="${esc(p.id)}">${ic('info')} Details & map</button></div>`).join('')}
        </div>`;
    } else if (m.tab === 'orders') {
      body.innerHTML = `<div class="row-head" style="margin-bottom:12px"><span class="muted">Orders and bookings from this device</span><button class="btn btn-ghost btn-sm" data-orders-refresh>${ic('flip')} Refresh</button></div><div class="orders" id="ordersList"><div class="empty">Loading…</div></div>`;
      loadOrders();
    }
  }

  async function loadOrders() {
    const el = document.getElementById('ordersList'); if (!el) return;
    let list = [];
    if (DEMO) list = store.get('orders', []);
    else {
      try { const r = await S.apiGet({ action: 'orders', userId: state.userId }); list = r.ok ? r.orders : []; }
      catch { el.innerHTML = '<div class="empty">Orders are unavailable offline.</div>'; return; }
    }
    el.innerHTML = list.length ? list.map(o => `<div class="order card">
      <div class="order-head"><b>${esc(o.orderId)}</b><span class="status ${esc(String(o.status).split(' ')[0])}">${esc(o.status)}</span></div>
      <span class="p-seller">${ic(o.type === 'booking' ? 'calendar' : 'package')} ${esc(o.seller || '')}${o.schedule ? ' · ' + esc(o.schedule) : ''}${o.fulfillment ? ' · ' + esc(o.fulfillment) : ''}</span>
      <pre>${esc(o.items)}</pre>
      ${o.total !== '' && o.total != null ? `<b>${S.money(o.total)}</b>` : ''}
      <small class="muted">${esc(new Date(o.createdAt).toLocaleString('en-PH'))}${o.payment ? ' · ' + esc(o.payment) : ''}</small></div>`).join('')
      : `<div class="empty">${ic('receipt')} No orders yet. <a class="link" href="#market">Browse merchandise</a></div>`;
  }

  /* ---------- location helper ---------- */
  function locate(btn) {
    if (!navigator.geolocation) { S.toast('Location is not available on this device.', 2600, 'info'); return; }
    btn.disabled = true; btn.innerHTML = `${ic('locate')} Locating…`;
    navigator.geolocation.getCurrentPosition(p => {
      m.loc = { lat: +p.coords.latitude.toFixed(6), lng: +p.coords.longitude.toFixed(6) };
      const box = document.getElementById('locBox');
      if (box) box.innerHTML = `<span class="loc-pin">${ic('check')} Pinned: ${m.loc.lat}, ${m.loc.lng}</span><iframe class="mini-map" style="height:160px" title="Your location" src="${S.embedUrl(m.loc.lat + ',' + m.loc.lng, 17)}"></iframe>`;
      btn.disabled = false; btn.innerHTML = `${ic('locate')} Update location`;
    }, () => { btn.disabled = false; btn.innerHTML = `${ic('locate')} Use my current location`; S.toast('Could not get your location. Please type your address.', 3200, 'info'); },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 });
  }
  const contact = () => store.get('contact', { name: state.name || '', phone: '', address: '' });
  const locBlock = (label, required) => `<label>${esc(label)}<textarea id="fAddr" placeholder="Hotel / street, barangay, landmark" ${required ? 'required' : ''}>${esc(contact().address || '')}</textarea></label>
    <div class="loc-row"><button type="button" class="btn btn-ghost btn-sm" data-locate>${ic('locate')} Use my current location</button></div>
    <div id="locBox">${m.loc ? `<span class="loc-pin">${ic('check')} Pinned: ${m.loc.lat}, ${m.loc.lng}</span><iframe class="mini-map" style="height:160px" title="Your location" src="${S.embedUrl(m.loc.lat + ',' + m.loc.lng, 17)}"></iframe>` : ''}</div>`;

  /* ---------- cart & checkout ---------- */
  function cartGroups() {
    const g = {};
    m.cart.forEach(i => { const p = productById(i.id); if (p) (g[p.sellerId] = g[p.sellerId] || []).push({ p, qty: i.qty }); });
    return g;
  }
  function openCart() {
    const groups = cartGroups(), ids = Object.keys(groups);
    if (!ids.length) {
      S.openSheet(`<div class="success"><div class="big-ic" style="background:var(--cream-2);color:var(--rust)">${ic('cart')}</div><h3>Your cart is empty</h3>
        <p class="muted">Souvenir shirts, hablon bags, SMILE postcards and more from local nano entrepreneurs.</p><a class="btn btn-primary" href="#market">${ic('store')} Browse the shop</a></div>`);
      return;
    }
    const fee = state.settings.deliveryFee || 0, deliv = m.fulfillment === 'delivery';
    const pickupOnly = m.cart.map(i => productById(i.id)).filter(p => p && !p.deliverable);
    let subtotal = 0;
    const groupHtml = ids.map(sid => {
      const s = sellerById(sid), items = groups[sid], sub = items.reduce((t, i) => t + i.p.price * i.qty, 0);
      subtotal += sub;
      return `<div class="cart-group"><h4>${ic(s.type === 'merchant' ? 'store' : 'users')} ${esc(s.name)}</h4>
        ${items.map(i => `<div class="cart-item"><span class="ci-name">${esc(i.p.name)}<small>${S.money(i.p.price)}${i.p.deliverable ? '' : ' · pickup only'}</small></span>
          <span class="qty"><button type="button" data-qty="${esc(i.p.id)}" data-d="-1" data-incart aria-label="Less">${ic('minus')}</button><span>${i.qty}</span><button type="button" data-qty="${esc(i.p.id)}" data-d="1" data-incart aria-label="More">${ic('plus')}</button></span></div>`).join('')}
        <div class="sum-row"><span>Subtotal</span><span>${S.money(sub)}</span></div>${deliv ? `<div class="sum-row"><span>Delivery</span><span>${S.money(fee)}</span></div>` : ''}</div>`;
    }).join('');
    const total = subtotal + (deliv ? fee * ids.length : 0), c = contact();
    S.openSheet(`<div class="sheet-title"><span class="pill pill-green">${ic('cart')} Cart</span><h3>Your order</h3></div>
      <div class="sheet-content" style="padding-top:6px">
        ${groupHtml}
        <div class="sum-row total"><span>Total</span><span>${S.money(total)}</span></div>
        ${deliv && ids.length > 1 ? `<small class="muted">Each seller delivers separately (${S.money(fee)} each).</small>` : ''}
        <form class="form" id="orderForm">
          <div class="seg"><label><input type="radio" name="ful" value="delivery" ${deliv ? 'checked' : ''}>${ic('truck')} Delivery</label><label><input type="radio" name="ful" value="pickup" ${deliv ? '' : 'checked'}>${ic('store')} Pickup</label></div>
          ${deliv && pickupOnly.length ? `<div class="demo-note" style="background:#FDE7EA;color:var(--c-events)">Pickup only: ${pickupOnly.map(p => esc(p.name)).join(', ')}. Remove them or choose Pickup.</div>` : ''}
          <div class="row2"><label>Name<input id="fName" required value="${esc(c.name || state.name || '')}" autocomplete="name"></label>
            <label>Mobile number<input id="fPhone" required type="tel" inputmode="tel" placeholder="09XX XXX XXXX" value="${esc(c.phone || '')}" autocomplete="tel"></label></div>
          ${deliv ? locBlock('Delivery address', false) : ''}
          <label>Payment<select id="fPay"><option value="cod">Cash on delivery / pickup</option><option value="gcash">GCash (seller sends details)</option></select></label>
          <label>Notes for the seller<textarea id="fNotes" placeholder="Sizes, colors, delivery time…"></textarea></label>
          <button class="btn btn-green btn-block" type="submit" ${deliv && pickupOnly.length ? 'disabled' : ''}>${ic('check')} Place order · ${S.money(total)}</button>
          <small class="muted">The seller confirms your order by text or call. Track it in <a class="link" href="#market/orders">My Orders</a>.</small>
        </form></div>`);
    document.getElementById('orderForm').addEventListener('submit', submitOrder);
    document.querySelectorAll('input[name="ful"]').forEach(r => r.addEventListener('change', e => { m.fulfillment = e.target.value; openCart(); }));
  }

  async function submitOrder(e) {
    e.preventDefault();
    const name = $('#fName').value.trim(), phone = $('#fPhone').value.trim(), address = ($('#fAddr')?.value || '').trim();
    if (!name || !phone) { S.toast('Please enter your name and mobile number.', 2600, 'info'); return; }
    if (!/^[+\d][\d\s-]{6,}$/.test(phone)) { S.toast('Please enter a valid mobile number.', 2600, 'info'); return; }
    if (m.fulfillment === 'delivery' && !address && !m.loc) { S.toast('Add your delivery address or share your location.', 3000, 'info'); return; }
    store.set('contact', { name, phone, address });
    const btn = e.submitter || e.target.querySelector('button[type=submit]'); btn.disabled = true; btn.textContent = 'Placing order…';
    const body = { action: 'order', userId: state.userId, customer: name, phone, fulfillment: m.fulfillment, address, ...(m.loc || {}),
      payment: $('#fPay').value, notes: $('#fNotes').value.trim(), items: m.cart.map(i => ({ id: i.id, qty: i.qty })) };
    let res;
    try { res = DEMO ? demoOrder(body) : await S.apiPost(body); }
    catch { res = { ok: false, error: 'You seem to be offline. Please try again.' }; }
    if (!res.ok) { btn.disabled = false; btn.textContent = 'Place order'; S.toast(res.error || 'Order failed.', 3600, 'info'); return; }
    m.cart = []; saveCart(); m.loc = null; renderMarket(); renderHomeProducts();
    S.celebrate(50);
    S.openSheet(`<div class="success"><div class="big-ic">${ic('package')}</div><span class="eyebrow">Order placed</span><h3>${esc(res.orderId)}</h3>
      <p class="muted">${(res.groups || []).map(g => `${esc(g.seller)}: ${S.money(g.subtotal + (g.deliveryFee || 0))}`).join('<br>')}</p>
      <div class="big-points">${S.money(res.total)}</div>
      <p class="muted">The seller will contact you at ${esc(phone)} to confirm${m.fulfillment === 'delivery' ? ' the delivery' : ' the pickup'}.</p>
      <div class="sheet-actions"><a class="btn btn-ghost" href="#market/orders">${ic('receipt')} My orders</a><a class="btn btn-primary" href="#explore/landmarks">${ic('compass')} Keep exploring</a></div></div>`);
  }

  function demoOrder(b) {
    const id = 'SM-DEMO-' + Math.random().toString(36).slice(2, 6).toUpperCase(), groups = cartGroups(), fee = state.settings.deliveryFee || 0;
    const out = [], orders = store.get('orders', []); let total = 0;
    Object.keys(groups).forEach(sid => {
      const sub = groups[sid].reduce((t, i) => t + i.p.price * i.qty, 0), f = b.fulfillment === 'delivery' ? fee : 0;
      total += sub + f; out.push({ seller: sellerById(sid).name, subtotal: sub, deliveryFee: f });
      orders.unshift({ orderId: id, type: 'order', status: 'Pending (demo)', createdAt: new Date().toISOString(), seller: sellerById(sid).name,
        items: groups[sid].map(i => `${i.qty}× ${i.p.name} (${S.money(i.p.price)})`).join('\n'), total: sub + f, fulfillment: b.fulfillment, payment: b.payment === 'gcash' ? 'GCash' : 'Cash on delivery' });
    });
    store.set('orders', orders);
    return { ok: true, orderId: id, total, groups: out };
  }

  /* ---------- bookings (services & stays) ---------- */
  function openBooking(kind, refId) {
    const c = contact(), todayStr = S.today();
    let title, sub, extra;
    if (kind === 'stay') {
      const p = S.placeById(refId); if (!p) return;
      title = p.name; sub = `${p.area} · ${p.priceRange || ''}`;
      extra = `<div class="row2"><label>Check-in<input id="bDate" type="date" min="${todayStr}" required></label><label>Check-out<input id="bEnd" type="date" min="${todayStr}" required></label></div>
        <label>Guests<input id="bGuests" type="number" min="1" max="20" value="2"></label>`;
    } else {
      const sv = cat().services.find(s => s.id === refId); if (!sv) return;
      title = sv.name; sub = `${sv.serviceType} · ${sellerById(sv.sellerId).name} · ${sv.rate || ''}`;
      extra = `<div class="row2"><label>Date<input id="bDate" type="date" min="${todayStr}" required></label><label>Time<input id="bTime" type="time" value="10:00"></label></div>
        ${locBlock(sv.homeService ? 'Where should they come? (hotel, home or address)' : 'Event venue / location', false)}`;
    }
    S.openSheet(`<div class="sheet-title"><span class="pill pill-green">${ic(kind === 'stay' ? 'bed' : 'calendar')} ${kind === 'stay' ? 'Stay request' : 'Book a service'}</span><h3>${esc(title)}</h3><span class="muted">${esc(sub)}</span></div>
      <div class="sheet-content" style="padding-top:6px"><form class="form" id="bookForm">
        ${extra}
        <div class="row2"><label>Name<input id="fName" required value="${esc(c.name || state.name || '')}" autocomplete="name"></label>
          <label>Mobile number<input id="fPhone" required type="tel" inputmode="tel" placeholder="09XX XXX XXXX" value="${esc(c.phone || '')}"></label></div>
        <label>Notes<textarea id="fNotes" placeholder="${kind === 'stay' ? 'Room type, arrival time…' : 'Number of people, event details…'}"></textarea></label>
        <button class="btn btn-green btn-block" type="submit">${ic('check')} Send request</button>
        <small class="muted">${kind === 'stay' ? 'The property confirms availability and rates with you directly.' : 'The provider confirms the schedule and final rate. You pay them directly.'}</small>
      </form></div>`);
    document.getElementById('bookForm').addEventListener('submit', e => submitBooking(e, kind, refId, title));
  }
  async function submitBooking(e, kind, refId, title) {
    e.preventDefault();
    const name = $('#fName').value.trim(), phone = $('#fPhone').value.trim(), date = $('#bDate').value;
    if (!name || !phone || !date) { S.toast('Please fill in the date, your name and mobile number.', 3000, 'info'); return; }
    const end = $('#bEnd')?.value || '';
    if (kind === 'stay' && end && end <= date) { S.toast('Check-out must be after check-in.', 2600, 'info'); return; }
    const address = ($('#fAddr')?.value || '').trim();
    store.set('contact', { ...contact(), name, phone, address: address || contact().address });
    const btn = e.submitter || e.target.querySelector('button[type=submit]'); btn.disabled = true; btn.textContent = 'Sending…';
    const body = { action: 'booking', userId: state.userId, customer: name, phone, kind, refId, date, time: $('#bTime')?.value || '', endDate: end,
      guests: $('#bGuests')?.value || '', address, ...(m.loc || {}), notes: $('#fNotes').value.trim() };
    let res;
    try {
      if (DEMO) {
        res = { ok: true, orderId: 'BK-DEMO-' + Math.random().toString(36).slice(2, 6).toUpperCase() };
        const orders = store.get('orders', []);
        orders.unshift({ orderId: res.orderId, type: 'booking', status: 'Pending (demo)', createdAt: new Date().toISOString(), seller: title,
          items: (kind === 'stay' ? 'Stay request' : 'Service booking') + ': ' + title, schedule: date + (body.time ? ' ' + body.time : '') + (end ? ' → ' + end : ''), total: '' });
        store.set('orders', orders);
      } else res = await S.apiPost(body);
    } catch { res = { ok: false, error: 'You seem to be offline. Please try again.' }; }
    if (!res.ok) { btn.disabled = false; btn.textContent = 'Send request'; S.toast(res.error || 'Booking failed.', 3600, 'info'); return; }
    m.loc = null;
    S.openSheet(`<div class="success"><div class="big-ic">${ic('calendar')}</div><span class="eyebrow">Request sent</span><h3>${esc(res.orderId)}</h3>
      <p class="muted">${esc(title)} · ${esc(date)}${body.time ? ' ' + esc(body.time) : ''}${end ? ' → ' + esc(end) : ''}<br>We'll text ${esc(phone)} to confirm.</p>
      <div class="sheet-actions"><a class="btn btn-ghost" href="#market/orders">${ic('receipt')} My orders</a><button class="btn btn-primary" type="button" data-close-sheet>Done</button></div></div>`);
  }

  /* ---------- route & events ---------- */
  S.routeHooks.home = () => renderHomeProducts();
  S.routeHooks.market = arg => { if (['merch', 'services', 'merchants', 'orders'].includes(arg)) m.tab = arg; renderMarket(); };
  document.addEventListener('click', e => {
    const t = e.target, on = s => t.closest(s);
    let el;
    if ((el = on('[data-mtab]'))) { history.replaceState(null, '', '#market/' + el.dataset.mtab); m.tab = el.dataset.mtab; renderMarket(); return; }
    if ((el = on('[data-mfilter]'))) { m.filter = el.dataset.mfilter; renderMarket(); return; }
    if ((el = on('[data-sfilter]'))) { m.svcFilter = el.dataset.sfilter; renderMarket(); return; }
    if ((el = on('[data-add]'))) {
      const p = productById(el.dataset.add); if (!p) return;
      setQty(p.id, qtyOf(p.id) + 1); bump();
      S.toast(`${p.name} added to cart`, 2000, 'cart');
      if (S.currentView === 'market') renderMarket(); renderHomeProducts(); return;
    }
    if ((el = on('[data-qty]'))) {
      setQty(el.dataset.qty, qtyOf(el.dataset.qty) + Number(el.dataset.d));
      if (el.hasAttribute('data-incart')) openCart(); else { if (S.currentView === 'market') renderMarket(); renderHomeProducts(); }
      return;
    }
    if (on('[data-open-cart]')) { openCart(); return; }
    if ((el = on('[data-book-svc]'))) { m.loc = null; openBooking('service', el.dataset.bookSvc); return; }
    if ((el = on('[data-book-stay]'))) { m.loc = null; openBooking('stay', el.dataset.bookStay); return; }
    if ((el = on('[data-locate]'))) { locate(el); return; }
    if (on('[data-orders-refresh]')) { loadOrders(); return; }
    if (on('[data-close-sheet]')) { S.closeSheet(); return; }
  });

  document.addEventListener('DOMContentLoaded', () => { updateCartCount(); renderHomeProducts(); });
  window.addEventListener('online', renderHomeProducts);
  Object.assign(S, { renderMarket, openCart, openBooking });
})();
