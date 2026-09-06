(function () {
  var canvas = document.getElementById("life-bg");
  if (!canvas || !canvas.getContext) return;

  var ctx = canvas.getContext("2d");
  var hero = canvas.parentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var CELL = 16;
  var SEED_DENSITY = 0.18;
  var TICK_MS = 400;
  var ACCENT = "169, 72, 47";

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

  // Each live cell gets its own random size/opacity, assigned once at
  // birth and kept while it stays alive, so the pattern reads as
  // textured/organic rather than a uniform field of identical marks.
  function randomStyle() {
    return {
      size: CELL * (0.34 + Math.random() * 0.4),
      alpha: 0.08 + Math.random() * 0.2,
    };
  }

  function seed() {
    grid = new Uint8Array(cols * rows);
    style = new Array(cols * rows);
    for (var i = 0; i < grid.length; i++) {
      if (Math.random() < SEED_DENSITY) {
        grid[i] = 1;
        style[i] = randomStyle();
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
    if (alive < cols * rows * 0.02) seed();
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
            x * CELL + CELL / 2 - half,
            y * CELL + CELL / 2 - half,
            s.size,
            s.size
          );
        }
      }
    }
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
