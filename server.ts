import express from "express";
import path from "path";
import { fork } from "child_process";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

// Memory store to keep track of the latest run's logs and status
interface FetchStatus {
  isRunning: boolean;
  logs: string[];
  lastRunTime: string | null;
  error: string | null;
}

const fetchStatus: FetchStatus = {
  isRunning: false,
  logs: [],
  lastRunTime: null,
  error: null
};

// Helper to log both internally and in the status buffer
const logToStatus = (message: string) => {
  const timestamp = new Date().toLocaleTimeString("fr-FR", { timeZone: "Europe/Paris" });
  const formatted = `[${timestamp}] ${message}`;
  console.log(formatted);
  fetchStatus.logs.push(formatted);
  if (fetchStatus.logs.length > 500) {
    fetchStatus.logs.shift(); // keep last 500 lines
  }
};

// Function to trigger the cron-fetch script in a background child process
function triggerCronFetch(): Promise<boolean> {
  if (fetchStatus.isRunning) {
    logToStatus("La curation est déjà en cours d'exécution.");
    return Promise.resolve(false);
  }

  fetchStatus.isRunning = true;
  fetchStatus.logs = [];
  fetchStatus.error = null;
  logToStatus("Événement de curation initié. Initialisation du sous-processus...");

  return new Promise((resolve) => {
    const scriptPath = path.join(process.cwd(), "cron-fetch.js");
    
    // Fork the process to run cron-fetch.js asynchronously without blocking Express
    const cp = fork(scriptPath, [], {
      silent: true,
      env: {
        ...process.env,
        // Make sure the parallel.lemedia secret maps to GEMINI_API_KEY if needed
        GEMINI_API_KEY: process.env['parallel.lemedia'] || process.env.parallel_lemedia || process.env.PARALLEL_LEMEDIA || process.env.GEMINI_API_KEY
      }
    });

    cp.stdout?.on("data", (data) => {
      const text = data.toString().trim();
      if (text) {
        text.split("\n").forEach((line: string) => logToStatus(line));
      }
    });

    cp.stderr?.on("data", (data) => {
      const text = data.toString().trim();
      if (text) {
        text.split("\n").forEach((line: string) => logToStatus(`[ERREUR] ${line}`));
      }
    });

    cp.on("close", (code) => {
      fetchStatus.isRunning = false;
      fetchStatus.lastRunTime = new Date().toLocaleString("fr-FR", { timeZone: "Europe/Paris" });
      if (code === 0) {
        logToStatus(`Curation terminée avec succès (Code ${code}). L'édition est en ligne !`);
        resolve(true);
      } else {
        const errMsg = `Le script s'est arrêté avec le code d'erreur ${code}`;
        logToStatus(`[ERREUR CRITIQUE] ${errMsg}`);
        fetchStatus.error = errMsg;
        resolve(false);
      }
    });
  });
}

// API endpoint to trigger curation manually
app.post("/api/run-cron", async (req, res) => {
  if (fetchStatus.isRunning) {
    return res.status(409).json({ message: "Le processus est déjà en cours.", status: fetchStatus });
  }
  // Run asynchronously
  triggerCronFetch();
  return res.json({ message: "La veille automatique a démarré en arrière-plan.", status: fetchStatus });
});

// API endpoint to get the status and live logs
app.get("/api/cron-status", (req, res) => {
  res.json(fetchStatus);
});

// Setup Automated Cron Scheduler at 7h00 Paris Time
let lastTriggeredDateParis = "";

setInterval(() => {
  const now = new Date();
  
  // Format current date and hour in Paris timezone
  const parisDateString = now.toLocaleDateString("fr-FR", { timeZone: "Europe/Paris" });
  const parisTimeString = now.toLocaleTimeString("fr-FR", { 
    timeZone: "Europe/Paris", 
    hour: "2-digit", 
    minute: "2-digit",
    hour12: false 
  });

  // Check if we reached 07:00 AM Paris time and have not scheduled for today yet
  if (parisTimeString === "07:00" && lastTriggeredDateParis !== parisDateString) {
    lastTriggeredDateParis = parisDateString;
    logToStatus(`Planificateur automatique : Il est 7h00 à Paris ! Lancement automatique de l'édition du jour (${parisDateString})...`);
    triggerCronFetch();
  }
}, 30000); // Check every 30 seconds

// Vite or Static Assets serving integration
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SERVEUR] Parallel est en ligne sur http://localhost:${PORT}`);
  });
}

setupVite();
