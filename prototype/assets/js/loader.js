(function() {
  // ── Inject Loader HTML ──
  const loaderHtml = `
    <div id="lc-global-loader" class="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-md flex flex-col items-center justify-center pointer-events-none opacity-0 transition-opacity duration-300">
      <div class="flex flex-col items-center justify-center space-y-6">
        <div class="relative">
          <img src="../assets/img/logo_a.png" id="lc-loader-logo" alt="Loading..." class="w-24 h-24 relative" />
        </div>
        <div class="text-center animate-pulse">
          <p class="font-inter text-[10px] uppercase tracking-[0.2em] text-white/60">Please wait</p>
        </div>
      </div>
    </div>
    <style>
      @keyframes pause-ping-rotate {
        0%   { transform: scale(1) rotate(0deg); }
        25%  { transform: scale(1) rotate(0deg); }
        50%  { transform: scale(1.15) rotate(0deg); opacity: 0.8; }
        75%  { transform: scale(1) rotate(180deg); }
        100% { transform: scale(1) rotate(360deg); }
      }
      .loading-logo-active {
        animation: pause-ping-rotate 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
      }
    </style>
  `;

  // Inject once DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    const div = document.createElement('div');
    div.innerHTML = loaderHtml;
    document.body.appendChild(div);

    const loader = document.getElementById('lc-global-loader');
    const logo = document.getElementById('lc-loader-logo');

    function showLoader(targetUrl) {
      loader.classList.remove('pointer-events-none');
      loader.classList.add('opacity-100');
      logo.classList.add('loading-logo-active');
      
      // Delay navigation a bit for the animation to be seen
      setTimeout(() => {
        window.location.href = targetUrl;
      }, 1500);
    }

    // Intercept clicks on links
    document.querySelectorAll('a').forEach(link => {
      // Basic check for internal links
      if (link.href && link.href.includes('.html') && !link.target && !link.href.includes('#')) {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          showLoader(link.href);
        });
      }
    });

    // Optionally hide when page is shown from cache
    window.addEventListener('pageshow', () => {
      loader.classList.add('pointer-events-none');
      loader.classList.remove('opacity-100');
      logo.classList.remove('loading-logo-active');
    });
  });
})();
