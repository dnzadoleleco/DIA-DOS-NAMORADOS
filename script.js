const projectData = [...document.querySelectorAll(".project-data")];
const projects = projectData.map((project) => ({
  title: project.dataset.title || "",
  year: project.dataset.year || "",
  color: project.dataset.color || "#090909",
  image: project.dataset.image || "",
  imageSecondary: project.dataset.imageSecondary || "",
  imageAlt: project.dataset.imageAlt || "",
  imageSecondaryAlt: project.dataset.imageSecondaryAlt || "",
  mediaHeight: project.dataset.mediaHeight || "",
  mediaFit: project.dataset.mediaFit || "",
  disciplines: project.querySelector("[data-project-disciplines]")?.innerHTML.trim() || "",
  text: project.querySelector("[data-project-text]")?.innerHTML.trim() || "",
}));
const BLUR_DURATION = 160;

let currentProject = 0;

const body = document.body;
const loader = document.getElementById("loader");
const loaderText = document.getElementById("loaderText");
const nav = document.querySelector(".navigation");
const menuBtn = document.querySelector(".menu-btn");
const menu = document.querySelector(".menu");
const sectionLabel = document.querySelector("[data-section-label]");
const projectTabs = document.querySelectorAll(".project-tab");
const projectList = document.querySelector(".project-list");
const caseMedia = document.querySelector(".case-media");
const projectImage = document.getElementById("projectImage");
const projectImageSecondary = document.getElementById("projectImageSecondary");
const projectYear = document.getElementById("projectYear");
const projectTitle = document.getElementById("projectTitle");
const projectText = document.getElementById("projectText");
const projectDisciplines = document.getElementById("projectDisciplines");
const copyBtn = document.getElementById("copyBtn");
const textToCopy = document.getElementById("textToCopy");
const popup = document.getElementById("popup");
const imageLightbox = document.getElementById("imageLightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxClose = document.querySelector(".lightbox-close");
const mainSections = [...document.querySelectorAll("main > section")];
const sectionLabels = {
  home: "Home",
  work: "Momentos",
  about: "Durante",
  contact: "Fim",
};

function runLoader() {
  let progress = 0;
  const timer = window.setInterval(() => {
    progress += Math.ceil(Math.random() * 13);
    if (progress >= 100) {
      progress = 100;
      window.clearInterval(timer);
      window.setTimeout(() => loader.classList.add("is-hidden"), 250);
    }
    loaderText.textContent = progress;
  }, 55);
}

function scrollToSection(id) {
  const target = document.getElementById(id);
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
}

function toggleMenu(forceState) {
  const isOpen = typeof forceState === "boolean" ? forceState : !menu.classList.contains("active");
  menu.classList.toggle("active", isOpen);
  menuBtn.classList.toggle("active", isOpen);
  menuBtn.setAttribute("aria-expanded", String(isOpen));
  menu.setAttribute("aria-hidden", String(!isOpen));
  body.classList.toggle("menu-open", isOpen);
}

function updateNavState() {
  nav.classList.toggle("is-compact", window.scrollY > 80);

  const active = mainSections
    .map((section) => ({
      id: section.id,
      top: Math.abs(section.getBoundingClientRect().top - 120),
    }))
    .sort((a, b) => a.top - b.top)[0];

  if (active && sectionLabel) {
    sectionLabel.textContent = sectionLabels[active.id] || active.id;
  }
}

function updateProject(index) {
  if (!projects.length) return;

  currentProject = (index + projects.length) % projects.length;
  const project = projects[currentProject];

  projectTabs.forEach((tab, tabIndex) => {
    const isActive = tabIndex === currentProject;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });

  projectImage.style.filter = "blur(8px)";
  if (projectImageSecondary) {
    projectImageSecondary.style.filter = "blur(8px)";
  }
  projectTitle.style.color = project.color;
  if (caseMedia) {
    if (project.mediaHeight) {
      caseMedia.style.setProperty("--case-media-height", project.mediaHeight);
    } else {
      caseMedia.style.removeProperty("--case-media-height");
    }
    caseMedia.classList.toggle("is-contain", project.mediaFit === "contain");
    caseMedia.classList.toggle("has-two-images", Boolean(project.imageSecondary));
  }

  window.setTimeout(() => {
    projectImage.src = project.image;
    projectImage.alt = project.imageAlt || `Visual do projeto ${project.title}`;
    projectImage.style.objectFit = project.mediaFit || "";
    if (projectImageSecondary) {
      if (project.imageSecondary) {
        projectImageSecondary.hidden = false;
        projectImageSecondary.src = project.imageSecondary;
        projectImageSecondary.alt = project.imageSecondaryAlt || `Segundo visual do projeto ${project.title}`;
        projectImageSecondary.style.objectFit = project.mediaFit || "";
      } else {
        projectImageSecondary.hidden = true;
        projectImageSecondary.removeAttribute("src");
        projectImageSecondary.alt = "";
        projectImageSecondary.style.objectFit = "";
      }
    }
    if (projectYear) {
      projectYear.textContent = project.year;
    }
    projectTitle.textContent = project.title;
    projectText.innerHTML = project.text;
    projectDisciplines.innerHTML = project.disciplines;
    projectImage.style.filter = "blur(0)";
    if (projectImageSecondary) {
      projectImageSecondary.style.filter = "blur(0)";
    }
  }, BLUR_DURATION);
}

function initRevealObserver() {
  const revealItems = document.querySelectorAll(
    ".reveal-card, .section-head, .project-stage, .about-layout, .about-board, .timeline article, .footer-grid"
  );

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  revealItems.forEach((item) => observer.observe(item));
}

function initCopy() {
  if (!copyBtn || !textToCopy) return;

  copyBtn.addEventListener("click", async () => {
    const value = textToCopy.textContent.trim();
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const area = document.createElement("textarea");
      area.value = value;
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }

    popup.classList.add("visible");
    window.setTimeout(() => popup.classList.remove("visible"), 1600);
  });
}

