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

  const { wrapper: emailField, input: emailInput } = InputField({
    id: "email",
    label: "Email",
    type: "email",
    placeholder: "e.g. info@mail.com",
    value: state.email,
    autoComplete: "email",
    onInput: (value) => {
      state.email = value;
    }
  });

  const { wrapper: passwordField, input: passwordInput } = InputField({
    id: "password",
    label: "Password",
    type: "password",
    placeholder: "••••••••",
    autoComplete: "current-password",
    onInput: (value) => {
      state.password = value;
    }
  });

  const submitButton = Button({ label: "Log in", type: "submit" });

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

  function setLoading(isLoading) {
    state.loading = isLoading;
    submitButton.disabled = isLoading;
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
