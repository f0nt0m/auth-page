import { AuthShell } from "../ui/AuthShell.js";
import { AuthHeader } from "../ui/AuthHeader.js";
import { InputField } from "../ui/InputField.js";
import { Button } from "../ui/Button.js";
import { createElement } from "../../utils/dom.js";

const userIcon = `
<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M8 8C9.65685 8 11 6.65685 11 5C11 3.34315 9.65685 2 8 2C6.34315 2 5 3.34315 5 5C5 6.65685 6.34315 8 8 8Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M13 14C13 11.7909 10.7614 10 8 10C5.23858 10 3 11.7909 3 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

const lockIcon = `
<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
  <path d="M5 7V5C5 3.34315 6.34315 2 8 2C9.65685 2 11 3.34315 11 5V7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
</svg>
`;

export function createLoginView({ onSubmit, initialEmail = "" }) {
  const state = {
    email: initialEmail,
    password: "",
    loading: false,
    error: null
  };

  const header = AuthHeader({
    title: "Sign in to your account to continue"
  });

  const form = createElement("form");
  form.classList.add("auth-shell__form");

  const { wrapper: emailField, input: emailInput } = InputField({
    id: "email",
    label: "Email",
    type: "email",
    placeholder: "Email",
    value: state.email,
    autoComplete: "email",
    icon: userIcon,
    onInput: (value) => {
      state.email = value;
      updateButtonState();
    }
  });

  const { wrapper: passwordField, input: passwordInput } = InputField({
    id: "password",
    label: "Password",
    type: "password",
    placeholder: "Password",
    autoComplete: "current-password",
    icon: lockIcon,
    onInput: (value) => {
      state.password = value;
      updateButtonState();
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

  function updateButtonState() {
    const hasEmail = state.email.trim().length > 0;
    const hasPassword = state.password.length > 0;
    submitButton.disabled = !hasEmail || !hasPassword || state.loading;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (state.loading || submitButton.disabled) return;

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

  function setLoading(isLoading) {
    state.loading = isLoading;
    updateButtonState();
    submitButton.textContent = isLoading ? "Signing in..." : "Log in";
    emailInput.disabled = isLoading;
    passwordInput.disabled = isLoading;
  }

  function setError(message) {
    state.error = message;
    if (message) {
      errorMessage.textContent = message;
      errorMessage.style.display = "block";
    } else {
      errorMessage.style.display = "none";
    }
  }

  return { element: shell, setLoading, setError };
}