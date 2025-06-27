export class PluginLoader {
  constructor(options = {}) {
    this.loaded = {};
    this.loading = {};
    this.plugins = {};
    this.detectors = {};
    this.config = {
      autoDetect: true,
      debug: false,
      retryAttempts: 3,
      retryDelay: 1000,
      ...options,
    };

    this.log("PluginLoader inicializado");
  }

  log(message, data = null) {
    if (this.config.debug) {
      console.log(`[PluginLoader] ${message}`, data || "");
    }
  }

  register(name, config) {
    if (!config.loader) {
      throw new Error(`Plugin '${name}' precisa de uma função loader`);
    }

    this.plugins[name] = {
      loader: config.loader,
      detector: config.detector || null,
      global: config.global || null,
      onLoad: config.onLoad || null,
      onError: config.onError || null,
      dependencies: config.dependencies || [],
      version: config.version || "1.0.0",
      description: config.description || "",
    };

    if (config.detector) {
      this.detectors[name] = config.detector;
    }

    this.log(`Plugin '${name}' registrado`);
    return this;
  }

  async load(name, retryCount = 0) {
    if (this.loaded[name]) {
      return this.plugins[name].global
        ? window[this.plugins[name].global]
        : true;
    }

    if (this.loading[name]) {
      return this.loading[name];
    }

    if (!this.plugins[name]) {
      throw new Error(`Plugin '${name}' não encontrado`);
    }

    this.log(`Carregando ${name}...`);

    const plugin = this.plugins[name];

    // Carregar dependências primeiro
    if (plugin.dependencies.length > 0) {
      await Promise.all(plugin.dependencies.map((dep) => this.load(dep)));
    }

    // Carregar o plugin
    this.loading[name] = plugin
      .loader()
      .then((result) => {
        const pluginExport = result.default || result;

        // Setar global se especificado
        if (plugin.global) {
          window[plugin.global] = pluginExport;
        }

        // Executar callback de carregamento
        if (plugin.onLoad) {
          try {
            plugin.onLoad(pluginExport);
          } catch (error) {
            this.log(`Erro no onLoad de ${name}:`, error);
            if (plugin.onError) {
              plugin.onError(error);
            }
          }
        }

        this.loaded[name] = true;
        delete this.loading[name];
        this.log(`✅ ${name} carregado`);

        // Dispatch event
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent(`plugin:${name}:loaded`, {
              detail: { plugin: pluginExport, name },
            })
          );
        }

        return plugin.global ? window[plugin.global] : pluginExport;
      })
      .catch(async (error) => {
        this.log(`❌ Erro ao carregar ${name}:`, error);
        delete this.loading[name];

        // Retry logic
        if (retryCount < this.config.retryAttempts) {
          await new Promise((resolve) =>
            setTimeout(resolve, this.config.retryDelay)
          );
          return this.load(name, retryCount + 1);
        }

        if (plugin.onError) {
          plugin.onError(error);
        }

        throw error;
      });

    return this.loading[name];
  }

  async loadMultiple(names) {
    const results = await Promise.allSettled(
      names.map((name) => this.load(name))
    );

    const successful = [];
    const failed = [];

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        successful.push(names[index]);
      } else {
        failed.push({ name: names[index], error: result.reason });
      }
    });

    return { successful, failed, results };
  }

  async autoDetect() {
    if (!this.config.autoDetect) return;

    this.log("🔍 Auto-detecção iniciada");

    const toLoad = [];

    for (const [name, detector] of Object.entries(this.detectors)) {
      try {
        if (detector()) {
          toLoad.push(name);
        }
      } catch (error) {
        this.log(`Erro no detector de ${name}:`, error);
      }
    }

    if (toLoad.length > 0) {
      this.log(`🎯 Detectados: ${toLoad.join(", ")}`);
      await this.loadMultiple(toLoad);
    }

    this.log("✅ Auto-detecção completa");
  }

  isLoaded(name) {
    return this.loaded[name] || false;
  }

  isLoading(name) {
    return !!this.loading[name];
  }

  list() {
    return Object.keys(this.plugins);
  }

  getStatus() {
    const status = {};
    for (const name of this.list()) {
      status[name] = {
        loaded: this.isLoaded(name),
        loading: this.isLoading(name),
        hasDetector: !!this.plugins[name].detector,
        version: this.plugins[name].version,
      };
    }
    return status;
  }

  unload(name) {
    if (this.loaded[name]) {
      delete this.loaded[name];

      if (this.plugins[name].global) {
        delete window[this.plugins[name].global];
      }

      this.log(`Plugin '${name}' descarregado`);
      return true;
    }
    return false;
  }

  reset() {
    Object.keys(this.loaded).forEach((name) => this.unload(name));
    this.loaded = {};
    this.loading = {};
    this.log("Reset completo");
  }
}
