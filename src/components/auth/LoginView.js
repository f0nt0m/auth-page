import { AuthShell } from "../ui/AuthShell.js";
import { AuthHeader } from "../ui/AuthHeader.js";
import { InputField } from "../ui/InputField.js";
import { Button } from "../ui/Button.js";
import { createElement } from "../../utils/dom.js";

export function createLoginView({ onSubmit, initialEmail = "" }) {
  const state = {
    email: initialEmail,
    password: "",
    loading: false,
    error: null
  };

  const header = AuthHeader({
    title: "Sign in to your account",
    subtitle: "to continue"
  });

  const form = createElement("form");
  form.classList.add("auth-shell__form");

  const { wrapper: emailField, input: emailInput, control: emailControl } = InputField({
    id: "email",
    label: "Email",
    hideLabel: true,
    type: "email",
    placeholder: "Email",
    value: state.email,
    autoComplete: "email",
    startIcon:
      '<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 5.75A2.25 2.25 0 0 1 4.75 3.5h10.5a2.25 2.25 0 0 1 2.25 2.25v8.5a2.25 2.25 0 0 1-2.25 2.25H4.75A2.25 2.25 0 0 1 2.5 14.25v-8.5Zm2.25-.75a.75.75 0 0 0-.75.75v.143l6 3.43 6-3.43V5.75a.75.75 0 0 0-.75-.75H4.75Zm12 3.023-4.94 2.823a1.75 1.75 0 0 1-1.62 0L5.25 8.023V14.25c0 .414.336.75.75.75h8a.75.75 0 0 0 .75-.75V8.023Z" fill="currentColor"/></svg>',
    onInput: (value) => {
      state.email = value;
      updateSubmitState();
    }
  });

  const { wrapper: passwordField, input: passwordInput, control: passwordControl } = InputField({
    id: "password",
    label: "Password",
    hideLabel: true,
    type: "password",
    placeholder: "Password",
    autoComplete: "current-password",
    startIcon:
      '<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.5 7V5.75a3.5 3.5 0 1 1 7 0V7h.75A2.75 2.75 0 0 1 17 9.75v4.5A2.75 2.75 0 0 1 14.25 17H5.75A2.75 2.75 0 0 1 3 14.25v-4.5A2.75 2.75 0 0 1 5.75 7H6.5Zm1.5 0h4V5.75a1.5 1.5 0 1 0-4 0V7ZM5.75 8.5a1.25 1.25 0 0 0-1.25 1.25v4.5c0 .69.56 1.25 1.25 1.25h8.5c.69 0 1.25-.56 1.25-1.25v-4.5c0-.69-.56-1.25-1.25-1.25h-8.5Z" fill="currentColor"/></svg>',
    onInput: (value) => {
      state.password = value;
      updateSubmitState();
    }
  });

  const submitButton = Button({ label: "Log in", type: "submit" });
  submitButton.disabled = true;

  const errorMessage = createElement("p", {
    classes: ["helper-text"],
    text: "",
    attrs: { style: "display: none; text-align: center;" }
  });

  form.append(emailField, passwordField, submitButton, errorMessage);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (state.loading) return;

    errorMessage.style.display = "none";

    onSubmit?.({
      email: state.email.trim(),
      password: state.password
    });
  });

  const shell = AuthShell({
    header,
    body: [form]
  });

  function updateSubmitState() {
    const canSubmit = state.email.trim() !== "" && state.password !== "";
    submitButton.disabled = state.loading || !canSubmit;
  }

  updateSubmitState();

  function setLoading(isLoading) {
    state.loading = isLoading;
    submitButton.disabled = isLoading;
    submitButton.textContent = isLoading ? "Signing in..." : "Log in";
    emailInput.disabled = isLoading;
    passwordInput.disabled = isLoading;
    updateSubmitState();
  }

  function setError(message) {
    state.error = message;
    if (message) {
      errorMessage.textContent = message;
      errorMessage.style.display = "block";
      emailControl.classList.add("input-field__control--error");
      passwordControl.classList.add("input-field__control--error");
    } else {
      errorMessage.style.display = "none";
      emailControl.classList.remove("input-field__control--error");
      passwordControl.classList.remove("input-field__control--error");
    }
  }

  return { element: shell, setLoading, setError };
}
