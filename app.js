/* ==========================================================================
   HARKAAM — frontend marketplace prototype
   Vanilla JavaScript. No backend, no frameworks, no external dependencies.

   All provider, review and pricing data is sample data. Bookings, favorites,
   accounts and provider applications are stored in this browser's
   localStorage only. This is NOT a real database and login is NOT secure.
   ========================================================================== */

(function () {
  "use strict";

  /* ----------------------------------------------------------------------
     1. Constants, storage and small utilities
     ---------------------------------------------------------------------- */

  const DATA = window.HARKAAM_DATA;
  const CATEGORIES = DATA.CATEGORIES;
  const CITIES = DATA.CITIES;
  const BASE_PROVIDERS = DATA.PROVIDERS;

  const CAT_BY_ID = {};
  const SUB_BY_KEY = {};
  const SUB_INDEX = [];

  CATEGORIES.forEach((cat) => {
    CAT_BY_ID[cat.id] = cat;
    cat.subcategories.forEach((sub) => {
      SUB_BY_KEY[cat.id + ":" + sub.id] = { cat, sub };
      SUB_INDEX.push({ cat, sub });
    });
  });

  const KEYS = {
    customers: "harkaam_customers_v1",
    providers: "harkaam_provider_apps_v1",
    bookings: "harkaam_bookings_v1",
    favorites: "harkaam_favorites_v1",
    session: "harkaam_session_v1",
    profile: "harkaam_customer_profile_v1",
    overrides: "harkaam_provider_overrides_v1",
    seq: "harkaam_booking_seq_v1",
    theme: "harkaam_theme_v1",
    back: "harkaam_back_v1",
    userRole: "harkaam_user_role_v1",
    invoiceSeq: "harkaam_invoice_seq_v1"
  };

  const POPULAR_SEARCHES = [
    "AC Repair", "Mathematics Tutor", "Plumber", "Electrician",
    "Carpenter", "Graphic Designer", "House Wiring", "Logo Design"
  ];

  function storeGet(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (error) {
      return fallback;
    }
  }

  function storeSet(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      toast("Could not save to this browser's storage. It may be full or blocked.", "error");
      return false;
    }
  }

  function storeRemove(key) {
    try { localStorage.removeItem(key); } catch (error) { /* ignore */ }
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function normalize(value) {
    return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
  }

  function slug(value) {
    return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  function formatPrice(value) {
    const number = Number(value) || 0;
    return "PKR " + number.toLocaleString("en-PK");
  }

  function formatDate(iso) {
    if (!iso) return "—";
    const date = new Date(iso + "T12:00:00");
    if (Number.isNaN(date.getTime())) return iso;
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }

  function formatTime(value) {
    if (!value) return "—";
    const [hour, minute] = value.split(":").map(Number);
    if (Number.isNaN(hour)) return value;
    const suffix = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return displayHour + ":" + String(minute || 0).padStart(2, "0") + " " + suffix;
  }

  function todayISO() {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  }

  function monthsAgoLabel(index) {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - (index + 1));
    return date.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
  }

  function starsHtml(rating) {
    const rounded = Math.round(Number(rating) || 0);
    let html = '<span class="stars" aria-label="' + (Number(rating) || 0) + ' out of 5 stars">';
    for (let i = 1; i <= 5; i += 1) {
      html += '<span class="' + (i <= rounded ? "star filled" : "star") + '">★</span>';
    }
    return html + "</span>";
  }

  function icon(name, size) {
    const s = size || 18;
    const paths = {
      search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
      location: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
      heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/>',
      check: '<path d="m5 12 4 4L19 6"/>',
      shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
      share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4"/>',
      arrowLeft: '<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>',
      arrowRight: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
      calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/>',
      clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
      phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z"/>',
      user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
      briefcase: '<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18"/>',
      wallet: '<path d="M20 7H5a2 2 0 0 1 0-4h13v4"/><path d="M3 5v14a2 2 0 0 0 2 2h15V7H5"/><path d="M16 13h.01"/>',
      chevron: '<path d="m9 18 6-6-6-6"/>',
      close: '<path d="M18 6 6 18M6 6l12 12"/>',
      edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
      info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
      logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>',
      filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
      home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/>',
      starFilled: '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1Z" fill="currentColor" stroke="none"/>'
    };
    return '<svg viewBox="0 0 24 24" width="' + s + '" height="' + s + '" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (paths[name] || "") + "</svg>";
  }

  function uid(prefix) {
    return (prefix || "id") + "_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function firstName(name) {
    return String(name || "").trim().split(/\s+/)[0] || "there";
  }

  /* ----------------------------------------------------------------------
     2. Data helpers: providers, services, reviews, favorites
     ---------------------------------------------------------------------- */

  function getCategory(catId) {
    return CAT_BY_ID[catId] || null;
  }

  function getSubcategory(catId, subId) {
    const match = SUB_BY_KEY[catId + ":" + subId];
    return match ? match.sub : null;
  }

  function categoryName(catId) {
    const cat = getCategory(catId);
    return cat ? cat.name : "Services";
  }

  function subcategoryName(provider) {
    const sub = getSubcategory(provider.cat, provider.sub);
    return sub ? sub.name : provider.skill;
  }

  function appToProvider(app) {
    return {
      id: Number(app.id),
      name: app.name,
      skill: app.skill || (getSubcategory(app.cat, app.sub) || {}).name || "Service Provider",
      cat: app.cat,
      sub: app.sub,
      city: app.city,
      area: app.area || app.city,
      exp: Number(app.exp) || 0,
      rating: Number(app.rating) || 0,
      reviews: Number(app.reviews) || 0,
      price: Number(app.price) || 0,
      icon: app.icon || "🧑‍💼",
      verified: false,
      pending: true,
      desc: app.desc || "New provider profile submitted through the HARKAAM demo registration form.",
      skills: app.skills || [],
      hours: app.hours || "By appointment",
      availability: app.availability || "Available this week",
      languages: app.languages || ["Urdu"],
      phone: app.phone || "",
      isApplication: true
    };
  }

  function getProviderApps() {
    const apps = storeGet(KEYS.providers, []);
    return Array.isArray(apps) ? apps : [];
  }

  function getProviderOverrides() {
    const overrides = storeGet(KEYS.overrides, {});
    return overrides && typeof overrides === "object" ? overrides : {};
  }

  function getAllProviders() {
    const overrides = getProviderOverrides();
    const applications = getProviderApps().map(appToProvider);
    return BASE_PROVIDERS.concat(applications).map((provider) => {
      const override = overrides[String(provider.id)] || {};
      return Object.assign({}, provider, override, {
        id: provider.id,
        skills: Array.isArray(override.skills) ? override.skills : provider.skills,
        languages: Array.isArray(override.languages) ? override.languages : provider.languages,
        isApplication: !!provider.isApplication
      });
    });
  }

  function getProvider(id) {
    const numeric = Number(id);
    return getAllProviders().find((provider) => provider.id === numeric) || null;
  }

  function providerServices(provider) {
    const sub = getSubcategory(provider.cat, provider.sub);
    if (!sub || !sub.services.length) {
      return [{ name: provider.skill, price: provider.price, duration: "By arrangement" }];
    }
    return sub.services.map((service, index) => {
      let price;
      if (index === 0) {
        price = Number(provider.price) || service.price;
      } else {
        const rounded = Math.round(Math.max(Number(provider.price) + 800, service.price) / 100) * 100;
        price = rounded;
      }
      return { name: service.name, price, duration: service.duration };
    });
  }

  function startingPrice(provider) {
    const prices = providerServices(provider).map((service) => Number(service.price) || 0);
    return Math.min.apply(null, prices.length ? prices : [Number(provider.price) || 0]);
  }

  // Verification wording used everywhere. Base demo providers may be marked
  // verified or not; a "pending" flag is used by new demo applications.
  function verificationText(provider) {
    if (provider.pending) return "Verification pending (demo)";
    return provider.verified ? "Demo verified" : "Not verified (demo)";
  }

  function generateReviews(provider) {
    const names = DATA.REVIEWER_NAMES;
    const texts = DATA.REVIEW_TEXTS;
    const ratings = [5, 5, 4];
    const reviews = [];
    for (let i = 0; i < 3; i += 1) {
      reviews.push({
        name: names[(provider.id * 3 + i) % names.length],
        rating: ratings[(provider.id + i) % ratings.length],
        date: monthsAgoLabel(i),
        text: texts[(provider.id * 5 + i * 2) % texts.length]
      });
    }
    return reviews;
  }

  function providerHaystack(provider) {
    const cat = getCategory(provider.cat);
    const sub = getSubcategory(provider.cat, provider.sub);
    return normalize([
      provider.name,
      provider.skill,
      provider.city,
      provider.area,
      provider.desc,
      (provider.skills || []).join(" "),
      providerServices(provider).map((service) => service.name).join(" "),
      cat ? cat.name : "",
      cat ? cat.blurb : "",
      sub ? sub.name : "",
      sub ? sub.description : "",
      (provider.languages || []).join(" ")
    ].join(" "));
  }

  function canFavorites() {
    return true;
  }

  function getFavorites() {
    const favorites = storeGet(KEYS.favorites, []);
    return Array.isArray(favorites) ? favorites.map(Number) : [];
  }

  function isFavorite(id) {
    return getFavorites().indexOf(Number(id)) !== -1;
  }

  function toggleFavorite(id) {
    const numeric = Number(id);
    const favorites = getFavorites();
    const index = favorites.indexOf(numeric);
    if (index === -1) {
      favorites.push(numeric);
      storeSet(KEYS.favorites, favorites);
      toast("Provider saved to your favorites.", "success");
    } else {
      favorites.splice(index, 1);
      storeSet(KEYS.favorites, favorites);
      toast("Provider removed from favorites.", "info");
    }
    updateHeader();
    return index === -1;
  }

  function getSession() {
    const session = storeGet(KEYS.session, null);
    return session && typeof session === "object" ? session : null;
  }

  function setSession(session) {
    if (session) storeSet(KEYS.session, session);
  }

  function clearSession() {
    storeRemove(KEYS.session);
  }

  function getCustomerProfile() {
    const profile = storeGet(KEYS.profile, null);
    return profile && typeof profile === "object" ? profile : null;
  }

  function saveCustomerProfile(profile) {
    storeSet(KEYS.profile, profile);
  }

  function getBookings() {
    const raw = storeGet(KEYS.bookings, null);
    if (raw === null || (Array.isArray(raw) && raw.length === 0)) {
      const initial = (DATA.SAMPLE_REQUESTS && Array.isArray(DATA.SAMPLE_REQUESTS))
        ? JSON.parse(JSON.stringify(DATA.SAMPLE_REQUESTS))
        : [];
      if (initial.length > 0) {
        saveBookings(initial);
      }
      return initial;
    }
    return Array.isArray(raw) ? raw : [];
  }

  function saveBookings(bookings) {
    storeSet(KEYS.bookings, bookings);
  }

  function findBooking(bookingId) {
    return getBookings().find((booking) => booking.bookingId === bookingId) || null;
  }

  function nextBookingId() {
    let sequence = Number(storeGet(KEYS.seq, 0)) || 0;
    sequence += 1;
    storeSet(KEYS.seq, sequence);
    return "HKM-DEMO-" + new Date().getFullYear() + "-" + String(sequence).padStart(6, "0");
  }

  /* --- Invoice / Fee Receipt System --- */
  const PLATFORM_FEE_RATE = 0.10;   // 10% platform fee
  const DEMO_TAX_RATE = 0.05;        // 5% applicable tax (configurable demo rate)

  function nextInvoiceNumber() {
    let seq = Number(storeGet(KEYS.invoiceSeq, 0)) || 0;
    seq += 1;
    storeSet(KEYS.invoiceSeq, seq);
    return "INV-" + new Date().getFullYear() + "-" + String(seq).padStart(6, "0");
  }

  function calculateInvoice(basePrice) {
    const base = Number(basePrice) || 0;
    const platformFee = Math.round(base * PLATFORM_FEE_RATE);
    const tax = Math.round(base * DEMO_TAX_RATE);
    const total = base + platformFee + tax;
    return { base, platformFee, tax, total };
  }

  function generateInvoiceRecord(booking) {
    const effectivePrice = booking.counteroffer && booking.counteroffer.accepted
      ? booking.counteroffer.newPrice
      : booking.servicePrice;
    const calc = calculateInvoice(effectivePrice);
    let invStatus = "Estimated Receipt";
    if (booking.status === "Awaiting Payment" || booking.status === "Accepted") invStatus = "Confirmed Invoice";
    else if (booking.status === "Paid (Demo)" || booking.status === "Paid") invStatus = "Paid Invoice (Demo)";
    else if (booking.status === "Completed") invStatus = "Completed Invoice (Demo)";
    else if (booking.status === "Rejected") invStatus = "Void / Rejected";

    return {
      invoiceNumber: nextInvoiceNumber(),
      requestId: booking.bookingId,
      basePrice: calc.base,
      platformFee: calc.platformFee,
      platformFeeRate: PLATFORM_FEE_RATE,
      tax: calc.tax,
      taxRate: DEMO_TAX_RATE,
      totalAmount: calc.total,
      status: invStatus,
      generatedAt: new Date().toISOString()
    };
  }

  function invoiceStatusLabel(booking) {
    const st = booking.status;
    if (st === "Pending" || st === "Counteroffer Received" || st === "Awaiting Customer Response") {
      return "ESTIMATED RECEIPT — Pending Confirmation";
    }
    if (st === "Awaiting Payment" || st === "Accepted") {
      return "CONFIRMED INVOICE — Awaiting Payment";
    }
    if (st === "Paid (Demo)" || st === "Paid") {
      return "PAID INVOICE (DEMO)";
    }
    if (st === "Completed") {
      return "COMPLETED INVOICE (DEMO)";
    }
    if (st === "Rejected" || st === "Cancelled") {
      return "VOID / REJECTED";
    }
    return "ESTIMATED RECEIPT";
  }

  function statusClass(status) {
    const value = normalize(status);
    if (value === "accepted") return "status-accepted";
    if (value === "counteroffer received") return "status-counteroffer";
    if (value === "awaiting customer response") return "status-awaiting-response";
    if (value === "rejected") return "status-rejected";
    if (value === "awaiting payment") return "status-awaiting-payment";
    if (value === "paid (demo)" || value === "paid") return "status-paid";
    if (value === "confirmed") return "status-accepted";
    if (value === "completed") return "status-completed";
    if (value === "cancelled" || value === "declined") return "status-rejected";
    return "status-pending";
  }

  function statusBadge(status) {
    return '<span class="status-badge ' + statusClass(status) + '">' + escapeHtml(status) + "</span>";
  }

  function recommendedSort(list) {
    return list.slice().sort((a, b) => {
      const scoreA = (b.rating || 0) * 10 + Math.log10((b.reviews || 0) + 1) * 4 + (b.verified ? 2 : 0);
      const scoreB = (a.rating || 0) * 10 + Math.log10((a.reviews || 0) + 1) * 4 + (a.verified ? 2 : 0);
      return scoreA - scoreB;
    });
  }

  function similarProviders(provider, limit) {
    return getAllProviders()
      .filter((item) => item.id !== provider.id && item.cat === provider.cat)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, limit || 3);
  }

  function countProvidersInCategory(catId) {
    return getAllProviders().filter((provider) => provider.cat === catId).length;
  }

  function countProvidersInSub(catId, subId) {
    return getAllProviders().filter((provider) => provider.cat === catId && provider.sub === subId).length;
  }

  function countServicesInCategory(cat) {
    return cat.subcategories.reduce((total, sub) => total + sub.services.length, 0);
  }

  function citiesWithProviders() {
    const cities = getAllProviders().map((provider) => provider.city);
    return CITIES.filter((city) => cities.indexOf(city) !== -1).concat(
      Array.from(new Set(cities.filter((city) => CITIES.indexOf(city) === -1))).sort()
    );
  }

  /* ----------------------------------------------------------------------
     3. Search engine
     ---------------------------------------------------------------------- */

  let SEARCH_ENTRIES = [];

  function buildSearchIndex() {
    const entries = [];
    CATEGORIES.forEach((cat) => {
      entries.push({
        type: "Category",
        typeWeight: 12,
        label: cat.name,
        icon: cat.icon,
        meta: "Category · " + cat.subcategories.length + " subcategories",
        cat: cat.id,
        haystack: normalize(cat.name + " " + cat.blurb + " " + cat.subcategories.map((sub) => sub.name + " " + sub.services.map((service) => service.name).join(" ")).join(" "))
      });
      cat.subcategories.forEach((sub) => {
        entries.push({
          type: "Service",
          typeWeight: 10,
          label: sub.name,
          icon: sub.icon,
          meta: cat.name,
          cat: cat.id,
          sub: sub.id,
          haystack: normalize(cat.name + " " + sub.name + " " + sub.description + " " + sub.services.map((service) => service.name).join(" "))
        });
        sub.services.forEach((service) => {
          entries.push({
            type: "Service",
            typeWeight: 8,
            label: service.name,
            icon: sub.icon,
            meta: cat.name + " · " + sub.name,
            cat: cat.id,
            sub: sub.id,
            q: service.name,
            haystack: normalize(cat.name + " " + sub.name + " " + service.name + " " + sub.description)
          });
        });
      });
    });

    getAllProviders().forEach((provider) => {
      entries.push({
        type: "Provider",
        typeWeight: 9,
        label: provider.name,
        icon: provider.icon,
        meta: provider.skill + " · " + provider.city,
        providerId: provider.id,
        cat: provider.cat,
        sub: provider.sub,
        rating: provider.rating,
        haystack: providerHaystack(provider)
      });
    });

    citiesWithProviders().forEach((city) => {
      entries.push({
        type: "City",
        typeWeight: 6,
        label: city,
        icon: "📍",
        meta: "City · providers available",
        city,
        haystack: normalize(city + " pakistan")
      });
    });

    const seen = {};
    SEARCH_ENTRIES = entries.filter((entry) => {
      const key = entry.type + "|" + entry.label.toLowerCase() + "|" + (entry.cat || "") + "|" + (entry.sub || "") + "|" + (entry.providerId || "");
      if (seen[key]) return false;
      seen[key] = true;
      return true;
    });
  }

  function tokenize(query) {
    return normalize(query).split(" ").filter(Boolean);
  }

  function suggestionScore(entry, query, tokens) {
    const label = normalize(entry.label);
    const q = normalize(query);
    let score = entry.typeWeight;
    if (label === q) score += 120;
    else if (label.indexOf(q) === 0) score += 95;
    else if (label.indexOf(q) > -1) score += 60;
    const words = label.split(" ");
    const startsAWord = tokens.every((token) => words.some((word) => word.indexOf(token) === 0));
    if (startsAWord && label !== q) score += 45;
    const allInHaystack = tokens.every((token) => entry.haystack.indexOf(token) !== -1);
    if (!allInHaystack) return -1;
    score += 25;
    if (entry.type === "Provider") score += (Number(entry.rating) || 0) * 2;
    return score;
  }

  function getSuggestions(query, limit) {
    const tokens = tokenize(query);
    if (!tokens.length) {
      return POPULAR_SEARCHES.slice(0, limit || 8).map((term) => ({
        type: "Popular",
        label: term,
        icon: "🔎",
        meta: "Popular search",
        q: term
      }));
    }
    return SEARCH_ENTRIES
      .map((entry) => ({ entry, score: suggestionScore(entry, query, tokens) }))
      .filter((result) => result.score > -1)
      .sort((a, b) => b.score - a.score || normalize(a.entry.label).localeCompare(normalize(b.entry.label)))
      .slice(0, limit || 8)
      .map((result) => result.entry);
  }

  function highlightLabel(label, query) {
    let safe = escapeHtml(label);
    const tokens = tokenize(query);
    tokens
      .slice()
      .sort((a, b) => b.length - a.length)
      .forEach((token) => {
        if (!token) return;
        safe = safe.replace(new RegExp("(" + escapeRegExp(token) + ")", "gi"), "<mark>$1</mark>");
      });
    return safe;
  }

  function suggestionIcon(entry) {
    if (entry.type === "Provider") {
      return '<span class="suggest-avatar">' + escapeHtml(entry.icon || "🧑‍💼") + "</span>";
    }
    return '<span class="suggest-emoji">' + escapeHtml(entry.icon || "🔎") + "</span>";
  }

  function suggestionAttributes(entry) {
    const attrs = [
      'data-suggest="1"',
      'data-suggest-type="' + escapeHtml(entry.type) + '"',
      'data-label="' + escapeHtml(entry.label) + '"'
    ];
    if (entry.providerId) attrs.push('data-provider="' + escapeHtml(entry.providerId) + '"');
    if (entry.cat) attrs.push('data-cat="' + escapeHtml(entry.cat) + '"');
    if (entry.sub) attrs.push('data-sub="' + escapeHtml(entry.sub) + '"');
    if (entry.city) attrs.push('data-city="' + escapeHtml(entry.city) + '"');
    if (entry.q) attrs.push('data-q="' + escapeHtml(entry.q) + '"');
    return attrs.join(" ");
  }

  function suggestionsHtml(query, entries) {
    if (!entries.length) {
      return (
        '<div class="suggest-empty">' +
          '<span class="suggest-empty-icon">🔍</span>' +
          '<div><strong>No matches for "' + escapeHtml(query) + '"</strong>' +
          '<p>Try a service like “AC repair”, a city like “Lahore”, or a provider name.</p></div>' +
        "</div>" +
        '<button type="button" class="suggest-all" data-action="apply-search-direct" data-q="' + escapeHtml(query) + '">Search anyway <span>Enter ↵</span></button>'
      );
    }
    const isPopular = entries[0] && entries[0].type === "Popular";
    let html = '<div class="suggest-head"><span>' + (isPopular ? "Popular searches" : "Suggestions") + "</span><span>↑↓ navigate · Enter search</span></div>";
    html += '<div role="listbox">';
    entries.forEach((entry, index) => {
      html +=
        '<button type="button" role="option" class="suggest-item' + (index === 0 ? " active" : "") + '" ' +
        suggestionAttributes(entry) + ' data-index="' + index + '">' +
          suggestionIcon(entry) +
          '<span class="suggest-copy"><span class="suggest-label">' + highlightLabel(entry.label, isPopular ? "" : query) + "</span>" +
          '<span class="suggest-meta">' + escapeHtml(entry.meta || "") + "</span></span>" +
          '<span class="suggest-type">' + escapeHtml(entry.type) + "</span>" +
        "</button>";
    });
    html += "</div>";
    if (isPopular) {
      html += '<div class="suggest-foot">Start typing to search across categories, services, providers and cities.</div>';
    } else {
      html += '<button type="button" class="suggest-all" data-action="apply-search-direct" data-q="' + escapeHtml(query) + '">View all results for “' + escapeHtml(query) + '” <span>Enter ↵</span></button>';
    }
    return html;
  }

  function executeSearch(query, city) {
    const q = String(query || "").trim();
    const selectedCity = String(city || "").trim();
    if (!q && !selectedCity) {
      navigate("#/browse");
      return;
    }
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (selectedCity) params.set("city", selectedCity);
    pendingSearch = true;
    navigate("#/search?" + params.toString());
    window.clearTimeout(searchTimer);
    searchTimer = window.setTimeout(() => {
      pendingSearch = false;
      if (parseHash().path === "/search") render();
    }, 260);
  }

  function navigateSearchFromEntry(entry, input) {
    closeAllSuggestions();
    if (entry.type === "Provider") {
      rememberBack();
      navigate("#/provider/" + entry.providerId);
      return;
    }
    if (entry.type === "City") {
      navigate("#/search?city=" + encodeURIComponent(entry.city));
      return;
    }
    if (entry.type === "Category") {
      navigate("#/category/" + entry.cat);
      return;
    }
    if (entry.type === "Service") {
      const params = new URLSearchParams();
      params.set("q", entry.q || entry.label);
      if (entry.cat) params.set("cat", entry.cat);
      if (entry.sub) params.set("sub", entry.sub);
      pendingSearch = true;
      navigate("#/search?" + params.toString());
      window.clearTimeout(searchTimer);
      searchTimer = window.setTimeout(() => {
        pendingSearch = false;
        if (parseHash().path === "/search") render();
      }, 220);
      return;
    }
    if (entry.type === "Popular") {
      executeSearch(entry.q || entry.label, input ? cityFromInput(input) : "");
    }
  }

  /* ----------------------------------------------------------------------
     4. Toast, modal, header, theme, mobile navigation
     ---------------------------------------------------------------------- */

  function toast(message, type) {
    const stack = document.getElementById("toastStack");
    if (!stack) return;
    const kind = type || "success";
    const symbol = kind === "error" ? "!" : kind === "info" ? "i" : "✓";
    const item = document.createElement("div");
    item.className = "toast-item toast-" + kind;
    item.innerHTML = '<span class="toast-symbol">' + symbol + "</span><span>" + escapeHtml(message) + "</span>";
    stack.appendChild(item);
    window.setTimeout(() => {
      item.classList.add("toast-out");
      window.setTimeout(() => item.remove(), 220);
    }, 3400);
  }

  let modalOnConfirm = null;

  function openModal(html) {
    const root = document.getElementById("modalRoot");
    root.innerHTML = '<div class="modal-backdrop"><div class="modal-card" role="dialog" aria-modal="true">' + html + "</div></div>";
    root.classList.add("show");
    document.body.classList.add("modal-open");
    window.setTimeout(() => {
      const focusable = root.querySelector("input, select, textarea, button");
      if (focusable) focusable.focus();
    }, 30);
  }

  function closeModal() {
    const root = document.getElementById("modalRoot");
    root.classList.remove("show");
    root.innerHTML = "";
    document.body.classList.remove("modal-open");
    modalOnConfirm = null;
  }

  function openConfirm(options) {
    modalOnConfirm = options.onConfirm || null;
    openModal(
      '<div class="modal-head"><h2>' + escapeHtml(options.title || "Are you sure?") + "</h2>" +
        '<button type="button" class="iconbtn" data-action="close-modal" aria-label="Close dialog">' + icon("close") + "</button></div>" +
      '<p class="modal-lead">' + escapeHtml(options.message || "") + "</p>" +
      '<div class="modal-actions">' +
        '<button type="button" class="btn outline" data-action="close-modal">Cancel</button>' +
        '<button type="button" class="btn ' + (options.danger ? "danger" : "primary") + '" data-action="confirm-modal">' + escapeHtml(options.confirmLabel || "Confirm") + "</button>" +
      "</div>"
    );
  }

  function openLogin(tab) {
    openModal(loginModalHtml(tab || "signin"));
  }

  function loginModalHtml(tab) {
    const active = tab === "demo" ? "demo" : "signin";
    return (
      '<div class="modal-head"><div><span class="modal-eyebrow">HARKAAM DEMO</span><h2>Welcome back</h2></div>' +
        '<button type="button" class="iconbtn" data-action="close-modal" aria-label="Close login">' + icon("close") + "</button></div>" +
      '<div class="tabs tabs-sm"><button type="button" class="tab' + (active === "signin" ? " active" : "") + '" data-action="login-tab" data-tab="signin">Sign in</button>' +
        '<button type="button" class="tab' + (active === "demo" ? " active" : "") + '" data-action="login-tab" data-tab="demo">Demo accounts</button></div>' +
      (active === "signin" ? signInPanelHtml() : demoPanelHtml()) +
      '<p class="demo-footnote">' + icon("info", 14) + " Demo authentication only — credentials stay in this browser. Never use a real password.</p>"
    );
  }

  function signInPanelHtml() {
    return (
      '<form id="loginForm" class="stack" novalidate>' +
        '<div class="form-field"><label for="loginId">Mobile number or email</label>' +
          '<input class="field" id="loginId" name="identifier" autocomplete="username" placeholder="0300 1234567 or you@example.com" required>' +
          '<span class="field-error" hidden></span></div>' +
        '<div class="form-field"><label for="loginPassword">Password <small>(demo)</small></label>' +
          '<input class="field" id="loginPassword" name="password" type="password" autocomplete="current-password" placeholder="Your demo password" required>' +
          '<span class="field-error" hidden></span></div>' +
        '<button class="btn primary block" type="submit">Sign in to demo account</button>' +
      "</form>" +
      '<div class="auth-switch">New to HARKAAM? <button type="button" class="link-btn" data-action="go-join-customer">Create a customer account</button> or <button type="button" class="link-btn" data-action="nav-join-provider">join as a provider</button>.</div>'
    );
  }

  function demoPanelHtml() {
    return (
      '<div class="demo-panel">' +
        '<div class="demo-option"><div><strong>Customer demo</strong><p>Explore favorites, bookings and account settings.</p></div>' +
          '<button type="button" class="btn primary small" data-action="demo-customer-login">Continue as customer</button></div>' +
        '<div class="demo-divider"><span>or preview a provider account</span></div>' +
        '<form id="demoProviderForm" novalidate><div class="form-field"><label for="demoProvider">Choose a sample provider</label>' +
          '<select class="field" id="demoProvider" name="providerId">' +
            BASE_PROVIDERS.slice(0, 12).map((provider) =>
              '<option value="' + provider.id + '">' + escapeHtml(provider.name) + " — " + escapeHtml(provider.skill) + " (" + escapeHtml(provider.city) + ")</option>"
            ).join("") +
          "</select></div>" +
          '<button class="btn outline block" type="submit">Open provider dashboard</button></form>' +
      "</div>"
    );
  }

  function updateHeader() {
    const session = getSession();
    const auth = document.getElementById("authActions");
    const mobileAuth = document.getElementById("mobileAuth");
    const favBadge = document.getElementById("favBadge");
    const favorites = getFavorites();
    if (favBadge) {
      favBadge.textContent = String(favorites.length);
      favBadge.hidden = favorites.length === 0;
    }
    if (auth) {
      if (session) {
        auth.innerHTML =
          '<span class="user-greeting" title="' + escapeHtml(session.name || "") + '">' + icon("user", 15) + " " + escapeHtml(firstName(session.name)) + "</span>" +
          '<a class="btn primary small" href="#/dashboard/' + (session.role === "provider" ? "provider" : "customer") + '">Dashboard</a>' +
          '<button type="button" class="iconbtn" data-action="logout" title="Log out" aria-label="Log out">' + icon("logout") + "</button>";
      } else {
        auth.innerHTML =
          '<button type="button" class="btn outline small" data-action="open-login">Log in</button>' +
          '<a class="btn primary small" href="#/join/provider" data-action="nav-join-provider">Join as provider</a>';
      }
    }
    if (mobileAuth) {
      if (session) {
        mobileAuth.innerHTML =
          '<div class="mobile-user">' + icon("user", 16) + " " + escapeHtml(session.name || "Demo user") + "</div>" +
          '<a class="btn primary block" href="#/dashboard/' + (session.role === "provider" ? "provider" : "customer") + '">Go to dashboard</a>' +
          '<button type="button" class="btn outline block" data-action="logout">Log out</button>';
      } else {
        mobileAuth.innerHTML =
          '<button type="button" class="btn primary block" data-action="open-login">Log in</button>' +
          '<a class="btn outline block" href="#/join/provider" data-action="nav-join-provider">Join as provider</a>' +
          '<a class="btn ghost block" href="#/join/customer" data-action="nav-join-customer">Create customer account</a>';
      }
    }

    document.querySelectorAll(".nav-link").forEach((link) => {
      link.classList.remove("active");
      const nav = link.dataset.nav;
      const path = parseHash().path;
      if (nav === "home" && path === "/") link.classList.add("active");
      if (nav === "browse" && (path === "/browse" || path.indexOf("/category/") === 0 || path === "/search")) link.classList.add("active");
    });
  }

  function applyTheme(theme) {
    const dark = theme === "dark";
    document.body.classList.toggle("dark", dark);
    const button = document.getElementById("themeBtn");
    if (button) button.textContent = dark ? "☀" : "☾";
  }

  function toggleTheme() {
    const dark = !document.body.classList.contains("dark");
    applyTheme(dark ? "dark" : "light");
    storeSet(KEYS.theme, dark ? "dark" : "light");
  }

  function openMobileMenu() {
    const menu = document.getElementById("mobileMenu");
    const backdrop = document.getElementById("mobileBackdrop");
    menu.classList.add("open");
    backdrop.hidden = false;
    menu.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    const btn = document.querySelector(".menu-btn");
    if (btn) btn.setAttribute("aria-expanded", "true");
  }

  function closeMobileMenu() {
    const menu = document.getElementById("mobileMenu");
    const backdrop = document.getElementById("mobileBackdrop");
    menu.classList.remove("open");
    backdrop.hidden = true;
    menu.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    const btn = document.querySelector(".menu-btn");
    if (btn) btn.setAttribute("aria-expanded", "false");
  }

  function toggleMobileMenu() {
    const menu = document.getElementById("mobileMenu");
    if (menu.classList.contains("open")) closeMobileMenu();
    else openMobileMenu();
  }

  function closeAllSuggestions() {
    document.querySelectorAll(".suggestions").forEach((dropdown) => {
      dropdown.hidden = true;
      dropdown.innerHTML = "";
    });
    document.querySelectorAll(".search-input").forEach((input) => input.setAttribute("aria-expanded", "false"));
  }

  /* ----------------------------------------------------------------------
     5. Routing helpers
     ---------------------------------------------------------------------- */

  let pendingSearch = false;
  let searchTimer = null;
  let skipScroll = false;
  let pendingSection = "";
  let lastFilterScroll = 0;

  function parseHash() {
    const raw = location.hash.replace(/^#/, "") || "/";
    const parts = raw.split("?");
    return {
      path: parts[0] || "/",
      params: new URLSearchParams(parts.slice(1).join("?") || "")
    };
  }

  function navigate(hash) {
    if (location.hash === hash) {
      render();
    } else {
      location.hash = hash;
    }
  }

  function rememberBack() {
    const route = parseHash();
    if (["/search", "/browse"].indexOf(route.path) !== -1 || route.path.indexOf("/category/") === 0) {
      sessionStorage.setItem(KEYS.back, location.hash);
    }
  }

  function backUrl() {
    return sessionStorage.getItem(KEYS.back) || "#/browse";
  }

  function hashWithParams(path, params) {
    const query = params.toString();
    return "#" + path + (query ? "?" + query : "");
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise((resolve, reject) => {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        textarea.remove();
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  async function shareProfile(id) {
    const provider = getProvider(id);
    if (!provider) return;
    const base = location.href.split("#")[0];
    const url = base + "#/provider/" + provider.id;
    if (navigator.share) {
      try {
        await navigator.share({
          title: provider.name + " on HARKAAM",
          text: provider.skill + " in " + provider.city + " — view the sample profile on HARKAAM.",
          url
        });
        return;
      } catch (error) {
        if (error && error.name === "AbortError") return;
      }
    }
    try {
      await copyText(url);
      toast("Profile link copied to clipboard.", "success");
    } catch (error) {
      window.prompt("Copy this profile link:", url);
    }
  }

  /* ----------------------------------------------------------------------
     6. Search bar binding
     ---------------------------------------------------------------------- */

  const searchBindings = new WeakMap();

  function cityFromInput(input) {
    const root = input.closest("[data-search-root]");
    const select = root ? root.querySelector(".search-city") : null;
    return select ? select.value : "";
  }

  /* Optional approximate geolocation. We only map the browser's coordinates to
     the nearest supported demo city. No radius, distance filter or real
     "providers near you" claim is made anywhere in the UI. */
  const CITY_COORDS = {
    Karachi: [24.8607, 67.0011],
    Lahore: [31.5204, 74.3587],
    Islamabad: [33.6844, 73.0479],
    Rawalpindi: [33.5651, 73.0169],
    Hyderabad: [25.396, 68.3578],
    Faisalabad: [31.4187, 73.0791],
    Multan: [30.1575, 71.5249],
    Peshawar: [34.0151, 71.5249],
    Quetta: [30.1798, 66.975]
  };

  function nearestDemoCity(latitude, longitude) {
    let best = "";
    let bestDistance = Infinity;
    Object.keys(CITY_COORDS).forEach((city) => {
      const coords = CITY_COORDS[city];
      const toRad = function (value) { return (value * Math.PI) / 180; };
      const dLat = toRad(coords[0] - latitude);
      const dLng = toRad(coords[1] - longitude);
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(latitude)) * Math.cos(toRad(coords[0])) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const distance = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      if (distance < bestDistance) {
        bestDistance = distance;
        best = city;
      }
    });
    return best;
  }

  function useApproximateLocation(inputId) {
    const input = document.getElementById(inputId);
    const root = input ? input.closest("[data-search-root]") : null;
    const select = root ? root.querySelector(".search-city") : null;

    function fallback(message) {
      toast(message, "info");
      if (select) {
        select.focus();
        select.classList.add("needs-city");
        window.setTimeout(() => select.classList.remove("needs-city"), 1800);
      }
    }

    if (!navigator.geolocation) {
      fallback("Location is not supported by this browser. Please choose a city manually.");
      return;
    }

    toast("Requesting your approximate location…", "info");
    navigator.geolocation.getCurrentPosition(
      function (position) {
        const city = nearestDemoCity(position.coords.latitude, position.coords.longitude);
        if (!city) {
          fallback("We couldn't match your location to a supported demo city. Please choose a city manually.");
          return;
        }
        if (select) select.value = city;
        toast("Approximate city set to " + city + ". You can change it from the city list.", "success");
        executeSearch(input ? input.value : "", city);
      },
      function () {
        fallback("Location permission was denied or unavailable. Please choose a city manually.");
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 }
    );
  }

  function bindSearchBar(input) {
    if (!input || searchBindings.has(input)) return;
    searchBindings.set(input, true);
    const root = input.closest("[data-search-root]");
    const dropdown = root ? root.querySelector(".suggestions") : null;
    const clear = root ? root.querySelector(".clear-search") : null;
    let activeIndex = -1;
    let visibleEntries = [];

    function updateClearButton() {
      if (clear) clear.hidden = !input.value;
    }

    function show() {
      if (!dropdown) return;
      visibleEntries = getSuggestions(input.value, 8);
      dropdown.innerHTML = suggestionsHtml(input.value, visibleEntries);
      dropdown.hidden = false;
      input.setAttribute("aria-expanded", "true");
      activeIndex = -1;
      updateClearButton();
    }

    function hide() {
      if (!dropdown) return;
      dropdown.hidden = true;
      input.setAttribute("aria-expanded", "false");
      activeIndex = -1;
    }

    function setActive(index) {
      if (!dropdown) return;
      const items = dropdown.querySelectorAll(".suggest-item");
      if (!items.length) return;
      activeIndex = (index + items.length) % items.length;
      items.forEach((item, itemIndex) => item.classList.toggle("active", itemIndex === activeIndex));
      items[activeIndex].scrollIntoView({ block: "nearest" });
    }

    input.addEventListener("input", () => {
      updateClearButton();
      show();
    });

    input.addEventListener("focus", () => {
      if (input.value.trim().length || !input.value) show();
    });

    input.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        if (!dropdown || dropdown.hidden) show();
        setActive(activeIndex + 1);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        if (!dropdown || dropdown.hidden) show();
        setActive(activeIndex - 1);
      } else if (event.key === "Enter") {
        event.preventDefault();
        if (!dropdown || dropdown.hidden) {
          if (activeIndex > -1 && visibleEntries[activeIndex]) {
            navigateSearchFromEntry(visibleEntries[activeIndex], input);
          } else {
            executeSearch(input.value, cityFromInput(input));
          }
          return;
        }
        const option = dropdown.querySelectorAll(".suggest-item")[activeIndex];
        if (option) option.click();
        else if (input.value.trim()) executeSearch(input.value, cityFromInput(input));
        else if (dropdown.querySelector(".suggest-item")) dropdown.querySelector(".suggest-item").click();
      } else if (event.key === "Escape") {
        event.preventDefault();
        hide();
      }
    });

    if (clear) {
      clear.addEventListener("click", () => {
        input.value = "";
        updateClearButton();
        show();
        input.focus();
      });
    }

    input.addEventListener("blur", () => {
      window.setTimeout(() => {
        if (dropdown && !dropdown.contains(document.activeElement) && document.activeElement !== input) hide();
      }, 130);
    });

    if (dropdown) {
      dropdown.addEventListener("mousedown", (event) => {
        if (event.target.closest(".suggest-item, .suggest-all")) event.preventDefault();
      });
    }

    updateClearButton();
  }

  function bindSearchBars() {
    document.querySelectorAll(".search-input").forEach(bindSearchBar);
  }

  function selectSuggestion(button) {
    const root = button.closest("[data-search-root]");
    const input = root ? root.querySelector(".search-input") : null;
    const entry = {
      type: button.dataset.suggestType,
      label: button.dataset.label,
      providerId: button.dataset.provider,
      cat: button.dataset.cat,
      sub: button.dataset.sub,
      city: button.dataset.city,
      q: button.dataset.q
    };
    navigateSearchFromEntry(entry, input);
  }

  /* ----------------------------------------------------------------------
     7. Shared renderers: provider cards, filters, empty states
     ---------------------------------------------------------------------- */

  function providerCardHtml(provider, options) {
    const opts = options || {};
    const favorite = isFavorite(provider.id);
    const price = startingPrice(provider);
    const ratingHtml = provider.rating
      ? '<span class="rating-inline">' + icon("starFilled", 14) + "<strong>" + Number(provider.rating).toFixed(1) + "</strong><span>(" + provider.reviews + ")</span></span>"
      : '<span class="new-badge">New profile</span>';
    return (
      '<article class="provider-card">' +
        '<div class="provider-card-top">' +
          '<div class="provider-avatar">' + escapeHtml(provider.icon) + "</div>" +
          '<div class="provider-title">' +
            '<div class="provider-name-row"><h3>' + escapeHtml(provider.name) + "</h3>" +
              (provider.verified ? '<span class="verified-dot" title="Sample verification only">' + icon("check", 11) + "</span>" : "") +
            "</div>" +
            '<p class="provider-role">' + escapeHtml(provider.skill) + "</p>" +
            '<div class="provider-rating">' + starsSvg(provider.rating) + ratingHtml + "</div>" +
          "</div>" +
          '<button type="button" class="heart-btn' + (favorite ? " active" : "") + '" data-action="toggle-favorite" data-id="' + provider.id + '" aria-label="' + (favorite ? "Remove from favorites" : "Save provider") + '" title="' + (favorite ? "Remove from favorites" : "Save provider") + '">' +
            icon("heart", 17) + "</button>" +
        "</div>" +
        '<div class="provider-meta">' +
          '<span>' + icon("location", 14) + escapeHtml(provider.area) + ", " + escapeHtml(provider.city) + "</span>" +
          '<span>' + icon("briefcase", 14) + (provider.exp ? provider.exp + " yrs experience" : "New provider") + "</span>" +
        "</div>" +
        '<p class="provider-desc">' + escapeHtml(provider.desc) + "</p>" +
        '<div class="provider-tags">' +
          '<span class="tag-soft">' + escapeHtml(subcategoryName(provider)) + "</span>" +
          (provider.pending ? '<span class="tag-warn">Pending verification</span>' : '<span class="tag-available">' + icon("check", 11) + escapeHtml(provider.availability) + "</span>") +
        "</div>" +
        '<div class="provider-card-foot">' +
          '<div class="provider-price"><span>From</span><strong>' + formatPrice(price) + "</strong></div>" +
          '<div class="provider-buttons">' +
            '<button type="button" class="btn outline small" data-action="view-provider" data-id="' + provider.id + '">View details</button>' +
            '<button type="button" class="btn primary small" data-action="book-provider" data-id="' + provider.id + '">Request booking</button>' +
          "</div>" +
        "</div>" +
      "</article>"
    );
  }

  function starsSvg(rating) {
    const rounded = Math.round(Number(rating) || 0);
    let out = '<span class="mini-stars" aria-hidden="true">';
    for (let i = 1; i <= 5; i += 1) out += '<span class="' + (i <= rounded ? "filled" : "") + '">★</span>';
    return out + "</span>";
  }

  function providerGridHtml(list, emptyOptions) {
    if (!list.length) return emptyStateHtml(emptyOptions || {});
    return list.map((provider) => providerCardHtml(provider)).join("");
  }

  function emptyStateHtml(options) {
    const opts = options || {};
    return (
      '<div class="empty-state">' +
        '<div class="empty-icon">' + (opts.icon || "🔎") + "</div>" +
        "<h3>" + escapeHtml(opts.title || "No providers match your filters") + "</h3>" +
        '<p>' + escapeHtml(opts.message || "Try a different city, category or price range. New sample providers are added under every category.") + "</p>" +
        '<div class="empty-actions">' +
          (opts.clear !== false ? '<button type="button" class="btn primary small" data-action="clear-filters">Clear filters</button>' : "") +
          '<a class="btn outline small" href="#/browse" data-action="nav-browse">Browse all services</a>' +
        "</div>" +
      "</div>"
    );
  }

  function filterSelectsHtml(params, options) {
    const opts = options || {};
    const city = params.get("city") || "";
    const price = params.get("price") || "";
    const rating = params.get("rating") || "0";
    const sort = params.get("sort") || "recommended";
    return (
      '<div class="filter-bar">' +
        '<div class="filter-label">' + icon("filter", 16) + " Filters</div>" +
        '<select class="field select-sm" id="cityFilter" aria-label="Filter by city">' +
          '<option value="">All cities</option>' +
          CITIES.map((item) => '<option value="' + escapeHtml(item) + '"' + (city === item ? " selected" : "") + ">" + escapeHtml(item) + "</option>").join("") +
        "</select>" +
        '<select class="field select-sm" id="priceFilter" aria-label="Filter by starting price">' +
          '<option value="">Any price</option>' +
          '<option value="0-1500"' + (price === "0-1500" ? " selected" : "") + ">Up to PKR 1,500</option>" +
          '<option value="1500-3000"' + (price === "1500-3000" ? " selected" : "") + ">PKR 1,500 – 3,000</option>" +
          '<option value="3000-6000"' + (price === "3000-6000" ? " selected" : "") + ">PKR 3,000 – 6,000</option>" +
          '<option value="6000-999999"' + (price === "6000-999999" ? " selected" : "") + ">PKR 6,000+</option>" +
        "</select>" +
        '<select class="field select-sm" id="ratingFilter" aria-label="Filter by rating">' +
          '<option value="0"' + (rating === "0" ? " selected" : "") + ">Any rating</option>" +
          '<option value="4.5"' + (rating === "4.5" ? " selected" : "") + ">4.5+ rating</option>" +
          '<option value="4.8"' + (rating === "4.8" ? " selected" : "") + ">4.8+ rating</option>" +
        "</select>" +
        '<select class="field select-sm" id="sortFilter" aria-label="Sort providers">' +
          '<option value="recommended"' + (sort === "recommended" ? " selected" : "") + ">Recommended</option>" +
          '<option value="rating"' + (sort === "rating" ? " selected" : "") + ">Highest rated</option>" +
          '<option value="price"' + (sort === "price" ? " selected" : "") + ">Lowest price</option>" +
          '<option value="experience"' + (sort === "experience" ? " selected" : "") + ">Most experienced</option>" +
        "</select>" +
        '<button type="button" class="btn ghost small filter-clear" data-action="clear-filters">Clear</button>' +
        (opts.countLabel ? '<span class="filter-count">' + escapeHtml(opts.countLabel) + "</span>" : "") +
      "</div>"
    );
  }

  function priceInRange(price, range) {
    if (!range) return true;
    const parts = range.split("-").map(Number);
    return price >= parts[0] && price <= parts[1];
  }

  function filterProviderList(list, options) {
    const opts = options || {};
    const tokens = tokenize(opts.q || "");
    return list.filter((provider) => {
      if (opts.cat && provider.cat !== opts.cat) return false;
      if (opts.sub && provider.sub !== opts.sub) return false;
      if (opts.city && provider.city !== opts.city) return false;
      if (opts.price && !priceInRange(startingPrice(provider), opts.price)) return false;
      if (opts.rating && Number(provider.rating) < Number(opts.rating)) return false;
      if (tokens.length) {
        const haystack = providerHaystack(provider);
        if (!tokens.every((token) => haystack.indexOf(token) !== -1)) return false;
      }
      return true;
    });
  }

  function sortProviderList(list, sort) {
    const copy = list.slice();
    if (sort === "rating") return copy.sort((a, b) => (b.rating || 0) - (a.rating || 0) || (b.reviews || 0) - (a.reviews || 0));
    if (sort === "price") return copy.sort((a, b) => startingPrice(a) - startingPrice(b));
    if (sort === "experience") return copy.sort((a, b) => (b.exp || 0) - (a.exp || 0));
    return recommendedSort(copy);
  }

  const filterOptions = {
    q: (params) => params.get("q") || "",
    city: (params) => params.get("city") || "",
    price: (params) => params.get("price") || "",
    rating: (params) => params.get("rating") || "0",
    sort: (params) => params.get("sort") || "recommended"
  };

  function currentFilterState(params) {
    return {
      q: filterOptions.q(params),
      city: filterOptions.city(params),
      price: filterOptions.price(params),
      rating: filterOptions.rating(params),
      sort: filterOptions.sort(params)
    };
  }

  /* Expose a few helpers for debugging in the browser console (demo only). */
  window.HARKAAM = {
    data: DATA,
    getProviders: getAllProviders,
    getBookings,
    getFavorites,
    clearDemoData: clearDemoData
  };

  /* ----------------------------------------------------------------------
     8. VIEW TEMPLATES
     ---------------------------------------------------------------------- */

  function searchBarHtml(prefix, options) {
    const opts = options || {};
    return (
      '<div class="search-wrap' + (opts.hero ? " search-hero" : "") + '" data-search-root>' +
        '<div class="search-box">' +
          '<span class="search-icon">' + icon("search", 20) + "</span>" +
          '<input class="search-input" id="' + prefix + 'Search" type="text" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="' + prefix + 'Suggestions" autocomplete="off" placeholder="' + escapeHtml(opts.placeholder || "Search services, providers or cities…") + '" value="' + escapeHtml(opts.value || "") + '">' +
          '<button type="button" class="clear-search" aria-label="Clear search" hidden>' + icon("close", 15) + "</button>" +
          '<span class="search-sep"></span>' +
          '<select class="search-city" aria-label="Choose city"><option value="">All cities</option>' +
            CITIES.map((city) => '<option value="' + escapeHtml(city) + '"' + (opts.city === city ? " selected" : "") + ">" + escapeHtml(city) + "</option>").join("") +
          "</select>" +
          '<button type="button" class="btn primary search-go" data-action="apply-search" data-input="' + prefix + 'Search">' + icon("search", 16) + '<span>Search</span></button>' +
        "</div>" +
        '<div class="suggestions" id="' + prefix + 'Suggestions" role="listbox" hidden></div>' +
        '<div class="search-extras">' +
          '<button type="button" class="geo-btn" data-action="use-location" data-input="' + prefix + 'Search">' + icon("location", 14) + " Use my location</button>" +
          '<span class="geo-note">Approximate city only · no distance or radius is calculated</span>' +
        "</div>" +
      "</div>"
    );
  }

  function pageIntroHtml(eyebrow, title, lead) {
    return '<div class="page-intro"><span class="eyebrow">' + escapeHtml(eyebrow) + "</span><h1>" + title + "</h1>" +
      (lead ? '<p class="lead">' + escapeHtml(lead) + "</p>" : "") + "</div>";
  }

  function breadcrumbHtml(items) {
    const userRole = sessionStorage.getItem(KEYS.userRole) || "";
    const roleLabel = userRole === "provider" ? "Service Provider" : userRole === "seeker" ? "Service Seeker" : "";
    const roleHash = userRole === "provider" ? "#/dashboard/provider" : "#/browse";

    const fullItems = [];
    let hasRoleCrumb = false;
    items.forEach((item) => {
      if (item.label === "Service Provider" || item.label === "Service Seeker") {
        hasRoleCrumb = true;
      }
    });

    items.forEach((item) => {
      fullItems.push(item);
      if (item.label === "Home" && roleLabel && !hasRoleCrumb) {
        fullItems.push({ label: roleLabel, hash: roleHash });
        hasRoleCrumb = true;
      }
    });

    return '<nav class="breadcrumb" aria-label="Breadcrumb">' + fullItems.map((item, index) => {
      const label = escapeHtml(item.label);
      const isLast = index === fullItems.length - 1;
      const isHome = item.label === "Home";
      if (isLast) return '<span aria-current="page">' + label + "</span>";
      if (isHome) {
        return '<a href="#/" data-action="reset-role" class="crumb-home" title="Return to Landing Page">' + icon("home", 12) + " " + label + "</a>";
      }
      if (item.hash) return '<a href="' + item.hash + '"' + (item.action ? ' data-action="' + item.action + '"' : "") + (item.attrs ? " " + item.attrs : "") + ">" + label + "</a>";
      return "<span>" + label + "</span>";
    }).join('<span class="crumb-sep">/</span>') + "</nav>";
  }

  // -- Landing Page (Role Selection) ---------------------------------------
  function landingView() {
    const totalProviders = getAllProviders().length;
    return (
      '<section class="landing-page">' +
        '<div class="landing-content">' +
          '<span class="landing-badge">' + icon("shield", 14) + " PAKISTAN'S LOCAL SERVICE MARKETPLACE · DEMO</span>" +
          '<h1 class="landing-title">What brings you here today?</h1>' +
          '<p class="landing-subtitle">Welcome to HARKAAM. Whether you are looking for trusted local help or ready to offer your professional skills, choose your path below to begin.</p>' +
          '<div class="landing-cards">' +
            '<div class="landing-card landing-card-provider">' +
              '<div class="landing-card-icon">' + icon("briefcase", 34) + '</div>' +
              '<h2>SERVICE PROVIDER</h2>' +
              '<p class="landing-card-desc">Offer your services, showcase your skills, and connect with customers who need your expertise.</p>' +
              '<div class="landing-card-features">' +
                '<span class="landing-card-feature">' + icon("check", 12) + " Create & edit provider profile</span>" +
                '<span class="landing-card-feature">' + icon("check", 12) + " Manage incoming service requests</span>" +
                '<span class="landing-card-feature">' + icon("check", 12) + " Accept requests or make counteroffers</span>" +
              '</div>' +
              '<button type="button" class="btn primary" data-action="select-provider-role">' + icon("briefcase", 16) + ' Continue as Provider</button>' +
            '</div>' +
            '<div class="landing-card landing-card-seeker">' +
              '<div class="landing-card-icon">' + icon("search", 34) + '</div>' +
              '<h2>SERVICE SEEKER</h2>' +
              '<p class="landing-card-desc">Discover skilled professionals, compare services, and find the right person for your needs.</p>' +
              '<div class="landing-card-features">' +
                '<span class="landing-card-feature">' + icon("check", 12) + " Browse 6 verified service categories</span>" +
                '<span class="landing-card-feature">' + icon("check", 12) + " Compare prices, ratings & reviews</span>" +
                '<span class="landing-card-feature">' + icon("check", 12) + " Submit requests & negotiate counteroffers</span>" +
              '</div>' +
              '<button type="button" class="btn primary" data-action="select-seeker-role">' + icon("search", 16) + ' Find a Service</button>' +
            '</div>' +
          '</div>' +
          '<div class="landing-footer">' +
            '<span>Already know what you need?</span>' +
            '<a class="landing-footer-btn" href="#/browse" data-action="nav-browse">' + icon("search", 14) + " Explore all services " + icon("arrowRight", 14) + "</a>" +
          '</div>' +
          '<div class="landing-stats">' +
            '<div class="landing-stat"><strong>' + totalProviders + '</strong><span>Demo Providers</span></div>' +
            '<div class="landing-stat"><strong>' + CATEGORIES.length + '</strong><span>Categories</span></div>' +
            '<div class="landing-stat"><strong>' + CITIES.length + '</strong><span>Cities</span></div>' +
            '<div class="landing-stat"><strong>30+</strong><span>Specialized Services</span></div>' +
          '</div>' +
        '</div>' +
      '</section>'
    );
  }

  // -- Provider Home --------------------------------------------------------
  function providerHomeView() {
    const session = getSession();
    const featured = recommendedSort(getAllProviders().filter((provider) => provider.verified)).slice(0, 6);
    return (
      '<section class="hero">' +
        '<div class="hero-orb hero-orb-one" aria-hidden="true"></div>' +
        '<div class="hero-orb hero-orb-two" aria-hidden="true"></div>' +
        '<div class="wrap hero-inner">' +
          '<span class="hero-eyebrow">' + icon("briefcase", 14) + ' FOR SERVICE PROVIDERS · DEMO</span>' +
          '<h1>Show customers <span class="hero-gradient">what you can do.</span></h1>' +
          '<p class="hero-lead">Create a sample provider profile, preview your dashboard, and see how HARKAAM helps you manage requests, pricing, and counteroffers.</p>' +
          '<div class="hero-stats">' +
            '<div><strong>' + getAllProviders().length + '</strong><span>sample providers</span></div>' +
            '<div><strong>' + CATEGORIES.length + '</strong><span>service categories</span></div>' +
            '<div><strong>' + CITIES.length + '</strong><span>Pakistani cities</span></div>' +
            '<div><strong>100%</strong><span>frontend demo</span></div>' +
          '</div>' +
        '</div>' +
      '</section>' +
      '<section class="wrap role-section">' +
        '<div class="role-card role-card-alt">' +
          '<div class="role-icon">' + icon("briefcase", 22) + "</div>" +
          '<div class="role-copy"><h2>' + (session && session.role === "provider" ? "Welcome back to your dashboard" : "Create your provider profile") + '</h2><p>' + (session && session.role === "provider" ? "Manage your bookings, services, availability and profile from one place." : "Tell customers what you do, where you work and what you charge.") + '</p></div>' +
          (session && session.role === "provider"
            ? '<a class="btn primary" href="#/dashboard/provider">Go to dashboard ' + icon("arrowRight", 16) + "</a>"
            : '<a class="btn primary" href="#/join/provider" data-action="nav-join-provider">Join as provider ' + icon("arrowRight", 16) + "</a>") +
        '</div>' +
        '<div class="role-card">' +
          '<div class="role-icon">' + icon("search", 22) + "</div>" +
          '<div class="role-copy"><h2>Looking for a service?</h2><p>Browse categories, compare sample profiles and send a demo booking request in minutes.</p></div>' +
          '<a class="btn outline" href="#/browse" data-action="nav-browse">Explore services ' + icon("arrowRight", 16) + "</a>" +
        '</div>' +
      '</section>' +
      '<section class="wrap section" id="categories">' +
        '<div class="section-head"><div><span class="eyebrow">BROWSE BY CATEGORY</span><h2>What do you need help with?</h2>' +
        '<p class="section-sub">Every category includes sample services and providers you can explore.</p></div>' +
        '<a class="text-link" href="#/browse" data-action="nav-browse">View all services ' + icon("arrowRight", 15) + "</a></div>" +
        '<div class="category-grid">' + CATEGORIES.map((cat) => categoryCardHtml(cat)).join("") + "</div>" +
      '</section>' +
      '<section class="wrap section featured-section">' +
        '<div class="section-head"><div><span class="eyebrow">FEATURED SAMPLE PROFILES</span><h2>Trusted professionals, ready to help</h2>' +
        '<p class="section-sub">Ratings, reviews and verification badges in this prototype are sample data.</p></div>' +
        '<a class="text-link" href="#/browse" data-action="nav-browse">Browse all providers ' + icon("arrowRight", 15) + "</a></div>" +
        '<div class="provider-grid">' + featured.map((provider) => providerCardHtml(provider)).join("") + "</div>" +
      '</section>' +
      '<section class="wrap section"><div class="cta-band"><div><span class="eyebrow eyebrow-light">FOR LOCAL PROFESSIONALS</span><h2>Show customers what you can do.</h2>' +
        '<p>Create a sample provider profile, preview your dashboard and see how HARKAAM could work for your skills.</p></div>' +
        '<a class="btn light" href="#/join/provider" data-action="nav-join-provider">Join as a provider ' + icon("arrowRight", 16) + "</a></div></section>"
    );
  }

  // -- Home -----------------------------------------------------------------
  function homeView() {
    const userRole = sessionStorage.getItem(KEYS.userRole) || "";
    if (!userRole) return landingView();
    if (userRole === "provider") return providerHomeView();
    const featured = recommendedSort(getAllProviders().filter((provider) => provider.verified)).slice(0, 6);
    return (
      '<section class="hero">' +
        '<div class="hero-orb hero-orb-one" aria-hidden="true"></div>' +
        '<div class="hero-orb hero-orb-two" aria-hidden="true"></div>' +
        '<div class="wrap hero-inner">' +
          '<span class="hero-eyebrow">' + icon("shield", 14) + " PAKISTAN'S LOCAL SERVICE MARKETPLACE · DEMO</span>" +
          '<h1>Find trusted local help.<br><span class="hero-gradient">Get more done.</span></h1>' +
          '<p class="hero-lead">Search ' + getAllProviders().length + '+ sample professionals across ' + CATEGORIES.length + ' categories — from AC repair and tutoring to plumbing, electrical and carpentry services.</p>' +
          searchBarHtml("hero", { hero: true, placeholder: "Try “AC repair”, “math tutor” or “Karachi plumber”…" }) +
          '<div class="popular-row"><span>Popular:</span>' +
            POPULAR_SEARCHES.map((term) => '<button type="button" class="popular-chip" data-action="use-popular" data-q="' + escapeHtml(term) + '">' + escapeHtml(term) + "</button>").join("") +
          "</div>" +
          '<div class="hero-stats">' +
            '<div><strong>' + getAllProviders().length + '</strong><span>sample providers</span></div>' +
            '<div><strong>' + CATEGORIES.length + '</strong><span>service categories</span></div>' +
            '<div><strong>' + CITIES.length + '</strong><span>Pakistani cities</span></div>' +
            '<div><strong>100%</strong><span>frontend demo</span></div>' +
          '</div>' +
        '</div>' +
      "</section>" +

      '<section class="wrap role-section">' +
        '<div class="role-card">' +
          '<div class="role-icon">' + icon("search", 22) + "</div>" +
          '<div class="role-copy"><h2>I need a service</h2><p>Browse categories, compare sample profiles and send a demo booking request in minutes.</p></div>' +
          '<a class="btn primary" href="#/browse" data-action="nav-browse">Explore services ' + icon("arrowRight", 16) + "</a>" +
        "</div>" +
        '<div class="role-card role-card-alt">' +
          '<div class="role-icon">' + icon("briefcase", 22) + "</div>" +
          '<div class="role-copy"><h2>I want to provide a service</h2><p>Create a sample provider profile and preview the provider dashboard experience.</p></div>' +
          '<a class="btn outline" href="#/join/provider" data-action="nav-join-provider">Join as provider ' + icon("arrowRight", 16) + "</a>" +
        "</div>" +
      "</section>" +

      '<section class="wrap section" id="categories">' +
        '<div class="section-head"><div><span class="eyebrow">BROWSE BY CATEGORY</span><h2>What do you need help with?</h2>' +
        '<p class="section-sub">Every category includes sample services and providers you can explore.</p></div>' +
        '<a class="text-link" href="#/browse" data-action="nav-browse">View all services ' + icon("arrowRight", 15) + "</a></div>" +
        '<div class="category-grid">' + CATEGORIES.map((cat) => categoryCardHtml(cat)).join("") + "</div>" +
      "</section>" +

      '<section class="wrap section featured-section">' +
        '<div class="section-head"><div><span class="eyebrow">FEATURED SAMPLE PROFILES</span><h2>Trusted professionals, ready to help</h2>' +
        '<p class="section-sub">Ratings, reviews and verification badges in this prototype are sample data.</p></div>' +
        '<a class="text-link" href="#/browse" data-action="nav-browse">Browse all providers ' + icon("arrowRight", 15) + "</a></div>" +
        '<div class="provider-grid">' + featured.map((provider) => providerCardHtml(provider)).join("") + "</div>" +
      "</section>" +

      '<section class="wrap section">' +
        '<div class="how-panel" id="how">' +
          '<div class="how-head"><span class="eyebrow eyebrow-light">SIMPLE BY DESIGN</span><h2>How HARKAAM works</h2>' +
          '<p>Three clear steps from “I need help” to a saved demo booking request.</p></div>' +
          '<div class="how-grid">' +
            '<div class="how-step"><span class="step-number">01</span><div class="step-icon">🔎</div><h3>Find a service</h3><p>Search by skill, category, provider or city. Live suggestions help you narrow it down from the first letter.</p></div>' +
            '<div class="how-step"><span class="step-number">02</span><div class="step-icon">🤝</div><h3>Compare & connect</h3><p>Open detailed sample profiles, compare experience and pricing, then save favorites or request a booking.</p></div>' +
            '<div class="how-step"><span class="step-number">03</span><div class="step-icon">📋</div><h3>Track the request</h3><p>Get a demo booking ID and follow the request status from your customer dashboard. No provider is actually contacted.</p></div>' +
          "</div>" +
          '<div class="how-note">' + icon("info", 15) + " This is a frontend prototype. Bookings, accounts and provider profiles are stored only in your browser.</div>" +
        "</div>" +
      "</section>" +

      '<section class="wrap section about-section" id="about">' +
        '<div class="about-copy"><span class="eyebrow">ABOUT HARKAAM</span><h2>Local skills deserve a better marketplace.</h2>' +
          '<p>HARKAAM is a service marketplace concept built for Pakistan. This prototype demonstrates how customers can discover services and how providers can present their skills — with a clear, professional experience.</p>' +
          '<ul class="check-list">' +
            '<li>' + icon("check", 15) + ' 6 core categories with specialized subcategories and sample services</li>' +
            '<li>' + icon("check", 15) + ' Live search across services, providers, skills and cities</li>' +
            '<li>' + icon("check", 15) + ' Detailed profiles, favorites and local demo booking records</li>' +
            '<li>' + icon("check", 15) + ' Separate customer and provider dashboards</li>' +
          "</ul>" +
          '<div class="about-actions"><a class="btn outline" href="#/join/customer" data-action="nav-join-customer">Create customer account</a>' +
          '<a class="btn primary" href="#/browse" data-action="nav-browse">Explore the marketplace</a></div>' +
        "</div>" +
        '<div class="about-panel"><div class="about-badge">' + icon("shield", 20) + " Demo transparency</div>" +
          '<h3>What is real — and what is not</h3>' +
          '<div class="truth-row"><span class="truth-dot on"></span><div><strong>Working frontend</strong><p>Search, filters, profiles, favorites, forms, dashboards and localStorage persistence.</p></div></div>' +
          '<div class="truth-row"><span class="truth-dot off"></span><div><strong>Not connected</strong><p>No real provider contact, identity verification, payments, messages or secure authentication.</p></div></div>' +
          '<div class="truth-row"><span class="truth-dot off"></span><div><strong>No CNIC collection</strong><p>CNIC verification is intentionally left for a secure backend implementation.</p></div></div>' +
          '<p class="about-foot">Sample data is used throughout this prototype.</p>' +
        "</div>" +
      "</section>" +

      '<section class="wrap section"><div class="cta-band"><div><span class="eyebrow eyebrow-light">FOR LOCAL PROFESSIONALS</span><h2>Show customers what you can do.</h2>' +
        '<p>Create a sample provider profile, preview your dashboard and see how HARKAAM could work for your skills.</p></div>' +
        '<a class="btn light" href="#/join/provider" data-action="nav-join-provider">Join as a provider ' + icon("arrowRight", 16) + "</a></div></section>"
    );
  }

  function categoryCardHtml(cat) {
    const count = countProvidersInCategory(cat.id);
    return (
      '<button type="button" class="category-card" data-action="open-category" data-cat="' + cat.id + '">' +
        '<span class="category-icon">' + escapeHtml(cat.icon) + "</span>" +
        '<span class="category-name">' + escapeHtml(cat.name) + "</span>" +
        '<span class="category-meta">' + cat.subcategories.length + " subcategories · " + count + " providers</span>" +
        '<span class="category-link">Explore ' + icon("arrowRight", 14) + "</span>" +
      "</button>"
    );
  }

  // -- Browse ---------------------------------------------------------------
  function browseView(params) {
    const filters = currentFilterState(params);
    const all = getAllProviders();
    const list = sortProviderList(filterProviderList(all, filters), filters.sort);
    const q = filters.q;
    return (
      '<section class="page-section"><div class="wrap">' +
        breadcrumbHtml([{ label: "Home", hash: "#/", action: "nav-home" }, { label: "Explore services" }]) +
        pageIntroHtml("THE RIGHT HELP, RIGHT HERE", "Every service you need, <span class=\"gradient\">all in one place.</span>",
          "Browse 6 categories and " + all.length + " verified sample professionals across Pakistan. Use live search or filters to narrow the list.") +
        searchBarHtml("browse", { value: q, city: filters.city, placeholder: "Search services, providers or cities…" }) +
        (q ? '<div class="active-search"><span>Showing matches for <strong>' + escapeHtml(q) + "</strong></span>" +
          '<button type="button" class="chip-clear" data-action="clear-search-results">Clear search ' + icon("close", 12) + "</button></div>" : "") +

        '<div class="section-head compact-head"><div><h2>Browse categories</h2><p class="section-sub">Pick a category to see its subcategories, services and providers.</p></div></div>' +
        '<div class="category-grid category-grid-sm">' + CATEGORIES.map((cat) => categoryCardHtml(cat)).join("") + "</div>" +

        '<div class="section-head results-head" id="results"><div><h2>All professionals</h2><p class="section-sub" id="resultsCount">' + list.length + " sample provider" + (list.length === 1 ? "" : "s") + " match your current filters.</p></div></div>" +
        filterSelectsHtml(params, { countLabel: list.length + " results" }) +
        '<div class="provider-grid" id="providerResults">' + providerGridHtml(list) + "</div>" +
      "</div></section>"
    );
  }

  // -- Category -------------------------------------------------------------
  function categoryView(catId, params) {
    const cat = getCategory(catId);
    if (!cat) return notFoundView("We couldn't find that category.");
    const subId = params.get("sub") || "";
    const filters = currentFilterState(params);
    const base = getAllProviders().filter((provider) => provider.cat === cat.id);
    const scoped = filterProviderList(base, Object.assign({}, filters, { cat: cat.id, sub: subId }));
    const list = sortProviderList(scoped, filters.sort);
    const sub = subId ? getSubcategory(cat.id, subId) : null;

    const services = cat.subcategories
      .filter((item) => !subId || item.id === subId)
      .reduce((items, item) => items.concat(item.services.map((service) => Object.assign({}, service, { subId: item.id, subName: item.name, subIcon: item.icon }))), []);

    return (
      '<section class="page-section"><div class="wrap">' +
        breadcrumbHtml([
          { label: "Home", hash: "#/", action: "nav-home" },
          { label: "Explore services", hash: "#/browse", action: "nav-browse" },
          { label: cat.name }
        ]) +
        '<div class="category-hero">' +
          '<div class="category-hero-icon">' + escapeHtml(cat.icon) + "</div>" +
          '<div class="category-hero-copy"><span class="eyebrow">CATEGORY</span><h1>' + escapeHtml(cat.name) + "</h1><p>" + escapeHtml(cat.blurb) + "</p>" +
            '<div class="category-stats"><span>' + cat.subcategories.length + " subcategories</span><span>" + countServicesInCategory(cat) + " sample services</span><span>" + base.length + " providers</span></div>" +
          "</div>" +
          '<button type="button" class="btn outline" data-action="share-category" data-cat="' + cat.id + '">' + icon("share", 15) + " Share category</button>" +
        "</div>" +

        '<div class="subcategory-scroll" role="tablist" aria-label="Subcategories"><button type="button" class="sub-pill' + (!subId ? " active" : "") + '" data-action="set-sub" data-cat="' + cat.id + '" data-sub="">All services</button>' +
          cat.subcategories.map((item) =>
            '<button type="button" class="sub-pill' + (subId === item.id ? " active" : "") + '" data-action="set-sub" data-cat="' + cat.id + '" data-sub="' + item.id + '">' +
              '<span>' + escapeHtml(item.icon) + "</span>" + escapeHtml(item.name) +
              '<span class="sub-count">' + countProvidersInSub(cat.id, item.id) + "</span></button>"
          ).join("") +
        "</div>" +

        (sub ? '<div class="subcategory-note"><strong>' + escapeHtml(sub.name) + "</strong><p>" + escapeHtml(sub.description) + '</p><button type="button" class="link-btn" data-action="set-sub" data-cat="' + cat.id + '" data-sub="">View all ' + escapeHtml(cat.name) + "</button></div>" : "") +

        '<div class="section-head compact-head"><div><h2>' + (sub ? escapeHtml(sub.name) + " services" : "Available services") + "</h2>" +
          '<p class="section-sub">Sample starting prices. Final quotes are agreed between customer and provider.</p></div></div>' +
        '<div class="service-grid">' + services.map((service) => serviceCardHtml(service, cat)).join("") + "</div>" +

        '<div class="section-head results-head" id="results"><div><h2>' + (sub ? escapeHtml(sub.name) + " providers" : "Providers in " + escapeHtml(cat.name)) + "</h2>" +
          '<p class="section-sub">' + list.length + " sample provider" + (list.length === 1 ? "" : "s") + " match your filters.</p></div></div>" +
        filterSelectsHtml(params, { countLabel: list.length + " results" }) +
        '<div class="provider-grid" id="providerResults">' + providerGridHtml(list, {
          title: "No providers match these filters",
          message: "Try another city, price range or rating — or select a different subcategory."
        }) + "</div>" +
      "</div></section>"
    );
  }

  function serviceCardHtml(service, cat) {
    return (
      '<article class="service-card">' +
        '<div class="service-icon">' + escapeHtml(service.subIcon || cat.icon) + "</div>" +
        '<div class="service-copy"><span class="service-sub">' + escapeHtml(service.subName) + "</span><h3>" + escapeHtml(service.name) + "</h3>" +
          '<div class="service-meta">' + icon("clock", 13) + escapeHtml(service.duration) + "</div></div>" +
        '<div class="service-foot"><div><span>From</span><strong>' + formatPrice(service.price) + "</strong></div>" +
          '<button type="button" class="btn outline small" data-action="open-service" data-cat="' + cat.id + '" data-sub="' + service.subId + '" data-q="' + escapeHtml(service.name) + '">View providers ' + icon("arrowRight", 14) + "</button></div>" +
      "</article>"
    );
  }

  // -- Search results -------------------------------------------------------
  function searchView(params) {
    const q = params.get("q") || "";
    const catId = params.get("cat") || "";
    const subId = params.get("sub") || "";
    const filters = currentFilterState(params);
    const all = getAllProviders();
    const scoped = filterProviderList(all, Object.assign({}, filters, { cat: catId, sub: subId }));
    const list = sortProviderList(scoped, filters.sort);

    const matchingCats = q ? CATEGORIES.filter((cat) => {
      const haystack = normalize(cat.name + " " + cat.blurb + " " + cat.subcategories.map((sub) => sub.name + " " + sub.services.map((service) => service.name).join(" ")).join(" "));
      return tokenize(q).every((token) => haystack.indexOf(token) !== -1);
    }).slice(0, 4) : [];
    const matchingServices = q ? searchMatchingServices(q).slice(0, 6) : [];

    let heading = "Search results";
    if (q && filters.city) heading = "“" + q + "” in " + filters.city;
    else if (q) heading = "Results for “" + q + "”";
    else if (filters.city) heading = "Professionals in " + filters.city;

    if (pendingSearch) {
      return (
        '<section class="page-section"><div class="wrap">' +
          breadcrumbHtml([{ label: "Home", hash: "#/", action: "nav-home" }, { label: "Search" }]) +
          pageIntroHtml("SEARCHING THE DEMO MARKETPLACE", "Looking for <span class=\"gradient\">" + escapeHtml(q || filters.city) + "</span>…", "Checking sample categories, services, providers and locations.") +
          filterSelectsHtml(params, {}) +
          '<div class="provider-grid">' + skeletonCardsHtml(6) + "</div>" +
        "</div></section>"
      );
    }

    return (
      '<section class="page-section"><div class="wrap">' +
        breadcrumbHtml([{ label: "Home", hash: "#/", action: "nav-home" }, { label: "Search" }, { label: q || filters.city || "All providers" }]) +
        '<div class="search-results-head"><div><span class="eyebrow">LIVE MARKETPLACE SEARCH</span><h1>' + escapeHtml(heading) + "</h1>" +
          '<p class="lead">' + list.length + " sample provider" + (list.length === 1 ? "" : "s") + " found" + (q ? " for <strong>" + escapeHtml(q) + "</strong>" : "") + (filters.city ? " in <strong>" + escapeHtml(filters.city) + "</strong>" : "") + ".</p></div>" +
          '<button type="button" class="btn outline small" data-action="clear-search-results">' + icon("close", 14) + " Clear search</button>" +
        "</div>" +
        searchBarHtml("searchPage", { value: q, city: filters.city, placeholder: "Search again…" }) +
        ((catId || subId) ? '<div class="active-search"><span>Filtered by ' + escapeHtml(categoryName(catId)) + (subId ? " · " + escapeHtml((getSubcategory(catId, subId) || {}).name || "") : "") + "</span>" +
          '<button type="button" class="chip-clear" data-action="clear-context-filter">Remove category filter ' + icon("close", 12) + "</button></div>" : "") +
        (matchingCats.length ? '<div class="result-block"><div class="result-block-head"><h2>Matching categories</h2></div><div class="result-cats">' +
          matchingCats.map((cat) => '<button type="button" class="result-cat" data-action="open-category" data-cat="' + cat.id + '"><span>' + escapeHtml(cat.icon) + '</span><strong>' + escapeHtml(cat.name) + "</strong><small>" + countProvidersInCategory(cat.id) + " providers</small>" + icon("arrowRight", 14) + "</button>").join("") +
          "</div></div>" : "") +
        (matchingServices.length ? '<div class="result-block"><div class="result-block-head"><h2>Matching services</h2></div><div class="service-chips">' +
          matchingServices.map((item) => '<button type="button" class="service-chip" data-action="open-service" data-cat="' + item.cat.id + '" data-sub="' + item.sub.id + '" data-q="' + escapeHtml(item.service.name) + '"><span>' + escapeHtml(item.sub.icon) + "</span><span><strong>" + escapeHtml(item.service.name) + "</strong><small>" + escapeHtml(item.cat.name) + " · " + formatPrice(item.service.price) + "</small></span></button>").join("") +
          "</div></div>" : "") +

        '<div class="section-head results-head" id="results"><div><h2>Professionals</h2><p class="section-sub">Open a profile to see services, sample reviews and booking options.</p></div></div>' +
        filterSelectsHtml(params, { countLabel: list.length + " results" }) +
        '<div class="provider-grid" id="providerResults">' +
          (list.length ? list.map((provider) => providerCardHtml(provider)).join("") : emptyStateHtml({
            title: "No matches for “" + (q || filters.city) + "”",
            message: "Check the spelling, try a broader term, or clear the city and price filters. You can also browse all categories.",
            icon: "🔍"
          })) +
        "</div>" +
        (q && list.length ? '<div class="search-tip">' + icon("info", 15) + " Can't find the right fit? Try searching a city alone, like “Lahore”, or a provider name like “Ayesha”." : "") +
      "</div></section>"
    );
  }

  function searchMatchingServices(query) {
    const tokens = tokenize(query);
    const items = [];
    CATEGORIES.forEach((cat) => {
      cat.subcategories.forEach((sub) => {
        sub.services.forEach((service) => {
          const haystack = normalize(service.name + " " + sub.name + " " + cat.name + " " + sub.description);
          if (tokens.every((token) => haystack.indexOf(token) !== -1)) {
            items.push({ cat, sub, service });
          }
        });
      });
    });
    return items.sort((a, b) => a.service.price - b.service.price);
  }

  function skeletonCardsHtml(count) {
    let html = "";
    for (let i = 0; i < count; i += 1) {
      html += '<div class="provider-card skeleton-card" aria-hidden="true"><div class="skeleton-line skeleton-avatar"></div><div class="skeleton-line skeleton-title"></div><div class="skeleton-line skeleton-text"></div><div class="skeleton-line skeleton-text short"></div><div class="skeleton-line skeleton-button"></div></div>';
    }
    return html;
  }

  // -- Provider profile -----------------------------------------------------
  function providerView(providerId) {
    const provider = getProvider(providerId);
    if (!provider) return notFoundView("That provider profile could not be found. It may have been removed from this demo.");
    const services = providerServices(provider);
    const reviews = generateReviews(provider);
    const cat = getCategory(provider.cat);
    const sub = getSubcategory(provider.cat, provider.sub);
    const favorite = isFavorite(provider.id);
    const similar = similarProviders(provider, 3);
    const verifiedLabel = provider.pending
      ? '<span class="tag-warn">' + icon("info", 12) + " Verification pending</span>"
      : provider.verified
        ? '<span class="verified-badge" title="Sample verification — not a real background check">' + icon("shield", 13) + " Demo verified</span>"
        : '<span class="tag-soft" title="This sample profile is not marked as verified">' + icon("info", 12) + " Demo profile · not verified</span>";

    return (
      '<section class="page-section profile-page"><div class="wrap">' +
        breadcrumbHtml([
          { label: "Home", hash: "#/", action: "nav-home" },
          { label: "Explore services", hash: "#/browse", action: "nav-browse" },
          { label: cat ? cat.name : "Services", hash: cat ? "#/category/" + cat.id : "#/browse", action: cat ? "open-category" : "nav-browse", attrs: cat ? 'data-cat="' + cat.id + '"' : "" },
          { label: provider.name }
        ]) +
        '<div class="profile-toolbar"><button type="button" class="btn ghost small" data-action="back-results">' + icon("arrowLeft", 15) + " Back to search results</button>" +
          '<span class="demo-inline-note">' + icon("info", 14) + " Sample profile · demo data</span></div>" +

        '<div class="profile-header panel">' +
          '<div class="profile-avatar-large">' + escapeHtml(provider.icon) + "</div>" +
          '<div class="profile-header-copy">' +
            '<div class="profile-badges">' + verifiedLabel + '<span class="tag-soft">' + escapeHtml(cat ? cat.name : "Service") + "</span>" +
              (provider.pending ? "" : '<span class="tag-soft">' + escapeHtml(provider.availability) + "</span>") + "</div>" +
            '<h1>' + escapeHtml(provider.name) + "</h1>" +
            '<p class="profile-skill">' + escapeHtml(provider.skill) + (sub ? " · " + escapeHtml(sub.name) : "") + "</p>" +
            '<div class="profile-meta-row">' +
              '<span>' + icon("location", 15) + escapeHtml(provider.area) + ", " + escapeHtml(provider.city) + "</span>" +
              '<span>' + icon("briefcase", 15) + (provider.exp ? provider.exp + " years experience" : "New provider") + "</span>" +
              '<span>' + icon("wallet", 15) + "From " + formatPrice(startingPrice(provider)) + "</span>" +
              '<span>' + icon("clock", 15) + "Responds in ~1 hour (demo)</span>" +
            "</div>" +
            '<div class="profile-rating-row">' + starsHtml(provider.rating) +
              (provider.rating ? '<strong>' + Number(provider.rating).toFixed(1) + "</strong><span>" + provider.reviews + " sample reviews</span>" : '<span class="new-badge">New sample profile</span>') +
            "</div>" +
          "</div>" +
          '<div class="profile-header-actions">' +
            '<button type="button" class="btn ' + (favorite ? "secondary" : "outline") + ' small" data-action="toggle-favorite" data-id="' + provider.id + '">' + icon("heart", 16) + (favorite ? " Saved" : " Add to favorites") + "</button>" +
            '<button type="button" class="btn outline small" data-action="share-profile" data-id="' + provider.id + '">' + icon("share", 16) + " Share profile</button>" +
            '<button type="button" class="btn primary" data-action="book-provider" data-id="' + provider.id + '">Request booking</button>' +
          "</div>" +
        "</div>" +

        '<div class="profile-layout">' +
          '<div class="profile-main">' +
            '<section class="panel profile-panel"><div class="panel-head"><h2>About ' + escapeHtml(firstName(provider.name)) + "</h2></div>" +
              "<p>" + escapeHtml(provider.desc) + "</p>" +
              '<div class="about-facts">' +
                '<div><span>Service area</span><strong>' + escapeHtml(provider.area) + " and nearby areas, " + escapeHtml(provider.city) + "</strong></div>" +
                '<div><span>Working hours</span><strong>' + escapeHtml(provider.hours) + "</strong></div>" +
                '<div><span>Languages</span><strong>' + escapeHtml((provider.languages || []).join(", ")) + "</strong></div>" +
                '<div><span>Availability</span><strong>' + escapeHtml(provider.availability) + "</strong></div>" +
              "</div>" +
            "</section>" +

            '<section class="panel profile-panel"><div class="panel-head"><h2>Skills & specialties</h2></div>' +
              '<div class="skill-tags">' + (provider.skills || []).map((skill) => '<span class="skill-tag">' + icon("check", 12) + escapeHtml(skill) + "</span>").join("") + "</div>" +
              (sub ? '<p class="panel-note">' + escapeHtml(sub.description) + "</p>" : "") +
            "</section>" +

            '<section class="panel profile-panel"><div class="panel-head"><h2>Services offered</h2><span class="panel-note-inline">Sample prices</span></div>' +
              '<div class="service-table">' + services.map((service) =>
                '<div class="service-row"><div class="service-row-icon">' + escapeHtml(provider.icon) + "</div>" +
                  '<div class="service-row-copy"><strong>' + escapeHtml(service.name) + "</strong><span>" + icon("clock", 12) + " " + escapeHtml(service.duration) + "</span></div>" +
                  '<div class="service-row-price">' + formatPrice(service.price) +
                    '<button type="button" class="btn primary small" data-action="book-provider" data-id="' + provider.id + '" data-service="' + escapeHtml(service.name) + '">Book</button>' +
                  "</div>" +
                "</div>"
              ).join("") + "</div>" +
            "</section>" +

            '<section class="panel profile-panel"><div class="panel-head"><h2>Customer reviews</h2><span class="panel-note-inline">Sample reviews</span></div>' +
              '<div class="review-summary"><div class="review-score"><strong>' + (provider.rating ? Number(provider.rating).toFixed(1) : "New") + '</strong>' + starsHtml(provider.rating) +
                "<span>" + (provider.reviews || 0) + " sample reviews</span></div>" +
                '<div class="rating-bars">' +
                  [5, 4, 3, 2, 1].map((star) => {
                    const width = star === 5 ? 74 : star === 4 ? 18 : star === 3 ? 5 : 2;
                    return '<div class="rating-bar"><span>' + star + " ★</span><div><i style=\"width:" + width + '%\"></i></div></div>';
                  }).join("") +
                "</div>" +
              "</div>" +
              '<div class="review-list">' + reviews.map((review) =>
                '<article class="review-card"><div class="review-top"><div class="review-avatar">' + escapeHtml(review.name.charAt(0)) + "</div>" +
                  '<div><strong>' + escapeHtml(review.name) + "</strong><span>" + escapeHtml(review.date) + " · Sample review</span></div>" +
                  starsHtml(review.rating) + "</div>" +
                  "<p>" + escapeHtml(review.text) + "</p></article>"
              ).join("") + "</div>" +
            "</section>" +

            (similar.length ? '<section class="section-inline"><div class="section-head compact-head"><div><h2>Similar providers</h2><p class="section-sub">More sample professionals in ' + escapeHtml(cat ? cat.name : "this category") + ".</p></div></div>" +
              '<div class="provider-grid provider-grid-3">' + similar.map((item) => providerCardHtml(item)).join("") + "</div></section>" : "") +
          "</div>" +

          '<aside class="profile-aside">' +
            '<div class="booking-card panel">' +
              '<span class="eyebrow">STARTING PRICE</span>' +
              '<div class="booking-price">' + formatPrice(startingPrice(provider)) + " <small>from</small></div>" +
              '<p class="booking-card-note">Choose a service on the booking form. Prices are sample estimates and confirmed directly with the provider.</p>' +
              '<button type="button" class="btn primary block" data-action="book-provider" data-id="' + provider.id + '">' + icon("calendar", 16) + " Request booking</button>" +
              '<button type="button" class="btn outline block" data-action="toggle-favorite" data-id="' + provider.id + '">' + icon("heart", 16) + (favorite ? " Remove from favorites" : " Save to favorites") + "</button>" +
              '<button type="button" class="btn ghost block" data-action="share-profile" data-id="' + provider.id + '">' + icon("share", 16) + " Share profile</button>" +
              '<div class="booking-card-facts">' +
                '<div>' + icon("shield", 15) + "<span>" + escapeHtml(verificationText(provider)) + "</span></div>" +
                '<div>' + icon("clock", 15) + "<span>" + escapeHtml(provider.hours) + "</span></div>" +
                '<div>' + icon("location", 15) + "<span>" + escapeHtml(provider.city) + " service area</span></div>" +
              "</div>" +
              '<div class="safety-note">' + icon("info", 14) + " Never pay a provider in advance. This demo does not process payments or contact the provider.</div>" +
            "</div>" +
          "</aside>" +
        "</div>" +
      "</div></section>"
    );
  }

  // -- Booking --------------------------------------------------------------
  function bookingView(params) {
    const provider = getProvider(params.get("provider"));
    if (!provider) return notFoundView("Choose a provider before starting a booking request.");
    const services = providerServices(provider);
    const selectedService = params.get("service") || services[0].name;
    const activeService = services.find((service) => service.name === selectedService) || services[0];
    const initialCalc = calculateInvoice(activeService.price);
    const profile = getCustomerProfile() || {};
    const session = getSession();
    const prefillName = profile.name || (session && session.role === "customer" ? session.name : "");
    const prefillPhone = profile.phone || "";
    const prefillCity = profile.city || provider.city;

    return (
      '<section class="page-section"><div class="wrap narrow-wrap">' +
        breadcrumbHtml([
          { label: "Home", hash: "#/", action: "nav-home" },
          { label: "Explore services", hash: "#/browse", action: "nav-browse" },
          { label: provider.name, hash: "#/provider/" + provider.id, action: "view-provider", attrs: 'data-id="' + provider.id + '"' },
          { label: "Request booking" }
        ]) +
        pageIntroHtml("DEMO SERVICE REQUEST", "Submit a Service Request", "Enter your work requirements below. An estimated fee receipt will be automatically generated upon submission.") +

        '<div class="booking-layout">' +
          '<div class="panel booking-form-panel">' +
            '<div class="panel-head"><h2>Service request details</h2><span class="step-chip">Step 1 of 2</span></div>' +
            '<form id="bookingForm" novalidate>' +
              '<input type="hidden" name="providerId" value="' + provider.id + '">' +
              '<div class="selected-provider">' +
                '<div class="provider-avatar">' + escapeHtml(provider.icon) + "</div>" +
                '<div><strong>' + escapeHtml(provider.name) + '</strong><span>' + escapeHtml(provider.skill) + " · " + escapeHtml(provider.city) + "</span></div>" +
                '<button type="button" class="link-btn" data-action="view-provider" data-id="' + provider.id + '">View profile</button>' +
              "</div>" +

              '<div class="form-field"><label for="bookingService">Service *</label>' +
                '<select class="field" id="bookingService" name="service" required>' +
                  services.map((service) => '<option value="' + escapeHtml(service.name) + '" data-price="' + service.price + '"' + (service.name === selectedService ? " selected" : "") + ">" + escapeHtml(service.name) + " — " + formatPrice(service.price) + "</option>").join("") +
                "</select><span class=\"field-error\" hidden></span></div>" +

              '<div class="form-grid">' +
                '<div class="form-field"><label for="bookingCustomer">Your full name *</label><input class="field" id="bookingCustomer" name="customer" autocomplete="name" placeholder="e.g. Ahmed Raza" value="' + escapeHtml(prefillName) + '" required><span class="field-error" hidden></span></div>' +
                '<div class="form-field"><label for="bookingPhone">Mobile number *</label><input class="field" id="bookingPhone" name="phone" inputmode="tel" autocomplete="tel" placeholder="03XX XXXXXXX" value="' + escapeHtml(prefillPhone) + '" required><span class="field-error" hidden></span></div>' +
                '<div class="form-field"><label for="bookingCity">City *</label><select class="field" id="bookingCity" name="city" required><option value="">Select city</option>' +
                  CITIES.map((city) => '<option value="' + escapeHtml(city) + '"' + (city === prefillCity ? " selected" : "") + ">" + escapeHtml(city) + "</option>").join("") +
                '</select><span class="field-error" hidden></span></div>' +
                '<div class="form-field"><label for="bookingDate">Preferred date *</label><input class="field" id="bookingDate" type="date" name="date" min="' + todayISO() + '" required><span class="field-error" hidden></span></div>' +
                '<div class="form-field"><label for="bookingTime">Preferred time *</label><input class="field" id="bookingTime" type="time" name="time" required><span class="field-error" hidden></span></div>' +
                '<div class="form-field"><label for="bookingAddress">Full address or area *</label><input class="field" id="bookingAddress" name="address" autocomplete="street-address" placeholder="House / street / area" required><span class="field-error" hidden></span></div>' +
              "</div>" +

              '<div class="form-field"><label for="bookingDetails">Description of required work *</label><textarea class="field" id="bookingDetails" name="details" rows="3" placeholder="Describe the job, issue or requirement in detail…" required></textarea></div>' +
              '<div class="form-field"><label for="bookingInstructions">Additional instructions <small>(optional)</small></label><textarea class="field" id="bookingInstructions" name="instructions" rows="2" placeholder="Parking, gate code, access, contact preference…"></textarea></div>' +

              '<div class="form-notice">' + icon("info", 16) + "<div><strong>Demo mode.</strong> This saves a service request in localStorage and generates an itemized estimated fee receipt. No real provider is contacted.</div></div>" +
              '<div class="booking-actions"><button type="submit" class="btn primary" id="bookingSubmit">Submit Service Request ' + icon("arrowRight", 16) + "</button>" +
                '<button type="button" class="btn ghost" data-action="view-provider" data-id="' + provider.id + '">Cancel</button></div>' +
            "</form>" +
          "</div>" +

          '<aside class="booking-summary panel">' +
            '<span class="eyebrow">ESTIMATED BILLING SUMMARY</span>' +
            '<div class="summary-provider"><div class="provider-avatar">' + escapeHtml(provider.icon) + "</div><div><strong>" + escapeHtml(provider.name) + "</strong><span>" + escapeHtml(provider.skill) + "</span><span>" + icon("location", 12) + " " + escapeHtml(provider.city) + "</span></div></div>" +
            '<div class="summary-row"><span>Service:</span><strong id="summaryService">' + escapeHtml(activeService.name) + "</strong></div>" +
            '<div class="summary-row"><span>Base Service Price:</span><strong id="summaryPrice">' + formatPrice(initialCalc.base) + "</strong></div>" +
            '<div class="summary-row"><span>Platform Fee (10%):</span><strong id="summaryPlatformFee">' + formatPrice(initialCalc.platformFee) + "</strong></div>" +
            '<div class="summary-row"><span>Applicable Tax (5% demo):</span><strong id="summaryTax">' + formatPrice(initialCalc.tax) + "</strong></div>" +
            '<div class="summary-row summary-total"><span>Estimated Total:</span><strong id="summaryTotal">' + formatPrice(initialCalc.total) + "</strong></div>" +
            '<div class="summary-note">' + icon("shield", 15) + " Platform fee is 10%. Demo tax rate is 5%. An official itemized Estimated Fee Receipt will be generated immediately upon submission.</div>" +
          "</aside>" +
        "</div>" +
      "</div></section>"
    );
  }

  function bookingConfirmationView(bookingId) {
    const booking = findBooking(bookingId);
    if (!booking) return notFoundView("We couldn't find that demo booking on this device.");
    return (
      '<section class="page-section"><div class="wrap narrow-wrap">' +
        breadcrumbHtml([
          { label: "Home", hash: "#/", action: "nav-home" },
          { label: "Service Seeker", hash: "#/browse" },
          { label: "Service Request", hash: "#/booking?provider=" + booking.providerId },
          { label: "Confirmation & Fee Receipt" }
        ]) +
        '<div class="confirmation-card panel">' +
          '<div class="confirmation-check">' + icon("check", 28) + "</div>" +
          '<span class="eyebrow green">SERVICE REQUEST SUBMITTED</span>' +
          "<h1>Request & Estimated Fee Receipt</h1>" +
          '<p class="lead">Service request <strong>' + escapeHtml(booking.bookingId) + "</strong> is saved in this browser with status " + statusBadge(booking.status) + ". Your automatic estimated fee receipt has been generated below.</p>" +
          '<div class="booking-id-box"><span>Service Request ID</span><strong id="confirmationBookingId">' + escapeHtml(booking.bookingId) + '</strong><button type="button" class="btn outline small" data-action="copy-booking-id" data-id="' + escapeHtml(booking.bookingId) + '">' + icon("share", 14) + ' Copy ID</button></div>' +

          '<div class="confirmation-invoice-preview">' +
            invoiceModalBlockHtml(booking) +
          '</div>' +

          '<div class="confirmation-actions">' +
            '<button type="button" class="btn outline" data-action="print-invoice">' + icon("share", 14) + " Print Receipt / Download</button>" +
            '<a class="btn primary" href="#/dashboard/customer?tab=bookings">View in Customer Dashboard</a>' +
            '<button type="button" class="btn primary outline" data-action="demo-switch-to-provider" data-id="' + booking.providerId + '">Switch to Provider Dashboard to Review Request →</button>' +
            '<a class="btn ghost" href="#/browse" data-action="nav-browse">Explore more services</a>' +
          "</div>" +
        "</div>" +
      "</div></section>"
    );
  }

  // -- Customer dashboard ---------------------------------------------------
  function customerDashboardView(params) {
    const session = getSession();
    const profile = getCustomerProfile() || {};
    const bookings = getBookings();
    const favoriteIds = getFavorites();
    const favorites = favoriteIds.map(getProvider).filter(Boolean);
    const tab = ["overview", "favorites", "bookings", "settings"].indexOf(params.get("tab")) !== -1 ? params.get("tab") : "overview";
    const pending = bookings.filter((booking) => booking.status === "Pending").length;
    const completed = bookings.filter((booking) => booking.status === "Completed").length;
    const counterofferBookings = bookings.filter((b) => b.status === "Counteroffer Received" || b.status === "Awaiting Customer Response");
    const awaitingPaymentBookings = bookings.filter((b) => b.status === "Awaiting Payment");

    const tabs = [
      ["overview", "Overview"],
      ["favorites", "Saved providers"],
      ["bookings", "My bookings"],
      ["settings", "Account settings"]
    ];

    return (
      '<section class="page-section dashboard-page"><div class="wrap">' +
        breadcrumbHtml([{ label: "Home", hash: "#/", action: "nav-home" }, { label: tab === "favorites" ? "Saved Providers" : tab === "bookings" ? "My Requests" : tab === "settings" ? "My Profile" : "Dashboard" }]) +
        '<div class="dashboard-head"><div><span class="eyebrow">CUSTOMER DASHBOARD</span><h1>' + (session ? "Welcome back, " + escapeHtml(firstName(session.name)) : "Your HARKAAM dashboard") + "</h1>" +
          '<p class="lead">' + (session ? "Manage your demo bookings, saved providers and account details." : "You are browsing as a guest. Bookings and favorites are still saved on this device.") + "</p></div>" +
          '<div class="dashboard-head-actions">' + (session ? '<button type="button" class="btn outline small" data-action="logout">' + icon("logout", 15) + ' Log out</button>' : '<button type="button" class="btn primary small" data-action="open-login">Log in to demo account</button>') + "</div>" +
        "</div>" +
        (!session ? '<div class="guest-banner">' + icon("info", 17) + "<div><strong>Guest demo mode</strong><span>Create a demo customer account or use the demo login to preview a named profile. No real authentication is used.</span></div></div>" : "") +
        (counterofferBookings.length ? '<div class="counteroffer-alert-card">' + icon("alert", 20) + '<div><strong>' + counterofferBookings.length + ' Counteroffer' + (counterofferBookings.length > 1 ? 's' : '') + ' Awaiting Your Review</strong><span>A service provider proposed revised pricing or terms. Review the request to accept or reject.</span></div><button type="button" class="btn primary small" data-action="dashboard-tab" data-tab="bookings">Review Counteroffers</button></div>' : '') +
        (awaitingPaymentBookings.length ? '<div class="payment-alert-card">' + icon("wallet", 20) + '<div><strong>' + awaitingPaymentBookings.length + ' Request' + (awaitingPaymentBookings.length > 1 ? 's' : '') + ' Awaiting Payment</strong><span>Your service request was accepted. Complete the demo checkout to confirm.</span></div><button type="button" class="btn primary small" data-action="dashboard-tab" data-tab="bookings">Proceed to Payment</button></div>' : '') +

        '<div class="stats-grid">' +
          '<div class="stat-card"><span class="stat-icon">' + icon("calendar", 19) + '</span><strong>' + bookings.length + "</strong><span>Total demo bookings</span></div>" +
          '<div class="stat-card"><span class="stat-icon amber">' + icon("clock", 19) + '</span><strong>' + pending + "</strong><span>Pending requests</span></div>" +
          '<div class="stat-card"><span class="stat-icon green">' + icon("check", 19) + '</span><strong>' + completed + "</strong><span>Completed</span></div>" +
          '<div class="stat-card"><span class="stat-icon rose">' + icon("heart", 19) + '</span><strong>' + favorites.length + "</strong><span>Saved providers</span></div>" +
        "</div>" +

        '<div class="tabs dashboard-tabs">' + tabs.map(([key, label]) =>
          '<button type="button" class="tab' + (tab === key ? " active" : "") + '" data-action="dashboard-tab" data-tab="' + key + '">' + label +
          (key === "bookings" ? '<span class="tab-count">' + bookings.length + "</span>" : key === "favorites" ? '<span class="tab-count">' + favorites.length + "</span>" : "") + "</button>"
        ).join("") + "</div>" +

        '<div class="dashboard-body">' +
          (tab === "overview" ? customerOverviewHtml(profile, bookings, favorites) : "") +
          (tab === "favorites" ? customerFavoritesHtml(favorites) : "") +
          (tab === "bookings" ? customerBookingsHtml(bookings) : "") +
          (tab === "settings" ? customerSettingsHtml(profile, session) : "") +
        "</div>" +
      "</div></section>"
    );
  }

  function customerOverviewHtml(profile, bookings, favorites) {
    const displayName = (getSession() && getSession().name) || profile.name || "Guest customer";
    return (
      '<div class="overview-grid">' +
        '<div class="panel profile-mini-card">' +
          '<div class="profile-mini-top"><div class="profile-mini-avatar">' + escapeHtml(displayName.charAt(0).toUpperCase()) + "</div>" +
            '<div><h2>' + escapeHtml(displayName) + "</h2><span>Customer demo profile</span></div></div>" +
          '<div class="mini-facts">' +
            '<div><span>Mobile</span><strong>' + escapeHtml(profile.phone || "Not added yet") + "</strong></div>" +
            '<div><span>City</span><strong>' + escapeHtml(profile.city || "Not added yet") + "</strong></div>" +
            '<div><span>Email</span><strong>' + escapeHtml(profile.email || "Not added yet") + "</strong></div>" +
            '<div><span>Account type</span><strong>Local demo</strong></div>' +
          "</div>" +
          '<button type="button" class="btn outline small" data-action="dashboard-tab" data-tab="settings">' + icon("edit", 14) + " Edit profile</button>" +
        "</div>" +
        '<div class="panel">' +
          '<div class="panel-head"><h2>Recent bookings</h2><button type="button" class="link-btn" data-action="dashboard-tab" data-tab="bookings">View all</button></div>' +
          (bookings.length ? '<div class="mini-booking-list">' + bookings.slice(0, 3).map((booking) => miniBookingHtml(booking)).join("") + "</div>" :
            '<div class="mini-empty"><span>📋</span><p>No demo bookings yet.</p><a class="btn primary small" href="#/browse" data-action="nav-browse">Explore services</a></div>') +
        "</div>" +
        '<div class="panel">' +
          '<div class="panel-head"><h2>Saved providers</h2><button type="button" class="link-btn" data-action="dashboard-tab" data-tab="favorites">View all</button></div>' +
          (favorites.length ? '<div class="saved-mini-list">' + favorites.slice(0, 3).map((provider) =>
            '<button type="button" class="saved-mini" data-action="view-provider" data-id="' + provider.id + '"><span class="provider-avatar">' + escapeHtml(provider.icon) + "</span><span><strong>" + escapeHtml(provider.name) + "</strong><small>" + escapeHtml(provider.skill) + "</small></span>" + icon("chevron", 15) + "</button>"
          ).join("") + "</div>" : '<div class="mini-empty"><span>💙</span><p>No saved providers yet.</p><a class="btn primary small" href="#/browse" data-action="nav-browse">Find providers</a></div>') +
        "</div>" +
        '<div class="panel quick-panel">' +
          '<div class="panel-head"><h2>Quick actions</h2></div>' +
          '<div class="quick-actions"><a class="quick-action" href="#/browse" data-action="nav-browse"><span>🔎</span><div><strong>Find a service</strong><small>Search categories and providers</small></div></a>' +
            '<a class="quick-action" href="#/dashboard/customer?tab=bookings"><span>📋</span><div><strong>Track bookings</strong><small>See request status history</small></div></a>' +
            '<a class="quick-action" href="#/join/provider" data-action="nav-join-provider"><span>🧰</span><div><strong>Offer a service</strong><small>Create a provider profile</small></div></a></div>' +
        "</div>" +
      "</div>"
    );
  }

  function miniBookingHtml(booking) {
    return '<button type="button" class="mini-booking" data-action="view-booking" data-id="' + escapeHtml(booking.bookingId) + '">' +
      '<div><strong>' + escapeHtml(booking.service) + "</strong><span>" + escapeHtml(booking.providerName) + " · " + formatDate(booking.date) + "</span><small>" + escapeHtml(booking.bookingId) + "</small></div>" +
      statusBadge(booking.status) + "</button>";
  }

  function customerFavoritesHtml(favorites) {
    return (
      '<div class="panel-head dashboard-section-head"><div><h2>Saved providers</h2><p class="section-sub">Favorites are stored in this browser only.</p></div>' +
        '<span class="panel-note-inline">' + favorites.length + " saved</span></div>" +
      (favorites.length ? '<div class="provider-grid">' + favorites.map((provider) => providerCardHtml(provider)).join("") + "</div>" :
        emptyStateHtml({ icon: "💙", title: "No saved providers yet", message: "Tap the heart on any provider card or profile to save them here for later.", clear: false }))
    );
  }

  function customerBookingsHtml(bookings) {
    return (
      '<div class="panel-head dashboard-section-head"><div><h2>Booking history</h2><p class="section-sub">All bookings are demo records saved in localStorage.</p></div>' +
        '<span class="panel-note-inline">' + bookings.length + " total</span></div>" +
      (bookings.length ? '<div class="booking-list">' + bookings.map((booking) => bookingRecordHtml(booking, "customer")).join("") + "</div>" :
        emptyStateHtml({ icon: "📋", title: "No demo bookings yet", message: "Choose a provider, request a booking, and your demo booking ID will appear here.", clear: false }))
    );
  }

  function bookingRecordHtml(booking, role) {
    var st = booking.status;
    var canCancel = st === "Pending" || st === "Awaiting Payment";
    var actions = role === "provider" ? providerBookingActions(booking) : customerBookingActions(booking, canCancel);
    var counterofferHtml = "";
    if (booking.counteroffer && (st === "Counteroffer Received" || st === "Awaiting Customer Response")) {
      counterofferHtml = '<div class="counteroffer-box">' +
        '<div class="counteroffer-head">' + icon("alert", 15) + '<strong>Counteroffer Received from Provider</strong></div>' +
        '<div class="counteroffer-prices">' +
          '<div><span>Original Estimate:</span><strong class="original-price">' + formatPrice(booking.servicePrice) + '</strong></div>' +
          '<div><span>Proposed New Price:</span><strong class="new-price">' + formatPrice(booking.counteroffer.newPrice) + '</strong></div>' +
        '</div>' +
        (booking.counteroffer.explanation ? '<p class="counteroffer-explain"><strong>Reason:</strong> ' + escapeHtml(booking.counteroffer.explanation) + '</p>' : '') +
        (booking.counteroffer.terms ? '<p class="counteroffer-terms"><strong>Revised Terms:</strong> ' + escapeHtml(booking.counteroffer.terms) + '</p>' : '') +
      '</div>';
    }

    var priceDisplay = "";
    if (booking.counteroffer && booking.counteroffer.accepted) {
      priceDisplay = '<span class="price-pill-agreed">' + icon("wallet", 14) + ' Agreed Price: ' + formatPrice(booking.counteroffer.newPrice) + ' <small>(Counteroffer Accepted)</small></span>';
    } else if (booking.counteroffer && (st === "Counteroffer Received" || st === "Awaiting Customer Response")) {
      priceDisplay = '<span class="price-pill-pending">' + icon("wallet", 14) + ' Proposed: ' + formatPrice(booking.counteroffer.newPrice) + ' (Orig: ' + formatPrice(booking.servicePrice) + ')</span>';
    } else {
      priceDisplay = '<span>' + icon("wallet", 14) + ' Estimated: ' + formatPrice(booking.servicePrice) + '</span>';
    }

    var requestDate = booking.createdAt ? formatDate(booking.createdAt.slice(0, 10)) : formatDate(booking.date);
    var paymentTag = "";
    if (booking.transactionId || st === "Paid (Demo)" || st === "Completed") {
      paymentTag = '<span class="booking-txn-pill">' + icon("check", 13) + ' Paid (' + escapeHtml(booking.paymentMethod || "Demo") + ') · ' + escapeHtml(booking.transactionId || "TXN-DEMO") + '</span>';
    }

    return (
      '<article class="booking-record">' +
        '<div class="booking-record-main">' +
          '<div class="booking-record-head">' +
            '<div><span class="booking-id">' + escapeHtml(booking.bookingId) + '</span>' + statusBadge(booking.status) + '</div>' +
            '<h3>' + escapeHtml(booking.service) + ' <small class="record-category">(' + escapeHtml(booking.providerSkill || "Service") + ')</small></h3>' +
            '<div class="booking-parties-summary">' +
              '<span>Provider: <strong>' + escapeHtml(booking.providerName) + '</strong></span> · ' +
              '<span>Customer: <strong>' + escapeHtml(booking.customer) + '</strong></span>' +
            '</div>' +
          '</div>' +
          '<div class="booking-record-meta">' +
            '<span>' + icon("calendar", 14) + ' Scheduled: ' + formatDate(booking.date) + ' at ' + formatTime(booking.time) + '</span>' +
            '<span>' + icon("clock", 14) + ' Requested on: ' + requestDate + '</span>' +
            '<span>' + icon("location", 14) + escapeHtml(booking.city) + ' · ' + escapeHtml(booking.address) + '</span>' +
            '<span>' + icon("phone", 14) + escapeHtml(booking.phone) + '</span>' +
            priceDisplay +
            paymentTag +
          '</div>' +
          (booking.details ? '<p class="booking-details"><strong>Instructions:</strong> ' + escapeHtml(booking.details) + '</p>' : '') +
          counterofferHtml +
        '</div>' +
        '<div class="booking-record-actions">' + actions + '</div>' +
      '</article>'
    );
  }

  function customerBookingActions(booking, canCancel) {
    var st = booking.status;
    var html = "";
    if (st === "Counteroffer Received" || st === "Awaiting Customer Response") {
      html += '<button type="button" class="btn primary small" data-action="customer-accept-counteroffer" data-id="' + escapeHtml(booking.bookingId) + '">Accept Counteroffer</button>' +
        '<button type="button" class="btn ghost small danger-text" data-action="customer-reject-counteroffer" data-id="' + escapeHtml(booking.bookingId) + '">Reject Counteroffer</button>';
    }
    if (st === "Awaiting Payment") {
      html += '<button type="button" class="btn primary small" data-action="open-payment-modal" data-id="' + escapeHtml(booking.bookingId) + '">' + icon("wallet", 13) + ' Pay (Demo)</button>';
    }
    html += '<button type="button" class="btn outline small" data-action="view-invoice" data-id="' + escapeHtml(booking.bookingId) + '">' + icon("wallet", 13) + ' View Invoice</button>';
    html += '<button type="button" class="btn outline small" data-action="view-booking" data-id="' + escapeHtml(booking.bookingId) + '">Details</button>';
    if (canCancel) {
      html += '<button type="button" class="btn ghost small danger-text" data-action="cancel-booking" data-id="' + escapeHtml(booking.bookingId) + '">Cancel</button>';
    }
    return html;
  }

  function providerBookingActions(booking) {
    var html = "";
    var st = booking.status;
    if (st === "Pending") {
      html += '<button type="button" class="btn primary small" data-action="provider-accept" data-id="' + escapeHtml(booking.bookingId) + '">Accept Request</button>' +
        '<button type="button" class="btn outline small" data-action="provider-counteroffer" data-id="' + escapeHtml(booking.bookingId) + '">Make Counteroffer</button>' +
        '<button type="button" class="btn ghost small danger-text" data-action="provider-decline" data-id="' + escapeHtml(booking.bookingId) + '">Reject Request</button>';
    }
    if (st === "Paid (Demo)") {
      html += '<button type="button" class="btn primary small" data-action="provider-complete" data-id="' + escapeHtml(booking.bookingId) + '">Mark Completed</button>';
    }
    html += '<button type="button" class="btn outline small" data-action="view-invoice" data-id="' + escapeHtml(booking.bookingId) + '">' + icon("wallet", 13) + ' View Invoice</button>';
    html += '<button type="button" class="btn outline small" data-action="view-booking" data-id="' + escapeHtml(booking.bookingId) + '">Details</button>';
    return html;
  }

  function customerSettingsHtml(profile, session) {
    return (
      '<div class="settings-grid">' +
        '<div class="panel"><div class="panel-head"><h2>Account settings</h2><span class="panel-note-inline">Local demo profile</span></div>' +
          '<form id="customerSettingsForm" novalidate><div class="form-grid">' +
            '<div class="form-field"><label for="profileName">Full name</label><input class="field" id="profileName" name="name" value="' + escapeHtml(profile.name || (session ? session.name : "")) + '" placeholder="Your full name"><span class="field-error" hidden></span></div>' +
            '<div class="form-field"><label for="profilePhone">Mobile number</label><input class="field" id="profilePhone" name="phone" inputmode="tel" value="' + escapeHtml(profile.phone || "") + '" placeholder="03XX XXXXXXX"><span class="field-error" hidden></span></div>' +
            '<div class="form-field"><label for="profileEmail">Email <small>(optional)</small></label><input class="field" id="profileEmail" name="email" type="email" value="' + escapeHtml(profile.email || "") + '" placeholder="you@example.com"><span class="field-error" hidden></span></div>' +
            '<div class="form-field"><label for="profileCity">City</label><select class="field" id="profileCity" name="city"><option value="">Select city</option>' +
              CITIES.map((city) => '<option value="' + escapeHtml(city) + '"' + (profile.city === city ? " selected" : "") + ">" + escapeHtml(city) + "</option>").join("") +
            "</select></div>" +
          "</div>" +
          '<div class="form-notice subtle">' + icon("info", 15) + " Profile data is saved in this browser only. It is not sent to a server and is not a real account.</div>" +
          '<button type="submit" class="btn primary">Save profile</button>' +
          "</form>" +
        "</div>" +
        '<div class="settings-side">' +
          '<div class="panel"><div class="panel-head"><h2>Preferences</h2></div>' +
            '<div class="setting-row"><div><strong>Dark mode</strong><span>Switch the interface theme.</span></div><button type="button" class="btn outline small" data-action="toggle-theme">Toggle theme</button></div>' +
            '<div class="setting-row"><div><strong>Demo data</strong><span>Bookings, favorites, accounts and provider applications on this device.</span></div><button type="button" class="btn ghost small danger-text" data-action="clear-demo-data">Clear demo data</button></div>' +
          "</div>" +
          '<div class="panel demo-disclaimer"><div class="panel-head"><h2>About this prototype</h2></div>' +
            '<p>HARKAAM is a frontend-only demonstration. localStorage is not a database, and demo login is not secure authentication.</p>' +
            '<ul class="plain-list"><li>No real provider contact</li><li>No payments or CNIC collection</li><li>No real verification or reviews</li></ul>' +
          "</div>" +
        "</div>" +
      "</div>"
    );
  }

  // -- Provider dashboard ---------------------------------------------------
  function providerDashboardView(params) {
    const session = getSession();
    if (!session || session.role !== "provider") return providerGateView();
    const provider = getProvider(session.providerId);
    if (!provider) {
      return providerGateView("That demo provider profile no longer exists on this device. Sign in to another provider account.");
    }
    const allProviders = BASE_PROVIDERS.concat(getProviderApps());
    const tab = ["overview", "requests", "services", "availability", "edit"].indexOf(params.get("tab")) !== -1 ? params.get("tab") : "overview";
    const bookings = getBookings().filter((booking) => Number(booking.providerId) === Number(provider.id));
    const pending = bookings.filter((booking) => booking.status === "Pending").length;
    const confirmed = bookings.filter((booking) => booking.status === "Paid (Demo)" || booking.status === "Completed" || booking.status === "Confirmed").length;
    const tabs = [
      ["overview", "Overview"],
      ["requests", "Incoming Requests"],
      ["services", "My Services"],
      ["availability", "Availability"],
      ["edit", "Edit Profile"]
    ];

    return (
      '<section class="page-section dashboard-page provider-dash"><div class="wrap">' +
        breadcrumbHtml([{ label: "Home", hash: "#/", action: "nav-home" }, { label: tab === "requests" ? "Incoming Requests" : tab === "services" ? "My Services" : tab === "availability" ? "Availability" : tab === "edit" ? "Edit Profile" : "Dashboard" }]) +
        '<div class="provider-switch-banner">' +
          '<div class="provider-switch-copy">' +
            icon("switch", 18) +
            '<div><strong>Demo Provider Switcher</strong><span>Switch active provider profile to see incoming requests for different categories</span></div>' +
          '</div>' +
          '<select class="field provider-quick-select" data-action="switch-provider-select" aria-label="Switch active provider">' +
            allProviders.slice(0, 12).map((p) => '<option value="' + p.id + '"' + (Number(p.id) === Number(provider.id) ? " selected" : "") + '>' + escapeHtml(p.name) + ' — ' + escapeHtml(p.skill) + ' (' + escapeHtml(p.city) + ')</option>').join('') +
          '</select>' +
        '</div>' +
        '<div class="dashboard-head"><div><span class="eyebrow">PROVIDER DASHBOARD</span><h1>' + escapeHtml(provider.name) + "</h1>" +
          '<p class="lead">' + escapeHtml(provider.skill) + " · " + escapeHtml(provider.city) + ' · <span class="demo-inline-note">' + escapeHtml(verificationText(provider)) + "</span></p></div>" +
          '<div class="dashboard-head-actions"><span class="availability-pill">' + icon("check", 13) + " " + escapeHtml(provider.availability) + '</span><button type="button" class="btn outline small" data-action="logout">' + icon("logout", 15) + " Log out</button></div></div>" +

        '<div class="stats-grid">' +
          '<div class="stat-card"><span class="stat-icon">' + icon("calendar", 19) + '</span><strong>' + bookings.length + "</strong><span>Incoming requests</span></div>" +
          '<div class="stat-card"><span class="stat-icon amber">' + icon("clock", 19) + '</span><strong>' + pending + "</strong><span>Awaiting response</span></div>" +
          '<div class="stat-card"><span class="stat-icon green">' + icon("check", 19) + '</span><strong>' + confirmed + "</strong><span>Paid / Completed</span></div>" +
          '<div class="stat-card"><span class="stat-icon rose">' + icon("starFilled", 19) + '</span><strong>' + (provider.rating ? Number(provider.rating).toFixed(1) : "New") + "</strong><span>Sample rating</span></div>" +
        "</div>" +

        '<div class="tabs dashboard-tabs">' + tabs.map(([key, label]) =>
          '<button type="button" class="tab' + (tab === key ? " active" : "") + '" data-action="provider-tab" data-tab="' + key + '">' + label +
          (key === "requests" ? '<span class="tab-count">' + bookings.length + "</span>" : "") + "</button>"
        ).join("") + "</div>" +

        '<div class="dashboard-body">' +
          (tab === "overview" ? providerOverviewHtml(provider, bookings) : "") +
          (tab === "requests" ? providerRequestsHtml(bookings) : "") +
          (tab === "services" ? providerServicesHtml(provider) : "") +
          (tab === "availability" ? providerAvailabilityHtml(provider) : "") +
          (tab === "edit" ? providerEditHtml(provider) : "") +
        "</div>" +
      "</div></section>"
    );
  }

  function providerGateView(message) {
    return (
      '<section class="page-section"><div class="wrap narrow-wrap">' +
        breadcrumbHtml([{ label: "Home", hash: "#/", action: "nav-home" }, { label: "Service Provider", hash: "#/dashboard/provider" }, { label: "Sign in" }]) +
        '<div class="auth-card panel">' +
          '<div class="auth-icon">🧰</div><span class="eyebrow">PROVIDER ACCESS</span><h1>Provider dashboard</h1>' +
          '<p class="lead">' + escapeHtml(message || "Sign in with a demo provider account to preview booking requests, services, availability and profile editing.") + "</p>" +
          '<div class="auth-choice-grid">' +
            '<button type="button" class="auth-choice" data-action="open-login"><span>🔐</span><strong>Sign in</strong><small>Use a registered demo provider account</small></button>' +
            '<a class="auth-choice" href="#/join/provider" data-action="nav-join-provider"><span>➕</span><strong>Create provider profile</strong><small>Submit a sample application</small></a>' +
          "</div>" +
          '<div class="demo-divider"><span>or preview a sample provider</span></div>' +
          '<form id="providerGateForm"><div class="form-field"><label for="gateProvider">Choose a sample provider</label><select class="field" id="gateProvider" name="providerId">' +
            BASE_PROVIDERS.slice(0, 10).map((provider) => '<option value="' + provider.id + '">' + escapeHtml(provider.name) + " — " + escapeHtml(provider.skill) + "</option>").join("") +
          '</select></div><button class="btn primary block" type="submit">Continue to provider dashboard</button></form>' +
          '<p class="demo-footnote">' + icon("info", 14) + " No real provider accounts or authentication are connected.</p>" +
        "</div>" +
      "</div></section>"
    );
  }

  function providerOverviewHtml(provider, bookings) {
    return (
      '<div class="overview-grid">' +
        '<div class="panel profile-mini-card">' +
          '<div class="profile-mini-top"><div class="profile-mini-avatar">' + escapeHtml(provider.icon) + "</div>" +
            '<div><h2>' + escapeHtml(provider.name) + "</h2><span>" + escapeHtml(provider.skill) + "</span></div></div>" +
          '<div class="mini-facts">' +
            '<div><span>Category</span><strong>' + escapeHtml(categoryName(provider.cat)) + "</strong></div>" +
            '<div><span>Service area</span><strong>' + escapeHtml(provider.area) + ", " + escapeHtml(provider.city) + "</strong></div>" +
            '<div><span>Starting price</span><strong>' + formatPrice(startingPrice(provider)) + "</strong></div>" +
            '<div><span>Verification</span><strong>' + escapeHtml(verificationText(provider)) + "</strong></div>" +
          "</div>" +
          '<button type="button" class="btn outline small" data-action="view-provider" data-id="' + provider.id + '">View public profile</button>' +
        "</div>" +
        '<div class="panel"><div class="panel-head"><h2>Latest demo requests</h2><button type="button" class="link-btn" data-action="provider-tab" data-tab="requests">View all</button></div>' +
          (bookings.length ? '<div class="mini-booking-list">' + bookings.slice(0, 3).map(miniBookingHtml).join("") + '</div>' :
            '<div class="mini-empty"><span>📭</span><p>No booking requests for this provider yet.</p><small>Use the customer booking flow to create one, then return here to accept or decline it.</small></div>') +
        "</div>" +
        '<div class="panel quick-panel"><div class="panel-head"><h2>Profile checklist</h2></div>' +
          '<div class="checklist">' +
            '<div class="checklist-item done">' + icon("check", 13) + "<span>Service category and starting price added</span></div>" +
            '<div class="checklist-item done">' + icon("check", 13) + "<span>Description and skills published</span></div>" +
            '<div class="checklist-item done">' + icon("check", 13) + "<span>Working hours and availability set</span></div>" +
            '<div class="checklist-item">' + icon("info", 13) + "<span>CNIC / document verification (not available in this demo)</span></div>" +
          "</div>" +
          '<button type="button" class="btn outline small" data-action="provider-tab" data-tab="edit">Edit profile</button>' +
        "</div>" +
      "</div>"
    );
  }

  function providerRequestsHtml(bookings) {
    return (
      '<div class="panel-head dashboard-section-head"><div><h2>Incoming Service Requests</h2><p class="section-sub">Review incoming requests. You can Accept, Reject, or Make a Counteroffer with revised pricing and terms.</p></div>' +
        '<span class="panel-note-inline">' + bookings.length + " total</span></div>" +
      (bookings.length ? '<div class="booking-list">' + bookings.map((booking) => bookingRecordHtml(booking, "provider")).join("") + "</div>" :
        '<div class="panel">' + emptyStateHtml({ icon: "📭", title: "No incoming requests yet", message: "Switch to another demo provider above or book this provider as a customer to create a new incoming request.", clear: false }) + "</div>")
    );
  }

  function providerServicesHtml(provider) {
    const services = providerServices(provider);
    return (
      '<div class="panel"><div class="panel-head"><div><h2>Services offered</h2><p class="section-sub">Your services come from the ' + escapeHtml(categoryName(provider.cat)) + " category catalogue.</p></div>" +
        '<span class="panel-note-inline">' + services.length + " services</span></div>" +
        '<div class="service-table">' + services.map((service) =>
          '<div class="service-row"><div class="service-row-icon">' + escapeHtml(provider.icon) + "</div>" +
            '<div class="service-row-copy"><strong>' + escapeHtml(service.name) + "</strong><span>" + icon("clock", 12) + " " + escapeHtml(service.duration) + "</span></div>" +
            '<div class="service-row-price">' + formatPrice(service.price) + "</div></div>"
        ).join("") + "</div>" +
        '<div class="form-notice subtle">' + icon("info", 15) + " To change service pricing, edit your starting price. Additional service prices are calculated from the sample catalogue.</div>" +
      "</div>"
    );
  }

  function providerAvailabilityHtml(provider) {
    return (
      '<div class="panel"><div class="panel-head"><h2>Availability information</h2><span class="panel-note-inline">Saved locally</span></div>' +
        '<form id="availabilityForm" novalidate><div class="form-grid">' +
          '<div class="form-field"><label for="availabilityStatus">Current availability</label><select class="field" id="availabilityStatus" name="availability">' +
            ["Available today", "Available tomorrow", "Available this week", "Fully booked"].map((option) => '<option' + (provider.availability === option ? " selected" : "") + ">" + option + "</option>").join("") +
          '</select></div>' +
          '<div class="form-field"><label for="availabilityHours">Working hours</label><input class="field" id="availabilityHours" name="hours" value="' + escapeHtml(provider.hours) + '" placeholder="e.g. 9:00 AM – 8:00 PM"><span class="field-error" hidden></span></div>' +
          '<div class="form-field"><label for="availabilityArea">Working area</label><input class="field" id="availabilityArea" name="area" value="' + escapeHtml(provider.area) + '" placeholder="Area, neighbourhood"><span class="field-error" hidden></span></div>' +
          '<div class="form-field"><label for="availabilityLanguages">Languages <small>(comma separated)</small></label><input class="field" id="availabilityLanguages" name="languages" value="' + escapeHtml((provider.languages || []).join(", ")) + '" placeholder="Urdu, English"><span class="field-error" hidden></span></div>' +
        "</div>" +
        '<div class="form-notice subtle">' + icon("info", 15) + " Availability updates are demo data stored in this browser.</div>" +
        '<button type="submit" class="btn primary">Save availability</button></form>' +
      "</div>"
    );
  }

  function providerEditHtml(provider) {
    return (
      '<div class="panel"><div class="panel-head"><h2>Edit provider profile</h2><span class="panel-note-inline">Public demo profile</span></div>' +
        '<form id="providerEditForm" novalidate><div class="form-grid">' +
          '<div class="form-field"><label for="editName">Full name</label><input class="field" id="editName" name="name" value="' + escapeHtml(provider.name) + '" required><span class="field-error" hidden></span></div>' +
          '<div class="form-field"><label for="editSkill">Service title</label><input class="field" id="editSkill" name="skill" value="' + escapeHtml(provider.skill) + '" required><span class="field-error" hidden></span></div>' +
          '<div class="form-field"><label for="editCity">City</label><select class="field" id="editCity" name="city">' + CITIES.map((city) => '<option' + (provider.city === city ? " selected" : "") + ">" + city + "</option>").join("") + "</select></div>" +
          '<div class="form-field"><label for="editArea">Service area</label><input class="field" id="editArea" name="area" value="' + escapeHtml(provider.area) + '"><span class="field-error" hidden></span></div>' +
          '<div class="form-field"><label for="editExp">Years of experience</label><input class="field" id="editExp" name="exp" type="number" min="0" max="60" value="' + Number(provider.exp || 0) + '"></div>' +
          '<div class="form-field"><label for="editPrice">Starting price (PKR)</label><input class="field" id="editPrice" name="price" type="number" min="0" value="' + Number(provider.price || 0) + '"><span class="field-error" hidden></span></div>' +
          '<div class="form-field span-2"><label for="editDesc">Service description</label><textarea class="field" id="editDesc" name="desc" rows="4">' + escapeHtml(provider.desc) + '</textarea><span class="field-error" hidden></span></div>' +
          '<div class="form-field span-2"><label for="editSkills">Skills <small>(comma separated)</small></label><input class="field" id="editSkills" name="skills" value="' + escapeHtml((provider.skills || []).join(", ")) + '"><span class="field-error" hidden></span></div>' +
        "</div>" +
        '<div class="form-actions"><button type="submit" class="btn primary">Save profile changes</button><button type="button" class="btn ghost" data-action="provider-tab" data-tab="overview">Cancel</button></div>' +
        "</form>" +
      "</div>"
    );
  }

  // -- Registration ---------------------------------------------------------
  function customerRegisterView() {
    return (
      '<section class="page-section"><div class="wrap narrow-wrap">' +
        breadcrumbHtml([{ label: "Home", hash: "#/", action: "nav-home" }, { label: "Create customer account" }]) +
        '<div class="auth-card panel">' +
          '<div class="auth-icon">👤</div><span class="eyebrow">CUSTOMER REGISTRATION</span><h1>Create your demo account</h1>' +
          '<p class="lead">Save a local customer profile so your bookings and favorites are easier to manage. No real account is created.</p>' +
          '<form id="customerRegisterForm" novalidate><div class="form-grid">' +
            '<div class="form-field"><label for="custName">Full name *</label><input class="field" id="custName" name="name" autocomplete="name" placeholder="e.g. Ahmed Raza" required><span class="field-error" hidden></span></div>' +
            '<div class="form-field"><label for="custPhone">Mobile number *</label><input class="field" id="custPhone" name="phone" inputmode="tel" autocomplete="tel" placeholder="03XX XXXXXXX" required><span class="field-error" hidden></span></div>' +
            '<div class="form-field"><label for="custEmail">Email <small>(optional)</small></label><input class="field" id="custEmail" name="email" type="email" autocomplete="email" placeholder="you@example.com"><span class="field-error" hidden></span></div>' +
            '<div class="form-field"><label for="custCity">City *</label><select class="field" id="custCity" name="city" required><option value="">Select city</option>' + CITIES.map((city) => "<option>" + city + "</option>").join("") + '</select><span class="field-error" hidden></span></div>' +
            '<div class="form-field span-2"><label for="custPassword">Password * <small>(demo only)</small></label><input class="field" id="custPassword" name="password" type="password" autocomplete="new-password" placeholder="At least 4 characters" required><span class="field-error" hidden></span></div>' +
          "</div>" +
          '<div class="form-notice">' + icon("info", 16) + "<div><strong>Demo-only registration.</strong> Your details are saved in this browser's localStorage. Do not use a real password — this frontend login is not secure.</div></div>" +
          '<button class="btn primary block" type="submit">Create demo customer account</button>' +
          "</form>" +
          '<div class="auth-switch">Already have a demo account? <button type="button" class="link-btn" data-action="open-login">Sign in</button> · Want to offer services? <button type="button" class="link-btn" data-action="nav-join-provider">Join as a provider</button></div>' +
        "</div>" +
      "</div></section>"
    );
  }

  function providerRegisterView() {
    return (
      '<section class="page-section"><div class="wrap narrow-wrap">' +
        breadcrumbHtml([{ label: "Home", hash: "#/", action: "nav-home" }, { label: "Join as provider" }]) +
        '<div class="auth-card panel">' +
          '<div class="auth-icon">🧰</div><span class="eyebrow">PROVIDER REGISTRATION</span><h1>Create your provider profile</h1>' +
          '<p class="lead">Tell customers what you do, where you work and what you charge. Your profile is saved locally and appears in the demo marketplace with a pending verification label.</p>' +
          '<form id="providerRegisterForm" novalidate><div class="form-grid">' +
            '<div class="form-field"><label for="provName">Full name *</label><input class="field" id="provName" name="name" autocomplete="name" placeholder="Your full name" required><span class="field-error" hidden></span></div>' +
            '<div class="form-field"><label for="provPhone">Mobile number *</label><input class="field" id="provPhone" name="phone" inputmode="tel" autocomplete="tel" placeholder="03XX XXXXXXX" required><span class="field-error" hidden></span></div>' +
            '<div class="form-field"><label for="provEmail">Email *</label><input class="field" id="provEmail" name="email" type="email" autocomplete="email" placeholder="you@example.com" required><span class="field-error" hidden></span></div>' +
            '<div class="form-field"><label for="provCity">City *</label><select class="field" id="provCity" name="city" required><option value="">Select city</option>' + CITIES.map((city) => "<option>" + city + "</option>").join("") + '</select><span class="field-error" hidden></span></div>' +
            '<div class="form-field"><label for="provCategory">Service category *</label><select class="field" id="provCategory" name="cat" required><option value="">Choose category</option>' +
              CATEGORIES.map((cat) => '<option value="' + cat.id + '">' + escapeHtml(cat.name) + "</option>").join("") +
            '</select><span class="field-error" hidden></span></div>' +
            '<div class="form-field"><label for="provService">Specific service *</label><select class="field" id="provService" name="sub" required><option value="">Choose a category first</option></select><span class="field-error" hidden></span></div>' +
            '<div class="form-field"><label for="provSkill">Service title / headline *</label><input class="field" id="provSkill" name="skill" placeholder="e.g. AC Repair Technician" required><span class="field-error" hidden></span></div>' +
            '<div class="form-field"><label for="provExp">Years of experience *</label><input class="field" id="provExp" name="exp" type="number" min="0" max="60" value="1" required><span class="field-error" hidden></span></div>' +
            '<div class="form-field"><label for="provPrice">Starting price (PKR) *</label><input class="field" id="provPrice" name="price" type="number" min="0" placeholder="e.g. 2000" required><span class="field-error" hidden></span></div>' +
            '<div class="form-field"><label for="provArea">Working area *</label><input class="field" id="provArea" name="area" placeholder="Area / neighbourhood" required><span class="field-error" hidden></span></div>' +
            '<div class="form-field"><label for="provHours">Working hours</label><input class="field" id="provHours" name="hours" placeholder="e.g. 9:00 AM – 8:00 PM" value="9:00 AM – 8:00 PM"></div>' +
            '<div class="form-field"><label for="provLanguages">Languages <small>(comma separated)</small></label><input class="field" id="provLanguages" name="languages" placeholder="Urdu, English" value="Urdu, English"></div>' +
            '<div class="form-field span-2"><label for="provSkills">Skills & specialties * <small>(comma separated)</small></label><input class="field" id="provSkills" name="skills" placeholder="AC repair, gas refilling, installation" required><span class="field-error" hidden></span></div>' +
            '<div class="form-field span-2"><label for="provDesc">Service description *</label><textarea class="field" id="provDesc" name="desc" rows="4" placeholder="Describe your experience, what you offer and how you work…" required></textarea><span class="field-error" hidden></span></div>' +
            '<div class="form-field span-2"><label for="provPassword">Demo password *</label><input class="field" id="provPassword" name="password" type="password" autocomplete="new-password" placeholder="At least 4 characters" required><span class="field-error" hidden></span></div>' +
          "</div>" +
          '<div class="form-notice">' + icon("shield", 16) + "<div><strong>No CNIC collection.</strong> This prototype intentionally does not ask for CNIC or identity documents. Real verification needs a secure backend. Your demo profile is saved in this browser only.</div></div>" +
          '<button class="btn primary block" type="submit">Submit demo provider profile</button>' +
          "</form>" +
          '<div class="auth-switch">Already registered? <button type="button" class="link-btn" data-action="open-login">Sign in</button> · Looking for a service? <button type="button" class="link-btn" data-action="nav-browse">Explore services</button></div>' +
        "</div>" +
      "</div></section>"
    );
  }

  // -- 404 ------------------------------------------------------------------
  function notFoundView(message) {
    return (
      '<section class="page-section"><div class="wrap narrow-wrap">' +
        '<div class="empty-state standalone">' +
          '<div class="empty-icon">🧭</div><h1>Page not found</h1>' +
          "<p>" + escapeHtml(message || "The page you're looking for doesn't exist in this HARKAAM demo.") + "</p>" +
          '<div class="empty-actions"><a class="btn primary" href="#/" data-action="nav-home">Back to home</a>' +
          '<a class="btn outline" href="#/browse" data-action="nav-browse">Explore services</a></div>' +
        "</div>" +
      "</div></section>"
    );
  }

  /* ----------------------------------------------------------------------
     9. Router and rendering
     ---------------------------------------------------------------------- */

  function render() {
    const route = parseHash();
    const path = route.path;
    const params = route.params;
    let html = "";
    let title = "HARKAAM — Find trusted local services in Pakistan";

    if (path === "/") {
      html = homeView();
      title = "HARKAAM — Find trusted local services in Pakistan";
    } else if (path === "/browse") {
      html = browseView(params);
      title = "Explore services — HARKAAM";
    } else if (path.indexOf("/category/") === 0) {
      const catId = path.split("/")[2];
      html = categoryView(catId, params);
      const cat = getCategory(catId);
      title = (cat ? cat.name : "Category") + " — HARKAAM";
    } else if (path === "/search") {
      html = searchView(params);
      title = "Search results — HARKAAM";
    } else if (path.indexOf("/provider/") === 0) {
      html = providerView(path.split("/")[2]);
      const provider = getProvider(path.split("/")[2]);
      title = (provider ? provider.name + " — " + provider.skill : "Provider") + " — HARKAAM";
    } else if (path === "/booking") {
      html = bookingView(params);
      title = "Request a booking — HARKAAM";
    } else if (path.indexOf("/booking/confirmation/") === 0) {
      html = bookingConfirmationView(path.split("/")[3]);
      title = "Demo booking confirmation — HARKAAM";
    } else if (path === "/dashboard/customer") {
      html = customerDashboardView(params);
      title = "Customer dashboard — HARKAAM";
    } else if (path === "/dashboard/provider") {
      html = providerDashboardView(params);
      title = "Provider dashboard — HARKAAM";
    } else if (path === "/join/customer") {
      html = customerRegisterView();
      title = "Create customer account — HARKAAM";
    } else if (path === "/join/provider") {
      html = providerRegisterView();
      title = "Join as provider — HARKAAM";
    } else {
      html = notFoundView();
      title = "Page not found — HARKAAM";
    }

    closeAllSuggestions();
    document.getElementById("app").innerHTML = html;
    document.title = title;
    updateHeader();
    bindSearchBars();

    document.querySelectorAll(".search-input").forEach((input) => {
      if (input.value) input.closest("[data-search-root]").querySelector(".clear-search").hidden = false;
    });

    if (!skipScroll) {
      window.scrollTo({ top: 0, behavior: "instant" in document.documentElement.style ? "instant" : "auto" });
    }
    skipScroll = false;

    if (pendingSection) {
      const sectionId = pendingSection;
      pendingSection = "";
      window.setTimeout(() => {
        const target = document.getElementById(sectionId);
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 60);
    }
  }

  function refreshView(preserveScroll) {
    const y = window.scrollY;
    skipScroll = !!preserveScroll;
    render();
    if (preserveScroll) {
      window.requestAnimationFrame(() => window.scrollTo(0, y));
    }
  }

  function goHomeSection(id) {
    closeMobileMenu();
    if (parseHash().path === "/") {
      const target = document.getElementById(id);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    pendingSection = id;
    navigate("#/");
  }

  function setRouteParams(params, preserveScroll) {
    const route = parseHash();
    const hash = hashWithParams(route.path, params);
    history.replaceState(null, "", hash);
    refreshView(preserveScroll !== false);
  }

  function updateFiltersAndRender() {
    const city = (document.getElementById("cityFilter") || {}).value || "";
    const price = (document.getElementById("priceFilter") || {}).value || "";
    const rating = (document.getElementById("ratingFilter") || {}).value || "0";
    const sort = (document.getElementById("sortFilter") || {}).value || "recommended";
    const params = new URLSearchParams(parseHash().params);
    if (city) params.set("city", city); else params.delete("city");
    if (price) params.set("price", price); else params.delete("price");
    if (rating && rating !== "0") params.set("rating", rating); else params.delete("rating");
    if (sort && sort !== "recommended") params.set("sort", sort); else params.delete("sort");
    setRouteParams(params, true);
  }

  function clearFilters() {
    const params = new URLSearchParams(parseHash().params);
    ["city", "price", "rating", "sort"].forEach((key) => params.delete(key));
    setRouteParams(params, true);
    toast("Filters cleared.", "info");
  }

  function clearSearchResults() {
    navigate("#/browse");
  }

  function clearContextFilter() {
    const params = new URLSearchParams(parseHash().params);
    params.delete("cat");
    params.delete("sub");
    setRouteParams(params, true);
  }

  function openServiceSearch(catId, subId, query) {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (catId) params.set("cat", catId);
    if (subId) params.set("sub", subId);
    pendingSearch = true;
    navigate("#/search?" + params.toString());
    window.clearTimeout(searchTimer);
    searchTimer = window.setTimeout(() => {
      pendingSearch = false;
      if (parseHash().path === "/search") render();
    }, 220);
  }

  /* ----------------------------------------------------------------------
     10. Validation helpers
     ---------------------------------------------------------------------- */

  function fieldError(form, name, message) {
    const input = form.elements[name];
    if (!input) return;
    const wrap = input.closest(".form-field") || input.parentElement;
    const error = wrap ? wrap.querySelector(".field-error") : null;
    if (error) {
      error.textContent = message;
      error.hidden = !message;
    }
    input.classList.toggle("invalid", !!message);
    input.setAttribute("aria-invalid", message ? "true" : "false");
  }

  function clearFormErrors(form) {
    form.querySelectorAll(".field-error").forEach((error) => {
      error.textContent = "";
      error.hidden = true;
    });
    form.querySelectorAll(".invalid").forEach((input) => {
      input.classList.remove("invalid");
      input.removeAttribute("aria-invalid");
    });
  }

  function validPhone(value) {
    const digits = String(value || "").replace(/[^\d+]/g, "");
    return /^(?:\+92|92|0)?3\d{9}$/.test(digits);
  }

  function validEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value || "").trim());
  }

  function digitsOnly(value) {
    return String(value || "").replace(/\D/g, "").replace(/^92/, "0");
  }

  function splitList(value) {
    return String(value || "").split(",").map((item) => item.trim()).filter(Boolean);
  }

  function focusFirstInvalid(form) {
    const invalid = form.querySelector(".invalid");
    if (invalid) {
      invalid.focus();
      invalid.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  /* ----------------------------------------------------------------------
     11. Actions
     ---------------------------------------------------------------------- */

  function updateBookingSummary(select) {
    if (!select) return;
    const option = select.options[select.selectedIndex];
    const price = option ? option.dataset.price : "";
    const serviceEl = document.getElementById("summaryService");
    const priceEl = document.getElementById("summaryPrice");
    if (serviceEl) serviceEl.textContent = option ? option.text.split(" — ")[0] : "";
    if (priceEl && price) priceEl.textContent = formatPrice(price);
  }

  function openBookingModal(bookingId) {
    const booking = findBooking(bookingId);
    if (!booking) {
      toast("That demo booking could not be found.", "error");
      return;
    }
    var canCancel = booking.status === "Pending" || booking.status === "Awaiting Payment";
    var counterofferSection = "";
    if (booking.counteroffer) {
      counterofferSection = '<div class="modal-block counteroffer-modal-box">' +
        "<span>Counteroffer</span>" +
        '<div class="counteroffer-prices"><div><span>Original price</span><strong>' + formatPrice(booking.servicePrice) + "</strong></div>" +
        '<div><span>Proposed price</span><strong>' + formatPrice(booking.counteroffer.newPrice) + "</strong></div></div>" +
        (booking.counteroffer.explanation ? "<p>" + escapeHtml(booking.counteroffer.explanation) + "</p>" : "") +
        (booking.counteroffer.terms ? '<p><small>Revised terms: ' + escapeHtml(booking.counteroffer.terms) + "</small></p>" : "") +
        (booking.counteroffer.accepted ? '<p class="counteroffer-status">' + icon("check", 13) + " Accepted by customer</p>" : "") +
        "</div>";
    }
    var invoiceSection = booking.invoice ? invoiceModalBlockHtml(booking) : "";
    openModal(
      '<div class="modal-head"><div><span class="modal-eyebrow">DEMO BOOKING</span><h2>' + escapeHtml(booking.bookingId) + "</h2></div>" +
        '<button type="button" class="iconbtn" data-action="close-modal" aria-label="Close">' + icon("close") + "</button></div>" +
      '<div class="modal-status">' + statusBadge(booking.status) + '<span class="panel-note-inline">Saved locally · provider not contacted</span></div>' +
      '<div class="modal-detail-grid">' +
        '<div><span>Provider</span><strong>' + escapeHtml(booking.providerName) + "</strong><small>" + escapeHtml(booking.providerSkill) + "</small></div>" +
        '<div><span>Service</span><strong>' + escapeHtml(booking.service) + "</strong><small>" + formatPrice(booking.servicePrice) + "</small></div>" +
        '<div><span>Date & time</span><strong>' + formatDate(booking.date) + "</strong><small>" + formatTime(booking.time) + "</small></div>" +
        '<div><span>City</span><strong>' + escapeHtml(booking.city) + "</strong><small>" + escapeHtml(booking.address) + "</small></div>" +
        '<div><span>Customer</span><strong>' + escapeHtml(booking.customer) + "</strong><small>" + escapeHtml(booking.phone) + "</small></div>" +
        '<div><span>Created</span><strong>' + escapeHtml(new Date(booking.createdAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })) + "</strong><small>Demo record</small></div>" +
      "</div>" +
      (booking.details ? '<div class="modal-block"><span>Service details</span><p>' + escapeHtml(booking.details) + "</p></div>" : "") +
      (booking.instructions ? '<div class="modal-block"><span>Additional instructions</span><p>' + escapeHtml(booking.instructions) + "</p></div>" : "") +
      counterofferSection +
      invoiceSection +
      '<div class="form-notice subtle">' + icon("info", 15) + " This is a frontend demonstration. No provider was contacted and no payment was taken.</div>" +
      '<div class="modal-actions">' +
        (canCancel ? '<button type="button" class="btn ghost danger-text" data-action="cancel-booking-modal" data-id="' + escapeHtml(booking.bookingId) + '">Cancel booking</button>' : "") +
        '<button type="button" class="btn primary" data-action="close-modal">Close</button>' +
      "</div>"
    );
  }

  function openCounterofferModal(bookingId) {
    const booking = findBooking(bookingId);
    if (!booking) {
      toast("That demo booking could not be found.", "error");
      return;
    }
    openModal(
      '<div class="modal-head"><div><span class="modal-eyebrow">COUNTEROFFER</span><h2>Make a Counteroffer</h2></div>' +
        '<button type="button" class="iconbtn" data-action="close-modal" aria-label="Close">' + icon("close") + "</button></div>" +
      '<p class="modal-lead">Propose a different price or revised terms for this service request. The customer will be notified and can accept or reject your counteroffer.</p>' +
      '<div class="modal-block"><span>Original request</span><div><strong>' + escapeHtml(booking.service) + "</strong><p>Original price: " + formatPrice(booking.servicePrice) + "</p></div></div>" +
      '<form id="counterofferForm" novalidate>' +
        '<input type="hidden" name="bookingId" value="' + escapeHtml(booking.bookingId) + '">' +
        '<div class="form-field"><label for="coNewPrice">New proposed price (PKR) *</label>' +
          '<input class="field" id="coNewPrice" name="newPrice" type="number" min="0" value="' + booking.servicePrice + '" required><span class="field-error" hidden></span></div>' +
        '<div class="form-field"><label for="coExplanation">Explanation <small>(optional)</small></label>' +
          '<textarea class="field" id="coExplanation" name="explanation" rows="3" placeholder="Explain why the price is different (e.g. additional materials, complexity)…"></textarea></div>' +
        '<div class="form-field"><label for="coTerms">Revised terms or conditions <small>(optional)</small></label>' +
          '<textarea class="field" id="coTerms" name="terms" rows="2" placeholder="Any changes to scope, timing, or conditions…"></textarea></div>' +
        '<div class="form-notice">' + icon("info", 16) + "<div><strong>Demo only.</strong> The counteroffer will be saved locally and shown to the customer in their dashboard.</div></div>" +
        '<div class="modal-actions"><button type="button" class="btn outline" data-action="close-modal">Cancel</button>' +
          '<button type="submit" class="btn primary">Send Counteroffer</button></div>' +
      "</form>"
    );
  }

  function openInvoiceModal(bookingId) {
    const booking = findBooking(bookingId);
    if (!booking) {
      toast("That demo booking could not be found.", "error");
      return;
    }
    if (!booking.invoice) {
      booking.invoice = generateInvoiceRecord(booking);
    }
    openModal(
      '<div class="modal-head"><div><span class="modal-eyebrow">OFFICIAL FEE RECEIPT</span><h2>' + escapeHtml(booking.invoice.invoiceNumber) + "</h2></div>" +
        '<button type="button" class="iconbtn" data-action="close-modal" aria-label="Close">' + icon("close") + "</button></div>" +
      invoiceModalBlockHtml(booking) +
      '<div class="form-notice subtle">' + icon("info", 15) + " Prototype Receipt: Applicable tax is calculated at a fixed 5% demonstration rate. All payments are simulated.</div>" +
      '<div class="modal-actions">' +
        '<button type="button" class="btn primary" data-action="print-invoice">' + icon("share", 14) + " Print Receipt / Save as PDF</button>" +
        '<button type="button" class="btn outline" data-action="copy-booking-id" data-id="' + escapeHtml(booking.invoice.invoiceNumber) + '">' + icon("share", 14) + " Copy invoice no.</button>" +
        '<button type="button" class="btn ghost" data-action="close-modal">Close</button>' +
      "</div>"
    );
  }

  function invoiceModalBlockHtml(booking) {
    var inv = booking.invoice || generateInvoiceRecord(booking);
    var effectivePrice = booking.counteroffer && booking.counteroffer.accepted ? booking.counteroffer.newPrice : (booking.counteroffer && (booking.status === "Counteroffer Received" || booking.status === "Awaiting Customer Response") ? booking.counteroffer.newPrice : booking.servicePrice);
    var calc = calculateInvoice(effectivePrice);
    var st = booking.status;
    var stampClass = "stamp-pending";
    var stampLabel = "ESTIMATED / PENDING";
    if (st === "Counteroffer Received" || st === "Awaiting Customer Response") {
      stampClass = "stamp-counteroffer";
      stampLabel = "COUNTEROFFER PENDING";
    } else if (st === "Awaiting Payment") {
      stampClass = "stamp-awaiting";
      stampLabel = "AWAITING PAYMENT";
    } else if (st === "Paid (Demo)") {
      stampClass = "stamp-paid";
      stampLabel = "PAID (DEMO)";
    } else if (st === "Completed") {
      stampClass = "stamp-completed";
      stampLabel = "COMPLETED / PAID";
    } else if (st === "Rejected" || st === "Cancelled") {
      stampClass = "stamp-void";
      stampLabel = "VOID / CANCELLED";
    }

    var issueDate = booking.createdAt ? formatDate(booking.createdAt.slice(0, 10)) : formatDate(booking.date);

    return (
      '<div class="invoice-sheet" id="invoiceSheet">' +
        '<div class="invoice-watermark">' + stampLabel + '</div>' +
        '<div class="invoice-sheet-header">' +
          '<div class="invoice-brand-block">' +
            '<div class="invoice-brand-title">' +
              '<span class="invoice-brand-icon">H</span>' +
              '<span class="invoice-brand-name">HARKAAM</span>' +
            '</div>' +
            '<span class="invoice-brand-sub">Pakistan’s Trusted Service Marketplace Prototype</span>' +
          '</div>' +
          '<div class="invoice-meta-block">' +
            '<div class="invoice-number-title">OFFICIAL RECEIPT / INVOICE</div>' +
            '<div class="invoice-number">' + escapeHtml(inv.invoiceNumber) + '</div>' +
            '<div class="invoice-meta-line"><span>Issue Date:</span> ' + issueDate + '</div>' +
            '<div class="invoice-meta-line"><span>Request ID:</span> <strong>' + escapeHtml(booking.bookingId) + '</strong></div>' +
          '</div>' +
        '</div>' +

        '<div class="invoice-stamp-banner ' + stampClass + '">' +
          '<span class="stamp-text">' + stampLabel + '</span>' +
          (booking.transactionId ? '<span class="stamp-meta">TXN ID: ' + escapeHtml(booking.transactionId) + ' · Method: ' + escapeHtml(booking.paymentMethod || 'Demo') + '</span>' : '') +
        '</div>' +

        '<div class="invoice-parties-grid">' +
          '<div class="party-block">' +
            '<span class="party-heading">BILLED TO (CUSTOMER)</span>' +
            '<strong>' + escapeHtml(booking.customer) + '</strong>' +
            '<span>Phone: ' + escapeHtml(booking.phone) + '</span>' +
            '<span>Location: ' + escapeHtml(booking.city) + ' · ' + escapeHtml(booking.address) + '</span>' +
          '</div>' +
          '<div class="party-block">' +
            '<span class="party-heading">SERVICE PROVIDER</span>' +
            '<strong>' + escapeHtml(booking.providerName) + '</strong>' +
            '<span>Specialization: ' + escapeHtml(booking.providerSkill || booking.service) + '</span>' +
            '<span>Scheduled: ' + formatDate(booking.date) + ' at ' + formatTime(booking.time) + '</span>' +
          '</div>' +
        '</div>' +

        '<div class="invoice-table-wrap">' +
          '<table class="invoice-calc-table">' +
            '<thead>' +
              '<tr>' +
                '<th>Service Item</th>' +
                '<th>Calculation Basis</th>' +
                '<th class="text-right">Amount (PKR)</th>' +
              '</tr>' +
            '</thead>' +
            '<tbody>' +
              '<tr>' +
                '<td>' +
                  '<strong>' + escapeHtml(booking.service) + '</strong>' +
                  (booking.counteroffer && booking.counteroffer.accepted ? '<span class="badge-pill">Agreed via Counteroffer</span>' : '') +
                  (booking.details ? '<small class="table-sub-detail">' + escapeHtml(booking.details) + '</small>' : '') +
                '</td>' +
                '<td>Base Service Rate</td>' +
                '<td class="text-right">' + formatPrice(calc.base) + '</td>' +
              '</tr>' +
              '<tr>' +
                '<td>' +
                  '<strong>HARKAAM Platform Fee</strong>' +
                  '<small class="table-sub-detail">Marketplace facilitation & verification charge</small>' +
                '</td>' +
                '<td>10% of Base</td>' +
                '<td class="text-right">' + formatPrice(calc.platformFee) + '</td>' +
              '</tr>' +
              '<tr>' +
                '<td>' +
                  '<strong>Applicable Tax (Demo)</strong>' +
                  '<small class="table-sub-detail">*Configured demonstration tax rate</small>' +
                '</td>' +
                '<td>5% demo rate</td>' +
                '<td class="text-right">' + formatPrice(calc.tax) + '</td>' +
              '</tr>' +
            '</tbody>' +
            '<tfoot>' +
              '<tr class="total-row">' +
                '<td colspan="2"><strong>Total Amount Payable</strong></td>' +
                '<td class="text-right"><strong class="invoice-grand-total">' + formatPrice(calc.total) + '</strong></td>' +
              '</tr>' +
            '</tfoot>' +
          '</table>' +
        '</div>' +

        '<div class="invoice-notes-block">' +
          '<div class="invoice-disclaimer"><strong>Notice:</strong> Tax is calculated at a fixed 5% demonstration rate for prototype simulation. Platform fee is 10%.</div>' +
          '<div class="invoice-security">Status: <strong>' + escapeHtml(booking.status) + '</strong> · ' + (booking.transactionId ? 'Paid via ' + escapeHtml(booking.paymentMethod) : 'Simulated Record') + '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function openPaymentModal(bookingId) {
    const booking = findBooking(bookingId);
    if (!booking) {
      toast("That demo booking could not be found.", "error");
      return;
    }
    const effectivePrice = booking.counteroffer && booking.counteroffer.accepted ? booking.counteroffer.newPrice : (booking.counteroffer && (booking.status === "Counteroffer Received" || booking.status === "Awaiting Customer Response") ? booking.counteroffer.newPrice : booking.servicePrice);
    const calc = calculateInvoice(effectivePrice);

    openModal(
      '<div class="modal-head"><div><span class="modal-eyebrow">DEMO CHECKOUT</span><h2>Complete Payment</h2></div>' +
        '<button type="button" class="iconbtn" data-action="close-modal" aria-label="Close">' + icon("close") + '</button></div>' +

      '<div class="payment-demo-warning">' +
        icon("alert", 22) +
        '<div><strong>DEMO MODE ONLY: Payment Gateway Not Connected</strong><span>This is a prototype demonstration. DO NOT enter real payment credentials, bank passwords, PINs, OTPs, or real CVVs.</span></div>' +
      '</div>' +

      '<div class="payment-order-summary">' +
        '<div class="summary-line"><span>Service Request:</span><strong>' + escapeHtml(booking.bookingId) + '</strong></div>' +
        '<div class="summary-line"><span>Service & Provider:</span><strong>' + escapeHtml(booking.service) + ' (' + escapeHtml(booking.providerName) + ')</strong></div>' +
        '<div class="summary-line total-line"><span>Total Payable:</span><strong class="pay-amount">' + formatPrice(calc.total) + '</strong></div>' +
      '</div>' +

      '<form id="checkoutPaymentForm" novalidate>' +
        '<input type="hidden" name="bookingId" value="' + escapeHtml(booking.bookingId) + '">' +
        '<input type="hidden" name="totalAmount" value="' + calc.total + '">' +
        '<input type="hidden" id="selectedPaymentMethod" name="paymentMethod" value="Easypaisa">' +

        '<label class="field-label" style="font-weight:600;display:block;margin-bottom:8px;">Choose Payment Option</label>' +
        '<div class="payment-methods-grid">' +
          '<button type="button" class="payment-method-card active" data-action="select-pm" data-method="Easypaisa">' +
            '<span class="pm-badge ep-badge">EP</span>' +
            '<div class="pm-info"><strong>Easypaisa</strong><small>Mobile Wallet</small></div>' +
          '</button>' +
          '<button type="button" class="payment-method-card" data-action="select-pm" data-method="JazzCash">' +
            '<span class="pm-badge jc-badge">JC</span>' +
            '<div class="pm-info"><strong>JazzCash</strong><small>Mobile Account</small></div>' +
          '</button>' +
          '<button type="button" class="payment-method-card" data-action="select-pm" data-method="Debit/Credit Card">' +
            '<span class="pm-badge card-badge">💳</span>' +
            '<div class="pm-info"><strong>Debit / Credit Card</strong><small>Visa / Mastercard</small></div>' +
          '</button>' +
        '</div>' +

        '<div id="walletInputsBlock" class="payment-inputs-block">' +
          '<div class="form-field"><label for="pmWalletPhone">Mobile Account Number</label>' +
            '<input class="field" id="pmWalletPhone" name="walletPhone" inputmode="tel" value="' + escapeHtml(booking.phone || "0300 1234567") + '" placeholder="03XX-XXXXXXX" required>' +
          '</div>' +
          '<div class="form-field"><label for="pmWalletTitle">Account Title</label>' +
            '<input class="field" id="pmWalletTitle" name="walletTitle" value="' + escapeHtml(booking.customer || "Ahmed Raza") + '" placeholder="Account Title" required>' +
          '</div>' +
        '</div>' +

        '<div id="cardInputsBlock" class="payment-inputs-block" style="display:none;">' +
          '<div class="form-field"><label for="pmCardNumber">Card Number</label>' +
            '<input class="field" id="pmCardNumber" name="cardNumber" inputmode="numeric" value="4242 4242 4242 4242" placeholder="4242 •••• •••• 4242">' +
          '</div>' +
          '<div class="form-row-2">' +
            '<div class="form-field"><label for="pmCardExpiry">Expiry Date</label>' +
              '<input class="field" id="pmCardExpiry" name="cardExpiry" placeholder="MM/YY" value="12/28">' +
            '</div>' +
            '<div class="form-field"><label for="pmCardCvv">CVV</label>' +
              '<input class="field" id="pmCardCvv" name="cardCvv" type="password" maxlength="4" placeholder="123" value="123">' +
            '</div>' +
          '</div>' +
          '<div class="form-field"><label for="pmCardHolder">Cardholder Name</label>' +
            '<input class="field" id="pmCardHolder" name="cardHolder" value="' + escapeHtml(booking.customer || "Ahmed Raza") + '" placeholder="Full name on card">' +
          '</div>' +
        '</div>' +

        '<div class="modal-actions">' +
          '<button type="button" class="btn outline" data-action="close-modal">Cancel</button>' +
          '<button type="submit" class="btn primary" id="btnPaySubmit">Pay ' + formatPrice(calc.total) + ' (Demo)</button>' +
        '</div>' +
      '</form>'
    );
  }

  function updateProviderData(provider, patch) {
    const overrides = getProviderOverrides();
    const key = String(provider.id);
    overrides[key] = Object.assign({}, overrides[key] || {}, patch);
    storeSet(KEYS.overrides, overrides);
    if (provider.isApplication) {
      const apps = getProviderApps();
      const index = apps.findIndex((app) => Number(app.id) === Number(provider.id));
      if (index !== -1) {
        apps[index] = Object.assign({}, apps[index], patch);
        storeSet(KEYS.providers, apps);
      }
    }
    buildSearchIndex();
  }

  function clearDemoData() {
    openConfirm({
      title: "Clear all demo data?",
      message: "This removes demo bookings, favorites, customer accounts, provider applications and profile edits from this browser. Your theme preference is kept. This cannot be undone.",
      confirmLabel: "Clear demo data",
      danger: true,
      onConfirm: function () {
        [KEYS.bookings, KEYS.favorites, KEYS.customers, KEYS.providers, KEYS.overrides, KEYS.profile, KEYS.session, KEYS.seq].forEach(storeRemove);
        sessionStorage.removeItem(KEYS.userRole);
        buildSearchIndex();
        updateHeader();
        navigate("#/");
        toast("All HARKAAM demo data has been cleared.", "info");
      }
    });
  }

  function handleAction(action, element, event) {
    switch (action) {
      case "nav-home":
        closeMobileMenu();
        if (parseHash().path === "/") window.scrollTo({ top: 0, behavior: "smooth" });
        else navigate("#/");
        break;
      case "select-seeker-role":
        sessionStorage.setItem(KEYS.userRole, "seeker");
        closeMobileMenu();
        navigate("#/");
        toast("Welcome! Browsing as a service seeker.", "success");
        break;
      case "select-provider-role":
        sessionStorage.setItem(KEYS.userRole, "provider");
        closeMobileMenu();
        navigate("#/");
        toast("Welcome! Continue as a service provider.", "success");
        break;
      case "reset-role":
        sessionStorage.removeItem(KEYS.userRole);
        closeMobileMenu();
        navigate("#/");
        toast("Returning to the landing page.", "info");
        break;
      case "nav-browse":
        closeMobileMenu();
        navigate("#/browse");
        break;
      case "nav-join-provider":
        closeMobileMenu();
        navigate("#/join/provider");
        break;
      case "nav-join-customer":
        closeMobileMenu();
        navigate("#/join/customer");
        break;
      case "nav-how":
        goHomeSection("how");
        break;
      case "nav-about":
        goHomeSection("about");
        break;
      case "toggle-mobile-menu":
        toggleMobileMenu();
        break;
      case "close-mobile-menu":
        closeMobileMenu();
        break;
      case "toggle-theme":
        toggleTheme();
        break;
      case "open-login":
        closeMobileMenu();
        openLogin(element.dataset.tab || "signin");
        break;
      case "login-tab":
        openLogin(element.dataset.tab || "signin");
        break;
      case "go-join-customer":
        closeModal();
        navigate("#/join/customer");
        break;
      case "logout": {
        clearSession();
        closeMobileMenu();
        updateHeader();
        toast("You have been signed out of the local demo account.", "info");
        if (parseHash().path.indexOf("/dashboard") === 0) navigate("#/");
        else refreshView(true);
        break;
      }
      case "demo-customer-login": {
        let profile = getCustomerProfile();
        if (!profile) {
          profile = { name: "Ahmed Raza", phone: "0300 1234567", email: "ahmed.demo@example.com", city: "Karachi", demo: true };
          saveCustomerProfile(profile);
        }
        setSession({ role: "customer", name: profile.name || "Ahmed Raza", demo: true, customerId: "demo_customer" });
        closeModal();
        updateHeader();
        toast("Signed in as Ahmed Raza (customer demo).", "success");
        navigate("#/dashboard/customer");
        break;
      }
      case "apply-search": {
        const input = document.getElementById(element.dataset.input);
        if (!input) break;
        const city = cityFromInput(input);
        if (!input.value.trim() && !city) {
          toast("Type a service, provider or city to search.", "info");
          input.focus();
          break;
        }
        executeSearch(input.value, city);
        break;
      }
      case "apply-search-direct":
        executeSearch(element.dataset.q || "", "");
        break;
      case "use-popular":
        executeSearch(element.dataset.q || "", "");
        break;
      case "use-location":
        useApproximateLocation(element.dataset.input || "heroSearch");
        break;
      case "clear-search-results":
      case "clear-results":
        clearSearchResults();
        break;
      case "clear-context-filter":
        clearContextFilter();
        break;
      case "clear-filters":
        clearFilters();
        break;
      case "open-category":
        navigate("#/category/" + element.dataset.cat);
        break;
      case "set-sub": {
        const params = new URLSearchParams(parseHash().params);
        if (element.dataset.sub) params.set("sub", element.dataset.sub);
        else params.delete("sub");
        setRouteParams(params, true);
        break;
      }
      case "open-service":
        openServiceSearch(element.dataset.cat, element.dataset.sub, element.dataset.q);
        break;
      case "view-provider":
        rememberBack();
        closeMobileMenu();
        navigate("#/provider/" + element.dataset.id);
        break;
      case "book-provider": {
        const params = new URLSearchParams();
        params.set("provider", element.dataset.id || "");
        if (element.dataset.service) params.set("service", element.dataset.service);
        navigate("#/booking?" + params.toString());
        break;
      }
      case "toggle-favorite":
        toggleFavorite(element.dataset.id);
        refreshView(true);
        break;
      case "share-profile":
        shareProfile(element.dataset.id);
        break;
      case "share-category": {
        const url = location.href.split("#")[0] + "#/category/" + element.dataset.cat;
        copyText(url).then(() => toast("Category link copied to clipboard.", "success")).catch(() => window.prompt("Copy this link:", url));
        break;
      }
      case "back-results":
        navigate(backUrl().replace(/^#/, "#"));
        break;
      case "dashboard-tab":
        navigate("#/dashboard/customer?tab=" + element.dataset.tab);
        break;
      case "provider-tab":
        navigate("#/dashboard/provider?tab=" + element.dataset.tab);
        break;
      case "view-booking":
        openBookingModal(element.dataset.id);
        break;
      case "cancel-booking": {
        const bookingId = element.dataset.id;
        openConfirm({
          title: "Cancel this demo booking?",
          message: "The booking status will change to Cancelled. This only updates the demo record in your browser.",
          confirmLabel: "Cancel booking",
          danger: true,
          onConfirm: function () {
            const bookings = getBookings().map((booking) => booking.bookingId === bookingId ? Object.assign({}, booking, { status: "Cancelled" }) : booking);
            saveBookings(bookings);
            toast("Demo booking cancelled.", "info");
            refreshView(true);
          }
        });
        break;
      }
      case "cancel-booking-modal": {
        const bookingId = element.dataset.id;
        const bookings = getBookings().map((booking) => booking.bookingId === bookingId ? Object.assign({}, booking, { status: "Cancelled" }) : booking);
        saveBookings(bookings);
        closeModal();
        toast("Demo booking cancelled.", "info");
        refreshView(true);
        break;
      }
      case "provider-accept": {
        const bookings = getBookings().map((booking) => booking.bookingId === element.dataset.id ? Object.assign({}, booking, { status: "Awaiting Payment" }) : booking);
        saveBookings(bookings);
        toast("Request accepted. Customer has been notified to proceed with payment.", "success");
        refreshView(true);
        break;
      }
      case "provider-decline": {
        const bookings = getBookings().map((booking) => booking.bookingId === element.dataset.id ? Object.assign({}, booking, { status: "Rejected" }) : booking);
        saveBookings(bookings);
        toast("Request rejected. The customer will see the updated status.", "info");
        refreshView(true);
        break;
      }
      case "provider-complete": {
        const bookings = getBookings().map((booking) => booking.bookingId === element.dataset.id ? Object.assign({}, booking, { status: "Completed" }) : booking);
        saveBookings(bookings);
        toast("Service marked as completed.", "success");
        refreshView(true);
        break;
      }
      case "provider-counteroffer":
        openCounterofferModal(element.dataset.id);
        break;
      case "customer-accept-counteroffer": {
        const bookings = getBookings().map((booking) => {
          if (booking.bookingId !== element.dataset.id) return booking;
          var updated = Object.assign({}, booking, { status: "Awaiting Payment" });
          if (booking.counteroffer) {
            updated.servicePrice = booking.counteroffer.newPrice;
            updated.counteroffer = Object.assign({}, booking.counteroffer, { accepted: true });
            if (updated.invoice) {
              var calc = calculateInvoice(booking.counteroffer.newPrice);
              updated.invoice = Object.assign({}, updated.invoice, {
                basePrice: calc.base,
                platformFee: calc.platformFee,
                tax: calc.tax,
                totalAmount: calc.total,
                updatedAt: new Date().toISOString()
              });
            }
          }
          return updated;
        });
        saveBookings(bookings);
        toast("Counteroffer accepted! Updated price applied. Please proceed to payment.", "success");
        refreshView(true);
        break;
      }
      case "customer-reject-counteroffer": {
        const bookings = getBookings().map((booking) => booking.bookingId === element.dataset.id ? Object.assign({}, booking, { status: "Rejected" }) : booking);
        saveBookings(bookings);
        toast("Counteroffer rejected.", "info");
        refreshView(true);
        break;
      }
      case "customer-pay-demo": {
        const bookings = getBookings().map((booking) => booking.bookingId === element.dataset.id ? Object.assign({}, booking, { status: "Paid (Demo)", paymentStatus: "Paid (demo)" }) : booking);
        saveBookings(bookings);
        toast("Demo payment recorded. The provider will be notified to start the service.", "success");
        refreshView(true);
        break;
      }
      case "view-invoice":
        openInvoiceModal(element.dataset.id);
        break;
      case "copy-booking-id":
        copyText(element.dataset.id).then(() => toast("Booking ID copied.", "success")).catch(() => window.prompt("Copy this booking ID:", element.dataset.id));
        break;
      case "close-modal":
        closeModal();
        break;
      case "confirm-modal": {
        const callback = modalOnConfirm;
        closeModal();
        if (typeof callback === "function") callback();
        break;
      }
      case "clear-demo-data":
        clearDemoData();
        break;
      default:
        return false;
    }
    if (event) event.preventDefault();
    return true;
  }

  document.addEventListener("click", (event) => {
    const suggestion = event.target.closest("[data-suggest]");
    if (suggestion) {
      event.preventDefault();
      selectSuggestion(suggestion);
      return;
    }
    const actionElement = event.target.closest("[data-action]");
    if (actionElement) {
      const handled = handleAction(actionElement.dataset.action, actionElement, event);
      if (handled) event.preventDefault();
      return;
    }
    if (!event.target.closest("[data-search-root]")) closeAllSuggestions();
  });

  document.addEventListener("change", (event) => {
    const target = event.target;
    if (["cityFilter", "priceFilter", "ratingFilter", "sortFilter"].indexOf(target.id) !== -1) {
      updateFiltersAndRender();
      return;
    }
    if (target.id === "provCategory") {
      const form = target.closest("form");
      const serviceSelect = form ? form.querySelector("#provService") : document.getElementById("provService");
      const cat = getCategory(target.value);
      if (serviceSelect) {
        serviceSelect.innerHTML = '<option value="">Select a specific service</option>' +
          (cat ? cat.subcategories.map((sub) => '<option value="' + sub.id + '">' + escapeHtml(sub.name) + "</option>").join("") : "");
      }
      fieldError(target.form, "cat", "");
      return;
    }
    if (target.id === "bookingService") {
      updateBookingSummary(target);
    }
  });

  document.addEventListener("input", (event) => {
    if (event.target.classList && event.target.classList.contains("invalid")) {
      event.target.classList.remove("invalid");
      event.target.removeAttribute("aria-invalid");
      const wrap = event.target.closest(".form-field");
      const error = wrap ? wrap.querySelector(".field-error") : null;
      if (error) {
        error.textContent = "";
        error.hidden = true;
      }
    }
  });

  /* ----------------------------------------------------------------------
     12. Forms
     ---------------------------------------------------------------------- */

  function handleBookingSubmit(form) {
    clearFormErrors(form);
    const elements = form.elements;
    const provider = getProvider(elements.providerId.value);
    if (!provider) {
      toast("The selected provider could not be found.", "error");
      return;
    }
    const name = elements.customer.value.trim();
    const phone = elements.phone.value.trim();
    const city = elements.city.value;
    const address = elements.address.value.trim();
    const date = elements.date.value;
    const time = elements.time.value;
    let valid = true;

    if (name.length < 2) { fieldError(form, "customer", "Please enter your full name."); valid = false; }
    if (!validPhone(phone)) { fieldError(form, "phone", "Enter a valid Pakistani mobile number, e.g. 0300 1234567."); valid = false; }
    if (!city) { fieldError(form, "city", "Select your city."); valid = false; }
    if (!address) { fieldError(form, "address", "Enter your full address or area."); valid = false; }
    else if (address.length < 5) { fieldError(form, "address", "Please add a little more detail for the address."); valid = false; }
    if (!date) { fieldError(form, "date", "Choose a preferred date."); valid = false; }
    else if (date < todayISO()) { fieldError(form, "date", "Booking dates cannot be in the past."); valid = false; }
    if (!time) { fieldError(form, "time", "Choose a preferred time."); valid = false; }
    if (!elements.service.value) { fieldError(form, "service", "Choose a service."); valid = false; }

    if (!valid) {
      toast("Please fix the highlighted fields.", "error");
      focusFirstInvalid(form);
      return;
    }

    const service = providerServices(provider).find((item) => item.name === elements.service.value) || providerServices(provider)[0];
    const submit = document.getElementById("bookingSubmit");
    const originalLabel = submit ? submit.innerHTML : "";
    if (submit) {
      submit.disabled = true;
      submit.innerHTML = '<span class="spinner"></span> Saving demo booking…';
    }

    window.setTimeout(() => {
      const booking = {
        bookingId: nextBookingId(),
        providerId: provider.id,
        providerName: provider.name,
        providerSkill: provider.skill,
        service: service.name,
        servicePrice: service.price,
        customer: name,
        phone,
        city,
        address,
        date,
        time,
        details: elements.details.value.trim(),
        instructions: elements.instructions.value.trim(),
        status: "Pending",
        paymentStatus: "Not required (demo)",
        createdAt: new Date().toISOString(),
        demo: true
      };
      booking.invoice = generateInvoiceRecord(booking);
      const bookings = getBookings();
      bookings.unshift(booking);
      const saved = saveBookings(bookings);
      const profile = getCustomerProfile() || {};
      saveCustomerProfile(Object.assign({}, profile, { name, phone, city }));
      if (!saved) {
        if (submit) {
          submit.disabled = false;
          submit.innerHTML = originalLabel;
        }
        return;
      }
      updateHeader();
      toast("Demo booking " + booking.bookingId + " saved.", "success");
      navigate("#/booking/confirmation/" + encodeURIComponent(booking.bookingId));
    }, 420);
  }

  function handleLogin(form) {
    clearFormErrors(form);
    const identifier = form.elements.identifier.value.trim();
    const password = form.elements.password.value;
    if (!identifier) {
      fieldError(form, "identifier", "Enter your mobile number or email.");
      focusFirstInvalid(form);
      return;
    }
    if (!password) {
      fieldError(form, "password", "Enter your demo password.");
      focusFirstInvalid(form);
      return;
    }
    const customers = storeGet(KEYS.customers, []);
    const customer = (Array.isArray(customers) ? customers : []).find((item) => {
      const phoneMatch = digitsOnly(item.phone) === digitsOnly(identifier);
      const emailMatch = item.email && item.email.toLowerCase() === identifier.toLowerCase();
      return (phoneMatch || emailMatch) && item.password === password;
    });
    if (customer) {
      setSession({ role: "customer", name: customer.name, identifier: customer.phone, customerId: customer.id });
      saveCustomerProfile({ name: customer.name, phone: customer.phone, email: customer.email || "", city: customer.city || "" });
      closeModal();
      updateHeader();
      toast("Signed in to your local customer demo account.", "success");
      navigate("#/dashboard/customer");
      return;
    }
    const apps = getProviderApps();
    const provider = apps.find((item) => {
      const phoneMatch = digitsOnly(item.phone) === digitsOnly(identifier);
      const emailMatch = item.email && item.email.toLowerCase() === identifier.toLowerCase();
      return (phoneMatch || emailMatch) && item.password === password;
    });
    if (provider) {
      setSession({ role: "provider", name: provider.name, providerId: provider.id });
      closeModal();
      updateHeader();
      toast("Signed in to your local provider demo account.", "success");
      navigate("#/dashboard/provider");
      return;
    }
    fieldError(form, "identifier", "No matching demo account was found for those details.");
    fieldError(form, "password", "Check your demo password or use the Demo accounts tab.");
    focusFirstInvalid(form);
    toast("Demo sign-in failed. Check your details or use a demo account.", "error");
  }

  function handleCustomerRegister(form) {
    clearFormErrors(form);
    const name = form.elements.name.value.trim();
    const phone = form.elements.phone.value.trim();
    const email = form.elements.email.value.trim();
    const city = form.elements.city.value;
    const password = form.elements.password.value;
    let valid = true;
    if (name.length < 2) { fieldError(form, "name", "Enter your full name."); valid = false; }
    if (!validPhone(phone)) { fieldError(form, "phone", "Enter a valid Pakistani mobile number."); valid = false; }
    if (email && !validEmail(email)) { fieldError(form, "email", "Enter a valid email address or leave it empty."); valid = false; }
    if (!city) { fieldError(form, "city", "Select your city."); valid = false; }
    if (password.length < 4) { fieldError(form, "password", "Use at least 4 characters for this demo password."); valid = false; }
    if (!valid) {
      toast("Please fix the highlighted fields.", "error");
      focusFirstInvalid(form);
      return;
    }
    const customers = storeGet(KEYS.customers, []);
    const list = Array.isArray(customers) ? customers : [];
    const duplicate = list.some((item) => digitsOnly(item.phone) === digitsOnly(phone) || (email && item.email && item.email.toLowerCase() === email.toLowerCase()));
    if (duplicate) {
      fieldError(form, "phone", "A demo account with this number or email already exists.");
      toast("A demo account already exists. Try signing in instead.", "error");
      focusFirstInvalid(form);
      return;
    }
    const customer = {
      id: uid("cust"),
      name, phone, email, city, password,
      createdAt: new Date().toISOString(),
      demo: true
    };
    list.unshift(customer);
    storeSet(KEYS.customers, list);
    saveCustomerProfile({ name, phone, email, city });
    setSession({ role: "customer", name, identifier: phone, customerId: customer.id });
    updateHeader();
    toast("Demo customer account created.", "success");
    navigate("#/dashboard/customer");
  }

  function handleProviderRegister(form) {
    clearFormErrors(form);
    const name = form.elements.name.value.trim();
    const phone = form.elements.phone.value.trim();
    const email = form.elements.email.value.trim();
    const city = form.elements.city.value;
    const catId = form.elements.cat.value;
    const subId = form.elements.sub.value;
    const skill = form.elements.skill.value.trim();
    const exp = Number(form.elements.exp.value);
    const price = Number(form.elements.price.value);
    const area = form.elements.area.value.trim();
    const hours = form.elements.hours.value.trim();
    const languages = splitList(form.elements.languages.value);
    const skills = splitList(form.elements.skills.value);
    const desc = form.elements.desc.value.trim();
    const password = form.elements.password.value;
    let valid = true;

    if (name.length < 2) { fieldError(form, "name", "Enter your full name."); valid = false; }
    if (!validPhone(phone)) { fieldError(form, "phone", "Enter a valid Pakistani mobile number."); valid = false; }
    if (!validEmail(email)) { fieldError(form, "email", "Enter a valid email address."); valid = false; }
    if (!city) { fieldError(form, "city", "Select your city."); valid = false; }
    if (!catId) { fieldError(form, "cat", "Choose a service category."); valid = false; }
    if (!subId) { fieldError(form, "sub", "Choose a specific service."); valid = false; }
    if (!skill) { fieldError(form, "skill", "Add a short service title."); valid = false; }
    if (!Number.isFinite(exp) || exp < 0) { fieldError(form, "exp", "Enter your years of experience."); valid = false; }
    if (!Number.isFinite(price) || price <= 0) { fieldError(form, "price", "Enter a starting price greater than zero."); valid = false; }
    if (!area) { fieldError(form, "area", "Add your working area."); valid = false; }
    if (!skills.length) { fieldError(form, "skills", "Add at least one skill, separated by commas."); valid = false; }
    if (desc.length < 20) { fieldError(form, "desc", "Write at least a short sentence describing your service."); valid = false; }
    if (password.length < 4) { fieldError(form, "password", "Use at least 4 characters for this demo password."); valid = false; }
    if (!valid) {
      toast("Please fix the highlighted fields.", "error");
      focusFirstInvalid(form);
      return;
    }
    const apps = getProviderApps();
    const duplicate = apps.some((item) => digitsOnly(item.phone) === digitsOnly(phone) || (item.email && item.email.toLowerCase() === email.toLowerCase()));
    if (duplicate) {
      fieldError(form, "phone", "A provider application already uses this number or email.");
      toast("A provider application already exists with these details.", "error");
      focusFirstInvalid(form);
      return;
    }
    const app = {
      id: Date.now(),
      name, phone, email, city,
      cat: catId,
      sub: subId,
      skill,
      exp,
      price,
      area,
      hours: hours || "By appointment",
      languages: languages.length ? languages : ["Urdu"],
      skills,
      desc,
      password,
      icon: "🧑‍💼",
      status: "Pending verification",
      availability: "Available this week",
      createdAt: new Date().toISOString(),
      demo: true
    };
    apps.unshift(app);
    storeSet(KEYS.providers, apps);
    buildSearchIndex();
    setSession({ role: "provider", name: app.name, providerId: app.id });
    updateHeader();
    toast("Demo provider profile submitted. Verification is pending.", "success");
    navigate("#/dashboard/provider");
  }

  function handleCustomerSettings(form) {
    clearFormErrors(form);
    const name = form.elements.name.value.trim();
    const phone = form.elements.phone.value.trim();
    const email = form.elements.email.value.trim();
    const city = form.elements.city.value;
    let valid = true;
    if (name.length < 2) { fieldError(form, "name", "Enter your name."); valid = false; }
    if (phone && !validPhone(phone)) { fieldError(form, "phone", "Enter a valid Pakistani mobile number."); valid = false; }
    if (email && !validEmail(email)) { fieldError(form, "email", "Enter a valid email address."); valid = false; }
    if (!valid) {
      toast("Please fix the highlighted fields.", "error");
      focusFirstInvalid(form);
      return;
    }
    const profile = Object.assign({}, getCustomerProfile() || {}, { name, phone, email, city });
    saveCustomerProfile(profile);
    const session = getSession();
    if (session && session.role === "customer") {
      setSession(Object.assign({}, session, { name }));
      if (session.customerId) {
        const customers = storeGet(KEYS.customers, []);
        const list = Array.isArray(customers) ? customers : [];
        const index = list.findIndex((item) => item.id === session.customerId);
        if (index !== -1) {
          list[index] = Object.assign({}, list[index], { name, phone, email, city });
          storeSet(KEYS.customers, list);
        }
      }
    }
    updateHeader();
    toast("Demo profile saved.", "success");
    refreshView(true);
  }

  function handleAvailability(form) {
    clearFormErrors(form);
    const session = getSession();
    const provider = session && session.role === "provider" ? getProvider(session.providerId) : null;
    if (!provider) {
      toast("Sign in as a provider to update availability.", "error");
      return;
    }
    const hours = form.elements.hours.value.trim();
    const area = form.elements.area.value.trim();
    const languages = splitList(form.elements.languages.value);
    let valid = true;
    if (!hours) { fieldError(form, "hours", "Add your working hours."); valid = false; }
    if (!area) { fieldError(form, "area", "Add your working area."); valid = false; }
    if (!languages.length) { fieldError(form, "languages", "Add at least one language."); valid = false; }
    if (!valid) {
      toast("Please fix the highlighted fields.", "error");
      focusFirstInvalid(form);
      return;
    }
    updateProviderData(provider, {
      availability: form.elements.availability.value,
      hours,
      area,
      languages
    });
    toast("Availability updated on your demo profile.", "success");
    refreshView(true);
  }

  function handleProviderEdit(form) {
    clearFormErrors(form);
    const session = getSession();
    const provider = session && session.role === "provider" ? getProvider(session.providerId) : null;
    if (!provider) {
      toast("Sign in as a provider to edit this profile.", "error");
      return;
    }
    const name = form.elements.name.value.trim();
    const skill = form.elements.skill.value.trim();
    const city = form.elements.city.value;
    const area = form.elements.area.value.trim();
    const exp = Number(form.elements.exp.value);
    const price = Number(form.elements.price.value);
    const desc = form.elements.desc.value.trim();
    const skills = splitList(form.elements.skills.value);
    let valid = true;
    if (name.length < 2) { fieldError(form, "name", "Enter your name."); valid = false; }
    if (skill.length < 2) { fieldError(form, "skill", "Add a service title."); valid = false; }
    if (!area) { fieldError(form, "area", "Add your service area."); valid = false; }
    if (!Number.isFinite(exp) || exp < 0) { fieldError(form, "exp", "Enter valid experience."); valid = false; }
    if (!Number.isFinite(price) || price <= 0) { fieldError(form, "price", "Enter a valid starting price."); valid = false; }
    if (desc.length < 20) { fieldError(form, "desc", "Write a slightly longer description."); valid = false; }
    if (!skills.length) { fieldError(form, "skills", "Add at least one skill."); valid = false; }
    if (!valid) {
      toast("Please fix the highlighted fields.", "error");
      focusFirstInvalid(form);
      return;
    }
    updateProviderData(provider, { name, skill, city, area, exp, price, desc, skills });
    setSession(Object.assign({}, session, { name }));
    updateHeader();
    toast("Provider profile updated.", "success");
    refreshView(true);
  }

  document.addEventListener("submit", (event) => {
    const form = event.target;
    const id = form.id;
    if (["bookingForm", "loginForm", "demoProviderForm", "providerGateForm", "customerRegisterForm", "providerRegisterForm", "customerSettingsForm", "availabilityForm", "providerEditForm"].indexOf(id) === -1) return;
    event.preventDefault();
    if (id === "bookingForm") handleBookingSubmit(form);
    else if (id === "loginForm") handleLogin(form);
    else if (id === "demoProviderForm" || id === "providerGateForm") {
      const providerId = form.elements.providerId.value;
      const provider = getProvider(providerId);
      if (!provider) {
        toast("Choose a valid sample provider.", "error");
        return;
      }
      setSession({ role: "provider", name: provider.name, providerId: provider.id });
      closeModal();
      updateHeader();
      toast("Provider demo dashboard opened for " + provider.name + ".", "success");
      navigate("#/dashboard/provider");
    } else if (id === "customerRegisterForm") handleCustomerRegister(form);
    else if (id === "providerRegisterForm") handleProviderRegister(form);
    else if (id === "customerSettingsForm") handleCustomerSettings(form);
    else if (id === "availabilityForm") handleAvailability(form);
    else if (id === "providerEditForm") handleProviderEdit(form);
  });

  /* ----------------------------------------------------------------------
     13. Global modal / keyboard behaviour
     ---------------------------------------------------------------------- */

  const modalRoot = document.getElementById("modalRoot");
  modalRoot.addEventListener("click", (event) => {
    if (event.target.classList.contains("modal-backdrop")) closeModal();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (modalRoot.classList.contains("show")) {
        closeModal();
        return;
      }
      const mobileMenu = document.getElementById("mobileMenu");
      if (mobileMenu && mobileMenu.classList.contains("open")) {
        closeMobileMenu();
        return;
      }
      closeAllSuggestions();
    }
  });

  window.addEventListener("hashchange", () => {
    closeMobileMenu();
    render();
  });

  /* ----------------------------------------------------------------------
     14. Init
     ---------------------------------------------------------------------- */

  applyTheme(storeGet(KEYS.theme, "light") === "dark" ? "dark" : "light");
  buildSearchIndex();
  updateHeader();
  if (!location.hash) history.replaceState(null, "", "#/");
  render();
})();


