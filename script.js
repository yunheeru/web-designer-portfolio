const projects = [
  {
    title: "MORROW — 천천히, 오래 쓰는 좋은 것들",
    category: "BRAND IDENTITY",
    description: "빠르게 소비되는 일상에 오래 곁에 둘 물건을 제안하는 라이프스타일 브랜드. 자연의 색과 느린 리듬을 담은 아이덴티티, 패키지, 디지털 접점을 디자인했습니다.",
    services: "Brand strategy · Identity · Packaging",
    year: "2025",
  },
  {
    title: "STILL, YOUR DAY — 나를 위한 작은 쉼표",
    category: "DIGITAL PRODUCT",
    description: "하루 5분, 마음의 날씨를 기록하는 셀프 케어 앱. 차분한 타이포그래피와 부담 없는 기록 플로우로 매일의 작은 루틴을 제안합니다.",
    services: "Product strategy · UX/UI · Prototyping",
    year: "2025",
  },
  {
    title: "SÉREIN — 피부가 편안해지는 균형",
    category: "BRAND IDENTITY",
    description: "민감한 피부를 위한 스킨케어 브랜드의 첫 시작. 과장된 약속 대신 성분과 감각에 집중하는 브랜드 전략과 비주얼 시스템을 구축했습니다.",
    services: "Brand strategy · Art direction · Packaging",
    year: "2024",
  },
  {
    title: "OBJECT ARCHIVE — 시간이 만든 아름다움",
    category: "DIGITAL EXPERIENCE",
    description: "오래된 물건에 담긴 이야기를 큐레이션하는 온라인 아카이브. 에디토리얼 레이아웃과 직관적인 쇼핑 경험으로 제품의 시간을 보여줍니다.",
    services: "UX/UI · Editorial design · E-commerce",
    year: "2024",
  },
];

const filterButtons = document.querySelectorAll(".filter-button");
const filterRow = document.querySelector(".filter-row");
const projectGrid = document.querySelector(".project-grid");
const projectCards = document.querySelectorAll(".project-card");
let filterTransitionId = 0;
let filterAnimations = [];
const dialog = document.querySelector(".project-dialog");
const closeButton = document.querySelector(".dialog-close");
const previousProjectButton = document.querySelector(".dialog-previous");
const nextProjectButton = document.querySelector(".dialog-next");
const dialogPosition = document.querySelector(".dialog-position");
const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const siteHeader = document.querySelector(".site-header");
const siteHeaderInner = document.querySelector(".site-header-inner");
let dialogProjectIndexes = [];
let dialogProjectPosition = 0;

const updateFilterIndicator = () => {
  const activeButton = filterRow.querySelector(".filter-button.is-active");
  if (!activeButton) return;

  const rowRect = filterRow.getBoundingClientRect();
  const buttonRect = activeButton.getBoundingClientRect();
  filterRow.style.setProperty("--filter-indicator-left", `${buttonRect.left - rowRect.left}px`);
  filterRow.style.setProperty("--filter-indicator-width", `${buttonRect.width}px`);
};

updateFilterIndicator();
window.addEventListener("resize", updateFilterIndicator);

filterButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    if (button.classList.contains("is-active")) return;

    const filter = button.dataset.filter;
    const transitionId = ++filterTransitionId;

    filterAnimations.forEach((animation) => animation.cancel());
    filterAnimations = [];

    filterButtons.forEach((item) => {
      const isActive = item === button;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });
    updateFilterIndicator();

    const matchesFilter = (card) => filter === "all" || card.dataset.category === filter;
    const visibleCards = [...projectCards].filter((card) => !card.hidden);
    const targetCards = [...projectCards].filter(matchesFilter);
    const canAnimate = document.visibilityState === "visible"
      && !window.matchMedia("(prefers-reduced-motion: reduce)").matches
      && typeof Element.prototype.animate === "function";

    if (canAnimate) {
      filterAnimations = visibleCards.map((card) => card.animate(
        [
          { opacity: 1, transform: "translateY(0)" },
          { opacity: 0, transform: "translateY(12px)" },
        ],
        { duration: 180, easing: "ease", fill: "forwards" },
      ));

      await Promise.all(filterAnimations.map((animation) => animation.finished.catch(() => undefined)));
      if (transitionId !== filterTransitionId) return;
    }

    filterAnimations.forEach((animation) => animation.cancel());
    filterAnimations = [];
    projectGrid.classList.toggle("is-filtered-digital", filter === "digital");
    projectCards.forEach((card) => {
      card.hidden = !matchesFilter(card);
    });

    const enteringOrder = targetCards
      .map((card, index) => ({ card, index, rect: card.getBoundingClientRect() }))
      .sort((a, b) => a.rect.top - b.rect.top || a.rect.left - b.rect.left || a.index - b.index);

    enteringOrder.forEach(({ card }, index) => {
      if (canAnimate) {
        filterAnimations.push(card.animate(
          [
            { opacity: 0, transform: "translateY(12px)" },
            { opacity: 1, transform: "translateY(0)" },
          ],
          { duration: 280, delay: index * 65, easing: "cubic-bezier(.2,.7,.2,1)", fill: "both" },
        ));
      }
    });
  });
});

const renderDialogProject = (projectIndex) => {
  const project = projects[projectIndex];
  const card = [...projectCards].find((item) => Number(item.dataset.project) === projectIndex);
  if (!project || !card || !(dialog instanceof HTMLDialogElement)) return false;

  dialog.querySelector("#dialog-category").textContent = project.category;
  dialog.querySelector("#dialog-title").textContent = project.title;
  dialog.querySelector("#dialog-description").textContent = project.description;
  dialog.querySelector("#dialog-services").textContent = project.services;
  dialog.querySelector("#dialog-year").textContent = project.year;
  dialog.querySelector("#dialog-image").replaceChildren(card.querySelector(".project-image").cloneNode(true));
  return true;
};

const updateDialogNavigation = () => {
  previousProjectButton.disabled = dialogProjectPosition === 0;
  nextProjectButton.disabled = dialogProjectPosition === dialogProjectIndexes.length - 1;
  dialogPosition.textContent = `${String(dialogProjectPosition + 1).padStart(2, "0")} / ${String(dialogProjectIndexes.length).padStart(2, "0")}`;
};

const moveDialogProject = (direction) => {
  const nextPosition = dialogProjectPosition + direction;
  if (nextPosition < 0 || nextPosition >= dialogProjectIndexes.length) return;

  if (renderDialogProject(dialogProjectIndexes[nextPosition])) {
    dialogProjectPosition = nextPosition;
    updateDialogNavigation();
  }
};

projectCards.forEach((card) => {
  card.addEventListener("click", () => {
    const projectIndex = Number(card.dataset.project);
    dialogProjectIndexes = [...projectCards]
      .filter((item) => !item.hidden)
      .map((item) => Number(item.dataset.project));
    dialogProjectPosition = dialogProjectIndexes.indexOf(projectIndex);

    if (dialogProjectPosition < 0 || !renderDialogProject(projectIndex)) return;
    updateDialogNavigation();
    dialog.showModal();
  });
});

closeButton.addEventListener("click", () => dialog.close());
previousProjectButton.addEventListener("click", () => moveDialogProject(-1));
nextProjectButton.addEventListener("click", () => moveDialogProject(1));
dialog.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    moveDialogProject(-1);
  } else if (event.key === "ArrowRight") {
    event.preventDefault();
    moveDialogProject(1);
  }
});

let pointerStartedOutsideDialog = false;
const isOutsideDialog = (event) => {
  const rect = dialog.getBoundingClientRect();
  return event.clientX < rect.left || event.clientX > rect.right
    || event.clientY < rect.top || event.clientY > rect.bottom;
};

