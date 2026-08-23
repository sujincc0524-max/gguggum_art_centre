/* Renders every list/detail view from window.ggExhibitions / ggArtists /
   ggPublications / ggNews / ggContact.

   Each rendered item/root element carries data-gg-item="<GlobalName>|<id>"
   (or "<GlobalName>|" for the single ggContact object). js/admin.js scans
   for these to attach an edit button when admin mode is on — render.js
   itself has no knowledge of the admin system, it just leaves the hook. */

(function () {
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function nl2br(s) {
    return esc(s).replace(/\n/g, "<br>");
  }

  function paragraphs(list) {
    return (list || []).map(function (p) {
      return "<p>" + esc(p) + "</p>";
    }).join("");
  }

  /* ---------- Exhibitions (cards + detail) ---------- */
  function cardHtml(item) {
    return (
      '<a class="card" href="' + item.href + '" data-gg-item="ggExhibitions|' + item.id + '">' +
      '<div class="card-thumb"><img src="' + item.image + '" alt="' + esc(item.titleKo) + '"></div>' +
      '<p class="card-title">' + esc(item.titleKo) + "</p>" +
      '<p class="card-date">' + esc(item.dateLabel) + "</p>" +
      "</a>"
    );
  }

  function renderGrid(elId, category, limit) {
    var el = document.getElementById(elId);
    if (!el) return;
    var items = window.ggExhibitions.filter(function (i) {
      return i.category === category;
    });
    if (limit) items = items.slice(0, limit);
    el.innerHTML = items.map(cardHtml).join("");
  }

  function renderExhibitionDetail(elId) {
    var el = document.getElementById(elId);
    if (!el) return;
    var params = new URLSearchParams(window.location.search);
    var id = params.get("id");
    var item = (window.ggExhibitions || []).find(function (e) {
      return e.id === id;
    });

    if (!item) {
      el.innerHTML = "<p>전시 정보를 찾을 수 없습니다.</p>";
      return;
    }

    document.title = item.titleKo + " | gguggum art centre";
    var d = item.detail || {};
    el.setAttribute("data-gg-item", "ggExhibitions|" + item.id);
    el.innerHTML =
      '<div class="detail-info">' +
      "<h1>" + esc(item.titleKo) + "</h1>" +
      (d.titleEn || item.titleEn ? '<p class="en-title">' + esc(d.titleEn || item.titleEn) + "</p>" : "") +
      '<p class="detail-sub">' + nl2br(d.sub) + "</p>" +
      '<p class="detail-date">' + esc(d.date) + "</p>" +
      '<div class="detail-body">' + nl2br(d.body) + "</div>" +
      "</div>" +
      '<div class="detail-poster">' +
      '<img src="' + item.image + '" alt="' + esc(item.titleKo) + '">' +
      "</div>";
  }

  /* ---------- Artists (list + detail) ---------- */
  var ARTIST_ROWS_PER_COLUMN = 11;

  function artistRowHtml(artist) {
    if (!artist.id) {
      return '<span class="artist-row placeholder">Artist Name (아티스트 이름)</span>';
    }
    // Wrapped so a per-row photo slot (used on phone-width screens, where
    // tapping a name shows that artist's photo directly beneath it instead
    // of in the shared lead-photo panel) can sit right under the name.
    return (
      '<div class="artist-row-wrap">' +
      '<a class="artist-row" href="artist-detail.html?id=' + artist.id + '" data-gg-item="ggArtists|' + artist.id + '" data-artist-id="' + artist.id + '">' +
      esc(artist.name) +
      "</a>" +
      '<div class="artist-row-photo" data-photo-for="' + artist.id + '"></div>' +
      "</div>"
    );
  }

  function applyArtistListLayout(el) {
    var isPhone = window.matchMedia("(max-width: 480px)").matches;
    if (isPhone) {
      el.style.gridTemplateColumns = "1fr";
      el.style.gridAutoFlow = "row";
      el.style.gridTemplateRows = "none";
    } else {
      el.style.gridTemplateColumns = "1fr 1fr";
      el.style.gridAutoFlow = "column";
      el.style.gridTemplateRows = "repeat(" + ARTIST_ROWS_PER_COLUMN + ", auto)";
    }
  }

  function renderArtistList(elId) {
    var el = document.getElementById(elId);
    if (!el) return;
    var artists = window.ggArtists || [];
    el.innerHTML = artists.map(artistRowHtml).join("");
    applyArtistListLayout(el);
    window.addEventListener("resize", function () {
      applyArtistListLayout(el);
    });
  }

  function renderArtistDetail(elId) {
    var el = document.getElementById(elId);
    if (!el) return;
    var params = new URLSearchParams(window.location.search);
    var id = params.get("id");
    var artist = (window.ggArtists || []).find(function (a) {
      return a.id === id;
    });

    if (!artist) {
      el.innerHTML = "<p>아티스트 정보를 찾을 수 없습니다.</p>";
      return;
    }

    document.title = artist.name + " | gguggum art centre";
    el.setAttribute("data-gg-item", "ggArtists|" + artist.id);
    el.innerHTML =
      '<div class="detail-info">' +
      "<h1>" + esc(artist.name).toUpperCase() + "</h1>" +
      '<div class="artist-bio">' +
      (artist.bio && artist.bio.length ? paragraphs(artist.bio) : "<p>소개글을 준비 중입니다.</p>") +
      "</div>" +
      "</div>" +
      '<div class="detail-poster artist-photo">' +
      (artist.photo ? '<img src="' + artist.photo + '" alt="' + esc(artist.name) + '">' : "") +
      "</div>";
  }

  /* ---------- Publications ---------- */
  function pubRowHtml(pub) {
    return (
      '<div class="pub-row" data-gg-item="ggPublications|' + pub.id + '">' +
      '<div class="pub-thumb"><img src="' + pub.cover + '" alt="' + esc(pub.title) + '"></div>' +
      '<div class="pub-info">' +
      '<h3 class="pub-title">' + esc(pub.title) + "</h3>" +
      '<p class="pub-publisher">' + esc(pub.publisher) + "</p>" +
      '<div class="pub-meta">' +
      "<p>SIZE : " + esc(pub.size) + "</p>" +
      "<p>" + esc(pub.pages) + " PAGES</p>" +
      "<p>@" + esc(pub.year) + "</p>" +
      "</div>" +
      '<p class="pub-price">PRICE :' + esc(pub.price) + "</p>" +
      '<a class="pub-purchase" href="' + esc(pub.link) + '" target="_blank" rel="noopener">PURCHASE ' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>' +
      "</a>" +
      "</div>" +
      "</div>"
    );
  }

  function renderPublications(elId) {
    var el = document.getElementById(elId);
    if (!el) return;
    var pubs = window.ggPublications || [];
    el.innerHTML = pubs.map(pubRowHtml).join("");
  }

  /* ---------- News (list + detail) ---------- */
  function newsCardHtml(item) {
    return (
      '<a class="news-card" href="news-detail.html?id=' + item.id + '" data-gg-item="ggNews|' + item.id + '">' +
      '<div class="news-thumb"><img src="' + item.banner + '" alt="' + esc(item.title) + '"></div>' +
      '<p class="news-title">' + esc(item.title) + "</p>" +
      '<p class="news-date">' + esc(item.dateLabel) + "</p>" +
      "</a>"
    );
  }

  function renderNewsList(elId, category) {
    var el = document.getElementById(elId);
    if (!el) return;
    var items = (window.ggNews || [])
      .filter(function (n) {
        return n.category === category;
      })
      .sort(function (a, b) {
        return a.date < b.date ? 1 : a.date > b.date ? -1 : 0;
      });
    el.innerHTML = items.length
      ? items.map(newsCardHtml).join("")
      : '<p class="news-empty">준비 중입니다.</p>';
  }

  function renderNewsDetail(bannerElId, elId) {
    var bannerEl = document.getElementById(bannerElId);
    var el = document.getElementById(elId);
    if (!el) return;
    var params = new URLSearchParams(window.location.search);
    var id = params.get("id");
    var item = (window.ggNews || []).find(function (n) {
      return n.id === id;
    });

    if (!item) {
      el.innerHTML = "<p>게시물을 찾을 수 없습니다.</p>";
      return;
    }

    document.title = item.title + " | gguggum art centre";
    if (bannerEl) {
      bannerEl.innerHTML = '<img src="' + item.banner + '" alt="' + esc(item.title) + '">';
      bannerEl.setAttribute("data-gg-item", "ggNews|" + item.id);
    }
    el.setAttribute("data-gg-item", "ggNews|" + item.id);
    el.innerHTML =
      '<div class="news-detail-info">' +
      "<h1>" + esc(item.title) + "</h1>" +
      '<a class="news-orig-link" href="' + esc(item.link) + '" target="_blank" rel="noopener">ORIGINAL LINK ' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>' +
      "</a>" +
      "</div>" +
      '<div class="news-detail-body">' + paragraphs(item.body) + "</div>";
  }

  /* ---------- Contact ---------- */
  function renderContact(ids) {
    var c = window.ggContact;
    if (!c) return;
    ids = ids || {};

    if (ids.address) {
      var el = document.getElementById(ids.address);
      if (el) el.innerHTML = (c.address || []).map(esc).join("<br>");
    }
    if (ids.tel) {
      var elTel = document.getElementById(ids.tel);
      if (elTel) elTel.textContent = c.tel;
    }
    if (ids.email) {
      var elEmail = document.getElementById(ids.email);
      if (elEmail) {
        elEmail.textContent = String(c.email).toUpperCase();
        elEmail.setAttribute("href", "mailto:" + c.email);
      }
    }
    if (ids.hours) {
      var elHours = document.getElementById(ids.hours);
      if (elHours) elHours.innerHTML = (c.hours || []).map(esc).join("<br>");
    }
    if (ids.photo) {
      var elPhoto = document.getElementById(ids.photo);
      if (elPhoto) elPhoto.setAttribute("src", c.photo);
    }
    if (ids.introKo) {
      var elIntroKo = document.getElementById(ids.introKo);
      if (elIntroKo) elIntroKo.innerHTML = nl2br(c.introKo);
    }
    if (ids.introEn) {
      var elIntroEn = document.getElementById(ids.introEn);
      if (elIntroEn) elIntroEn.innerHTML = nl2br(c.introEn);
    }
    if (ids.root) {
      var elRoot = document.getElementById(ids.root);
      if (elRoot) elRoot.setAttribute("data-gg-item", "ggContact|");
    }
  }

  window.ggRender = {
    renderGrid: renderGrid,
    renderExhibitionDetail: renderExhibitionDetail,
    renderArtistList: renderArtistList,
    renderArtistDetail: renderArtistDetail,
    renderPublications: renderPublications,
    renderNewsList: renderNewsList,
    renderNewsDetail: renderNewsDetail,
    renderContact: renderContact
  };
})();
