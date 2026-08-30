import { CATEGORIES, getCategory, applyTitleType, detectTitleType } from "../src/data/content.js";
import { renderCertificate } from "../src/data/renderTemplate.js";

// Après paiement, le client est redirigé ici avec un token de session en query string.
// Ce token est vérifié côté serveur (fonction verify-session) et renvoie :
// { styles: ["neon", "parchemin", "comic"], sessionId: "..." }
// styles.length = 1 ou 3 selon le pack acheté.

const params = new URLSearchParams(window.location.search);
const sessionToken = params.get("session");
const isTestMode = params.get("test") === "1";
const testStyles = (params.get("styles") || "").split(",").filter(Boolean);

const form = document.getElementById("personalize-form");
const categorySelect = document.getElementById("category");
const titleSelect = document.getElementById("title");
const titleTypeSelect = document.getElementById("titleType");
const phraseSelect = document.getElementById("phrase");
const firstnameInput = document.getElementById("firstname");
const dateInput = document.getElementById("date");
const emailInput = document.getElementById("email");
const photoInput = document.getElementById("photo");
const orientationSelect = document.getElementById("orientation");
const removePhotoBtn = document.getElementById("remove-photo-btn");
const formError = document.getElementById("form-error");
const previewFrame = document.getElementById("preview-frame");
const progressEl = document.getElementById("progress");
const prevBtn = document.getElementById("prev-btn");
const downloadBtn = document.getElementById("download-btn");

let purchasedStyles = [];   // ex: ["neon", "parchemin", "comic"]
let currentIndex = 0;
let currentPhotoDataUrl = null; // data URL de la photo uploadée pour le certificat courant
// Sauvegarde locale des choix déjà faits pour chaque certificat du pack, pour permettre "certificat précédent".
const draftsByIndex = {};

const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5 Mo

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
  titleTypeSelect.value = detectTitleType(titleSelect.value);
}

function currentStyleId() {
  return purchasedStyles[currentIndex];
}

function currentDisplayTitle() {
  return applyTitleType(titleSelect.value, titleTypeSelect.value);
}

function updatePreview() {
  const content = {
    title: currentDisplayTitle(),
    firstname: firstnameInput.value.trim() || "Votre prénom",
    date: dateInput.value,
    phrase: phraseSelect.value,
    image: currentPhotoDataUrl,
  };
  previewFrame.classList.toggle("landscape", orientationSelect.value === "landscape");
  previewFrame.innerHTML = renderCertificate(currentStyleId(), content, orientationSelect.value);
}

function updateProgress() {
  const base =
    purchasedStyles.length > 1
      ? `Certificat ${currentIndex + 1} sur ${purchasedStyles.length}`
      : "Votre certificat";
  progressEl.textContent = isTestMode ? `🧪 Mode test — aucun paiement — ${base}` : base;
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
    titleTypeSelect.value = draft.titleType;
    phraseSelect.value = draft.phrase;
    firstnameInput.value = draft.firstname;
    dateInput.value = draft.date;
    currentPhotoDataUrl = draft.image || null;
    orientationSelect.value = draft.orientation || "portrait";
  } else {
    categorySelect.value = CATEGORIES[0].id;
    populateTitlesAndPhrases(CATEGORIES[0].id);
    firstnameInput.value = "";
    currentPhotoDataUrl = null;
    orientationSelect.value = "portrait";
  }
  photoInput.value = "";
  removePhotoBtn.hidden = !currentPhotoDataUrl;
  updatePreview();
}

categorySelect.addEventListener("change", () => {
  populateTitlesAndPhrases(categorySelect.value);
  updatePreview();
});
titleSelect.addEventListener("change", () => {
  titleTypeSelect.value = detectTitleType(titleSelect.value);
  updatePreview();
});
[phraseSelect, firstnameInput, dateInput, titleTypeSelect, orientationSelect].forEach((el) =>
  el.addEventListener("input", updatePreview)
);

photoInput.addEventListener("change", () => {
  const file = photoInput.files?.[0];
  formError.hidden = true;
  if (!file) return;
  if (file.size > MAX_PHOTO_BYTES) {
    formError.textContent = "La photo dépasse 5 Mo, choisissez un fichier plus léger.";
    formError.hidden = false;
    photoInput.value = "";
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    currentPhotoDataUrl = reader.result;
    removePhotoBtn.hidden = false;
    updatePreview();
  };
  reader.onerror = () => {
    formError.textContent = "Impossible de lire cette photo, réessayez avec un autre fichier.";
    formError.hidden = false;
  };
  reader.readAsDataURL(file);
});

removePhotoBtn.addEventListener("click", () => {
  currentPhotoDataUrl = null;
  photoInput.value = "";
  removePhotoBtn.hidden = true;
  updatePreview();
});

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
    titleType: titleTypeSelect.value,
    phrase: phraseSelect.value,
    firstname: firstnameInput.value.trim(),
    date: dateInput.value,
    image: currentPhotoDataUrl,
    orientation: orientationSelect.value,
  };

  const isLast = currentIndex === purchasedStyles.length - 1;

  if (!isLast) {
    currentIndex += 1;
    loadDraftIntoForm(currentIndex);
    updateProgress();
    return;
  }

  if (isTestMode) {
    formError.hidden = true;
    downloadBtn.textContent = "✓ Parcours test terminé (aucun PDF réel généré)";
    downloadBtn.disabled = true;
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
        certificates: purchasedStyles.map((styleId, i) => {
          const draft = draftsByIndex[i];
          return {
            styleId,
            title: applyTitleType(draft.title, draft.titleType),
            firstname: draft.firstname,
            date: draft.date,
            phrase: draft.phrase,
            image: draft.image || null,
            orientation: draft.orientation || "portrait",
          };
        }),
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

  if (isTestMode) {
    // Mode test : aucun paiement vérifié. Affiché clairement pour ne jamais
    // être confondu avec un vrai parcours d'achat.
    purchasedStyles = testStyles.length > 0 ? testStyles : ["parchemin"];
    progressEl.textContent = "🧪 Mode test — aucun paiement effectué";
    loadDraftIntoForm(0);
    updateProgress();
    return;
  }

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
