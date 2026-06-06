const header = document.querySelector("[data-header]");
const featureButtons = [...document.querySelectorAll("[data-feature]")];
const preview = document.querySelector("[data-preview]");
const form = document.querySelector(".waitlist-form");
const formNote = document.querySelector("[data-form-note]");

const previewStates = {
  shield: {
    badge: "Shield active",
    time: "25:00",
    label: "Focus protected",
    background:
      "radial-gradient(circle at 50% 34%, rgba(255,255,255,.28), transparent 31%), linear-gradient(180deg, #3b237d, #171326)",
  },
  missions: {
    badge: "Mission ready",
    time: "07:00",
    label: "Walk reset",
    background:
      "radial-gradient(circle at 50% 34%, rgba(255,255,255,.24), transparent 31%), linear-gradient(180deg, #49b95f, #193821)",
  },
  buddy: {
    badge: "Buddy streak",
    time: "3x",
    label: "Friends active",
    background:
      "radial-gradient(circle at 50% 34%, rgba(255,255,255,.26), transparent 31%), linear-gradient(180deg, #6d45d9, #2a1b54)",
  },
  plan: {
    badge: "Plan updated",
    time: "82",
    label: "Recovery score",
    background:
      "radial-gradient(circle at 50% 34%, rgba(255,255,255,.24), transparent 31%), linear-gradient(180deg, #ff7b45, #3d247e)",
  },
};

function updateHeader() {
  header.classList.toggle("is-scrolled", window.scrollY > 12);
}

function updatePreview(key) {
  const state = previewStates[key];

  preview.querySelector(".preview-badge").textContent = state.badge;
  preview.querySelector(".timer-ring strong").textContent = state.time;
  preview.querySelector(".timer-ring span").textContent = state.label;
  preview.style.background = state.background;
}

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

