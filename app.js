import { STYLES } from "../src/data/content.js";
import { renderCertificate } from "../src/data/renderTemplate.js";

const grid = document.getElementById("styles-grid");
const selectionBar = document.getElementById("selection-bar");
const selectionCount = document.getElementById("selection-count");
const checkoutBtn = document.getElementById("checkout-btn");
const testBtn = document.getElementById("test-btn");

// Un exemple différent par style, tiré de catégories variées, pour que la
// grille ne montre jamais le même titre/la même phrase deux fois.
const PREVIEW_CONTENT_BY_STYLE = {
  parchemin: {
    title: "Diplôme du Meilleur Papa",
    firstname: "Marc",
    date: new Date().toISOString().slice(0, 10),
    phrase: "Pour amour inconditionnel et sans limite",
  },
  neon: {
    title: "Certificat de Survie en Réunion",
    firstname: "Sophie",
    date: new Date().toISOString().slice(0, 10),
    phrase: "Pour avoir survécu à une réunion qui aurait pu être un email",
  },
  comic: {
    title: "Diplôme du Roi de la Flemme",
    firstname: "Julien",
    date: new Date().toISOString().slice(0, 10),
    phrase: "Pour avoir dormi malgré 5 alarmes",
  },
  minimal: {
    title: "Diplôme Officiel d'une Année de Plus",
    firstname: "Camille",
    date: new Date().toISOString().slice(0, 10),
    phrase: "Pour une année de plus, pas forcément de sagesse",
  },
  grunge: {
    title: "Brevet Officiel de Supportage",
    firstname: "Nadia",
    date: new Date().toISOString().slice(0, 10),
    phrase: "Pour patience infinie et sans faille",
  },
  pastel: {
    title: "Certificat de Champion du Pull Moche",
    firstname: "Léo",
    date: new Date().toISOString().slice(0, 10),
    phrase: "Pour port du pull le plus moche avec fierté assumée",
  },
};

let requiredCount = 1; // 1 (single) ou 3 (pack)
const selectedStyles = new Set();

function renderGrid() {
  grid.innerHTML = "";
  for (const style of STYLES) {
    const previewContent = PREVIEW_CONTENT_BY_STYLE[style.id];
    const card = document.createElement("button");
    card.type = "button";
    card.className = "style-card";
    card.dataset.styleId = style.id;
    card.innerHTML = `
      <div class="thumb">${renderCertificate(style.id, previewContent)}</div>
      <div class="meta">
        <h3>${style.name}</h3>
        <p>${style.description}</p>
      </div>
    `;
    card.addEventListener("click", () => toggleStyle(style.id, card));
    grid.appendChild(card);
  }
}

function toggleStyle(styleId, cardEl) {
  if (selectedStyles.has(styleId)) {
    selectedStyles.delete(styleId);
    cardEl.classList.remove("selected");
  } else {
    if (selectedStyles.size >= requiredCount) {
      // Retire le plus ancien choix si on dépasse le quota (comportement "remplace le premier")
      const [first] = selectedStyles;
      selectedStyles.delete(first);
      grid.querySelector(`[data-style-id="${first}"]`)?.classList.remove("selected");
    }
    selectedStyles.add(styleId);
    cardEl.classList.add("selected");
  }
  updateSelectionBar();
}

function updateSelectionBar() {
  selectionBar.hidden = false;
  selectionCount.textContent = `${selectedStyles.size} / ${requiredCount} style${requiredCount > 1 ? "s" : ""} sélectionné${selectedStyles.size > 1 ? "s" : ""}`;
  checkoutBtn.disabled = selectedStyles.size !== requiredCount;
}

document.querySelectorAll("[data-select-count]").forEach((btn) => {
  btn.addEventListener("click", () => {
    requiredCount = Number(btn.dataset.selectCount);
    selectedStyles.clear();
    grid.querySelectorAll(".style-card").forEach((c) => c.classList.remove("selected"));
    document.querySelectorAll(".btn-select").forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");
    updateSelectionBar();
  });
});

// Mode test : contourne totalement Stripe, pour vérifier le rendu et le parcours
// de personnalisation sans payer. À retirer ou protéger par mot de passe avant
// une vraie mise en production publique.
testBtn.addEventListener("click", () => {
  const styles =
    selectedStyles.size > 0
      ? Array.from(selectedStyles)
      : STYLES.slice(0, 3).map((s) => s.id); // par défaut : 3 premiers styles
  const params = new URLSearchParams({ test: "1", styles: styles.join(",") });
  window.location.href = `/personalize.html?${params.toString()}`;
});

checkoutBtn.addEventListener("click", async () => {
  checkoutBtn.disabled = true;
  checkoutBtn.textContent = "Redirection…";
  try {
    const res = await fetch("/.netlify/functions/create-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        count: requiredCount,
        styles: Array.from(selectedStyles),
      }),
    });
    if (!res.ok) throw new Error("checkout_failed");
    const { url } = await res.json();
    window.location.href = url;
  } catch (err) {
    checkoutBtn.disabled = false;
    checkoutBtn.textContent = "Payer et personnaliser";
    alert("Le paiement n'a pas pu démarrer. Réessayez dans un instant.");
  }
});

renderGrid();
