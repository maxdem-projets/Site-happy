const fs = require('fs');
const path = require('path');
const Parser = require('rss-parser');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialiser le parseur RSS et l'IA Gemini
const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  }
});
const apiKey = process.env['parallel.lemedia'] || process.env.parallel_lemedia || process.env.PARALLEL_LEMEDIA || process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("Erreur : La variable d'environnement GEMINI_API_KEY ou parallel.lemedia est manquante.");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash",
  generationConfig: { 
    responseMimeType: "application/json",
    temperature: 0.1
  }
});

const articlesFilePath = path.join(__dirname, 'articles.js');

// Sources RSS cibles de bonnes nouvelles (élargi au maximum)
const feeds = [
  { name: "Point AFP", url: "https://www.lepoint.fr/tags/afp/rss.xml" },
  { name: "Le Monde Une", url: "https://www.lemonde.fr/rss/une.xml" },
  { name: "Courrier International", url: "https://www.courrierinternational.com/feed/all/rss.xml" },
  { name: "Reuters Agency", url: "https://www.reutersagency.com/feed/" },
  { name: "AP Top Headlines", url: "https://hosted.ap.org/lineups/TOPHEADLINES.rss" },
  { name: "BBC World", url: "http://feeds.bbci.co.uk/news/world/rss.xml" },
  { name: "Hacker News", url: "https://news.ycombinator.com/rss" },
  { name: "Wired Science", url: "https://www.wired.com/feed/category/science/latest/rss" },
  { name: "MIT Technology Review", url: "https://www.technologyreview.com/feed/" },
  { name: "Maddyness", url: "https://www.maddyness.com/feed/" },
  { name: "Fix the News", url: "https://fixthenews.com/rss/" },
  { name: "Mongabay", url: "https://news.mongabay.com/feed/" },
  { name: "Vert Le Média", url: "https://vert.eco/feed" },
  { name: "L'Équipe", url: "https://www.lequipe.fr/rss/Actu_Lequipe.xml" },
  { name: "The Athletic", url: "https://theathletic.com/rss" },
  { name: "Pitchfork News", url: "https://pitchfork.com/feed/feed-news/rss" }
];

