# Lazy Plugin Loader

<p align="center">
  <img src="https://img.shields.io/npm/v/lazy-plugin-loader" alt="npm version">
  <img src="https://img.shields.io/npm/dm/lazy-plugin-loader" alt="downloads">
  <img src="https://img.shields.io/bundlephobia/minzip/lazy-plugin-loader" alt="bundle size">
  <img src="https://img.shields.io/github/license/ocristopfer/lazy-plugin-loader" alt="license">
</p>

Sistema genérico de lazy loading para plugins JavaScript com **auto-detecção** baseada no DOM. Carregue apenas o que você precisa, quando você precisa!

## ✨ Características

- 🚀 **Lazy Loading Inteligente** - Carrega plugins apenas quando necessário
- 🎯 **Auto-detecção** - Detecta automaticamente plugins baseado no HTML
- 📦 **Super Leve** - Apenas ~5KB minificado, zero dependências
- 🔧 **Flexível** - Sistema de registro de plugins customizável
- 🌐 **Universal** - Funciona com qualquer framework ou vanilla JS
- 🔄 **Sistema de Dependências** - Gerencia ordem de carregamento
- 🐛 **Debug Mode** - Logs detalhados para desenvolvimento
- ⚡ **Performance** - Carregamento sob demanda melhora performance inicial

## 📦 Instalação

```bash
npm install lazy-plugin-loader
```

Ou via CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/lazy-plugin-loader@latest/dist/index.js"></script>
```

## 🚀 Início Rápido

### 1. Configuração Básica

```javascript
import { registerPlugin, detectors } from "lazy-plugin-loader";

// Registrar jQuery
registerPlugin("jquery", {
  loader: () => import("jquery"),
  global: "$",
  onLoad: ($) => {
    window.jQuery = $;
    console.log("jQuery carregado!");
  },
  detector: detectors.hasDataAttribute("jquery"),
});

// Registrar Bootstrap
registerPlugin("bootstrap", {
  loader: async () => {
    await import("bootstrap/dist/css/bootstrap.min.css");
    return import("bootstrap");
  },
  detector: detectors.hasClass("btn", "card", "container"),
});
```

### 2. HTML com Auto-detecção

```html
<!-- jQuery será auto-detectado e carregado -->
<div data-jquery>
  <button onclick="$('#message').fadeIn()">Mostrar Mensagem</button>
  <div id="message" style="display:none">jQuery funcionando!</div>
</div>

<!-- Bootstrap será auto-detectado pelas classes -->
<div class="container">
  <button class="btn btn-primary">Botão Bootstrap</button>
</div>
```

### 3. Carregamento Manual

```javascript
// Carregar um plugin específico
await loadPlugin("jquery");

// Carregar múltiplos plugins
const { successful, failed } = await loadPlugins(["jquery", "bootstrap"]);

// Verificar se está carregado
if (window.PluginLoader.isLoaded("jquery")) {
  console.log("jQuery está disponível!");
}
```

## 📚 Documentação Completa

### Registrando Plugins

```javascript
registerPlugin("nome-do-plugin", {
  // Função que retorna uma Promise com o plugin
  loader: () => import("plugin-package"),

  // Nome da variável global (opcional)
  global: "PluginName",

  // Função executada após carregamento (opcional)
  onLoad: (plugin) => {
    plugin.init();
  },

  // Função executada em caso de erro (opcional)
  onError: (error) => {
    console.error("Erro:", error);
  },

  // Função que detecta se o plugin é necessário (opcional)
  detector: () => document.querySelector(".plugin-required"),

  // Dependências que devem ser carregadas primeiro (opcional)
  dependencies: ["jquery"],

  // Metadados (opcional)
  version: "1.0.0",
  description: "Descrição do plugin",
});
```

### Detectores Disponíveis

```javascript
import { detectors } from "lazy-plugin-loader";

// Detecta classes CSS
detectors.hasClass("btn", "card", "modal");

