export function createElement(tag, { classes = [], attrs = {}, text } = {}) {
  const el = document.createElement(tag);
  if (classes.length) {
    el.className = classes.join(" ");
  }
  Object.entries(attrs).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (key === "dataset") {
      Object.entries(value).forEach(([dataKey, dataValue]) => {
        el.dataset[dataKey] = dataValue;
      });
    } else if (key === "listeners") {
      Object.entries(value).forEach(([event, handler]) => {
        el.addEventListener(event, handler);
      });
    } else if (key in el) {
      el[key] = value;
    } else {
      el.setAttribute(key, value);
    }
  });
  if (text !== undefined) {
    el.textContent = text;
  }
  return el;
}

export function clearChildren(node) {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}
