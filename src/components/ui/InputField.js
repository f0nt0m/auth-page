import { createElement } from "../../utils/dom.js";

export function InputField({
  id,
  label,
  type = "text",
  placeholder = "",
  value = "",
  error,
  onInput,
  autoComplete
}) {
  const wrapper = createElement("div", { classes: ["form-field"] });

  if (label) {
    const labelEl = createElement("label", {
      classes: ["form-label"],
      attrs: { htmlFor: id },
      text: label
    });
    wrapper.appendChild(labelEl);
  }

  const input = createElement("input", {
    classes: ["input", error ? "input--error" : ""].filter(Boolean),
    attrs: { id, type, placeholder, value, autoComplete }
  });

  if (onInput) {
    input.addEventListener("input", (event) => onInput(event.target.value, event));
  }

  wrapper.appendChild(input);

  if (error) {
    wrapper.appendChild(
      createElement("p", {
        classes: ["helper-text"],
        text: error
      })
    );
  }

  return { wrapper, input };
}
