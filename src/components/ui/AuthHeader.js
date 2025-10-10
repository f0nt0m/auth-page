import { createElement } from "../../utils/dom.js";

export function AuthHeader({ title, subtitle, brandName = "Company" }) {
  const header = createElement("div", { classes: ["auth-shell__header"] });

  const brand = createElement("div", { classes: ["auth-brand"] });
  const brandIcon = createElement("span", {
    classes: ["auth-brand__icon"],
    attrs: { "aria-hidden": "true" }
  });
  const brandLabel = createElement("span", {
    classes: ["auth-brand__name"],
    text: brandName
  });
  brand.append(brandIcon, brandLabel);
  header.appendChild(brand);

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
