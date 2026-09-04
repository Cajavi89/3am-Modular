const nav = document.getElementById("nav");
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");
const gallery = document.getElementById("gallery");
const filters = document.querySelectorAll(".filter");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxTitle = document.getElementById("lightboxTitle");
const lightboxText = document.getElementById("lightboxText");
const form = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");
const year = document.getElementById("year");

year.textContent = String(new Date().getFullYear());

if (location.hash) {
  const target = document.querySelector(location.hash);
  if (target) {
    requestAnimationFrame(() => target.scrollIntoView({ block: "start" }));
  }
}

window.addEventListener("scroll", () => {
  nav.classList.toggle("is-scrolled", window.scrollY > 12);
});

navToggle.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(open));
});

navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

window.setTimeout(() => {
  document.querySelectorAll(".reveal:not(.is-visible)").forEach((el) => {
    el.classList.add("is-visible");
  });
}, 1800);

function applyFilter(category) {
  document.querySelectorAll(".card").forEach((card) => {
    const match = category === "all" || card.dataset.cat === category;
    card.classList.toggle("is-hidden", !match);
  });

  filters.forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.filter === category);
  });
}

filters.forEach((btn) => {
  btn.addEventListener("click", () => applyFilter(btn.dataset.filter));
});

document.querySelectorAll("[data-filter]").forEach((link) => {
  if (link.tagName !== "A") return;
  link.addEventListener("click", () => {
    const category = link.dataset.filter;
    if (category) applyFilter(category);
  });
});

gallery.addEventListener("click", (event) => {
  const card = event.target.closest(".card");
  if (!card) return;

  lightboxImg.src = card.dataset.src;
  lightboxImg.alt = card.dataset.title;
  lightboxTitle.textContent = card.dataset.title;
  lightboxText.textContent = card.dataset.text;
  lightbox.showModal();
});

document.querySelector(".lightbox__close").addEventListener("click", () => {
  lightbox.close();
});

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) lightbox.close();
});

const messages = {
  name: "Escribe tu nombre.",
  email: "Ingresa un correo válido.",
  phone: "Usa un teléfono de 7 a 15 dígitos.",
  line: "Selecciona una línea de interés.",
  message: "Cuéntanos un poco más del proyecto.",
};

function setError(name, text) {
  const node = form.querySelector(`[data-error="${name}"]`);
  if (node) node.textContent = text;
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value) {
  if (!value) return true;
  return /^[+()\s\d-]{7,20}$/.test(value) && value.replace(/\D/g, "").length >= 7;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  formStatus.textContent = "";
  formStatus.classList.remove("is-error");

  const data = Object.fromEntries(new FormData(form));
  let valid = true;

  Object.keys(messages).forEach((key) => setError(key, ""));

  if (!data.name.trim()) {
    setError("name", messages.name);
    valid = false;
  }

  if (!isValidEmail(data.email.trim())) {
    setError("email", messages.email);
    valid = false;
  }

  if (!isValidPhone(data.phone.trim())) {
    setError("phone", messages.phone);
    valid = false;
  }

  if (!data.line) {
    setError("line", messages.line);
    valid = false;
  }

  if (!data.message.trim() || data.message.trim().length < 10) {
    setError("message", messages.message);
    valid = false;
  }

  if (!valid) {
    formStatus.textContent = "Revisa los campos marcados.";
    formStatus.classList.add("is-error");
    return;
  }

  const inquiries = JSON.parse(localStorage.getItem("bam-inquiries") || "[]");
  inquiries.push({
    ...data,
    createdAt: new Date().toISOString(),
  });
  localStorage.setItem("bam-inquiries", JSON.stringify(inquiries));

  const lineLabels = {
    publicidad: "Material publicitario",
    remodelacion: "Renovación de espacios",
    ambas: "Ambas líneas",
  };

  const subject = encodeURIComponent(`Consulta web · ${lineLabels[data.line] || data.line}`);
  const body = encodeURIComponent(
    `Nombre: ${data.name}\nCorreo: ${data.email}\nTeléfono: ${data.phone || "No indicado"}\nLínea: ${lineLabels[data.line] || data.line}\n\n${data.message}`
  );

  form.reset();
  formStatus.textContent = "Abriendo tu correo para enviar a comercial@3amodular.com";
  window.location.href = `mailto:comercial@3amodular.com?subject=${subject}&body=${body}`;
});
