import { CATEGORIES, getCategory } from "../src/data/content.js";
import { renderCertificate } from "../src/data/renderTemplate.js";

// Après paiement, le client est redirigé ici avec un token de session en query string.
// Ce token est vérifié côté serveur (fonction verify-session) et renvoie :
// { styles: ["neon", "parchemin", "comic"], sessionId: "..." }
// styles.length = 1 ou 3 selon le pack acheté.

const params = new URLSearchParams(window.location.search);
const sessionToken = params.get("session");

const form = document.getElementById("personalize-form");
const categorySelect = document.getElementById("category");
const titleSelect = document.getElementById("title");
const phraseSelect = document.getElementById("phrase");
const firstnameInput = document.getElementById("firstname");
const dateInput = document.getElementById("date");
const emailInput = document.getElementById("email");
const formError = document.getElementById("form-error");
const previewFrame = document.getElementById("preview-frame");
const progressEl = document.getElementById("progress");
const prevBtn = document.getElementById("prev-btn");
const downloadBtn = document.getElementById("download-btn");

let purchasedStyles = [];   // ex: ["neon", "parchemin", "comic"]
let currentIndex = 0;
// Sauvegarde locale des choix déjà faits pour chaque certificat du pack, pour permettre "certificat précédent".
const draftsByIndex = {};

dateInput.value = new Date().toISOString().slice(0, 10);

function populateCategories() {
  categorySelect.innerHTML = CATEGORIES.map(
    (c) => `<option value="${c.id}">${c.name}</option>`
  ).join("");
}

function populateTitlesAndPhrases(categoryId) {
  const category = getCategory(categoryId);
  titleSelect.innerHTML = category.titles
    .map((t) => `<option value="${t}">${t}</option>`)
    .join("");
  phraseSelect.innerHTML = category.phrases
    .map((p) => `<option value="${p}">${p}</option>`)
    .join("");
}

function currentStyleId() {
  return purchasedStyles[currentIndex];
}

function updatePreview() {
  const content = {
    title: titleSelect.value,
    firstname: firstnameInput.value.trim() || "Votre prénom",
    date: dateInput.value,
    phrase: phraseSelect.value,
  };
  previewFrame.innerHTML = renderCertificate(currentStyleId(), content);
}

function updateProgress() {
  progressEl.textContent =
    purchasedStyles.length > 1
      ? `Certificat ${currentIndex + 1} sur ${purchasedStyles.length}`
      : "Votre certificat";
  prevBtn.hidden = currentIndex === 0;
  downloadBtn.textContent =
    currentIndex < purchasedStyles.length - 1
      ? "Valider et passer au suivant"
      : "Télécharger le PDF";
}

function loadDraftIntoForm(index) {
  const draft = draftsByIndex[index];
  if (draft) {
    categorySelect.value = draft.categoryId;
    populateTitlesAndPhrases(draft.categoryId);
    titleSelect.value = draft.title;
    phraseSelect.value = draft.phrase;
    firstnameInput.value = draft.firstname;
    dateInput.value = draft.date;
  } else {
    categorySelect.value = CATEGORIES[0].id;
    populateTitlesAndPhrases(CATEGORIES[0].id);
    firstnameInput.value = "";
  }
  updatePreview();
}

categorySelect.addEventListener("change", () => {
  populateTitlesAndPhrases(categorySelect.value);
  updatePreview();
});
[titleSelect, phraseSelect, firstnameInput, dateInput].forEach((el) =>
  el.addEventListener("input", updatePreview)
);

prevBtn.addEventListener("click", () => {
  if (currentIndex === 0) return;
  currentIndex -= 1;
  loadDraftIntoForm(currentIndex);
  updateProgress();
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  formError.hidden = true;

  if (!firstnameInput.value.trim()) {
    formError.textContent = "Entrez un prénom avant de continuer.";
    formError.hidden = false;
    return;
  }
  if (!dateInput.value) {
    formError.textContent = "Choisissez une date avant de continuer.";
    formError.hidden = false;
    return;
  }

  // Sauvegarde le brouillon du certificat courant
  draftsByIndex[currentIndex] = {
    categoryId: categorySelect.value,
    title: titleSelect.value,
    phrase: phraseSelect.value,
    firstname: firstnameInput.value.trim(),
    date: dateInput.value,
  };

  const isLast = currentIndex === purchasedStyles.length - 1;

  if (!isLast) {
    currentIndex += 1;
    loadDraftIntoForm(currentIndex);
    updateProgress();
    return;
  }

  // Dernier certificat validé : on envoie tout au serveur pour génération du/des PDF.
  downloadBtn.disabled = true;
  downloadBtn.textContent = "Génération du PDF…";
  try {
    const res = await fetch("/.netlify/functions/generate-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionToken,
        email: emailInput.value.trim() || null,
        certificates: purchasedStyles.map((styleId, i) => ({
          styleId,
          ...draftsByIndex[i],
        })),
      }),
    });
    if (!res.ok) throw new Error("generate_failed");
    const { downloadUrl } = await res.json();
    window.location.href = downloadUrl;
  } catch (err) {
    formError.textContent = "La génération du PDF a échoué. Réessayez dans un instant.";
    formError.hidden = false;
    downloadBtn.disabled = false;
    updateProgress();
  }
});

async function init() {
  populateCategories();

  if (!sessionToken) {
    formError.textContent = "Session de paiement introuvable. Retournez à la page d'accueil.";
    formError.hidden = false;
    form.querySelectorAll("input, select, button").forEach((el) => (el.disabled = true));
    return;
  }

  try {
    const res = await fetch(`/.netlify/functions/verify-session?session=${encodeURIComponent(sessionToken)}`);
    if (!res.ok) throw new Error("invalid_session");
    const data = await res.json();
    purchasedStyles = data.styles; // ["neon"] ou ["neon","parchemin","comic"]
  } catch (err) {
    formError.textContent = "Paiement introuvable ou expiré. Retournez à la page d'accueil pour recommencer.";
    formError.hidden = false;
    form.querySelectorAll("input, select, button").forEach((el) => (el.disabled = true));
    return;
  }

  loadDraftIntoForm(0);
  updateProgress();
}

init();
