/* Shared header / footer renderer for gguggum art centre static site.
   Works from file:// (no fetch), so pages stay portable. */

(function () {
  var NAV_ITEMS = [
    { key: "exhibitions", label: "EXHIBITIONS", href: "index.html" },
    { key: "artists", label: "ARTISTS", href: "artists.html" },
    { key: "publications", label: "PUBLICATIONS", href: "publications.html" },
    { key: "news", label: "NEWS", href: "news.html" },
    { key: "kuca", label: "KUCA", href: null },
    { key: "contact", label: "CONTACT", href: "contact.html" }
  ];

  function renderHeader(active) {
    var navHtml = NAV_ITEMS.map(function (item) {
      var isActive = item.key === active;
      if (item.href) {
        return (
          '<a href="' + item.href + '" class="' + (isActive ? "active" : "") + '">' +
          item.label +
          "</a>"
        );
      }
      // No page built yet for this section — render as inactive, non-navigating label
      return '<span class="' + (isActive ? "active" : "") + '">' + item.label + "</span>";
    }).join("");

    return (
      '<div class="wrap">' +
      '<header class="site-header">' +
      '<a class="logo" href="index.html"><img src="img/logo.png" alt="gguggum art centre"></a>' +
      '<nav class="main-nav">' + navHtml + "</nav>" +
      "</header>" +
      "</div>"
    );
  }

  function renderFooter() {
    return (
      '<div class="wrap">' +
      '<footer class="site-footer">' +
      '<div class="footer-left">' +
      '<span class="footer-name">gguggum art centre</span>' +
      '<span class="gg-admin-bar" id="gg-admin-toggle"></span>' +
      "</div>" +
      '<div class="social-icons">' +
      '<a href="https://www.facebook.com/sungtae.jung.52" target="_blank" rel="noopener" aria-label="Facebook"><svg viewBox="0 0 24 24"><path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94Z"/></svg></a>' +
      '<a href="https://www.instagram.com/gguggumart/" target="_blank" rel="noopener" aria-label="Instagram"><svg viewBox="0 0 24 24"><path d="M12 2c2.72 0 3.06.01 4.12.06 1.06.05 1.79.22 2.43.47.66.26 1.22.6 1.77 1.16.56.55.9 1.11 1.16 1.77.25.64.42 1.37.47 2.43C21.99 8.94 22 9.28 22 12s-.01 3.06-.06 4.12c-.05 1.06-.22 1.79-.47 2.43a4.9 4.9 0 0 1-1.16 1.77 4.9 4.9 0 0 1-1.77 1.16c-.64.25-1.37.42-2.43.47C15.06 21.99 14.72 22 12 22s-3.06-.01-4.12-.06c-1.06-.05-1.79-.22-2.43-.47a4.9 4.9 0 0 1-1.77-1.16 4.9 4.9 0 0 1-1.16-1.77c-.25-.64-.42-1.37-.47-2.43C2.01 15.06 2 14.72 2 12s.01-3.06.06-4.12c.05-1.06.22-1.79.47-2.43.26-.66.6-1.22 1.16-1.77a4.9 4.9 0 0 1 1.77-1.16c.64-.25 1.37-.42 2.43-.47C8.94 2.01 9.28 2 12 2Zm0 1.8c-2.67 0-2.99.01-4.04.06-.87.04-1.34.18-1.65.3-.42.16-.71.36-1.02.67-.31.31-.51.6-.67 1.02-.12.31-.26.78-.3 1.65C4.27 8.71 4.26 9.03 4.26 12c0 2.97.01 3.29.06 4.5.04.87.18 1.34.3 1.65.16.42.36.71.67 1.02.31.31.6.51 1.02.67.31.12.78.26 1.65.3 1.05.05 1.37.06 4.04.06s2.99-.01 4.04-.06c.87-.04 1.34-.18 1.65-.3.42-.16.71-.36 1.02-.67.31-.31.51-.6.67-1.02.12-.31.26-.78.3-1.65.05-1.21.06-1.53.06-4.5s-.01-3.29-.06-4.5c-.04-.87-.18-1.34-.3-1.65a2.7 2.7 0 0 0-.67-1.02 2.7 2.7 0 0 0-1.02-.67c-.31-.12-.78-.26-1.65-.3C14.99 3.81 14.67 3.8 12 3.8Zm0 3.05a5.15 5.15 0 1 1 0 10.3 5.15 5.15 0 0 1 0-10.3Zm0 1.8a3.35 3.35 0 1 0 0 6.7 3.35 3.35 0 0 0 0-6.7Zm5.35-1.98a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0Z"/></svg></a>' +
      "</div>" +
      "</footer>" +
      "</div>"
    );
  }

  window.ggSite = {
    mount: function (activeNav) {
      var headerEl = document.getElementById("site-header");
      var footerEl = document.getElementById("site-footer");
      if (headerEl) headerEl.innerHTML = renderHeader(activeNav);
      if (footerEl) footerEl.innerHTML = renderFooter();
    }
  };
})();
