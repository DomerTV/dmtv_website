(function () {
  "use strict";

  var MONTHS = [
    "января", "февраля", "марта", "апреля", "мая", "июня",
    "июля", "августа", "сентября", "октября", "ноября", "декабря"
  ];

  function declension(number, forms) {
    number = Math.abs(number) % 100;
    var last = number % 10;
    if (number > 10 && number < 20) return forms[2];
    if (last > 1 && last < 5) return forms[1];
    if (last === 1) return forms[0];
    return forms[2];
  }

  function relativeDate(iso) {
    var date = new Date(iso + "T12:00:00");
    if (isNaN(date.getTime())) return "";

    var now = new Date();
    var years = now.getFullYear() - date.getFullYear();
    var months = now.getMonth() - date.getMonth();
    var days = now.getDate() - date.getDate();

    if (days < 0) {
      months--;
      var previousMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += previousMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    var parts = [];
    if (years > 0) parts.push(years + " " + declension(years, ["год", "года", "лет"]));
    if (months > 0) parts.push(months + " " + declension(months, ["месяц", "месяца", "месяцев"]));
    if (days > 0 || parts.length === 0) parts.push(days + " " + declension(days, ["день", "дня", "дней"]));

    return parts.join(" ") + " назад";
  }

  function initYear() {
    var year = String(new Date().getFullYear());
    document.querySelectorAll("[data-year]").forEach(function (node) {
      node.textContent = year;
    });
  }

  function initNav() {
    var file = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
    var active = file === "post.html" ? "blog" : file.replace(".html", "");

    document.querySelectorAll("[data-nav]").forEach(function (link) {
      if (link.getAttribute("data-nav") === active) {
        link.setAttribute("aria-current", "page");
      }
    });
  }

  function initRelativeDates() {
    document.querySelectorAll("[data-date]").forEach(function (node) {
      var iso = node.getAttribute("data-date");
      var text = relativeDate(iso);
      if (text) node.textContent = text;
    });
  }

  function boot() {
    initYear();
    initNav();
    initRelativeDates();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
