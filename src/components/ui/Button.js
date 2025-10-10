import { createElement } from "../../utils/dom.js";

export function Button({ label, variant = "primary", type = "button", disabled = false, onClick }) {
  const button = createElement("button", {
    classes: ["button", `button--${variant}`],
    attrs: { type, disabled }
  });

  button.textContent = label;

  if (onClick) {
    button.addEventListener("click", onClick);
  }

  return button;
}
