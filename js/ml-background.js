(function () {
  "use strict";

  var canvas = document.getElementById("ml-bg");
  if (!canvas || !canvas.getContext) return;

  var ctx = canvas.getContext("2d");
  var nodes = [];
  var width = 0;
  var height = 0;
  var animationId = 0;
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var MAX_DISTANCE = 150;
  var DRIFT = 0.12;

  function isDarkTheme() {
    return document.documentElement.getAttribute("data-theme") !== "light";
  }

  function getThemeColors() {
    var style = getComputedStyle(document.documentElement);
    return {
      accent: style.getPropertyValue("--accent").trim() || "#3d9eff",
      highlight: style.getPropertyValue("--highlight").trim() || "#5eead4",
    };
  }

  function nodeCount() {
    var area = width * height;
    return Math.max(28, Math.min(72, Math.floor(area * 0.00007)));
  }

  function seedNodes() {
    var count = nodeCount();
    nodes = [];

    for (var i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * DRIFT,
        vy: (Math.random() - 0.5) * DRIFT,
        r: 1.4 + Math.random() * 1.6,
        hue: i % 2,
      });
    }
  }

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    seedNodes();
  }

  function drawEdges(colors) {
    for (var i = 0; i < nodes.length; i++) {
      for (var j = i + 1; j < nodes.length; j++) {
        var dx = nodes[i].x - nodes[j].x;
        var dy = nodes[i].y - nodes[j].y;
        var dist = Math.hypot(dx, dy);

        if (dist < MAX_DISTANCE) {
          var fade = (1 - dist / MAX_DISTANCE) * 0.22;
          ctx.globalAlpha = fade;
          ctx.strokeStyle = nodes[i].hue === nodes[j].hue ? colors.accent : colors.highlight;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function drawNodes(colors) {
    nodes.forEach(function (node) {
      ctx.globalAlpha = 0.65;
      ctx.fillStyle = node.hue ? colors.highlight : colors.accent;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = 0.22;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.r * 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function stop() {
    window.cancelAnimationFrame(animationId);
    animationId = 0;
    ctx.clearRect(0, 0, width, height);
  }

  function tick() {
    if (!isDarkTheme()) {
      stop();
      return;
    }

    var colors = getThemeColors();

    if (!reducedMotion) {
      nodes.forEach(function (node) {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x <= 0 || node.x >= width) node.vx *= -1;
        if (node.y <= 0 || node.y >= height) node.vy *= -1;
      });
    }

    ctx.clearRect(0, 0, width, height);
    drawEdges(colors);
    drawNodes(colors);
    ctx.globalAlpha = 1;

    if (!reducedMotion) {
      animationId = window.requestAnimationFrame(tick);
    }
  }

  function start() {
    if (!isDarkTheme()) return;
    window.cancelAnimationFrame(animationId);
    resize();
    tick();
  }

  start();

  window.addEventListener("resize", start);

  var themeObserver = new MutationObserver(function () {
    if (isDarkTheme()) {
      start();
    } else {
      stop();
    }
  });

  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
})();
