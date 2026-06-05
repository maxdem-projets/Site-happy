document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Elements ---
  const themeToggleBtn = document.getElementById("theme-toggle");
  const navButtons = document.querySelectorAll(".admin-nav-item");
  const panels = document.querySelectorAll(".admin-panel");
  const panelTitle = document.getElementById("admin-panel-title");
  const panelSubtitle = document.getElementById("admin-panel-subtitle");
  
  // Newsletter Elements
  const countNewsletterBadge = document.getElementById("count-newsletter-badge");
  const subscriberTableBody = document.getElementById("subscriber-table-body");
  const btnAddSubscriber = document.getElementById("btn-add-subscriber");
  const subscriberFormModal = document.getElementById("subscriber-form-modal");
  const subscriberAdminForm = document.getElementById("subscriber-admin-form");
  const btnCloseSubModal = document.getElementById("btn-close-sub-modal");
  const btnCancelSub = document.getElementById("btn-cancel-sub");
  const subscriberSearch = document.getElementById("subscriber-search");

  // Articles Elements
  const countArticlesBadge = document.getElementById("count-articles-badge");
  const articleTableBody = document.getElementById("article-table-body");
  const btnAddArticle = document.getElementById("btn-add-article");
  const articleFormModal = document.getElementById("article-form-modal");
  const articleAdminForm = document.getElementById("article-admin-form");
  const btnCloseArticleModal = document.getElementById("btn-close-article-modal");
  const btnCancelArticle = document.getElementById("btn-cancel-article");
  const articleSearch = document.getElementById("article-search");
  
  // Article Form Fields
  const formArticleId = document.getElementById("form-article-id");
  const formTitle = document.getElementById("form-title");
  const formCategory = document.getElementById("form-category");
  const formImage = document.getElementById("form-image");
  const formSource = document.getElementById("form-source");
  const formSourceLink = document.getElementById("form-source-link");
  const formSmileFactor = document.getElementById("form-smile-factor");
  const formBody = document.getElementById("form-body");
  const formFeatured = document.getElementById("form-featured");
  const formOffset = document.getElementById("form-offset");
  const articleModalTitle = document.getElementById("article-modal-title");

  // Toast Notification
  const toastNotification = document.getElementById("toast-notification");
  const toastMessage = document.getElementById("toast-message");

  // --- State Variables ---
  let subscribers = [];
  let articlesList = [];

  // --- Initial Setup ---
  // Theme Manager
  const savedTheme = localStorage.getItem("parallel-theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-theme");
  }

  themeToggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");
    const isDark = document.body.classList.contains("dark-theme");
    localStorage.setItem("parallel-theme", isDark ? "dark" : "light");
  });

  // Sidebar Panel Switching
  navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      // Remove active from all nav items and panels
      navButtons.forEach(b => b.classList.remove("active"));
      panels.forEach(p => p.classList.remove("active"));

      // Set active
      btn.classList.add("active");
      const targetPanelId = btn.getAttribute("data-target");
      const targetPanel = document.getElementById(targetPanelId);
      targetPanel.classList.add("active");

      // Update Header Text
      if (targetPanelId === "panel-stats") {
        panelTitle.textContent = "Statistiques du site";
        panelSubtitle.textContent = "Aperçu en temps réel de l'audience et des performances.";
      } else if (targetPanelId === "panel-newsletter") {
        panelTitle.textContent = "Base d'abonnés newsletter";
        panelSubtitle.textContent = "Visualisez, filtrez, exportez et modifiez les inscriptions clients.";
      } else if (targetPanelId === "panel-articles") {
        panelTitle.textContent = "Gestion de l'actualité";
        panelSubtitle.textContent = "Publiez, modifiez ou supprimez des articles pour l'ensemble du site.";
      }
    });
  });

  // Toast Helper
  function showToast(message) {
    toastMessage.textContent = message;
    toastNotification.classList.add("show");
    setTimeout(() => {
      toastNotification.classList.remove("show");
    }, 3000);
  }

  // --- 1. Newsletter Database Module ---
  function initNewsletterData() {
    const localNewsletter = localStorage.getItem("parallel_newsletter");
    if (localNewsletter) {
      subscribers = JSON.parse(localNewsletter);
    } else {
      // Mock initial subscribers if empty
      subscribers = [
        { email: "maxime.demilly@example.com", date: "1 juin 2026, 09:30" },
        { email: "contact@entreprise-verte.fr", date: "2 juin 2026, 14:15" },
        { email: "sophie.dubois@gmail.com", date: "3 juin 2026, 08:05" },
        { email: "lucas.martin@laposte.net", date: "3 juin 2026, 11:42" }
      ];
      localStorage.setItem("parallel_newsletter", JSON.stringify(subscribers));
    }
    updateNewsletterBadge();
    renderSubscribers();
  }

  function updateNewsletterBadge() {
    countNewsletterBadge.textContent = subscribers.length;
  }

  function renderSubscribers(filter = "") {
    subscriberTableBody.innerHTML = "";
    
    const filteredSubscribers = subscribers.filter(sub => 
      sub.email.toLowerCase().includes(filter.toLowerCase())
    );

    if (filteredSubscribers.length === 0) {
      subscriberTableBody.innerHTML = `
        <tr>
          <td colspan="3" style="text-align: center; color: var(--gray); padding: 30px;">
            Aucun inscrit trouvé.
          </td>
        </tr>
      `;
      return;
    }

    filteredSubscribers.forEach((sub, idx) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td style="font-weight: 600;">${sub.email}</td>
        <td class="date-td">${sub.date}</td>
        <td style="text-align: center;">
          <button class="btn-table-action btn-delete" data-idx="${idx}">Désinscrire</button>
        </td>
      `;
      subscriberTableBody.appendChild(tr);
    });

    // Attach Delete Action
    document.querySelectorAll("#subscriber-table-body .btn-delete").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const idx = parseInt(btn.getAttribute("data-idx"));
        const targetEmail = subscribers[idx].email;
        if (confirm(`Êtes-vous sûr de vouloir supprimer l'abonné ${targetEmail} ?`)) {
          subscribers.splice(idx, 1);
          localStorage.setItem("parallel_newsletter", JSON.stringify(subscribers));
          updateNewsletterBadge();
          renderSubscribers(subscriberSearch.value);
          showToast("Abonné supprimé avec succès.");
        }
      });
    });
  }

  // Add Subscriber Modal Logic
  btnAddSubscriber.addEventListener("click", () => {
    subscriberFormModal.classList.add("active");
  });

  function closeSubscriberModal() {
    subscriberFormModal.classList.remove("active");
    subscriberAdminForm.reset();
  }

  btnCloseSubModal.addEventListener("click", closeSubscriberModal);
  btnCancelSub.addEventListener("click", closeSubscriberModal);

  subscriberAdminForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const emailInput = document.getElementById("sub-email").value.trim();

    if (subscribers.some(sub => sub.email.toLowerCase() === emailInput.toLowerCase())) {
      alert("Cet e-mail est déjà inscrit à la newsletter !");
      return;
    }

    subscribers.push({
      email: emailInput,
      date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    });

    localStorage.setItem("parallel_newsletter", JSON.stringify(subscribers));
    updateNewsletterBadge();
    renderSubscribers(subscriberSearch.value);
    closeSubscriberModal();
    showToast("Nouvel abonné ajouté.");
  });

  subscriberSearch.addEventListener("input", (e) => {
    renderSubscribers(e.target.value);
  });


  // --- 2. Articles Manager Module ---
  function initArticlesData() {
    const CURRENT_VERSION = "1.0.4";
    const storedVersion = localStorage.getItem("parallel_version");
    if (storedVersion !== CURRENT_VERSION) {
      localStorage.removeItem("parallel_articles");
      localStorage.setItem("parallel_version", CURRENT_VERSION);
    }

    const localArticles = localStorage.getItem("parallel_articles");
    if (localArticles) {
      articlesList = JSON.parse(localArticles);
    } else {
      // articles global was loaded from articles.js
      articlesList = [...articles];
      localStorage.setItem("parallel_articles", JSON.stringify(articlesList));
    }
    updateArticlesBadge();
    renderArticlesTable();
  }

  function updateArticlesBadge() {
    countArticlesBadge.textContent = articlesList.length;
  }

  function renderArticlesTable(filter = "") {
    articleTableBody.innerHTML = "";

    const filteredArticles = articlesList.filter(art => 
      art.title.toLowerCase().includes(filter.toLowerCase()) ||
      art.category.toLowerCase().includes(filter.toLowerCase())
    );

    if (filteredArticles.length === 0) {
      articleTableBody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align: center; color: var(--gray); padding: 30px;">
            Aucun article trouvé.
          </td>
        </tr>
      `;
      return;
    }

    filteredArticles.forEach(art => {
      const tr = document.createElement("tr");
      
      const categoryClass = getCategoryClass(art.category);
      const isFeaturedText = art.featured ? '<span class="trend up" style="margin-left: 8px;">À la Une</span>' : '';
      const dayText = art.offsetDays === 0 ? "Aujourd'hui" : `Il y a ${art.offsetDays} jour(s)`;

      tr.innerHTML = `
        <td style="font-weight: 700; line-height: 1.4;">${art.title} ${isFeaturedText}</td>
        <td><span class="admin-badge-cat tag-${categoryClass}">${art.category}</span></td>
        <td class="date-td">${dayText}</td>
        <td style="text-align: center; white-space: nowrap;">
          <button class="btn-table-action btn-edit" data-id="${art.id}">Modifier</button>
          <button class="btn-table-action btn-delete" data-id="${art.id}">Supprimer</button>
        </td>
      `;
      articleTableBody.appendChild(tr);
    });

    // Helper for category classes matching main style
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

    // Attach actions
    document.querySelectorAll("#article-table-body .btn-delete").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = parseInt(btn.getAttribute("data-id"));
        const targetArt = articlesList.find(a => a.id === id);
        if (confirm(`Êtes-vous sûr de vouloir supprimer définitivement l'article : \n"${targetArt.title}" ?`)) {
          articlesList = articlesList.filter(a => a.id !== id);
          localStorage.setItem("parallel_articles", JSON.stringify(articlesList));
          updateArticlesBadge();
          renderArticlesTable(articleSearch.value);
          showToast("Article supprimé.");
        }
      });
    });

    document.querySelectorAll("#article-table-body .btn-edit").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = parseInt(btn.getAttribute("data-id"));
        const targetArt = articlesList.find(a => a.id === id);
        if (targetArt) {
          openArticleModal(targetArt);
        }
      });
    });
  }

  // Edit / Add Article Form Modals
  btnAddArticle.addEventListener("click", () => {
    openArticleModal(); // Open empty form
  });

  function openArticleModal(articleObj = null) {
    if (articleObj) {
      // Edit mode
      articleModalTitle.textContent = "Modifier l'article";
      formArticleId.value = articleObj.id;
      formTitle.value = articleObj.title;
      formCategory.value = articleObj.category;
      formImage.value = articleObj.image || "";
      formSource.value = articleObj.source || "";
      formSourceLink.value = articleObj.sourceLink || "";
      formSmileFactor.value = articleObj.smileFactor || "";
      formBody.value = articleObj.body || "";
      formFeatured.checked = !!articleObj.featured;
      formOffset.value = articleObj.offsetDays !== undefined ? articleObj.offsetDays : 0;
    } else {
      // Add mode
      articleModalTitle.textContent = "Publier un nouvel article";
      formArticleId.value = "";
      articleAdminForm.reset();
      formOffset.value = 0;
      formFeatured.checked = false;
    }
    articleFormModal.classList.add("active");
  }

  function closeArticleModal() {
    articleFormModal.classList.remove("active");
    articleAdminForm.reset();
  }

  btnCloseArticleModal.addEventListener("click", closeArticleModal);
  btnCancelArticle.addEventListener("click", closeArticleModal);

  // Form submission handler
  articleAdminForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const idVal = formArticleId.value;
    const titleVal = formTitle.value.trim();
    const categoryVal = formCategory.value;
    const imageVal = formImage.value.trim();
    const sourceVal = formSource.value.trim();
    const sourceLinkVal = formSourceLink.value.trim();
    const smileVal = formSmileFactor.value.trim();
    const bodyVal = formBody.value.trim();
    const featuredVal = formFeatured.checked;
    const offsetVal = parseInt(formOffset.value);

    // If marked featured, remove featured tag from other articles of the day
    if (featuredVal) {
      articlesList.forEach(art => {
        if (art.offsetDays === offsetVal) {
          art.featured = false;
        }
      });
    }

    if (idVal) {
      // Edit existing
      const artId = parseInt(idVal);
      const index = articlesList.findIndex(a => a.id === artId);
      if (index !== -1) {
        articlesList[index] = {
          ...articlesList[index],
          title: titleVal,
          category: categoryVal,
          image: imageVal,
          source: sourceVal,
          sourceLink: sourceLinkVal,
          smileFactor: smileVal,
          body: bodyVal,
          featured: featuredVal,
          offsetDays: offsetVal
        };
        showToast("Article mis à jour.");
      }
    } else {
      // Add new
      const maxId = articlesList.reduce((max, a) => a.id > max ? a.id : max, 0);
      const newArt = {
        id: maxId + 1,
        isCustom: true,
        title: titleVal,
        category: categoryVal,
        image: imageVal,
        source: sourceVal,
        sourceLink: sourceLinkVal,
        smileFactor: smileVal,
        body: bodyVal,
        featured: featuredVal,
        offsetDays: offsetVal
      };
      articlesList.unshift(newArt); // Put at top
      showToast("Nouvel article publié.");
    }

    // Save to localstorage
    localStorage.setItem("parallel_articles", JSON.stringify(articlesList));
    updateArticlesBadge();
    renderArticlesTable(articleSearch.value);
    closeArticleModal();
  });

  articleSearch.addEventListener("input", (e) => {
    renderArticlesTable(e.target.value);
  });

  // --- Initial Startup ---
  initNewsletterData();
  initArticlesData();
});
