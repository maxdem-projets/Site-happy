/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { Github, Loader2, Play, Terminal, ArrowRight, Layers, Cpu, Sparkles } from "lucide-react";

export default function App() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between font-sans selection:bg-neutral-800 selection:text-neutral-200 antialiased overflow-hidden">
      {/* Background Decorative Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

      {/* Header */}
      <header className="border-b border-neutral-800/60 bg-neutral-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center">
            <Cpu className="h-4.5 w-4.5 text-neutral-400" />
          </div>
          <div>
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-neutral-500">AI Studio Workspace</span>
            <h1 className="text-sm font-semibold text-neutral-200">Workspace Live</h1>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-neutral-900/60 border border-neutral-800/80 px-3 py-1.5 rounded-full text-xs text-neutral-400">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Serveur de Dev Actif</span>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 z-10 max-w-4xl mx-auto w-full">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center space-y-6"
        >
          {/* Status Badge */}
          <div className="inline-flex gap-2.5 items-center px-3.5 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-xs text-neutral-400">
            <Github className="h-4 w-4" />
            <span>Dépôt GitHub Connecté</span>
            <span className="text-neutral-600">|</span>
            <span className="font-mono text-neutral-500">parallel.lemediaBIS</span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-sans tracking-tight font-medium text-neutral-100 max-w-2xl mx-auto leading-tight">
            Votre application est prête à être construite
          </h2>

          <p className="text-neutral-400 text-base max-w-lg mx-auto leading-relaxed">
            Le preview s'affichait blanc car votre composant global <code className="font-mono text-xs px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300">App.tsx</code> était vide. Tout est désormais connecté et configuré pour le développement.
          </p>

          {/* Core App Information Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto pt-6 text-left">
            <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800/50 backdrop-blur-sm space-y-2">
              <div className="flex items-center gap-2 text-neutral-300">
                <Terminal className="h-4.5 w-4.5 text-neutral-400" />
                <span className="text-xs font-semibold uppercase tracking-wide font-mono text-neutral-500">Environnement</span>
              </div>
              <p className="text-sm text-neutral-300 font-mono">React 19 + TypeScript</p>
            </div>

            <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800/50 backdrop-blur-sm space-y-2">
              <div className="flex items-center gap-2 text-neutral-300">
                <Layers className="h-4.5 w-4.5 text-neutral-400" />
                <span className="text-xs font-semibold uppercase tracking-wide font-mono text-neutral-500">Styles & Mises en page</span>
              </div>
              <p className="text-sm text-neutral-300 font-mono">Tailwind CSS + Motion</p>
            </div>

            <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800/50 backdrop-blur-sm space-y-2">
              <div className="flex items-center gap-2 text-neutral-300">
                <Sparkles className="h-4.5 w-4.5 text-neutral-400" />
                <span className="text-xs font-semibold uppercase tracking-wide font-mono text-neutral-500">Prochaine Étape</span>
              </div>
              <p className="text-sm text-neutral-300 font-mono">Demandez-moi d'coder !</p>
            </div>
          </div>

          {/* Hint Action Box */}
          <div className="pt-4 max-w-md mx-auto">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 text-sm text-neutral-300 text-left gap-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-center shrink-0">
                  <Play className="h-4 w-4 text-emerald-500 fill-emerald-500/20" />
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-200">Lancez l'intégration</h4>
                  <p className="text-xs text-neutral-400">Décrivez l'application que vous voulez créer.</p>
                </div>
              </div>
              <ArrowRight className="h-4.5 w-4.5 text-neutral-500 shrink-0" />
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800/40 bg-neutral-950 py-4 px-6 text-center text-xs text-neutral-500 z-10 font-mono">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Prêt à être synchronisé vers le dépôt GitHub distant</span>
          <span className="text-neutral-600">•</span>
          <span>Google AI Studio Build</span>
        </div>
      </footer>
    </div>
  );
}

