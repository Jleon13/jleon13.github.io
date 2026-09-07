(function () {
  var canvas = document.getElementById("life-bg");
  if (!canvas || !canvas.getContext) return;

  var ctx = canvas.getContext("2d");
  var hero = canvas.parentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var CELL = 16;
  var SEED_DENSITY_MAX = 0.22;
  var PATCH = 4; // coarse blocks used to vary seed density, so the
                 // starting soup clumps unevenly instead of an even scatter
  var TICK_MS = 400;
  var ACCENT = "169, 72, 47";
  var BG = "250, 246, 240"; // matches --bg, used for the vignette fade

  var cols, rows, grid, style, dpr;

  function resize() {
    var rect = hero.getBoundingClientRect();
    dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.max(1, Math.ceil(rect.width / CELL));
    rows = Math.max(1, Math.ceil(rect.height / CELL));
    seed();
    draw();
  }

  // Each live cell gets its own random size/opacity/offset, assigned
  // once at birth and kept while it stays alive, so the pattern reads
  // as scattered and organic rather than a uniform grid of identical marks.
  function randomStyle() {
    return {
      size: CELL * (0.28 + Math.random() * 0.55),
      alpha: 0.05 + Math.random() * 0.16,
      dx: (Math.random() - 0.5) * CELL * 0.4,
      dy: (Math.random() - 0.5) * CELL * 0.4,
    };
  }

  function seed() {
    grid = new Uint8Array(cols * rows);
    style = new Array(cols * rows);
    var patchCols = Math.ceil(cols / PATCH);
    var patchRows = Math.ceil(rows / PATCH);
    var density = new Array(patchCols * patchRows);
    for (var p = 0; p < density.length; p++) {
      density[p] = Math.random() * Math.random(); // biased low, occasional bursts
    }
    for (var y = 0; y < rows; y++) {
      for (var x = 0; x < cols; x++) {
        var p2 = Math.floor(y / PATCH) * patchCols + Math.floor(x / PATCH);
        var i = y * cols + x;
        if (Math.random() < density[p2] * SEED_DENSITY_MAX) {
          grid[i] = 1;
          style[i] = randomStyle();
        }
      }
    }
  }

  function at(x, y) {
    x = (x + cols) % cols;
    y = (y + rows) % rows;
    return grid[y * cols + x];
  }

  function step() {
    var next = new Uint8Array(cols * rows);
    var nextStyle = new Array(cols * rows);
    var alive = 0;
    for (var y = 0; y < rows; y++) {
      for (var x = 0; x < cols; x++) {
        var n =
          at(x - 1, y - 1) + at(x, y - 1) + at(x + 1, y - 1) +
          at(x - 1, y)                     + at(x + 1, y) +
          at(x - 1, y + 1) + at(x, y + 1) + at(x + 1, y + 1);
        var i = y * cols + x;
        var cur = grid[i];
        var val = cur ? (n === 2 || n === 3 ? 1 : 0) : (n === 3 ? 1 : 0);
        next[i] = val;
        if (val) {
          nextStyle[i] = cur ? style[i] : randomStyle();
          alive++;
        }
      }
    }
    grid = next;
    style = nextStyle;
    if (alive < cols * rows * 0.015) seed();
  }

  function draw() {
    var w = canvas.width / dpr;
    var h = canvas.height / dpr;
    ctx.clearRect(0, 0, w, h);

    for (var y = 0; y < rows; y++) {
      for (var x = 0; x < cols; x++) {
        var i = y * cols + x;
        if (grid[i]) {
          var s = style[i];
          var half = s.size / 2;
          ctx.fillStyle = "rgba(" + ACCENT + ", " + s.alpha.toFixed(2) + ")";
          ctx.fillRect(
            x * CELL + CELL / 2 - half + s.dx,
            y * CELL + CELL / 2 - half + s.dy,
            s.size,
            s.size
          );
        }
      }
    }

    // Vignette: fade the pattern out toward the center so it stays
    // clear of the name/tagline/intro text sitting on top of it.
    var cx = w / 2;
    var cy = h / 2;
    var radius = Math.max(w, h) * 0.55;
    var vignette = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    vignette.addColorStop(0, "rgba(" + BG + ", 0.96)");
    vignette.addColorStop(0.5, "rgba(" + BG + ", 0.65)");
    vignette.addColorStop(1, "rgba(" + BG + ", 0)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);
  }

  var lastTick = 0;
  function loop(ts) {
    if (!lastTick) lastTick = ts;
    if (ts - lastTick > TICK_MS) {
      step();
      draw();
      lastTick = ts;
    }
    requestAnimationFrame(loop);
  }

  window.addEventListener("resize", resize);
  resize();
  if (!reduceMotion) requestAnimationFrame(loop);
})();
