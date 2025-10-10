import { createElement } from "../../utils/dom.js";

export function AuthHeader({ title, subtitle }) {
  const header = createElement("div", { classes: ["auth-shell__header"] });

  const logo = createElement("div", { classes: ["auth-shell__logo"], text: "C" });
  header.appendChild(logo);

  const titleEl = createElement("h1", {
    classes: ["auth-shell__title"],
    text: title
  });
  header.appendChild(titleEl);

  if (subtitle) {
    const subtitleEl = createElement("p", {
      classes: ["auth-shell__subtitle"],
      text: subtitle
    });
    header.appendChild(subtitleEl);
  }

  return header;
}
