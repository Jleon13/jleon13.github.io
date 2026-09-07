(function () {
  var grid = document.getElementById("flower-grid");
  if (!grid) return;

  // Seed the shuffle from today's date, so the arrangement is stable
  // through the day but changes to a new order tomorrow.
  var today = new Date();
  var seed =
    today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();

  function seededRandom() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  }

  var items = Array.prototype.slice.call(grid.children);
  for (var i = items.length - 1; i > 0; i--) {
    var j = Math.floor(seededRandom() * (i + 1));
    var tmp = items[i];
    items[i] = items[j];
    items[j] = tmp;
  }
  items.forEach(function (el) {
    grid.appendChild(el);
  });
})();
