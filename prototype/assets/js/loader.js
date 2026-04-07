(function() {
  // ── CSS & HTML for Zero-Flicker Loader ──
  const style = `
    #lc-global-loader {
      position: fixed; inset: 0; z-index: 9999; 
      background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      transition: opacity 0.3s ease; opacity: 1;
    }
    .loading-logo-active {
      animation: pause-ping-rotate 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
    }
    @keyframes pause-ping-rotate {
      0%   { transform: scale(1) rotate(0deg); }
      25%  { transform: scale(1) rotate(0deg); }
      50%  { transform: scale(1.15) rotate(0deg); opacity: 0.8; }
      75%  { transform: scale(1) rotate(180deg); }
      100% { transform: scale(1) rotate(360deg); }
    }
    .loader-hidden { opacity: 0 !important; pointer-events: none !important; }
  `;

  const html = `
    <div id="lc-global-loader">
      <div class="flex flex-col items-center justify-center" style="gap: 1.5rem; display: flex; flex-direction: column; align-items: center;">
        <img src="../assets/img/logo_a.png" id="lc-loader-logo" class="loading-logo-active" style="width: 6rem; height: 6rem;" />
        <p style="font-family: sans-serif; font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; color: rgba(255,255,255,0.6); animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;">Please wait</p>
      </div>
    </div>
    <style>@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }</style>
  `;

  // Bypass on Splash or referrers that shouldn't show it
  const isSplashTransition = document.referrer.includes('splash.html');
  const isSplashItself = window.location.href.includes('splash.html');

  if (!isSplashTransition && !isSplashItself) {
    // We use document.write here intentionally to inject the loader 
    // before the rest of the body finishes parsing, preventing white flicker.
    document.write(`<style>${style}</style>${html}`);
  }

  // Finalize behavior
  window.addEventListener('load', () => {
    const loader = document.getElementById('lc-global-loader');
    if (loader) {
      setTimeout(() => {
        loader.classList.add('loader-hidden');
      }, 150);
    }
  });

  // Intercept subsequent clicks
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a').forEach(link => {
      if (link.href && link.href.includes('.html') && !link.target && !link.href.includes('#')) {
        link.addEventListener('click', (e) => {
          if (link.href === window.location.href) return;
          e.preventDefault();
          const loader = document.getElementById('lc-global-loader');
          if (loader) loader.classList.remove('loader-hidden');
          setTimeout(() => { window.location.href = link.href; }, 120);
        });
      }
    });
  });
})();
