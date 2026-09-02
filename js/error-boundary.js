/* =============================================
   SPARKCHARGE - Error boundary / 404 detector
   If the current URL path isn't a known page,
   redirect to the 404 error page.
   ============================================= */

(function () {
  var KNOWN = [
    'index.html', 'login.html', 'signup.html', 'dashboard.html',
    'charging.html', 'stations.html', 'payments.html', 'upgrade.html',
    'profile.html', 'error.html', 'features.html', 'how-it-works.html',
    'pricing.html', 'testimonials.html', 'get-started.html'
  ];

  try {
    var path = (window.location.pathname || '').split('/');
    var page = path[path.length - 1] || '';

    // Ignore dev-server index fallbacks and empty paths
    if (!page || page === 'index.html' || page === '/') return;
    if (page.indexOf('.html') === -1 && page !== '') return; // not a direct html request

    if (KNOWN.indexOf(page) === -1) {
      window.location.replace('error.html');
    }
  } catch (e) {
    /* never block a page from rendering because of the detector */
  }
})();