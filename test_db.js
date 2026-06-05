const fs = require('fs');

// Read articles.js
const articlesContent = fs.readFileSync('c:\\Users\\maxime.demilly\\Desktop\\Site happy\\articles.js', 'utf8');

// Evaluate articles.js content by replacing const with global
const modifiedContent = articlesContent
  .replace('const articles =', 'global.articles =')
  .replace('const parallelQuotes =', 'global.parallelQuotes =');
eval(modifiedContent);

console.log("Total articles in database:", articles.length);

const today = new Date();
const todayArticles = articles.filter(art => art.offsetDays === 0);
console.log("Articles with offsetDays === 0 (Today):", todayArticles.length);

const categories = [...new Set(articles.map(art => art.category))];
console.log("Categories found:", categories);

categories.forEach(cat => {
  const catToday = todayArticles.filter(art => art.category === cat);
  console.log(`- ${cat}: ${catToday.length} today`);
});