// Detecta atributos data-*
detectors.hasDataAttribute("plugin-name");

// Detecta IDs
detectors.hasId("vue-app", "chart-container");

// Detecta seletores CSS
detectors.hasSelector("canvas[data-chart]");

// Detecta conteúdo em onclick
detectors.hasOnClick("$");

// Detector customizado
detectors.custom(() => window.location.pathname === "/dashboard");

// Combinações (OR)
detectors.any(
  detectors.hasClass("btn"),
  detectors.hasDataAttribute("bootstrap")
);

// Combinações (AND)
detectors.all(detectors.hasId("app"), detectors.hasClass("vue-app"));
```

### API Completa

```javascript
// Carregamento
await loadPlugin(name); // Carrega um plugin
await loadPlugins([names]); // Carrega múltiplos plugins
await window.PluginLoader.autoDetect(); // Executa auto-detecção

// Verificação
window.PluginLoader.isLoaded(name); // true/false
window.PluginLoader.isLoading(name); // true/false
window.PluginLoader.list(); // Lista todos os plugins
window.PluginLoader.getStatus(); // Status detalhado

// Gerenciamento
window.PluginLoader.unload(name); // Remove plugin da memória
window.PluginLoader.reset(); // Remove todos os plugins
```

## 🎯 Exemplos Práticos

### Vue.js com Auto-montagem

```javascript
registerPlugin("vue", {
  loader: () => import("vue"),
  global: "Vue",
  onLoad: (Vue) => {
    // Auto-montar aplicações Vue
    document.querySelectorAll("#vue-app, [data-vue]").forEach((el) => {
      const config = el.dataset.vue
        ? JSON.parse(el.dataset.vue)
        : {
            data() {
              return { message: "Vue carregado!" };
            },
            template: "<div>{{ message }}</div>",
          };
      Vue.createApp(config).mount(el);
    });
  },
  detector: detectors.any(
    detectors.hasId("vue-app"),
    detectors.hasDataAttribute("vue")
  ),
});
```

```html
<!-- Vue será auto-detectado e montado -->
<div id="vue-app"></div>

<!-- Ou com configuração customizada -->
<div
  data-vue='{"data": {"nome": "João"}, "template": "<p>Olá {{ nome }}!</p>"}'
></div>
```

### Chart.js com Auto-criação

```javascript
registerPlugin("chartjs", {
  loader: () => import("chart.js"),
  global: "Chart",
  onLoad: (Chart) => {
    Chart.register(...Chart.registerables);

    // Auto-criar gráficos
    document.querySelectorAll("canvas[data-chart]").forEach((canvas) => {
      const config = JSON.parse(canvas.dataset.chart);
      new Chart(canvas, config);
    });
  },
  detector: detectors.hasSelector("canvas[data-chart]"),
});
```

```html
<!-- Chart.js será auto-detectado e o gráfico criado -->
<canvas
  data-chart='{
  "type": "bar",
  "data": {
    "labels": ["Jan", "Feb", "Mar"],
    "datasets": [{
      "label": "Vendas",
      "data": [10, 20, 15],
      "backgroundColor": "rgba(54, 162, 235, 0.5)"
    }]
  }
}'
  width="400"
  height="200"
