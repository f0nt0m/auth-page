import { createElement } from "../../utils/dom.js";

export function InputField({
  id,
  label,
  hideLabel = false,
  type = "text",
  placeholder = "",
  value = "",
  error,
  onInput,
  autoComplete,
  startIcon
}) {
  const wrapper = createElement("div", { classes: ["input-field"] });

  if (label) {
    const labelEl = createElement("label", {
      classes: ["form-label", hideLabel ? "sr-only" : ""].filter(Boolean),
      attrs: { htmlFor: id },
      text: label
    });
    wrapper.appendChild(labelEl);
  }

  const control = createElement("div", {
    classes: ["input-field__control", error ? "input-field__control--error" : ""].filter(Boolean)
  });

  if (startIcon) {
    const iconEl = createElement("span", {
      classes: ["input-field__icon"],
      attrs: { innerHTML: startIcon }
    });
    control.appendChild(iconEl);
  }

  const input = createElement("input", {
    classes: ["input-field__input"],
    attrs: { id, type, placeholder, value, autoComplete }
  });

  if (onInput) {
    input.addEventListener("input", (event) => onInput(event.target.value, event));
  }

  control.appendChild(input);
  wrapper.appendChild(control);

  if (error) {
    wrapper.appendChild(
      createElement("p", {
        classes: ["helper-text"],
        text: error
      })
    );
  }

  return { wrapper, input, control };
}
