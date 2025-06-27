export const detectors = {
  // Detecta elementos com classes específicas
  hasClass:
    (...classes) =>
    () => {
      return !!document.querySelector(classes.map((c) => `.${c}`).join(", "));
    },

  // Detecta atributos data-*
  hasDataAttribute: (attr) => () => {
    return !!document.querySelector(`[data-${attr}]`);
  },

  // Detecta elementos por ID
  hasId:
    (...ids) =>
    () => {
      return !!document.querySelector(ids.map((id) => `#${id}`).join(", "));
    },

  // Detecta seletores CSS
  hasSelector: (selector) => () => {
    return !!document.querySelector(selector);
  },

  // Detecta conteúdo no onclick
  hasOnClick: (content) => () => {
    return !!document.querySelector(`[onclick*="${content}"]`);
  },

  // Detector customizado
  custom: (fn) => fn,

  // Combinação OR
  any:
    (...detectors) =>
    () => {
      return detectors.some((detector) => {
        try {
          return detector();
        } catch {
          return false;
        }
      });
    },

  // Combinação AND
  all:
    (...detectors) =>
    () => {
      return detectors.every((detector) => {
        try {
          return detector();
        } catch {
          return false;
        }
      });
    },
};
