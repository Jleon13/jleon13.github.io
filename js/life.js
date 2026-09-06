(function () {
  var canvas = document.getElementById("life-bg");
  if (!canvas || !canvas.getContext) return;

  var ctx = canvas.getContext("2d");
  var hero = canvas.parentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var CELL = 16;
  var SEED_DENSITY = 0.18;
  var TICK_MS = 400;
  var DOT_COLOR = "rgba(169, 72, 47, 0.16)";

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
    ctx.fillStyle = DOT_COLOR;
    var r = CELL * 0.32;
    for (var y = 0; y < rows; y++) {
      for (var x = 0; x < cols; x++) {
        if (grid[y * cols + x]) {
          ctx.beginPath();
          ctx.arc(x * CELL + CELL / 2, y * CELL + CELL / 2, r, 0, Math.PI * 2);
          ctx.fill();
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
