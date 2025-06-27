import { PluginLoader } from "./PluginLoader.js";
import { detectors } from "./utils/detectors.js";

// Função para criar uma nova instância
export function createPluginLoader(options = {}) {
  return new PluginLoader(options);
}

// Instância global padrão
export const pluginLoader = createPluginLoader({
  debug:
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.search.includes("debug=true")),
});

// Helpers globais
export const loadPlugin = (name) => pluginLoader.load(name);
export const loadPlugins = (names) => pluginLoader.loadMultiple(names);
export const registerPlugin = (name, config) =>
  pluginLoader.register(name, config);

// Auto-inicialização no browser
if (typeof window !== "undefined") {
  // Disponibilizar globalmente
  window.PluginLoader = pluginLoader;
  window.loadPlugin = loadPlugin;
  window.loadPlugins = loadPlugins;
  window.registerPlugin = registerPlugin;

  // Auto-detecção no DOM ready
  const initAutoDetect = () => {
    pluginLoader.autoDetect();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAutoDetect);
  } else {
    setTimeout(initAutoDetect, 0);
  }

  console.log("🚀 Lazy Plugin Loader ready!");
}

// Exports
export { PluginLoader, detectors };
