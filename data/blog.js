(function () {
  "use strict";

  var MONTHS = [
    "января", "февраля", "марта", "апреля", "мая", "июня",
    "июля", "августа", "сентября", "октября", "ноября", "декабря"
  ];

  var posts = Array.isArray(window.DMTV_POSTS) ? window.DMTV_POSTS.slice() : [];

  posts.sort(function (a, b) {
    return String(b.date).localeCompare(String(a.date));
  });

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatDate(iso) {
    var parts = String(iso || "").split("-").map(Number);
    if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) return String(iso || "");
    return parts[2] + " " + MONTHS[parts[1] - 1] + " " + parts[0];
  }

  function readingTime(html) {
    var text = String(html || "")
      .replace(/<[^>]*>/g, " ")
      .replace(/&[a-z#0-9]+;/gi, " ");
    var words = text.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 180));
  }

  function postUrl(post) {
    return "post.html?id=" + encodeURIComponent(post.id);
  }

  function documentTitle(post) {
    return post.title.indexOf("DMTV") === -1 ? post.title + " — DMTV" : post.title;
  }

  function featurePost(post) {
    var url = postUrl(post);
    return (
      '<a class="feature-post" href="' + url + '">' +
        '<div class="post-meta">' +
          (post.category ? '<span class="tag">' + escapeHtml(post.category) + "</span>" : "") +
          '<time datetime="' + escapeHtml(post.date) + '">' + escapeHtml(formatDate(post.date)) + "</time>" +
          "<span>" + readingTime(post.body) + " мин чтения</span>" +
        "</div>" +
        '<div class="feature-body">' +
          "<h3>" + escapeHtml(post.title) + "</h3>" +
          (post.excerpt ? "<p>" + escapeHtml(post.excerpt) + "</p>" : "") +
        "</div>" +
        '<span class="post-link">Читать <span aria-hidden="true">→</span></span>' +
      "</a>"
    );
  }

  function postRow(post) {
    var url = postUrl(post);
    return (
      '<article class="post-row">' +
        '<div class="post-row-meta">' +
          '<time datetime="' + escapeHtml(post.date) + '">' + escapeHtml(formatDate(post.date)) + "</time>" +
          (post.category ? "<span>" + escapeHtml(post.category) + "</span>" : "") +
        "</div>" +
        '<div class="post-row-main">' +
          '<h2><a href="' + url + '">' + escapeHtml(post.title) + "</a></h2>" +
          (post.excerpt ? "<p>" + escapeHtml(post.excerpt) + "</p>" : "") +
        "</div>" +
        '<div class="post-row-side">' +
          "<span>" + readingTime(post.body) + " мин</span>" +
          '<a class="arrow-link" href="' + url + '" aria-label="Читать: ' + escapeHtml(post.title) + '">→</a>' +
        "</div>" +
      "</article>"
    );
  }

  function setMeta(attribute, key, value) {
    var node = document.querySelector("meta[" + attribute + '="' + key + '"]');
    if (node) node.setAttribute("content", value);
  }

  function initLatest() {
    var root = document.querySelector("[data-latest-posts]");
    if (!root) return;

    if (!posts.length) {
      root.innerHTML = '<p class="empty-state">Записей пока нет.</p>';
      return;
    }

    root.innerHTML = featurePost(posts[0]);
  }

  function initBlog() {
    var list = document.querySelector("[data-post-list]");
    if (!list) return;

    var filtersRoot = document.querySelector("[data-filters]");
    var categories = ["Все"];

    posts.forEach(function (post) {
      if (post.category && categories.indexOf(post.category) === -1) {
        categories.push(post.category);
      }
    });

    var active = "Все";

    function draw() {
      var visible = active === "Все"
        ? posts
        : posts.filter(function (post) { return post.category === active; });

      list.innerHTML = visible.length
        ? visible.map(postRow).join("")
        : '<p class="empty-state">В этой категории пока нет записей.</p>';
    }

    if (filtersRoot) {
      filtersRoot.innerHTML = categories.map(function (category) {
        return (
          '<button class="filter" type="button" data-category="' + escapeHtml(category) +
          '" aria-pressed="' + (category === active) + '">' +
          escapeHtml(category) +
          "</button>"
        );
      }).join("");

      filtersRoot.addEventListener("click", function (event) {
        var button = event.target.closest("[data-category]");
        if (!button) return;

        active = button.getAttribute("data-category");

        filtersRoot.querySelectorAll("[data-category]").forEach(function (item) {
          item.setAttribute("aria-pressed", String(item === button));
        });

        draw();
      });
    }

    draw();
  }

  function initPost() {
    var root = document.querySelector("[data-article]");
    if (!root) return;

    var id = new URLSearchParams(window.location.search).get("id");
    var post = posts.find(function (item) { return item.id === id; });

    if (!post) {
      document.title = "Запись не найдена — DMTV";
      root.innerHTML =
        '<div class="not-found">' +
          "<h1>Запись не найдена</h1>" +
          "<p>Такой записи нет.</p>" +
          '<div class="actions">' +
            '<a class="btn btn--primary" href="blog.html">Все записи</a>' +
          "</div>" +
        "</div>";
      return;
    }

    document.title = documentTitle(post);
    setMeta("name", "description", post.excerpt || "");
    setMeta("property", "og:title", documentTitle(post));
    setMeta("property", "og:description", post.excerpt || "");    setMeta("property", "og:type", "article");

    var index = posts.indexOf(post);
    var newer = index > 0 ? posts[index - 1] : null;
    var older = index < posts.length - 1 ? posts[index + 1] : null;
    var navigation = "";

    function navItem(item, label) {
      return (
        '<a href="' + postUrl(item) + '">' +
          '<span class="nav-label">' + label + "</span>" +
          '<span class="nav-title">' + escapeHtml(item.title) + "</span>" +
        "</a>"
      );
    }

    if (newer || older) {
      navigation =
        '<nav class="article-nav" aria-label="Другие записи">' +
          (newer ? navItem(newer, "← Новее") : "") +
          (older ? navItem(older, "Старее →") : "") +
        "</nav>";
    }

    root.innerHTML =
      '<a class="back-link" href="blog.html">← Все записи</a>' +
      '<header class="article-header">' +
        '<div class="post-meta">' +
          (post.category ? '<span class="tag">' + escapeHtml(post.category) + "</span>" : "") +
          '<time datetime="' + escapeHtml(post.date) + '">' + escapeHtml(formatDate(post.date)) + "</time>" +
          "<span>" + readingTime(post.body) + " мин чтения</span>" +
        "</div>" +
        "<h1>" + escapeHtml(post.title) + "</h1>" +
        (post.excerpt ? '<p class="article-excerpt">' + escapeHtml(post.excerpt) + "</p>" : "") +
      "</header>" +
      '<div class="prose">' + (post.body || "<p>Текст записи.</p>") + "</div>" +
      navigation;
  }

  function boot() {
    initLatest();
    initBlog();
    initPost();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