dialog.addEventListener("pointerdown", (event) => {
  pointerStartedOutsideDialog = isOutsideDialog(event);
});
dialog.addEventListener("pointerup", (event) => {
  const clickedOutside = pointerStartedOutsideDialog && isOutsideDialog(event);
  pointerStartedOutsideDialog = false;
  if (clickedOutside) dialog.close();
});
dialog.addEventListener("pointercancel", () => {
  pointerStartedOutsideDialog = false;
});

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") !== "true";
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.querySelector(".sr-only").textContent = isOpen ? "메뉴 닫기" : "메뉴 열기";
  siteNav.classList.toggle("is-open", isOpen);
});

siteNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.querySelector(".sr-only").textContent = "메뉴 열기";
    siteNav.classList.remove("is-open");
  });
});

let lastScrollY = window.scrollY;
const setHeaderHidden = (isHidden) => {
  if (window.gsap && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.gsap.to(siteHeaderInner, {
      yPercent: isHidden ? -110 : 0,
      duration: 0.42,
      ease: "power2.inOut",
      overwrite: "auto",
    });
  } else {
    siteHeaderInner.style.transform = isHidden ? "translateY(-110%)" : "";
  }
  siteHeader.classList.toggle("is-hidden", isHidden);
};
const revealHeader = () => setHeaderHidden(false);

document.addEventListener("click", (event) => {
  if (event.target instanceof Element && !siteHeader.contains(event.target)) {
    setHeaderHidden(true);
  }
});

window.addEventListener("scroll", () => {
  const currentScrollY = window.scrollY;
  if (currentScrollY < lastScrollY) revealHeader();
  lastScrollY = currentScrollY;
}, { passive: true });

document.addEventListener("pointermove", (event) => {
  if (event.clientY <= 16) revealHeader();
}, { passive: true });

const forestViewport = document.querySelector(".forest-experience");
const forestIntroPanel = forestViewport?.querySelector(".forest-intro");
const updateForestIntroHeight = () => {
  if (!forestViewport || !forestIntroPanel) return;
  forestViewport.style.setProperty("--forest-intro-height", `${forestIntroPanel.offsetHeight}px`);
};

updateForestIntroHeight();
window.addEventListener("resize", updateForestIntroHeight);

const gsapCore = window.gsap;
const scrollTrigger = window.ScrollTrigger;

