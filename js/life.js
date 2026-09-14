(function () {
  var canvas = document.getElementById("life-bg");
  if (!canvas || !canvas.getContext) return;

  var ctx = canvas.getContext("2d");
  var hero = canvas.parentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var CELL = 16;
  var CELL_FILL = 0.86; // uniform, tetris-like blocks with a thin grid gap
  var SEED_DENSITY = 0.18;
  var TICK_MS = 400;
  var ACCENT = "15, 118, 110";
  var CELL_ALPHA = 0.38;
  var BG = "243, 249, 248"; // matches --bg, used for the vignette fade

  var cols, rows, grid, dpr;

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

  function seed() {
    grid = new Uint8Array(cols * rows);
    for (var i = 0; i < grid.length; i++) {
      grid[i] = Math.random() < SEED_DENSITY ? 1 : 0;
    }
  }

  function at(x, y) {
    x = (x + cols) % cols;
    y = (y + rows) % rows;
    return grid[y * cols + x];
  }

  function step() {
    var next = new Uint8Array(cols * rows);
    var alive = 0;
    for (var y = 0; y < rows; y++) {
      for (var x = 0; x < cols; x++) {
        var n =
          at(x - 1, y - 1) + at(x, y - 1) + at(x + 1, y - 1) +
          at(x - 1, y)                     + at(x + 1, y) +
          at(x - 1, y + 1) + at(x, y + 1) + at(x + 1, y + 1);
        var cur = at(x, y);
        var val = cur ? (n === 2 || n === 3 ? 1 : 0) : (n === 3 ? 1 : 0);
        next[y * cols + x] = val;
        alive += val;
      }
    }
    grid = next;
    if (alive < cols * rows * 0.02) seed();
  }

  function draw() {
    var w = canvas.width / dpr;
    var h = canvas.height / dpr;
    ctx.clearRect(0, 0, w, h);

    var size = CELL * CELL_FILL;
    var half = size / 2;
    ctx.fillStyle = "rgba(" + ACCENT + ", " + CELL_ALPHA + ")";
    for (var y = 0; y < rows; y++) {
      for (var x = 0; x < cols; x++) {
        if (grid[y * cols + x]) {
          ctx.fillRect(
            x * CELL + CELL / 2 - half,
            y * CELL + CELL / 2 - half,
            size,
            size
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