featureButtons.forEach((button) => {
  button.addEventListener("click", () => {
    featureButtons.forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    updatePreview(button.dataset.feature);
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const email = new FormData(form).get("email");
  formNote.textContent = email
    ? "You're on the list. We'll send Demb beta updates there."
    : "Private beta updates only.";
  form.reset();
});

// --- Path & Mascot Animation ---
const svg = document.getElementById("journey-path");
const mascot = document.getElementById("mascot");
const mascotAngry = document.getElementById("mascot-angry");
const mascotHappy = document.getElementById("mascot-happy");
const cards = document.querySelectorAll(".problem-grid article, .step");

let pathElement;
let pathLength = 0;

// Cached coordinates to prevent layout thrashing on scroll
let problemTop = 0;
let howBottom = 0;
let howTop = 0;
let cardsCache = [];

function drawPath() {
  if (!svg || cards.length === 0) return;
  
  svg.innerHTML = '';
  const newPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  
  // Cache section dimensions
  const problemSection = document.querySelector(".problem");
  const howSection = document.querySelector(".how");
  if (problemSection && howSection) {
    const pRect = problemSection.getBoundingClientRect();
    const hRect = howSection.getBoundingClientRect();
    problemTop = pRect.top + scrollTop;
    howBottom = hRect.bottom + scrollTop;
    howTop = hRect.top + scrollTop;
  }
  
  // Cache cards and draw path
  cardsCache = [];
  let d = "";
  cards.forEach((card, index) => {
    const rect = card.getBoundingClientRect();
    const cardTop = rect.top + scrollTop;
    const cardLeft = rect.left;
    const cardWidth = rect.width;
    const cardHeight = rect.height;
    
    // Store in cache for scroll animation
    cardsCache.push({
      el: card,
      top: cardTop,
      height: cardHeight,
      type: card.classList.contains("step") ? "solution" : "problem"
    });
    
    // Center of the card
    const x = cardLeft + cardWidth / 2;
    const y = cardTop + cardHeight / 2;
    
    if (index === 0) {
      d += `M ${x} ${y}`;
    } else {
      // Create a smooth bezier curve between points
      const prevCard = cardsCache[index - 1];
      const prevRect = cards[index - 1].getBoundingClientRect();
      const prevX = prevRect.left + prevRect.width / 2;
      const prevY = prevRect.top + scrollTop + prevRect.height / 2;
      
      const cx1 = prevX + (x - prevX) * 0.5;
      const cy1 = prevY;
      const cx2 = prevX + (x - prevX) * 0.5;
      const cy2 = y;
      
      d += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x} ${y}`;
    }
  });
  
  newPath.setAttribute("d", d);
  svg.appendChild(newPath);
  pathElement = newPath;
  pathLength = pathElement.getTotalLength();
  
  // Set SVG dimensions to cover the whole document height
  svg.style.height = document.documentElement.scrollHeight + 'px';
  
  updateScrollAnimations(); // update animations and mascot on resize/load
}

function updateScrollAnimations() {
  if (!pathElement || !mascot) return;
  
  const scrollY = window.scrollY;
  const viewportHeight = window.innerHeight;
  const viewportCenter = scrollY + viewportHeight / 2;
  
  // 1. Calculate scroll progress through the journey sections
  let progress = (viewportCenter - problemTop) / (howBottom - problemTop);
  progress = Math.max(0, Math.min(1, progress));
  
  // Mascot visibility check
  if (viewportCenter > problemTop - viewportHeight / 2 && viewportCenter < howBottom + viewportHeight / 2) {
    mascot.classList.add("is-visible");
  } else {
    mascot.classList.remove("is-visible");
  }
  
  // Mascot position
  const point = pathElement.getPointAtLength(progress * pathLength);
  mascot.style.transform = `translate(${point.x}px, ${point.y}px)`;
  
  // Mascot happy/angry state crossfade
  if (viewportCenter > howTop) {
    if (mascotHappy) {
      if (mascotHappy.classList.contains("is-hidden")) {
        mascotHappy.classList.remove("is-hidden");
        mascotHappy.play().catch(() => {});
      }
    }
    if (mascotAngry) mascotAngry.classList.add("is-hidden");
  } else {
    if (mascotHappy) {
      if (!mascotHappy.classList.contains("is-hidden")) {
        mascotHappy.classList.add("is-hidden");
        mascotHappy.pause();
      }
    }
    if (mascotAngry) mascotAngry.classList.remove("is-hidden");
  }
  
  // 2. Card scroll transitions (dissolving/entering effects)
  cardsCache.forEach(item => {
    const elementCenter = item.top + item.height / 2;
    const currentY = elementCenter - scrollY; // position of element center relative to viewport top
    
    if (item.type === "problem") {
      // Fade out and blur as the card scrolls up out of the top half of the screen
      const startFadeY = viewportHeight * 0.45; // starts fading/blurring above 45% screen height
      const endFadeY = -item.height; // fully faded when scrolled off screen
      
      let p = 0;
      if (currentY < startFadeY) {
        p = (startFadeY - currentY) / (startFadeY - endFadeY);
        p = Math.max(0, Math.min(1, p));
      }
      
      const opacity = 1 - p;
      const blur = p * 12;
      const translateY = -p * 30;
      const scale = 1 - p * 0.04;
      
      item.el.style.setProperty("--scroll-opacity", opacity);
      item.el.style.setProperty("--scroll-blur", `${blur}px`);
      item.el.style.setProperty("--scroll-translate-y", `${translateY}px`);
      item.el.style.setProperty("--scroll-scale", scale);
    } else if (item.type === "solution") {
      // Fade in and un-blur as the card rises from the bottom of the screen
      const startFadeY = viewportHeight; // start fading at bottom edge
      const endFadeY = viewportHeight * 0.55; // fully visible at 55% screen height
      
      let p = 0;
      if (currentY < startFadeY) {
        p = (startFadeY - currentY) / (startFadeY - endFadeY);
        p = Math.max(0, Math.min(1, p));
      }
      
      const opacity = p;
      const blur = (1 - p) * 12;
      const translateY = (1 - p) * 30;
      const scale = 0.96 + p * 0.04;
      
      item.el.style.setProperty("--scroll-opacity", opacity);
      item.el.style.setProperty("--scroll-blur", `${blur}px`);
      item.el.style.setProperty("--scroll-translate-y", `${translateY}px`);
      item.el.style.setProperty("--scroll-scale", scale);
    }
  });
}

let scrollTimeout;
window.addEventListener("scroll", () => {
  updateScrollAnimations();
  
  // stop walking after scroll stops
  clearTimeout(scrollTimeout);
  mascot.classList.add("is-walking");
  scrollTimeout = setTimeout(() => {
    mascot.classList.remove("is-walking");
  }, 150);
}, { passive: true });

window.addEventListener("resize", drawPath);

// Initialize on load and with a short fallback delay to ensure layout is complete
window.addEventListener("load", drawPath);
setTimeout(drawPath, 200);
