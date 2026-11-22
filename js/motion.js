(function () {
  'use strict';

  document.documentElement.classList.add('motion');

  function show(el) {
    el.classList.add('in');
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        show(e.target);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0, rootMargin: '0px' });

  var sections = document.querySelectorAll('main > section:not(.hero)');
  sections.forEach(function (el) {
    el.classList.add('lift');
    el.querySelectorAll('.sec-head, .card, .job, .mark, .panel, .log, .about, .actions, .socials').forEach(function (child, i) {
      child.classList.add('piece');
      child.style.transitionDelay = (Math.min(i, 6) * 70) + 'ms';
    });
    io.observe(el);
  });

  function revealVisible() {
    sections.forEach(function (el) {
      if (el.classList.contains('in')) return;
      var r = el.getBoundingClientRect();
      if (r.top < innerHeight * 0.92 && r.bottom > 48) show(el);
    });
  }

  revealVisible();
  addEventListener('scroll', revealVisible, { passive: true });
  addEventListener('resize', revealVisible);

  var ring = document.getElementById('scrollRing');
  if (ring) {
    var circ = 2 * Math.PI * 16;
    ring.style.strokeDasharray = String(circ);
    function paintRing() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      ring.style.strokeDashoffset = String(circ * (1 - p));
    }
    paintRing();
    addEventListener('scroll', paintRing, { passive: true });
    addEventListener('resize', paintRing);
  }

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function drops(canvas, count, pace) {
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var bits = [];

    var view = { w: 0, h: 0 };
    function size() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var w = canvas.clientWidth || window.innerWidth;
      var h = canvas.clientHeight || window.innerHeight;
      if (w !== view.w || h !== view.h) {
        view.w = w;
        view.h = h;
        canvas.width = Math.max(1, Math.floor(w * dpr));
        canvas.height = Math.max(1, Math.floor(h * dpr));
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      return view;
    }

    function seed() {
      bits = [];
      for (var i = 0; i < count; i++) {
        bits.push({
          x: Math.random(),
          y: Math.random(),
          r: 0.7 + Math.random() * 1.5,
          v: pace * (0.45 + Math.random()),
          a: 0.22 + Math.random() * 0.4
        });
      }
    }

    function frame() {
      var box = size();
      ctx.clearRect(0, 0, box.w, box.h);
      for (var i = 0; i < bits.length; i++) {
        var b = bits[i];
        b.y += b.v;
        b.x += Math.sin(b.y * 18) * 0.00035;
        if (b.y > 1.04) {
          b.y = -0.04;
          b.x = Math.random();
        }
        ctx.beginPath();
        ctx.fillStyle = 'rgba(0,214,255,' + b.a + ')';
        ctx.arc(b.x * box.w, b.y * box.h, b.r, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(frame);
    }

    seed();
    addEventListener('resize', seed);
    requestAnimationFrame(frame);
  }

  drops(document.getElementById('heroDrops'), 135, 0.0016);
  drops(document.getElementById('sideDrops'), 126, 0.00135);
})();
