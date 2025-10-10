import { createElement } from "../../utils/dom.js";

export function AuthShell({ header, body = [], footer }) {
  const shell = createElement("section", { classes: ["auth-shell"] });

  if (header) {
    shell.appendChild(header);
  }

  const bodyEl = createElement("div", { classes: ["auth-shell__body"] });
  body.forEach((child) => bodyEl.appendChild(child));
  shell.appendChild(bodyEl);

  if (footer) {
    shell.appendChild(footer);
  }

  return shell;
}