// Fonction utilitaire pour le minuteur
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function run() {
  console.log("Démarrage de la veille automatique Parallel...");

  // 1. Lire articles.js actuel
  if (!fs.existsSync(articlesFilePath)) {
    console.error(`Fichier introuvable : ${articlesFilePath}`);
    process.exit(1);
  }
  
  const fileContent = fs.readFileSync(articlesFilePath, 'utf8');
  
  // Extraire le tableau JSON articles
  const startIdx = fileContent.indexOf('[');
  const endIdx = fileContent.lastIndexOf(']');
  if (startIdx === -1 || endIdx === -1) {
    console.error("Structure de articles.js invalide (impossible de trouver le tableau d'articles).");
    process.exit(1);
  }
  
  const articlesJSON = fileContent.substring(startIdx, endIdx + 1);
  let articlesList = [];
  try {
    articlesList = eval(articlesJSON);
  } catch (err) {
    console.error("Erreur lors de la lecture du JSON des articles :", err);
    process.exit(1);
  }

  console.log(`Base de données actuelle : ${articlesList.length} articles.`);

  // 2. Décaler l'historique
  console.log("Mise à jour de l'historique : décalage de +1 jour pour les actualités existantes...");
  articlesList.forEach(art => {
    art.offsetDays = (art.offsetDays || 0) + 1;
    if (art.featured) art.featured = false;
  });

  // 3. Récupérer les articles des flux RSS
  const rawStories = [];
  const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
  for (const feed of feeds) {
    try {
      console.log(`Lecture du flux : ${feed.name}...`);
      const res = await fetch(feed.url, { headers: { 'User-Agent': ua } });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const xml = await res.text();
      const parsedFeed = await parser.parseString(xml);
      console.log(`Trouvé ${parsedFeed.items.length} articles dans ${feed.name}.`);
      parsedFeed.items.forEach(item => {
        rawStories.push({
          title: item.title,
          content: item.contentSnippet || item.content || "",
          link: item.link,
          sourceName: feed.name
        });
      });
    } catch (err) {
      console.error(`Erreur de lecture du flux ${feed.name}:`, err.message);
    }
  }

  // 4. Traiter et filtrer les articles avec Gemini
  console.log("Analyse et réécriture des articles par l'IA Gemini...");
  const newArticles = [];
  
  const categories = [
    "Environnement & Planète",
    "Santé",
    "IA & Tech",
    "Politique & Société",
    "Business & Économie Positive",
    "France",
    "Monde",
    "Sport"
  ];

  const categoryCounts = {};
  categories.forEach(cat => categoryCounts[cat] = 0);

  let hasFlip = false;
  const storiesToProcess = rawStories.slice(0, 300);
  
  let processedCount = 0; // Compteur pour savoir quand appliquer la pause

  for (const story of storiesToProcess) {
    const duplicate = articlesList.some(art => 
      art.title.toLowerCase().includes(story.title.toLowerCase().substring(0, 15))
    );
    if (duplicate) {
      console.log(`Passage de l'article (doublon potentiel) : ${story.title}`);
      continue;
    }

    const isGeneratingFlip = !hasFlip;

    // 🔥 MODIFICATION 1 : Pause stricte d'une minute avant chaque appel Gemini pour préserver les quotas gratuits
    if (processedCount > 0) {
      console.log(`⏳ [ANTI-QUOTA] Pause de 60 secondes pour préserver le forfait gratuit de Google...`);
      await sleep(60000);
    }
    processedCount++;

    let prompt = "";
    if (isGeneratingFlip) {
      prompt = `
        Tu es le rédacteur en chef de "Parallel", un quotidien d'actualité positive.
        Analyse cette nouvelle d'actualité :
        Titre d'origine : "${story.title}"
        Contenu d'origine : "${story.content}"
        
        Instructions :
        1. Rédige un article spécial de type "FLIP" : pars d'un fait d'actualité important et assez grave (une crise, une difficulté, un problème récent), puis décris en parallèle tout ce qu'il y a de positif, d'optimiste, de progrès ou de solutions concrètes que ce fait grave a engendré en parallèle. Cet article doit adopter cette structure de contraste marquée.
        2. Si la nouvelle d'origine n'est pas elle-même négative ou grave, trouve/associe un fait d'actualité difficile ou anxiogène connexe récent (par exemple une sécheresse, crise économique, maladie, pollution) pour l'opposer à la solution positive présentée dans le contenu d'origine.
        3. Rédige le contenu en français et cite la source de façon rigoureuse.
        4. Adopte un ton "Chaleureux & Populaire" : phrases courtes, dynamiques, vocabulaire bienveillant et entraînant qui donne le sourire.
        5. Rédige un corps d'article court, vulgarisé et captivant d'exactement 150 à 250 mots.
        6. Trouve une phrase d'introduction ultra-positive (le "facteur sourire").
        7. Associe l'actualité à l'une de ces 8 catégories de Parallel : "Environnement & Planète", "Santé", "IA & Tech", "Politique & Société", "Business & Économie Positive", "France", "Monde", "Sport".
        8. Rédige un titre en français qui soit une phrase naturelle, complète et bien construite.
        9. Rédige un texte court de 2 à 4 mots en majuscules avec un retour à la ligne pour le visuel de la carte de l'article (champ "visualText"). Exemple: "50% D'EAU\\nÉCONOMISÉE".
        10. Choisis un mot-clé de recherche d'image simple et précis en anglais (2-3 mots) pour Unsplash (champ "imageQueryEnglish"). Exemple: "solar panels roof". Deux articles ne doivent jamais partager la même image, garde-le bien unique et descriptif.
        
        Format attendu en retour (JSON uniquement) :
        {
          "isPositive": true,
          "category": "Nom de la catégorie exacte",
          "title": "Titre naturel, fluide et bien construit en français",
          "smileFactor": "La phrase d'intro facteur sourire",
          "visualText": "TEXTE EN MAJUSCULES\\nAVEC RETOUR",
          "imageQueryEnglish": "solar panels roof",
          "bad_news_resume": "Le résumé court (1-2 phrases maximum) du fait d'actualité négatif/anxiogène de départ",
          "content_parallel": "### La Ligne Parallèle\\n[Phrase d'accroche/contraste comme: La sobriété n'est plus une contrainte, c'est le laboratoire du futur, etc.]\\n\\n- **Le contenu** : [Le corps complet du paragraphe positif rédigé en français (150-250 mots)]\\n- **[Analogie Pop/Humoristique]** : [Une analogie décalée et amusante avec la pop-culture (cinéma, sport, séries, BD, etc.)]",
          "body": "Le corps de l'article de type FLIP rédigé en français (150-250 mots, reprenant le contenu de la section ci-dessus de façon fluide)",
          "source": "${story.sourceName}"
        }
      `;
    } catch (err) {
      console.error(`Erreur lors de la génération du prompt pour l'article : ${story.title}`, err.message);
    }
    
    // Le reste de la boucle suit...
    if (!isGeneratingFlip) {
      prompt = `
        Tu es le rédacteur en chef de "Parallel", un quotidien d'actualité positive.
        Analyse cette nouvelle :
        Titre d'origine : "${story.title}"
        Contenu d'origine : "${story.content}"
        
        Instructions :
        1. Détermine si c'est une actualité positive, constructive ou porteuse d'espoir. Si c'est négatif ou sans intérêt, réponds avec {"isPositive": false}.
        2. Si elle est positive, traduis et reformule l'information en français et cite la source de façon rigoureuse.
        3. Adopte un ton "Chaleureux & Populaire" : phrases courtes, dynamiques, vocabulaire bienveillant et entraînant qui donne le sourire.
        4. Rédige un corps d'article court, vulgarisé et captivant d'exactement 150 à 250 mots.
        5. Trouve une phrase d'introduction ultra-positive (le "facteur sourire").
        6. Associe l'actualité à l'une de ces 8 catégories de Parallel : "Environnement & Planète", "Santé", "IA & Tech", "Politique & Société", "Business & Économie Positive", "France", "Monde", "Sport".
        7. Rédige un titre en français qui soit une phrase naturelle, complète et bien construite (sans style télégraphique).
        8. Rédige un texte court de 2 à 4 mots en majuscules avec un retour à la ligne pour le visuel de la carte de l'article (champ "visualText"). Exemple: "VACCIN CONTRE\\nLE CANCER".
        9. Choisis un mot-clé de recherche d'image simple et précis en anglais (2-3 mots) pour Unsplash (champ "imageQueryEnglish"). Exemple: "electric car charging". Deux articles ne doivent jamais partager la même image, garde-le bien unique et descriptif.
        
        Format attendu en retour (JSON uniquement) :
        {
          "isPositive": true,
          "category": "Nom de la catégorie exacte",
          "title": "Titre naturel, fluide et bien construit en français",
          "smileFactor": "La phrase d'intro facteur sourire",
          "visualText": "TEXTE EN MAJUSCULES\\nAVEC RETOUR",
          "imageQueryEnglish": "electric car charging",
          "body": "Le corps de l'article rédigé en français (150-250 mots)",
          "source": "${story.sourceName}"
        }
      `;
    }

    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const parsedData = JSON.parse(responseText);

      if (parsedData.isPositive) {
        const cat = parsedData.category;
        
        // 🔥 MODIFICATION 2 : Fabriquer un lien d'image dynamique unique basé sur le mot-clé généré par Gemini
        const query = parsedData.imageQueryEnglish ? parsedData.imageQueryEnglish.replace(/\s+/g, ',') : 'news';
        const randomId = Math.floor(Math.random() * 1000);
        const generatedImageUrl = `https://images.unsplash.com/featured/800x600/?${encodeURIComponent(query)}&sig=${randomId}`;

        if (isGeneratingFlip) {
          const newArt = {
            id: articlesList.length + newArticles.length + 1,
            category: cat,
            title: parsedData.title,
            smileFactor: parsedData.smileFactor,
            visualText: parsedData.visualText || parsedData.title.substring(0, 25).toUpperCase(),
            imageQueryEnglish: parsedData.imageQueryEnglish || "",
            bad_news_resume: parsedData.bad_news_resume || "",
            content_parallel: parsedData.content_parallel || "",
            body: parsedData.body,
            source: parsedData.source,
            sourceLink: story.link,
            image: generatedImageUrl, // Intégration de l'image unique
            offsetDays: 0,
            featured: true
          };
          newArticles.push(newArt);
          hasFlip = true;
          console.log(`[SUCCÈS - FLIP] Article Flip ajouté : ${newArt.title} (${newArt.category})`);
        } else if (categoryCounts[cat] < 3) {
          const newArt = {
            id: articlesList.length + newArticles.length + 1,
            category: cat,
            title: parsedData.title,
            smileFactor: parsedData.smileFactor,
            visualText: parsedData.visualText || parsedData.title.substring(0, 25).toUpperCase(),
            imageQueryEnglish: parsedData.imageQueryEnglish || "",
            body: parsedData.body,
            source: parsedData.source,
            sourceLink: story.link,
            image: generatedImageUrl, // Intégration de l'image unique
            offsetDays: 0,
            featured: false
          };
          newArticles.push(newArt);
          categoryCounts[cat]++;
          console.log(`[SUCCÈS] Article thématique ajouté : ${newArt.title} (${newArt.category}) [${categoryCounts[cat]}/3]`);
        }
        
        const allThemesDone = categories.every(cat => categoryCounts[cat] >= 3);
        if (hasFlip && allThemesDone) {
          console.log("Quota quotidien de publication complété (1 Flip + 24 articles thématiques) !");
          break;
        }
      }
    } catch (err) {
      console.error(`Erreur d'analyse de l'article : ${story.title}`, err.message);
    }
  }

  if (newArticles.length === 0) {
    console.log("Aucune nouvelle actualité validée aujourd'hui. Fin du script.");
    process.exit(0);
  }

  const updatedArticlesList = [...newArticles, ...articlesList];
  const finalArticlesList = updatedArticlesList.slice(0, 200);

  // 5. Réécrire le fichier articles.js
  const stringifiedList = JSON.stringify(finalArticlesList, null, 2);
  const updatedContent = fileContent.substring(0, startIdx) + stringifiedList + fileContent.substring(endIdx + 1);

  fs.writeFileSync(articlesFilePath, updatedContent, 'utf8');
  console.log(`[SUCCÈS] Fichier articles.js mis à jour avec ${newArticles.length} nouvelles actualités du jour !`);
}

run();