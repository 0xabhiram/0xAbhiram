(function () {
  var clock = document.getElementById('clock');
  function tick() {
    if (!clock) return;
    clock.textContent = new Date().toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata', hour12: false,
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  }
  tick();
  setInterval(tick, 1000);
})();

(function () {
  var bar = document.getElementById('bar');
  var dots = document.querySelectorAll('.rail__dots a');
  var ids = ['brief','surface','mandate','method','logs','record','marks','operator','channel'];
  function onScroll() {
    var max = document.documentElement.scrollHeight - innerHeight;
    var p = max > 0 ? scrollY / max : 0;
    if (bar) bar.style.width = (p * 100) + '%';
    var y = scrollY + innerHeight * 0.35;
    var current = ids[0];
    ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (el && el.offsetTop <= y) current = id;
    });
    dots.forEach(function (a) {
      a.classList.toggle('is-on', a.getAttribute('data-sec') === current);
    });
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

(function () {
  document.querySelectorAll('.stat b[data-t]').forEach(function (el) {
    var target = +el.dataset.t, v = 0, step = Math.max(1, Math.ceil(target / 48));
    var t = setInterval(function () {
      v = Math.min(v + step, target);
      el.textContent = v;
      if (v >= target) clearInterval(t);
    }, 24);
  });
})();

(function () {
  var el = document.getElementById('s3');
  if (!el) return;
  function anim(n) {
    var v = 0, step = Math.max(8, Math.ceil(n / 50));
    var t = setInterval(function () {
      v = Math.min(v + step, n);
      el.textContent = v;
      if (v >= n) clearInterval(t);
    }, 18);
  }
  fetch('https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json')
    .then(function (r) { if (!r.ok) throw 0; return r.json(); })
    .then(function (d) { anim((d.vulnerabilities || []).length || 1270); })
    .catch(function () { anim(1270); });
})();

(function () {
  var host = location.host || '0xabhiram.netlify.app';
  var proto = location.protocol.replace(':', '') || 'https';
  var rows = [
    ['Origin', host],
    ['Scheme', proto.toUpperCase()],
    ['Viewport', innerWidth + ' × ' + innerHeight],
    ['Language', navigator.language || '—'],
    ['Timezone', Intl.DateTimeFormat().resolvedOptions().timeZone || '—'],
    ['Cookies', navigator.cookieEnabled ? 'ENABLED' : 'BLOCKED'],
    ['Referrer', document.referrer ? new URL(document.referrer).host : 'DIRECT'],
    ['Online', navigator.onLine ? 'YES' : 'NO'],
    ['Cores', navigator.hardwareConcurrency || '—'],
    ['Device memory', (navigator.deviceMemory ? navigator.deviceMemory + ' GB' : 'OPAQUE')]
  ];
  var root = document.getElementById('surfaceList');
  if (!root) return;
  rows.forEach(function (r) {
    var dt = document.createElement('div');
    dt.className = 'kv';
    dt.innerHTML = '<dt>' + r[0] + '</dt><dd>' + r[1] + '</dd>';
    root.appendChild(dt);
  });
})();

(function () {
  var box = document.getElementById('logList');
  if (!box) return;
  var base = 'https://0xabhiram-blogs.vercel.app';
  var feeds = [base + '/rss.xml', base + '/feed.xml', base + '/atom.xml', base + '/feed', base + '/rss'];
  var i = 0;
  function render(items) {
    if (!items.length) return;
    box.innerHTML = items.map(function (it, n) {
      var idx = String(n + 1).padStart(2, '0');
      return '<a class="log" href="' + it.href + '" target="_blank" rel="noopener">' +
        '<div class="lid">LOG ' + idx + '</div>' +
        '<div><h3>' + it.title + '</h3><p>' + it.meta + '</p></div>' +
        '<div class="go">READ →</div></a>';
    }).join('');
  }
  function tryFeed() {
    if (i >= feeds.length) return;
    fetch(feeds[i++])
      .then(function (r) { if (!r.ok) throw 0; return r.text(); })
      .then(function (xml) {
        var doc = new DOMParser().parseFromString(xml, 'text/xml');
        var nodes = doc.querySelectorAll('item, entry');
        if (!nodes.length) throw 0;
        function esc(s) {
          return String(s).replace(/[&<>"']/g, function (ch) {
            return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch];
          });
        }
        var items = [];
        nodes.forEach(function (node) {
          if (items.length >= 4) return;
          var title = ((node.querySelector('title') || {}).textContent || '').trim();
          var link = node.querySelector('link');
          var href = (link && (link.textContent || link.getAttribute('href'))) || base;
          if (!title) return;
          items.push({ title: esc(title), href: esc(href.trim()), meta: 'Field note · 0xAbhiram' });
        });
        if (!items.length) throw 0;
        render(items);
      })
      .catch(tryFeed);
  }
  tryFeed();
})();

(function () {
  var c = document.getElementById('graph');
  if (!c || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var x = c.getContext('2d'), W, H, t = 0;
  var nodes = [
    { l: 'IDENTITY', a: 0 },
    { l: 'SESSION', a: 1 },
    { l: 'API', a: 2 },
    { l: 'CLOUD IAM', a: 3 },
    { l: 'MODEL', a: 4 },
    { l: 'DATA', a: 5 }
  ];
  function rsz() { W = c.width = innerWidth; H = c.height = innerHeight; }
  rsz();
  addEventListener('resize', rsz);
  function frame() {
    t += 0.004;
    x.clearRect(0, 0, W, H);
    var cx = W * 0.72, cy = H * 0.48, R = Math.min(W, H) * 0.22;
    var pts = nodes.map(function (n, i) {
      var ang = t + (Math.PI * 2 * i) / nodes.length;
      return { x: cx + Math.cos(ang) * R, y: cy + Math.sin(ang) * R * 0.72, l: n.l };
    });
    x.strokeStyle = 'rgba(212,18,36,0.14)';
    x.lineWidth = 1;
    pts.forEach(function (p, i) {
      var q = pts[(i + 2) % pts.length];
      x.beginPath(); x.moveTo(p.x, p.y); x.lineTo(q.x, q.y); x.stroke();
    });
    pts.forEach(function (p) {
      x.beginPath(); x.arc(p.x, p.y, 3, 0, Math.PI * 2);
      x.fillStyle = 'rgba(212,18,36,0.85)'; x.fill();
      x.font = '10px "IBM Plex Mono", monospace';
      x.fillStyle = 'rgba(243,236,228,0.28)';
      x.fillText(p.l, p.x + 8, p.y + 3);
    });
    requestAnimationFrame(frame);
  }
  frame();
})();
