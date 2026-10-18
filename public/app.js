/* 计算不可约性 · 运营简报
 * 数据唯一来源: ./data/brief.json —— 改这个文件，站点自动变。
 * 图表用内联 SVG 手绘，零依赖，Cloudflare Pages 直接托管即可。
 */
(function () {
  "use strict";

  var fmt = function (n) {
    return typeof n === "number" ? n.toLocaleString("zh-CN") : n;
  };

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function renderKpis(acc) {
    var box = document.getElementById("kpis");
    box.innerHTML = "";
    var rate = acc.notes_total ? ((acc.likes_collected / acc.notes_total).toFixed(1)) : "0";
    var items = [
      { v: fmt(acc.followers), l: "粉丝", hot: true },
      { v: fmt(acc.likes_collected), l: "获赞与收藏" },
      { v: fmt(acc.notes_total), l: "笔记数" },
      { v: rate, l: "篇均互动" }
    ];
    items.forEach(function (it) {
      var card = el("div", "kpi" + (it.hot ? " hot" : ""));
      card.appendChild(el("div", "v", it.v));
      card.appendChild(el("div", "l", it.l));
      box.appendChild(card);
    });
  }

  function renderTopics(topics) {
    var wrap = document.getElementById("topics");
    wrap.innerHTML = "";
    topics.forEach(function (t) {
      var row = el("div", "topic");
      var head = el("div");
      head.appendChild(el("div", "name", t.name));
      head.appendChild(el("div", "growth", t.growth || ""));

      var fit = el("span", "tag fit-" + (t.fit || "中"), "匹配度 " + (t.fit || "-"));

      var barRow = el("div", "row");
      var bar = el("div", "bar");
      var fill = document.createElement("i");
      fill.style.width = Math.max(4, Math.min(100, t.heat || 0)) + "%";
      bar.appendChild(fill);
      barRow.appendChild(bar);
      barRow.appendChild(el("span", "tag", "热度 " + (t.heat || 0)));

      var why = el("div", "why", t.why || "");

      row.appendChild(head);
      row.appendChild(fit);
      row.appendChild(barRow);
      row.appendChild(why);
      wrap.appendChild(row);
    });
  }

  function renderNotes(notes) {
    var host = document.getElementById("notes-chart");
    host.innerHTML = "";
    if (!notes || !notes.length) return;

    var W = Math.max(520, host.clientWidth || 640);
    var rowH = 30;
    var labelW = 200;
    var maxLike = Math.max.apply(null, notes.map(function (n) { return n.likes || 0 })) || 1;
    var H = notes.length * rowH + 12;

    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", H);

    notes.forEach(function (n, i) {
      var y = i * rowH + 6;
      var title = n.title || "";
      if (title.length > 16) title = title.slice(0, 16) + "…";

      var label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("x", 0);
      label.setAttribute("y", y + 13);
      label.textContent = title;
      svg.appendChild(label);

      var trackW = W - labelW - 46;
      var track = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      track.setAttribute("x", labelW);
      track.setAttribute("y", y + 3);
      track.setAttribute("width", trackW);
      track.setAttribute("height", 12);
      track.setAttribute("rx", 6);
      track.setAttribute("fill", "#202737");
      svg.appendChild(track);

      var w = Math.max(3, (n.likes || 0) / maxLike * trackW);
      var fillRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      fillRect.setAttribute("x", labelW);
      fillRect.setAttribute("y", y + 3);
      fillRect.setAttribute("width", w);
      fillRect.setAttribute("height", 12);
      fillRect.setAttribute("rx", 6);
      fillRect.setAttribute("fill", "url(#g" + i + ")");
      svg.appendChild(fillRect);

      var grad = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
      grad.setAttribute("id", "g" + i);
      grad.setAttribute("x1", "0");
      grad.setAttribute("x2", "1");
      var s1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
      s1.setAttribute("offset", "0");
      s1.setAttribute("stop-color", "#ff4d67");
      var s2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
      s2.setAttribute("offset", "1");
      s2.setAttribute("stop-color", "#ff8a5c");
      grad.appendChild(s1);
      grad.appendChild(s2);
      var defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
      defs.appendChild(grad);
      svg.appendChild(defs);

      var val = document.createElementNS("http://www.w3.org/2000/svg", "text");
      val.setAttribute("x", labelW + w + 8);
      val.setAttribute("y", y + 13);
      val.textContent = String(n.likes || 0);
      svg.appendChild(val);
    });

    host.appendChild(svg);
  }

  function renderDiagnosis(items) {
    var ul = document.getElementById("diagnosis");
    ul.innerHTML = "";
    (items || []).forEach(function (d) {
      var li = el("li");
      li.appendChild(el("div", "l", d.label));
      li.appendChild(el("div", "v", d.value));
      li.appendChild(el("div", "n", d.note));
      ul.appendChild(li);
    });
  }

  function renderDirections(dirs) {
    var host = document.getElementById("directions");
    host.innerHTML = "";
    (dirs || []).forEach(function (d) {
      var box = el("div", "dir");
      box.appendChild(el("h3", null, d.title));
      box.appendChild(el("p", null, "为什么：" + (d.why || "")));
      box.appendChild(el("p", null, "怎么做：" + (d.how || "")));
      host.appendChild(box);
    });
  }

  function renderSources(src) {
    var ul = document.getElementById("sources");
    ul.innerHTML = "";
    (src || []).forEach(function (s) {
      ul.appendChild(el("li", null, s));
    });
  }

  function render(data) {
    var acc = data.account || {};
    document.getElementById("acct-name").textContent = acc.name || "账号";
    document.getElementById("acct-desc").textContent = acc.desc || "";
    document.getElementById("acct-id").textContent = acc.xhs_id ? "小红书号 " + acc.xhs_id : "";
    document.getElementById("acct-pos").textContent = acc.positioning || "";
    document.getElementById("updated").textContent = data.generated_at
      ? "更新于 " + String(data.generated_at).replace("T", " ").slice(0, 16)
      : "";
    renderKpis(acc);
    renderTopics(data.topics || []);
    renderNotes(data.notes_top || []);
    renderDiagnosis(data.diagnosis || []);
    renderDirections(data.directions || []);
    renderSources(data.sources || []);

    var reflow = function () { renderNotes(data.notes_top || []); };
    window.addEventListener("resize", debounce(reflow, 200));
  }

  function debounce(fn, ms) {
    var t;
    return function () {
      clearTimeout(t);
      t = setTimeout(fn, ms);
    };
  }

  fetch("./data/brief.json", { cache: "no-store" })
    .then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    })
    .then(render)
    .catch(function (err) {
      document.getElementById("topics").textContent = "数据加载失败：" + err.message;
    });
})();
