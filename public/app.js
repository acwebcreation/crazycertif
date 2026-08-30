import { STYLES } from "../src/data/content.js";
import { renderCertificate } from "../src/data/renderTemplate.js";

const grid = document.getElementById("styles-grid");
const selectionBar = document.getElementById("selection-bar");
const selectionCount = document.getElementById("selection-count");
const checkoutBtn = document.getElementById("checkout-btn");

// Contenu factice utilisé uniquement pour l'aperçu des vignettes de style.
const PREVIEW_CONTENT = {
  title: "Roi de la Flemme",
  firstname: "Julien",
  date: new Date().toISOString().slice(0, 10),
  phrase: "Pour avoir dormi malgré 5 alarmes",
};

let requiredCount = 1; // 1 (single) ou 3 (pack)
const selectedStyles = new Set();

function renderGrid() {
  grid.innerHTML = "";
  for (const style of STYLES) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "style-card";
    card.dataset.styleId = style.id;
    card.innerHTML = `
      <div class="thumb">${renderCertificate(style.id, PREVIEW_CONTENT)}</div>
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
