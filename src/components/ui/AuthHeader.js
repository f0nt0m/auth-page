import { createElement } from "../../utils/dom.js";

export function AuthHeader({ title, subtitle }) {
  const header = createElement("div", { classes: ["auth-shell__header"] });

  // Logo container with icon and text
  const logoContainer = createElement("div", { classes: ["auth-shell__logo-container"] });

  const logo = createElement("div", { classes: ["auth-shell__logo"], text: "C" });
  logoContainer.appendChild(logo);

  const companyName = createElement("span", {
    classes: ["auth-shell__company-name"],
    text: "Company"
  });
  logoContainer.appendChild(companyName);

  header.appendChild(logoContainer);

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