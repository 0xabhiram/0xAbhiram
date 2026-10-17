(function () {
  'use strict';

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

  var bar = document.getElementById('bar');
  function onScroll() {
    var max = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.width = ((max > 0 ? scrollY / max : 0) * 100) + '%';
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) e.target.classList.add('in');
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

  document.querySelectorAll('.stat-n[data-t]').forEach(function (el) {
    var target = +el.dataset.t, v = 0, step = Math.max(1, Math.ceil(target / 46));
    var t = setInterval(function () {
      v = Math.min(v + step, target);
      el.textContent = v;
      if (v >= target) clearInterval(t);
    }, 24);
  });

  (function kev() {
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

  (function surface() {
    var local = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
    var host = local ? '0xabhiram.netlify.app' : (location.host || '0xabhiram.netlify.app');
    var scheme = local ? 'HTTPS' : (location.protocol || 'https:').replace(':', '').toUpperCase();
    var rows = [
      ['Origin', host],
      ['Scheme', scheme],
      ['Viewport', innerWidth + ' × ' + innerHeight],
      ['Language', navigator.language || '-'],
      ['Timezone', Intl.DateTimeFormat().resolvedOptions().timeZone || '-'],
      ['Cookies', navigator.cookieEnabled ? 'ENABLED' : 'BLOCKED'],
      ['Referrer', document.referrer ? new URL(document.referrer).host : 'DIRECT'],
      ['Cores', String(navigator.hardwareConcurrency || '-')]
    ];
    var root = document.getElementById('surfaceList');
    if (!root) return;
    rows.forEach(function (r) {
      var wrap = document.createElement('div');
      var dt = document.createElement('dt');
      var dd = document.createElement('dd');
      dt.textContent = r[0];
      dd.textContent = r[1];
      wrap.appendChild(dt);
      wrap.appendChild(dd);
      root.appendChild(wrap);
    });
  })();

  (function logs() {
    var box = document.getElementById('logList');
    if (!box) return;
    var base = 'https://0xabhiram-blogs.vercel.app';
    var feeds = [base + '/rss.xml', base + '/feed.xml', base + '/atom.xml'];
    var i = 0;
    function esc(s) {
      return String(s).replace(/[&<>"']/g, function (ch) {
        return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch];
      });
    }
    function tryFeed() {
      if (i >= feeds.length) return;
      fetch(feeds[i++])
        .then(function (r) { if (!r.ok) throw 0; return r.text(); })
        .then(function (xml) {
          var doc = new DOMParser().parseFromString(xml, 'text/xml');
          var nodes = doc.querySelectorAll('item, entry');
          if (!nodes.length) throw 0;
          var html = '';
          nodes.forEach(function (node, n) {
            if (n > 3) return;
            var title = ((node.querySelector('title') || {}).textContent || '').trim();
            var link = node.querySelector('link');
            var href = (link && (link.textContent || link.getAttribute('href'))) || base;
            if (!title) return;
            html += '<a class="log" href="' + esc(href.trim()) + '" target="_blank" rel="noopener">' +
              '<div class="lid">LOG ' + String(n + 1).padStart(2, '0') + '</div>' +
              '<div><h3>' + esc(title) + '</h3><p>Field note · 0xAbhiram</p></div>' +
              '<div class="go">READ →</div></a>';
          });
          if (!html) throw 0;
          box.innerHTML = html;
        })
        .catch(tryFeed);
    }
    tryFeed();
  })();

  (function field() {
    var canvas = document.getElementById('field');
    if (!canvas || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var ctx = canvas.getContext('2d');
    var W, H, dpr, lines = [], hex = [], yOff = 0, hexOff = 0, tickN = 0, t = 0;
    var locks = [], hosts = [], rain = [], glyphs = [], splashes = [];
    var typed = 0, lastText = '';
    var hitRe = /IDOR|SSRF|SQLi|CVE|public|alg=none|critical|secret|prompt|0\.0\.0\.0/i;
    var pool = [
      '445/tcp  open   microsoft-ds',
      '22/tcp   open   ssh',
      '443/tcp  open   https',
      'GET /api/v1/users/118  →  200',
      'GET /admin  →  403',
      'POST /oauth/token  →  401',
      'IDOR  /invoices/4091  unauth read',
      'SSRF  http://169.254.169.254/latest/meta-data',
      'XSS   /search?q=<svg onload=alert(1)>',
      'SQLi  id=1 UNION SELECT 1,2,3--',
      'AWS   s3://exotel-uploads  ACL=public-read',
      'IAM   *:* on ci-deploy-role',
      'JWT   alg=none accepted',
      'CORS  Access-Control-Allow-Origin: *',
      'AUTO  leaver playbook  privilege revoked',
      'CVE-2021-44228  log4j  JNDI',
      'CVE-2023-44487  HTTP/2 rapid reset',
      'NMAP  10.0.4.0/24  18 hosts up',
      'SMB   \\10.0.4.12\\C$  guest',
      'KERB  AS-REP roast  svc_backup',
      'FILE  /etc/passwd  readable',
      'REDIR  //evil.test  open redirect',
      'CTEM  attack path  identity → s3 → data',
      'BURP  collaborator hit  3 callbacks',
      'HEAD  X-Frame-Options missing',
      'COOKIE  session  HttpOnly=0  Secure=0',
      'GRAPH  user.role  IDOR write',
      'CLOUD  0.0.0.0/0  on 27017',
      'AI     CTEM  identity → cloud → data',
      'MODEL  prompt inject  tool=shell'
    ];
    var hexPool = [
      '7f 45 4c 46 02 01 01 00',
      '00 00 00 00 00 00 00 00',
      '48 89 e5 48 83 ec 20',
      'e8 3f 12 00 00 85 c0',
      '0a 00 04 0c 1b 39 00 50',
      'GET /latest/meta-data',
      'AKIA****************',
      'eyJhbGciOiJub25lIn0',
      '16 03 03 00 2f 02 00',
      'FF 53 4D 42 72 00 00'
    ];
    var hostPool = [
      ['10.0.4.12', 'OPEN'],
      ['10.0.4.18', 'OPEN'],
      ['10.0.4.21', 'FILT'],
      ['13.126.8.40', 'LIVE'],
      ['52.66.11.9', 'LIVE'],
      ['169.254.169.254', 'HIT'],
      ['api.internal', '403'],
      ['s3.uploads', 'PUB']
    ];

    function isHit(s) { return hitRe.test(s); }

    function viewSize() {
      var vv = window.visualViewport;
      W = Math.round((vv && vv.width) || innerWidth);
      H = Math.round((vv && vv.height) || innerHeight);
    }

    var seededW = 0, seededH = 0;
    function resize() {
      viewSize();
      var phone = W < 720;
      dpr = Math.min(devicePixelRatio || 1, phone ? 1.5 : 2);
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (lines.length && seededW === W && Math.abs(seededH - H) < 90) return;
      seededW = W; seededH = H;
      lines = [];
      hex = [];
      var rows = Math.ceil(H / 22) + 8;
      for (var i = 0; i < rows; i++) {
        var s = pool[i % pool.length];
        lines.push({ t: s, hit: isHit(s) });
        hex.push(hexPool[i % hexPool.length]);
      }
      rain = [];
      glyphs = [];
      splashes = [];
      var n = phone ? 70 : (W < 1100 ? 110 : 160);
      for (var p = 0; p < n; p++) {
        rain.push({
          x: Math.random() * W,
          y: Math.random() * H,
          len: 10 + Math.random() * 28,
          vy: 5.2 + Math.random() * 8.5,
          vx: -0.55 - Math.random() * 0.7,
          w: 0.6 + Math.random() * 1.15,
          hot: Math.random() > 0.78
        });
      }
      var tokens = ['0x', 'CVE', 'IDOR', 'SSRF', 'IAM', 'JWT', 'AWS', 'VAPT', 'AI', 'HIT', 'API'];
      var gn = phone ? 14 : (W < 1100 ? 20 : 28);
      for (var g = 0; g < gn; g++) {
        glyphs.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vy: 1.15 + Math.random() * 1.9,
          s: tokens[g % tokens.length],
          a: 0.1 + Math.random() * 0.14,
          hot: Math.random() > 0.65
        });
      }
      hosts = hostPool.map(function (h, i) {
        return { ip: h[0], st: h[1], a: 0.3 + (i % 5) * 0.08 };
      });
    }
    addEventListener('resize', resize);
    addEventListener('orientationchange', function () { setTimeout(resize, 80); });
    if (window.visualViewport) visualViewport.addEventListener('resize', resize);
    resize();

    function bracket(x, y, w, h, s) {
      ctx.beginPath();
      ctx.moveTo(x, y + s); ctx.lineTo(x, y); ctx.lineTo(x + s, y);
      ctx.moveTo(x + w - s, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + s);
      ctx.moveTo(x + w, y + h - s); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w - s, y + h);
      ctx.moveTo(x + s, y + h); ctx.lineTo(x, y + h); ctx.lineTo(x, y + h - s);
      ctx.stroke();
    }

    function frame() {
      t += 0.016;
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.strokeStyle = 'rgba(255,69,58,0.055)';
      ctx.lineWidth = 1;
      var gy = (t * 18) % 44;
      for (var y = -44; y < H + 44; y += 44) {
        ctx.beginPath();
        ctx.moveTo(0, y + gy);
        ctx.lineTo(W, y + gy);
        ctx.stroke();
      }
      for (var x = 0; x < W; x += 72) {
        ctx.beginPath();
        ctx.moveTo(x + (t * 8) % 72, 0);
        ctx.lineTo(x + (t * 8) % 72, H);
        ctx.stroke();
      }
      ctx.restore();

      ctx.save();
      ctx.font = '10px "IBM Plex Mono", ui-monospace, monospace';
      glyphs.forEach(function (g) {
        g.y += g.vy;
        if (g.y > H + 20) {
          g.y = -20;
          g.x = Math.random() * W;
        }
        ctx.fillStyle = g.hot
          ? 'rgba(255,69,58,' + g.a + ')'
          : 'rgba(244,241,236,' + g.a + ')';
        ctx.fillText(g.s, g.x, g.y);
      });
      rain.forEach(function (d) {
        d.x += d.vx;
        d.y += d.vy;
        if (d.y > H + 8) {
          splashes.push({ x: d.x, y: H - 10, r: 2, a: 0.28, hot: d.hot });
          d.y = -d.len;
          d.x = Math.random() * W;
        }
        if (d.x < -12) d.x = W + 8;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - d.vx * 2.2, d.y - d.len);
        ctx.strokeStyle = d.hot
          ? 'rgba(255,69,58,0.28)'
          : 'rgba(210,214,220,0.16)';
        ctx.lineWidth = d.w;
        ctx.stroke();
      });
      splashes = splashes.filter(function (s) { s.r += 0.55; s.a *= 0.9; return s.a > 0.03; });
      splashes.forEach(function (s) {
        ctx.beginPath();
        ctx.ellipse(s.x, s.y, s.r * 1.8, s.r * 0.35, 0, 0, Math.PI * 2);
        ctx.strokeStyle = s.hot
          ? 'rgba(255,69,58,' + s.a + ')'
          : 'rgba(210,214,220,' + s.a + ')';
        ctx.lineWidth = 1;
        ctx.stroke();
      });
      ctx.restore();

      yOff += 0.38;
      hexOff += 0.22;
      var rowH = 22;
      if (yOff >= rowH) {
        yOff = 0;
        var nxt = pool[tickN++ % pool.length];
        lastText = nxt;
        typed = 0;
        lines.push({ t: nxt, hit: isHit(nxt), born: t });
        if (isHit(nxt)) {
          locks.push({ life: 1, text: nxt });
        }
        if (lines.length > Math.ceil(H / rowH) + 10) lines.shift();
      }
      if (hexOff >= 16) {
        hexOff = 0;
        hex.push(hexPool[tickN % hexPool.length]);
        if (hex.length > Math.ceil(H / 16) + 6) hex.shift();
      }
      typed = Math.min((lastText || lines[lines.length - 1].t).length, typed + 0.55);

      var phone = W < 720;
      ctx.font = (phone ? '11px' : '12px') + ' "IBM Plex Mono", ui-monospace, monospace';
      var cols = W > 1100 ? 2 : 1;
      var colW = phone ? Math.max(120, W - 36) : Math.min(W * 0.58, 640);
      var scanY = (t * 55) % (H + 80) - 40;

      for (var c = 0; c < cols; c++) {
        for (var i = 0; i < lines.length; i++) {
          var ly = H - i * rowH + yOff - 8;
          if (ly < -24 || ly > H + 24) continue;
          var line = lines[i];
          var glitch = line.hit && Math.sin(t * 18 + i) > 0.92 ? 3 : 0;
          var lx = (phone ? 12 : 28) + c * (colW + 24) + glitch;
          var nearScan = Math.abs(ly - scanY) < 14;
          if (line.hit && nearScan) {
            ctx.fillStyle = 'rgba(255,69,58,0.08)';
            ctx.fillRect(lx - 8, ly - 14, colW * 0.92, 20);
          }
          var newest = i === lines.length - 1;
          var shown = (newest && lastText)
            ? lastText.slice(0, Math.floor(typed))
            : line.t;
          if (phone && shown.length > 38) shown = shown.slice(0, 38);
          ctx.fillStyle = line.hit
            ? (nearScan ? 'rgba(255,90,70,0.55)' : 'rgba(255,69,58,0.32)')
            : 'rgba(244,241,236,0.12)';
          ctx.fillText((c === 0 ? '› ' : '  ') + shown, lx, ly);
          if (newest && c === 0 && (t % 1) < 0.55) {
            var tw = ctx.measureText('› ' + shown).width;
            ctx.fillStyle = 'rgba(255,69,58,0.85)';
            ctx.fillRect(lx + tw + 2, ly - 11, 7, 13);
          }
          if (line.hit && c === 0) {
            ctx.strokeStyle = 'rgba(255,69,58,' + (0.18 + 0.18 * Math.sin(t * 3 + i)) + ')';
            ctx.lineWidth = 1;
            bracket(lx - 10, ly - 15, Math.min(W - lx - 16, 420, colW * 0.86), 20, 6);
          }
        }
      }

      ctx.font = (phone ? '9px' : '11px') + ' "IBM Plex Mono", ui-monospace, monospace';
      var hexX = phone ? W - 108 : W - 220;
      for (var hxi = 0; hxi < hex.length; hxi++) {
        var hy = H - hxi * (phone ? 14 : 16) + hexOff - 6;
        if (hy < 0 || hy > H) continue;
        ctx.fillStyle = 'rgba(244,241,236,0.07)';
        ctx.fillText(phone ? hex[hxi].slice(0, 11) : hex[hxi], hexX, hy);
      }

      ctx.save();
      var g = ctx.createLinearGradient(0, scanY - 40, 0, scanY + 40);
      g.addColorStop(0, 'rgba(255,69,58,0)');
      g.addColorStop(0.45, 'rgba(255,69,58,0.05)');
      g.addColorStop(0.5, 'rgba(255,210,180,0.18)');
      g.addColorStop(0.55, 'rgba(255,69,58,0.05)');
      g.addColorStop(1, 'rgba(255,69,58,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, scanY - 40, W, 80);
      ctx.fillStyle = 'rgba(255,69,58,0.35)';
      ctx.fillRect(0, scanY, W, 1);
      ctx.restore();

      ctx.font = (phone ? '9px' : '10px') + ' "IBM Plex Mono", ui-monospace, monospace';
      hosts.forEach(function (h, i) {
        var hy = (phone ? 78 : 92) + i * (phone ? 16 : 22);
        if (phone && i > 5) return;
        var pulse = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 2.2 + i));
        var hx = phone ? W - 14 : W - 28;
        ctx.fillStyle = h.st === 'HIT' || h.st === 'PUB'
          ? 'rgba(255,69,58,' + (0.35 + pulse * 0.35) + ')'
          : 'rgba(244,241,236,0.16)';
        ctx.beginPath();
        ctx.arc(hx, hy, phone ? 1.8 : 2.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(244,241,236,0.16)';
        ctx.fillText(h.ip, phone ? W - 118 : W - 168, hy + 3);
        ctx.fillStyle = h.st === 'HIT' || h.st === 'PUB'
          ? 'rgba(255,69,58,0.45)'
          : 'rgba(244,241,236,0.18)';
        ctx.fillText(h.st, phone ? W - 38 : W - 52, hy + 3);
      });

      locks = locks.filter(function (L) { L.life -= 0.008; return L.life > 0; });
      locks.forEach(function (L) {
        ctx.font = (phone ? '9px' : '11px') + ' "IBM Plex Mono", ui-monospace, monospace';
        ctx.fillStyle = 'rgba(255,69,58,' + (L.life * 0.35) + ')';
        var lockT = 'LOCK  ' + L.text;
        if (phone && lockT.length > 34) lockT = lockT.slice(0, 34);
        ctx.fillText(lockT, 16, (phone ? 72 : 86) + (1 - L.life) * 18);
      });

      ctx.strokeStyle = 'rgba(255,69,58,0.28)';
      ctx.lineWidth = 1;
      var pad = phone ? 10 : 18, arm = phone ? 14 : 22;
      bracket(pad, pad + (phone ? 58 : 52), W - pad * 2, H - pad * 2 - (phone ? 56 : 70), arm);

      ctx.font = (phone ? '9px' : '10px') + ' "IBM Plex Mono", ui-monospace, monospace';
      ctx.fillStyle = 'rgba(255,69,58,0.4)';
      ctx.fillText(phone ? 'ENG  0xABHIRAM   VAPT' : 'ENG  0xABHIRAM   MODE  VAPT   SCOPE  WEB / API / CLOUD', phone ? 14 : 28, H - (phone ? 20 : 22));
      ctx.fillStyle = 'rgba(244,241,236,0.18)';
      ctx.fillText(
        'SCAN  ' + Math.floor((t * 7) % 100) + '%   HOSTS  ' + hosts.length + '   FINDINGS  LIVE',
        phone ? 14 : 28,
        H - (phone ? 8 : 8)
      );

      requestAnimationFrame(frame);
    }
    frame();
  })();
})();