function initMagneticButtons() {
  document.querySelectorAll(".magnetic").forEach((button) => {
    button.addEventListener("mousemove", (event) => {
      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      button.style.transform = `translate(${x * 0.12}px, ${y * 0.18}px)`;
    });

    button.addEventListener("mouseleave", () => {
      button.style.transform = "translate(0, 0)";
    });
  });
}

function openLightbox(src, alt) {
  if (!imageLightbox || !lightboxImage) return;
  lightboxImage.src = src;
  lightboxImage.alt = alt || "";
  imageLightbox.classList.add("is-open");
  imageLightbox.setAttribute("aria-hidden", "false");
  body.classList.add("lightbox-open");
}

function closeLightbox() {
  if (!imageLightbox || !lightboxImage) return;
  imageLightbox.classList.remove("is-open");
  imageLightbox.setAttribute("aria-hidden", "true");
  body.classList.remove("lightbox-open");
  lightboxImage.src = "";
}

function bindEvents() {
  document.querySelectorAll("[data-scroll-to]").forEach((trigger) => {
    trigger.addEventListener("click", () => scrollToSection(trigger.dataset.scrollTo));
  });

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      toggleMenu(false);
      scrollToSection(link.getAttribute("href").slice(1));
    });
  });

  menuBtn.addEventListener("click", () => toggleMenu());

  document.querySelectorAll("[data-lightbox-src]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      openLightbox(trigger.dataset.lightboxSrc, trigger.dataset.lightboxAlt);
    });
  });

  if (lightboxClose) {
    lightboxClose.addEventListener("click", closeLightbox);
  }

  if (imageLightbox) {
    imageLightbox.addEventListener("click", (event) => {
      if (event.target === imageLightbox) closeLightbox();
    });
  }

  projectTabs.forEach((tab) => {
    tab.addEventListener("click", () => updateProject(Number(tab.dataset.project)));
  });

  document.querySelector("[data-prev-project]").addEventListener("click", () => {
    updateProject(currentProject - 1);
  });

  document.querySelector("[data-next-project]").addEventListener("click", () => {
    updateProject(currentProject + 1);
  });

  projectList.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      updateProject(currentProject + 1);
      projectTabs[currentProject].focus();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      updateProject(currentProject - 1);
      projectTabs[currentProject].focus();
    }
  });

  document.getElementById("goToTop").addEventListener("click", () => scrollToSection("home"));

  window.addEventListener("scroll", updateNavState, { passive: true });
  window.addEventListener("resize", updateNavState);
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeLightbox();
  });
}

runLoader();
bindEvents();
initCopy();
initRevealObserver();
initMagneticButtons();
updateProject(0);
updateNavState();
