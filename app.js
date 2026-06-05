document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Elements ---
  const currentDateEl = document.getElementById("current-date");
  const themeToggleBtn = document.getElementById("theme-toggle");
  const heroGridSection = document.getElementById("hero-grid-section");
  const heroLayout = document.getElementById("hero-layout");
  const articlesGrid = document.getElementById("articles-grid");
  const searchInput = document.getElementById("search-input");
  const filterTabs = document.getElementById("filter-tabs");
  const mainSectionTitle = document.getElementById("main-section-title");
  
  // Quote Elements
  const quoteDisplay = document.getElementById("quote-display");
  const btnNextQuote = document.getElementById("btn-next-quote");
  
  // Newsletter Forms
  const mainNewsletterForm = document.getElementById("main-newsletter-form");
  const sideNewsletterPopup = document.getElementById("side-newsletter-popup");
  const sideNewsletterForm = document.getElementById("side-newsletter-form");
  const sidePopupClose = document.getElementById("side-popup-close");
  
  // Modal Elements
  const articleModal = document.getElementById("article-modal");
  const modalCloseBtn = document.getElementById("modal-close");
  const modalImage = document.getElementById("modal-image");
  const modalCategory = document.getElementById("modal-category");
  const modalTitle = document.getElementById("modal-title");
  const modalSmileFactor = document.getElementById("modal-smile-factor");
  const modalBody = document.getElementById("modal-body");
  const modalDate = document.getElementById("modal-date");
  const modalSourceName = document.getElementById("modal-source-name");
  const modalSourceLink = document.getElementById("modal-source-link");
  
  // Toast Elements
  const toastNotification = document.getElementById("toast-notification");
  const toastMessage = document.getElementById("toast-message");

  // State
  let currentCategory = "Tous";
  let searchQuery = "";

  // Version invalidation to force cache refresh for static database updates
  const CURRENT_VERSION = "1.0.4";
  const storedVersion = localStorage.getItem("parallel_version");
  if (storedVersion !== CURRENT_VERSION) {
    localStorage.removeItem("parallel_articles");
    localStorage.setItem("parallel_version", CURRENT_VERSION);
  }

  // Initialize articles list from localStorage or default (with static sync)
  let articlesList = [];
  try {
    const storedArticles = localStorage.getItem("parallel_articles");
    if (storedArticles) {
      let localList = JSON.parse(storedArticles);
      
      // Filter out any stale static articles from localStorage and only keep custom articles created by user
      const customArticles = localList.filter(a => a.isCustom);
      
      // Merge static articles from articles.js with custom user articles
      // We map static articles to ensure we don't have duplicates if title matches
      const customFiltered = customArticles.filter(customArt => 
        !articles.some(staticArt => staticArt.title.toLowerCase().trim() === customArt.title.toLowerCase().trim())
      );
      
      articlesList = [...articles, ...customFiltered];
      
      // Sort articles by id descending
      articlesList.sort((a, b) => b.id - a.id);
      
      localStorage.setItem("parallel_articles", JSON.stringify(articlesList));
    } else {
      articlesList = [...articles];
      localStorage.setItem("parallel_articles", JSON.stringify(articlesList));
    }
  } catch (e) {
    console.error("Failed to load articles from localStorage", e);
    articlesList = [...articles];
  }
  
  // --- Date resolution and display ---
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const today = new Date();
  currentDateEl.textContent = today.toLocaleDateString('fr-FR', options);

  // Compute and format real dates for articles based on offsetDays
  function updateArticleDates() {
    articlesList.forEach(art => {
      const artDate = new Date();
      artDate.setDate(today.getDate() - (art.offsetDays || 0));
      art.date = artDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    });
  }
  updateArticleDates();

  // --- Theme Management ---
  const savedTheme = localStorage.getItem("parallel-theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-theme");
  }

  themeToggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");
    const isDark = document.body.classList.contains("dark-theme");
    localStorage.setItem("parallel-theme", isDark ? "dark" : "light");
  });

  // --- SVG Placeholder Generator for missing images ---
  function getCategoryColors(category) {
    switch (category) {
      case "Environnement & Planète":
        return { start: "#2ECC71", end: "#27AE60" };
      case "Santé":
        return { start: "#FF7675", end: "#D63031" };
      case "IA & Tech":
        return { start: "#0984E3", end: "#74B9FF" };
      case "Politique & Société":
        return { start: "#6C5CE7", end: "#A29BFE" };
      case "Business & Économie Positive":
        return { start: "#F1C40F", end: "#F39C12" };
      case "France":
        return { start: "#00d2d3", end: "#54a0ff" };
      case "Monde":
        return { start: "#10ac84", end: "#1dd1a1" };
      case "Sport":
        return { start: "#FF9F43", end: "#EE5253" };
      default:
        return { start: "#FF5722", end: "#FF8A50" };
    }
  }

  function getCategoryIconSVG(category) {
    switch (category) {
      case "Environnement & Planète":
        return `<path d="M150,55 C175,80 175,110 150,130 C125,110 125,80 150,55 Z M150,55 L150,130 M150,80 L165,70 M150,100 L135,90" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
      case "Santé":
        return `<path d="M110,100 H130 L140,75 L155,125 L165,85 L175,110 L185,100 H200" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M140,85 C140,75 150,75 150,85 C150,75 160,75 160,85 C160,95 150,105 150,110 C150,105 140,95 140,85 Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.8"/>`;
      case "IA & Tech":
        return `<path d="M110,120 L150,70 L190,120 Z M150,70 V120 M110,120 H190" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="150" cy="70" r="5" fill="white"/><circle cx="110" cy="120" r="5" fill="white"/><circle cx="190" cy="120" r="5" fill="white"/><circle cx="150" cy="120" r="5" fill="white"/>`;
      case "Politique & Société":
        return `<circle cx="135" cy="85" r="9" stroke="white" stroke-width="2.5" fill="none"/><path d="M115,125 C115,110 155,110 155,125" stroke="white" stroke-width="2.5" fill="none"/><circle cx="165" cy="85" r="9" stroke="white" stroke-width="2.5" fill="none"/><path d="M145,125 C145,110 185,110 185,125" stroke="white" stroke-width="2.5" fill="none"/>`;
      case "Business & Économie Positive":
        return `<path d="M100,125 L135,90 L160,105 L200,65 M200,65 H175 M200,65 V90" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
      case "France":
        return `<path d="M150,60 L185,80 L185,120 L150,140 L115,120 L115,80 Z" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M150,60 V140" stroke="white" stroke-width="1.5" stroke-dasharray="4 4" opacity="0.6"/>`;
      case "Monde":
        return `<circle cx="150" cy="100" r="35" stroke="white" stroke-width="2.5" fill="none"/><path d="M115,100 H185 M150,65 V135 M120,85 C132,95 168,95 180,85 M120,115 C132,105 168,105 180,115" stroke="white" stroke-width="2" fill="none" opacity="0.7"/>`;
      case "Sport":
        return `<path d="M135,130 C135,105 150,80 150,60 C150,80 165,105 165,130 C165,145 150,148 150,148 C150,148 135,145 135,130 Z M150,95 V125" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
      default:
        return `<circle cx="150" cy="100" r="25" stroke="white" stroke-width="2.5" fill="none"/><line x1="150" y1="65" x2="150" y2="70" stroke="white" stroke-width="2.5"/><line x1="150" y1="130" x2="150" y2="135" stroke="white" stroke-width="2.5"/><line x1="115" y1="100" x2="120" y2="100" stroke="white" stroke-width="2.5"/><line x1="180" y1="100" x2="185" y2="100" stroke="white" stroke-width="2.5"/>`;
    }
  }

  function renderPlaceholderSVG(category, title = "", iconSize = 40, textSize = 14) {
    const cleanTitle = title ? title.replace(/"/g, '&quot;') : category;
    return `
      <div class="placeholder-fallback category-${getCategoryClass(category)}">
        <div class="placeholder-title-container">
          <div class="placeholder-bullet"></div>
          <h3 class="placeholder-title">${cleanTitle}</h3>
        </div>
      </div>
    `;
  }

  function getCategoryClass(category) {
    switch (category) {
      case "Environnement & Planète": return "environnement";
      case "Santé": return "sante";
      case "IA & Tech": return "tech";
      case "Politique & Société": return "societe";
      case "Business & Économie Positive": return "economie";
      case "France": return "france";
      case "Monde": return "monde";
      case "Sport": return "sport";
      default: return "default";
    }
  }

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // --- Article Rendering ---
  function renderArticles() {
    let filtered = [];

    if (currentCategory === "Tous") {
      // MODE "À la Une" (première page) : Uniquement les articles du jour (offsetDays === 0 ou non défini)
      const dayArticles = articlesList.filter(art => !art.offsetDays || art.offsetDays === 0);
      
      // Trouver l'article mis en avant à la une (le flip du jour)
      let mainFeatured = dayArticles.find(art => art.featured);
      if (!mainFeatured) mainFeatured = dayArticles[0];

      // Mélanger aléatoirement le reste des articles du jour
      const otherArticles = dayArticles.filter(art => art.id !== mainFeatured.id);
      shuffleArray(otherArticles);

      // Reconstituer la liste avec le grand article de Une en premier
      filtered = [mainFeatured, ...otherArticles];
      
      // Activer la section Hero Grid (Style Les Echos 1 + 2)
      heroGridSection.style.display = "block";
      mainSectionTitle.textContent = "Les sujets du jour";
    } else {
      // MODE CATÉGORIE : Tous les articles de cette catégorie, aujourd'hui + historique (toutes dates)
      filtered = articlesList.filter(art => art.category === currentCategory);
      
      // Désactiver la section Hero Grid (Style Les Echos) pour n'avoir qu'une liste propre
      heroGridSection.style.display = "none";
      mainSectionTitle.textContent = `Actualités : ${currentCategory}`;
    }

    // Appliquer le filtre de recherche textuelle
    if (searchQuery !== "") {
      filtered = filtered.filter(art => 
        art.title.toLowerCase().includes(searchQuery) ||
        art.body.toLowerCase().includes(searchQuery) ||
        art.smileFactor.toLowerCase().includes(searchQuery) ||
        art.category.toLowerCase().includes(searchQuery)
      );
    }

    // Rendu spécifique si pas d'articles
    if (filtered.length === 0) {
      heroGridSection.style.display = "none";
      articlesGrid.innerHTML = `
        <div class="no-results">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3>Aucune bonne nouvelle trouvée</h3>
          <p>Essayez de modifier votre recherche ou de changer de thématique.</p>
        </div>
      `;
      return;
    }

    // Si on est à la Une, distribuer la grille asymétrique (1 grand à gauche, 2 petits à droite)
    let gridStartIdx = [];
    
    if (currentCategory === "Tous" && searchQuery === "") {
      // Trouver l'article mis en avant à la une
      let mainFeatured = filtered.find(art => art.featured);
      if (!mainFeatured) mainFeatured = filtered[0];

      // Trouver quatre autres articles du jour pour la colonne de droite
      const sideFeatured = filtered.filter(art => art.id !== mainFeatured.id).slice(0, 4);

      // Générer l'HTML pour le grand article de gauche
      const mainImgHTML = mainFeatured.image 
        ? `<img src="${mainFeatured.image}" alt="${mainFeatured.title}" class="hero-main-image">`
        : renderPlaceholderSVG(mainFeatured.category, mainFeatured.title, 60, 18);

      const mainHTML = `
        <div class="hero-main-card" data-id="${mainFeatured.id}">
          <div class="hero-main-image-container">
            ${mainImgHTML}
          </div>
          <div class="hero-main-content">
            <span class="category-tag tag-${getCategoryClass(mainFeatured.category)}">${mainFeatured.category}</span>
            <h2>${mainFeatured.title}</h2>
            <div class="smile-factor">
              <strong>Angle Parallèle :</strong> ${mainFeatured.smileFactor}
            </div>
            <p class="hero-main-excerpt">${mainFeatured.body}</p>
            <div class="article-meta">
              <span>Publié aujourd'hui</span>
              <span>Source : <span class="source-tag">${mainFeatured.source}</span></span>
            </div>
          </div>
        </div>
      `;

      // Générer l'HTML pour les quatre petits articles de droite
      const sideHTML = `
        <div class="hero-side-container">
          ${sideFeatured.map(art => {
            const sideImgHTML = art.image
              ? `<img src="${art.image}" alt="${art.title}" class="hero-side-image">`
              : renderPlaceholderSVG(art.category, art.title, 30, 12);
            return `
              <div class="hero-side-card" data-id="${art.id}">
                <div class="hero-side-image-container">
                  ${sideImgHTML}
                </div>
                <div class="hero-side-content">
                  <span class="category-tag tag-${getCategoryClass(art.category)}">${art.category}</span>
                  <h3>${art.title}</h3>
                  <p class="card-excerpt">${art.body}</p>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      `;

      heroLayout.innerHTML = mainHTML + sideHTML;

      // Déterminer quels articles afficher dans la grille principale du dessous (exclure les 3 mis en Une)
      gridStartIdx = [mainFeatured.id, ...sideFeatured.map(a => a.id)];
    }

    // Afficher la grille d'articles
    let remainingArticles = [];
    if (currentCategory === "Tous" && searchQuery === "") {
      remainingArticles = filtered.filter(art => !gridStartIdx.includes(art.id));
    } else {
      remainingArticles = filtered;
    }

    articlesGrid.innerHTML = remainingArticles.map(art => {
      const cardImgHTML = art.image
        ? `<img src="${art.image}" alt="${art.title}" class="card-image" loading="lazy">`
        : renderPlaceholderSVG(art.category, art.title, 45, 14);

      return `
        <div class="article-card" data-id="${art.id}">
          <div class="card-image-container">
            ${cardImgHTML}
          </div>
          <div class="card-content">
            <span class="category-tag tag-${getCategoryClass(art.category)}">${art.category}</span>
            <h3>${art.title}</h3>
            <p class="card-excerpt">${art.body}</p>
            <div class="article-meta">
              <span>${art.offsetDays === 0 ? "Aujourd'hui" : art.date}</span>
              <span>Source : <span class="source-tag">${art.source}</span></span>
            </div>
          </div>
        </div>
      `;
    }).join("");

    // Setup click events on cards
    document.querySelectorAll(".hero-main-card, .hero-side-card, .article-card").forEach(card => {
      card.addEventListener("click", () => {
        const id = parseInt(card.getAttribute("data-id"));
        const article = articlesList.find(art => art.id === id);
        if (article) openModal(article);
      });
    });
  }

  // --- Modal Management ---
  function openModal(article) {
    modalCategory.className = `category-tag tag-${getCategoryClass(article.category)}`;
    modalCategory.textContent = article.category;
    modalTitle.textContent = article.title;
    modalSmileFactor.innerHTML = `<strong>Angle Parallèle :</strong> ${article.smileFactor}`;
    modalBody.textContent = article.body;
    modalDate.textContent = `Publié le ${article.date}`;
    modalSourceName.textContent = article.source;
    modalSourceLink.href = article.sourceLink;
    
    const photoLink = document.getElementById("modal-photo-link");
    const photoName = document.getElementById("modal-photo-name");
    const photoContainer = document.getElementById("modal-photo-source-container");

    if (article.image) {
      modalImage.style.display = "block";
      modalImage.src = article.image;
      modalImage.alt = article.title;
      
      if (article.photoSource && article.photoSourceLink) {
        photoName.textContent = article.photoSource;
        photoLink.href = article.photoSourceLink;
        photoContainer.style.display = "inline";
      } else {
        photoName.textContent = "Unsplash";
        photoLink.href = "https://unsplash.com";
        photoContainer.style.display = "inline";
      }
    } else {
      modalImage.style.display = "none";
      if (photoContainer) photoContainer.style.display = "none";
    }

    articleModal.classList.add("active");
    document.body.style.overflow = "hidden"; // Disable background scrolling
  }

  function closeModal() {
    articleModal.classList.remove("active");
    document.body.style.overflow = ""; // Enable scrolling
  }

  modalCloseBtn.addEventListener("click", closeModal);
  articleModal.addEventListener("click", (e) => {
    if (e.target === articleModal) closeModal();
  });

  // Esc key closes modal
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  // --- Filtering & Searching ---
  function selectCategory(category) {
    // Sync header tab active state
    document.querySelectorAll(".filter-tab").forEach(tab => {
      const tabCat = tab.getAttribute("data-category");
      if (tabCat === category || (category === "Tous" && tabCat === "Tous")) {
        tab.classList.add("active");
      } else {
        tab.classList.remove("active");
      }
    });

    currentCategory = category;
    if (currentCategory === "À la Une") currentCategory = "Tous";
    
    // Scroll smoothly to navigation/content start
    window.scrollTo({
      top: document.querySelector(".navigation-section").offsetTop - 20,
      behavior: "smooth"
    });
    
    renderArticles();
  }

  // Header Category tabs
  filterTabs.addEventListener("click", (e) => {
    if (e.target.classList.contains("filter-tab")) {
      const category = e.target.getAttribute("data-category");
      selectCategory(category);
    }
  });

  // Footer Category links integration
  document.querySelectorAll(".footer-cat-link").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const category = link.getAttribute("data-cat");
      selectCategory(category);
    });
  });

  // Search input
  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    renderArticles();
  });

  // --- Quotes Rotation ---
  function showRandomQuote() {
    const randomIndex = Math.floor(Math.random() * parallelQuotes.length);
    quoteDisplay.style.opacity = 0;
    setTimeout(() => {
      quoteDisplay.textContent = parallelQuotes[randomIndex];
      quoteDisplay.style.opacity = 1;
    }, 250);
  }

  btnNextQuote.addEventListener("click", showRandomQuote);
  quoteDisplay.style.transition = "opacity 0.25s ease";

  // --- Newsletter Popup Logic (Vertically Centered Right side) ---
  const isPopupDismissed = localStorage.getItem("parallel-popup-dismissed") === "true";
  
  if (!isPopupDismissed) {
    // Open popup after 3 seconds
    setTimeout(() => {
      sideNewsletterPopup.classList.add("active");
    }, 3000);
  }

  // Close Popup
  sidePopupClose.addEventListener("click", () => {
    sideNewsletterPopup.classList.remove("active");
    localStorage.setItem("parallel-popup-dismissed", "true");
  });

  function saveNewsletterSubscription(email) {
    try {
      let subscribers = JSON.parse(localStorage.getItem("parallel_newsletter") || "[]");
      if (!subscribers.some(sub => sub.email.toLowerCase() === email.toLowerCase())) {
        subscribers.push({
          email: email,
          date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        });
        localStorage.setItem("parallel_newsletter", JSON.stringify(subscribers));
      }
    } catch (e) {
      console.error("Failed to save newsletter subscription", e);
    }
  }

  // Newsletter form submissions
  mainNewsletterForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("news-email-input").value;
    saveNewsletterSubscription(email);
    showToast(`☀ Merci ! L'adresse ${email} a bien été enregistrée pour recevoir la dose Parallel quotidienne.`);
    mainNewsletterForm.reset();
  });

  sideNewsletterForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("side-email-input").value;
    saveNewsletterSubscription(email);
    showToast(`☀ Merci ! L'adresse ${email} a bien été enregistrée pour recevoir la dose Parallel quotidienne.`);
    sideNewsletterPopup.classList.remove("active");
    localStorage.setItem("parallel-popup-dismissed", "true");
    sideNewsletterForm.reset();
  });

  function showToast(message) {
    toastMessage.textContent = message;
    toastNotification.classList.add("show");
    setTimeout(() => {
      toastNotification.classList.remove("show");
    }, 4500);
  }

  // --- Initial Render ---
  renderArticles();
  showRandomQuote();
});
