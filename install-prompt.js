// KPL Hub install banner. Self-contained: injects its own banner, needs no changes to the page's CSS.
// Shows once after a few seconds, on phones only, never when already installed,
// and stays away for 7 days after the person closes it.
(function () {
  var KEY = 'kpl_install_dismissed';
  var DAYS = 7;
  var DELAY_MS = 6000;

  function isInstalled() {
    return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
           window.navigator.standalone === true;
  }
  function recentlyDismissed() {
    try {
      var t = parseInt(localStorage.getItem(KEY), 10);
      return !!t && (Date.now() - t) < DAYS * 86400000;
    } catch (e) { return false; }
  }
  function rememberDismissed() {
    try { localStorage.setItem(KEY, String(Date.now())); } catch (e) {}
  }

  if (isInstalled() || recentlyDismissed()) return;

  var ua = navigator.userAgent || '';
  var isIOS = /iPad|iPhone|iPod/.test(ua);
  var isAndroid = /Android/.test(ua);
  if (!isIOS && !isAndroid) return;

  var deferredPrompt = null;
  var bar = null;

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
  });
  window.addEventListener('appinstalled', hide);

  function hide() {
    if (bar && bar.parentNode) bar.parentNode.removeChild(bar);
    bar = null;
  }

  function show(message, buttonLabel, onButton) {
    if (bar) return;
    bar = document.createElement('div');
    bar.setAttribute('role', 'dialog');
    bar.setAttribute('aria-label', 'Install KPL Hub');
    bar.style.cssText = 'position:fixed;left:12px;right:12px;bottom:calc(12px + env(safe-area-inset-bottom,0px));' +
      'z-index:2147483000;display:flex;align-items:center;gap:12px;padding:14px 16px;border-radius:14px;' +
      'background:#12141C;color:#fff;border:1px solid #232735;box-shadow:0 12px 30px rgba(0,0,0,.5);' +
      'font:600 14px/1.35 -apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif;';

    var text = document.createElement('span');
    text.style.cssText = 'flex:1;';
    text.textContent = message;
    bar.appendChild(text);

    if (buttonLabel) {
      var btn = document.createElement('button');
      btn.textContent = buttonLabel;
      btn.style.cssText = 'background:#E31B23;color:#fff;border:0;border-radius:8px;padding:10px 16px;' +
        'font:700 14px inherit;font-family:inherit;cursor:pointer;';
      btn.addEventListener('click', onButton);
      bar.appendChild(btn);
    }

    var close = document.createElement('button');
    close.textContent = '\u00D7';
    close.setAttribute('aria-label', 'Close');
    close.style.cssText = 'background:none;border:0;color:#8F96A8;font-size:24px;line-height:1;cursor:pointer;padding:0 4px;';
    close.addEventListener('click', function () { rememberDismissed(); hide(); });
    bar.appendChild(close);

    document.body.appendChild(bar);
  }

  setTimeout(function () {
    if (isInstalled()) return;
    if (deferredPrompt) {
      show('Install KPL Hub for one-tap access to fixtures and results.', 'Install', function () {
        var p = deferredPrompt;
        deferredPrompt = null;
        hide();
        p.prompt();
        if (p.userChoice) {
          p.userChoice.then(function (choice) {
            if (!choice || choice.outcome !== 'accepted') rememberDismissed();
          });
        }
      });
    } else if (isIOS) {
      show('To install KPL Hub: tap the Share button, then "Add to Home Screen".');
    } else {
      show('To add KPL Hub to your home screen: tap the \u22EE menu, then "Add to Home screen".');
    }
  }, DELAY_MS);
})();