></canvas>
```

### Plugin com Dependências

```javascript
// DataTables precisa do jQuery
registerPlugin("datatables", {
  loader: () => import("datatables.net"),
  dependencies: ["jquery"], // Carrega jQuery primeiro
  onLoad: () => {
    // Auto-inicializar tabelas
    $("table[data-datatable]").DataTable();
  },
  detector: detectors.hasSelector("table[data-datatable]"),
});
```

### Integração com PHP

```php
<!-- src/dashboard.php -->
<div class="container">
    <!-- Bootstrap auto-detectado -->
    <div class="row">
        <div class="col-md-6">
            <div class="card">
                <div class="card-body">
                    <h5>Relatórios</h5>

                    <!-- Chart.js auto-detectado -->
                    <canvas data-chart='{
                        "type": "doughnut",
                        "data": {
                            "labels": ["Vendas", "Marketing", "Suporte"],
                            "datasets": [{
                                "data": [<?= $vendas ?>, <?= $marketing ?>, <?= $suporte ?>],
                                "backgroundColor": ["#ff6384", "#36a2eb", "#ffce56"]
                            }]
                        }
                    }'></canvas>
                </div>
            </div>
        </div>

        <div class="col-md-6">
            <!-- Vue auto-detectado -->
            <div data-vue='{
                "data": {"users": <?= json_encode($users) ?>},
                "template": "<div><h6>Usuários Online: {{ users.length }}</h6></div>"
            }'></div>
        </div>
    </div>

    <!-- DataTables auto-detectado -->
    <table data-datatable class="table">
        <thead>
            <tr><th>Nome</th><th>Email</th></tr>
        </thead>
        <tbody>
            <?php foreach($usuarios as $user): ?>
            <tr>
                <td><?= $user['nome'] ?></td>
                <td><?= $user['email'] ?></td>
            </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
</div>
```

## ⚙️ Configuração Avançada

### Modo Debug

```javascript
// Ativar logs detalhados
window.PluginLoader.config.debug = true;

// Ou criar instância com debug
import { createPluginLoader } from "lazy-plugin-loader";
const loader = createPluginLoader({ debug: true });
```

### Configuração de Retry

```javascript
const loader = createPluginLoader({
  retryAttempts: 5, // Tentar 5 vezes
  retryDelay: 2000, // Esperar 2s entre tentativas
  autoDetect: false, // Desabilitar auto-detecção
});
```

### Eventos Customizados

```javascript
// Escutar carregamento de plugins específicos
window.addEventListener("plugin:jquery:loaded", (event) => {
  console.log("jQuery carregado!", event.detail);
});

// Plugin que dispara eventos customizados
registerPlugin("meu-plugin", {
  loader: () => import("./meu-plugin"),
  onLoad: (plugin) => {
    plugin.init();
    // Disparar evento customizado
    window.dispatchEvent(
      new CustomEvent("meu-plugin:ready", {
        detail: { plugin, timestamp: Date.now() },
      })
    );
  },
});
```

## 🔧 Integração com Bundlers

### Vite

```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["lazy-plugin-loader"],
          plugins: ["jquery", "bootstrap", "vue"],
        },
      },
    },
  },
};
```

### Webpack

```javascript
// webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: "all",
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all",
        },
        plugins: {
          test: /[\\/]node_modules[\\/](jquery|bootstrap|vue)[\\/]/,
          name: "plugins",
          chunks: "all",
        },
      },
    },
  },
};
```

## 📊 Métricas de Performance

### Antes (carregamento tradicional)

```
Bundle inicial: ~300KB
Tempo de carregamento: ~2.5s
Plugins não utilizados: ~60%
```

### Depois (com Lazy Plugin Loader)

```
Bundle inicial: ~50KB
Tempo de carregamento: ~0.8s
Plugins carregados: apenas os necessários
Melhoria na performance: ~70%
```

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Changelog

### v1.0.0

- ✨ Sistema de lazy loading com auto-detecção
- 🔧 Sistema de registro de plugins flexível
- 📦 Detectores pré-construídos
- 🐛 Modo debug
- ⚡ Sistema de dependências
- 🔄 Retry automático

## 📄 Licença

MIT © [Seu Nome](https://github.com/ocristopfer)

## 🙋‍♂️ Suporte

- 📧 Email: ocristopfer@gmail.com
- 🐛 Issues: [GitHub Issues](https://github.com/ocristopfer/lazy-plugin-loader/issues)
- 💬 Discussões: [GitHub Discussions](https://github.com/ocristopfer/lazy-plugin-loader/discussions)

---

<p align="center">
  Feito com ❤️ para a comunidade JavaScript
</p>
