(function () {
  "use strict";

  const toggle = document.querySelector(".nav__toggle");
  const menu = document.querySelector(".nav__menu");
  const pageLinks = document.querySelectorAll(".nav__link[data-page], .nav__brand[href^='#']");
  const pages = document.querySelectorAll(".page-panel");
  const filterBtns = document.querySelectorAll(".filter-btn");
  const projectCards = document.querySelectorAll(".project-card");
  const themeToggle = document.getElementById("theme-toggle");
  const themeMeta = document.getElementById("theme-color-meta");

  const validPages = Array.from(pages).map((page) => page.id);

  function closeMobileMenu() {
    if (menu && toggle) {
      menu.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }
  }

  function setActiveNav(pageId) {
    document.querySelectorAll(".nav__link[data-page]").forEach((link) => {
      link.classList.toggle("is-active", link.dataset.page === pageId);
    });
  }

  function showPage(pageId, updateHash = true) {
    if (!validPages.includes(pageId)) {
      pageId = "about";
    }

    pages.forEach((page) => {
      const isActive = page.id === pageId;
      page.classList.toggle("is-active", isActive);
      page.hidden = !isActive;
    });

    setActiveNav(pageId);
    window.scrollTo(0, 0);

    if (updateHash) {
      history.replaceState(null, "", `#${pageId}`);
    }
  }

  function getTheme() {
    return document.documentElement.getAttribute("data-theme") || "dark";
  }

  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);

    if (themeMeta) {
      themeMeta.setAttribute("content", theme === "light" ? "#f8f9fb" : "#0b0f14");
    }

    if (themeToggle) {
      const isDark = theme === "dark";
      themeToggle.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
      themeToggle.querySelector(".theme-toggle__icon").textContent = isDark ? "☀" : "☾";
    }
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      setTheme(getTheme() === "dark" ? "light" : "dark");
    });
    setTheme(getTheme());
  }

  pageLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const pageId = link.dataset.page || link.getAttribute("href")?.slice(1);
      if (!pageId || !validPages.includes(pageId)) return;

      event.preventDefault();
      showPage(pageId);
      closeMobileMenu();
    });
  });

  window.addEventListener("hashchange", () => {
    const pageId = window.location.hash.slice(1);
    if (pageId && validPages.includes(pageId)) {
      showPage(pageId, false);
    }
  });

  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const isOpen = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;

      filterBtns.forEach((b) => b.classList.toggle("is-active", b === btn));

      projectCards.forEach((card) => {
        const type = card.dataset.type;
        const show = filter === "all" || type === filter;
        card.classList.toggle("is-hidden", !show);
      });
    });
  });

  const initialPage = window.location.hash.slice(1);
  showPage(initialPage && validPages.includes(initialPage) ? initialPage : "about", false);
})();