if (gsapCore && scrollTrigger) {
  gsapCore.registerPlugin(scrollTrigger);
  const scrollMotion = gsapCore.matchMedia();

  scrollMotion.add("(prefers-reduced-motion: no-preference)", () => {
    const forestExperience = document.querySelector(".forest-experience");
    const forestScene = document.querySelector(".forest-scene");
    const storySection = document.querySelector(".story-section");
    const storySidebar = document.querySelector(".story-sidebar");
    const isDesktop = window.matchMedia("(min-width: 761px)").matches;

    document.documentElement.classList.add("gsap-ready");

    if (forestExperience && forestScene) {
      const forestIntro = forestExperience.querySelector(".forest-intro");
      const forestTimeline = gsapCore.timeline({
        scrollTrigger: {
          trigger: forestExperience,
          start: isDesktop ? "top top" : "top 75%",
          end: isDesktop ? `+=${Math.round(window.innerHeight * 3.6)}` : "bottom top",
          scrub: 1,
          pin: isDesktop ? forestExperience : false,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          snap: isDesktop
            ? {
                snapTo: "labelsDirectional",
                delay: 0.1,
                duration: { min: 0.15, max: 0.4 },
                ease: "power1.inOut",
              }
            : false,
          toggleClass: { targets: forestScene, className: "is-active" },
        },
      });

      forestTimeline
        .addLabel("trailhead", 0)
        .to(forestScene.querySelector(".forest-walker"), { x: () => window.innerWidth * 0.025, y: -3, duration: 0.4, ease: "power1.inOut" }, 0)
        .to(forestScene.querySelector(".forest-walker"), { x: () => window.innerWidth * 0.05, y: 0, duration: 0.4, ease: "power1.inOut" }, 0.4)
        .to(forestScene.querySelector(".forest-walker"), { x: () => window.innerWidth * 0.075, y: -3, duration: 0.4, ease: "power1.inOut" }, 0.8)
        .addLabel("three-steps", 1.2)
        .to(forestScene, { top: 0, duration: 0.85, ease: "power2.inOut" }, 1.2)
        .to(forestIntro, { autoAlpha: 0, y: -18, duration: 0.45, ease: "power2.in" }, 1.6)
        .addLabel("full-screen", 2.05)
        .to(forestScene.querySelector(".forest-sky"), { z: -150, scale: 1.16, yPercent: 2, duration: 5, ease: "none" }, 0)
        .to(forestScene.querySelector(".forest-light"), { xPercent: 12, yPercent: 4, z: 45, opacity: 0.8, duration: 5, ease: "none" }, 0)
        .to(forestScene.querySelector(".forest-layer--back"), { xPercent: -11, yPercent: 2, z: -120, scale: 1.06, rotationY: -2, filter: "blur(1.2px)", duration: 5, ease: "none" }, 0)
        .to(forestScene.querySelector(".forest-layer--mid"), { xPercent: -24, yPercent: 1, z: -15, scale: 1.04, rotationY: -0.8, duration: 5, ease: "none" }, 0)
        .to(forestScene.querySelector(".forest-mist"), { xPercent: 18, yPercent: -12, z: 65, opacity: 0.82, duration: 5, ease: "none" }, 0)
        .to(forestScene.querySelector(".forest-layer--front"), { xPercent: -38, yPercent: -3, z: 120, scale: 1.07, rotationY: 1.5, duration: 5, ease: "none" }, 0)
        .to(forestScene.querySelector(".forest-walker"), { x: () => window.innerWidth * 0.2, y: -8, z: 90, scale: 1.08, rotationY: -2, duration: 2.95, ease: "none" }, 2.05)
        .to(forestScene.querySelector(".forest-scroll-meter > span"), { scaleX: 1, duration: 5, ease: "none" }, 0)
        .addLabel("last-steps", 4.55)
        .addLabel("sunlit-clearing", 5);

      if (isDesktop && siteHeader) {
        forestTimeline
          .to(siteHeader, { yPercent: -110, autoAlpha: 0, duration: 0.35, ease: "power2.inOut" }, 2.05)
          .to(siteHeader, { yPercent: 0, autoAlpha: 1, duration: 0.35, ease: "power2.out" }, 4.55);
      }
    }

    const manifestoSection = document.querySelector(".manifesto-section");
    if (manifestoSection) {
      const manifestoLines = manifestoSection.querySelectorAll(".manifesto-line");
      const manifestoGlow = manifestoSection.querySelector(".manifesto-glow");
      const manifestoOrbit = manifestoSection.querySelector(".manifesto-orbit");
      const manifestoProgress = manifestoSection.querySelector(".manifesto-progress > span");
      const manifestoTimeline = gsapCore.timeline({
        scrollTrigger: {
          trigger: manifestoSection,
          start: "top top",
          end: () => `+=${Math.round(window.innerHeight * (isDesktop ? 2.4 : 2))}`,
          scrub: 0.8,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          snap: {
            snapTo: "labelsDirectional",
            delay: 0.08,
            duration: { min: 0.15, max: 0.4 },
            ease: "power1.inOut",
          },
        },
      });

      manifestoTimeline
        .fromTo(manifestoLines[0], { autoAlpha: 0, y: 70, scale: 0.94 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.65, ease: "power3.out" }, 0)
        .addLabel("our", 0.72)
        .fromTo(manifestoLines[1], { autoAlpha: 0, y: 70, scale: 0.94 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.65, ease: "power3.out" }, 0.86)
        .addLabel("design", 1.58)
        .fromTo(manifestoLines[2], { autoAlpha: 0, y: 70, scale: 0.94 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.65, ease: "power3.out" }, 1.72)
        .addLabel("make", 2.44)
        .to(manifestoLines, { scale: 1.045, duration: 0.24, ease: "power2.out" }, 2.62)
        .to(manifestoLines, { scale: 1, duration: 0.28, ease: "power2.inOut" }, 2.86)
        .to(manifestoSection, { backgroundColor: "#3d4538", duration: 1.1, ease: "none" }, 1.1)
        .to(manifestoGlow, { xPercent: -9, yPercent: 8, scale: 1.12, opacity: 1, duration: 3.14, ease: "none" }, 0)
        .to(manifestoOrbit, { rotation: 8, scale: 1.08, duration: 3.14, ease: "none" }, 0)
        .to(manifestoProgress, { scaleX: 1, duration: 3.14, ease: "none" }, 0)
        .addLabel("together", 3.14);
    }

    const horizontalPortfolio = document.querySelector(".horizontal-portfolio");
    const horizontalStage = horizontalPortfolio?.querySelector(".horizontal-stage");
    const horizontalTrack = horizontalStage?.querySelector(".horizontal-track");
    const horizontalPanels = horizontalTrack?.querySelectorAll(".horizontal-panel");

    if (isDesktop && horizontalStage && horizontalTrack && horizontalPanels && horizontalPanels.length > 1) {
      const getHorizontalTravel = () => Math.max(1, horizontalTrack.scrollWidth - horizontalStage.clientWidth);
      const horizontalCounter = horizontalStage.querySelector(".horizontal-current");
      let activePanel = 0;
      const horizontalTimeline = gsapCore.timeline({
        scrollTrigger: {
          trigger: horizontalPortfolio,
          start: "top top",
          end: () => `+=${getHorizontalTravel()}`,
          scrub: 0.9,
          pin: horizontalPortfolio,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          snap: {
            snapTo: "labelsDirectional",
            delay: 0.08,
            duration: { min: 0.15, max: 0.4 },
            ease: "power1.inOut",
          },
          onUpdate: (trigger) => {
            const nextPanel = Math.min(
              horizontalPanels.length - 1,
              Math.round(trigger.progress * (horizontalPanels.length - 1)),
            );

            if (nextPanel !== activePanel && horizontalCounter) {
              activePanel = nextPanel;
              horizontalCounter.textContent = String(activePanel + 1).padStart(2, "0");
            }
          },
        },
      });

      horizontalTimeline
        .to(horizontalTrack, { x: () => -getHorizontalTravel(), duration: 1, ease: "none" }, 0)
        .to(horizontalStage.querySelector(".horizontal-progress > span"), { scaleX: 1, duration: 1, ease: "none" }, 0);

      horizontalPanels.forEach((_, index) => {
        horizontalTimeline.addLabel(
          `panel-${String(index + 1).padStart(2, "0")}`,
          index / (horizontalPanels.length - 1),
        );
      });
    }

    if (isDesktop && storySection && storySidebar) {
      gsapCore.to(storySidebar, {
        scrollTrigger: {
          trigger: storySection,
          start: "top 100px",
          end: "bottom bottom",
          pin: storySidebar,
          pinSpacing: false,
          anticipatePin: 1,
        },
      });
    }

    document.querySelectorAll(".story-card").forEach((card) => {
      gsapCore.fromTo(
        card,
        { autoAlpha: 0, y: 48, rotateX: 8, scale: 0.96, transformOrigin: "center bottom" },
        {
          autoAlpha: 1,
          y: 0,
          rotateX: 0,
          scale: 1,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 84%",
            toggleActions: "play none none reverse",
          },
        },
      );
    });

    return () => document.documentElement.classList.remove("gsap-ready");
  });
}
