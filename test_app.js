const fs = require('fs');

// Mock browser global variables
global.window = {};
global.document = {
  addEventListener: (event, cb) => {
    if (event === 'DOMContentLoaded') {
      setTimeout(cb, 0);
    }
  },
  getElementById: (id) => {
    return {
      textContent: '',
      addEventListener: () => {},
      classList: {
        add: () => {},
        remove: () => {},
        toggle: () => {},
        contains: () => false
      },
      style: {
        display: '',
        overflow: ''
      },
      setAttribute: () => {},
      getAttribute: () => '',
      reset: () => {},
      querySelectorAll: () => []
    };
  },
  querySelectorAll: () => {
    return {
      forEach: () => {}
    };
  }
};
global.localStorage = {
  getItem: () => null,
  setItem: () => null
};
global.IntersectionObserver = class {
  observe() {}
};

// Load articles
const articlesContent = fs.readFileSync('c:\\Users\\maxime.demilly\\Desktop\\Site happy\\articles.js', 'utf8');
const modifiedArticles = articlesContent
  .replace('const articles =', 'global.articles =')
  .replace('const parallelQuotes =', 'global.parallelQuotes =');
eval(modifiedArticles);

// Load app.js
const appContent = fs.readFileSync('c:\\Users\\maxime.demilly\\Desktop\\Site happy\\app.js', 'utf8');
try {
  eval(appContent);
  console.log("app.js loaded successfully, executing DOMContentLoaded callback...");
  setTimeout(() => {
    console.log("No runtime errors encountered during initial rendering!");
  }, 50);
} catch (err) {
  console.error("Runtime error in app.js:", err);
}
