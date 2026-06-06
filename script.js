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
