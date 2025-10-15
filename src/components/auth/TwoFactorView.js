import { AuthShell } from "../ui/AuthShell.js";
import { AuthHeader } from "../ui/AuthHeader.js";
import { Button } from "../ui/Button.js";
import { createElement } from "../../utils/dom.js";

const CODE_LENGTH = 6;
const CODE_TIMEOUT_SECONDS = 60;

export function createTwoFactorView({
  onSubmit,
  onRequestNew,
  onBack,
  error: initialError
}) {
  const state = {
    digits: Array(CODE_LENGTH).fill(""),
    loading: false,
    error: initialError ?? null,
    isExpired: false,
    secondsRemaining: CODE_TIMEOUT_SECONDS
  };

  let timerHandle = null;

  const formatSeconds = (total) => {
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const header = createElement("div", { classes: ["two-factor-header"] });

  if (onBack) {
    const nav = createElement("div", { classes: ["two-factor-header__nav"] });
    const backButton = createElement("button", {
      classes: ["back-button"],
      attrs: { type: "button" }
    });
    backButton.innerHTML = `
      <span class="sr-only">Back</span>
      <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M12.5 15 7.5 10l5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>`;
    backButton.addEventListener("click", () => onBack());
    nav.appendChild(backButton);
    header.appendChild(nav);
  }

  header.appendChild(
    AuthHeader({
      title: "Two-Factor Authentication",
      subtitle: "Enter the 6-digit code from the Google Authenticator app"
    })
  );

  const form = createElement("form", { classes: ["auth-shell__form"] });

  const grid = createElement("div", { classes: ["two-factor-grid"] });
  const inputs = [];

  function focusNext(index) {
    const next = inputs[index + 1];
    if (next) next.focus();
  }

  function focusPrev(index) {
    const prev = inputs[index - 1];
    if (prev) prev.focus();
  }

  function updateSubmitState() {
    const isComplete = state.digits.every((digit) => digit !== "");
    submitButton.disabled = !isComplete || state.loading || state.isExpired;
  }

  function handleInput(index, event) {
    const value = event.target.value.replace(/\D/g, "");
    if (state.error) {
      setError(null);
    }
    if (!value) {
      state.digits[index] = "";
      event.target.value = "";
      updateSubmitState();
      return;
    }

    state.digits[index] = value[0];
    event.target.value = value[0];
    updateSubmitState();
    if (value.length > 0) {
      focusNext(index);
    }
  }

  function handleKeyDown(index, event) {
    if (event.key === "Backspace" && !event.target.value) {
      focusPrev(index);
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusPrev(index);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      focusNext(index);
    }
  }

  function handlePaste(event) {
    event.preventDefault();
    const text = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (!text) return;
    if (state.error) {
      setError(null);
    }
    text.split("").forEach((char, index) => {
      state.digits[index] = char;
      inputs[index].value = char;
    });
    updateSubmitState();
    const lastFilledIndex = text.length - 1;
    const focusIndex = Math.min(lastFilledIndex, CODE_LENGTH - 1);
    inputs[focusIndex].focus();
  }

  for (let index = 0; index < CODE_LENGTH; index += 1) {
    const input = createElement("input", {
      classes: ["two-factor-input", state.error ? "error" : ""].filter(Boolean),
      attrs: {
        inputMode: "numeric",
        maxLength: 1,
        type: "text",
        autoComplete: "one-time-code"
      }
    });

    input.addEventListener("input", (event) => handleInput(index, event));
    input.addEventListener("keydown", (event) => handleKeyDown(index, event));
    input.addEventListener("paste", handlePaste);

    grid.appendChild(input);
    inputs.push(input);
  }

  const submitButton = Button({ label: "Continue", type: "submit" });
  submitButton.disabled = true;

  const resendPrimaryButton = Button({
    label: "Get new",
    type: "button",
    onClick: () => {
      if (state.loading) return;
      onRequestNew?.();
    }
  });
  resendPrimaryButton.style.display = "none";

  const errorMessage = createElement("p", {
    classes: ["two-factor-error"],
    text: state.error ?? "",
    attrs: { style: state.error ? "" : "display:none;" }
  });

  const infoMessage = createElement("p", {
    classes: ["two-factor-info"],
    text: "",
    attrs: { style: "display:none;" }
  });

  const timerMessage = createElement("p", {
    classes: ["two-factor-info"],
    attrs: { "data-variant": "muted", style: "display:none;" },
    text: ""
  });

  const expiredMessage = createElement("p", {
    classes: ["two-factor-expired-note"],
    text: "Code expired. Request a new one.",
    attrs: { style: "display:none;" }
  });

  const actions = createElement("div", { classes: ["two-factor-actions"] });
  actions.append(submitButton, resendPrimaryButton);

  form.append(grid, errorMessage, actions, infoMessage, expiredMessage, timerMessage);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (state.loading || submitButton.disabled) return;
    errorMessage.style.display = "none";
    infoMessage.style.display = "none";
    onSubmit?.(state.digits.join(""));
  });

  const shell = AuthShell({ header, body: [form] });

  function toggleExpiredUI() {
    if (state.isExpired) {
      submitButton.style.display = "none";
      resendPrimaryButton.style.display = "inline-flex";
      expiredMessage.style.display = "block";
      timerMessage.style.display = "none";
    } else {
      submitButton.style.display = "inline-flex";
      resendPrimaryButton.style.display = "none";
      expiredMessage.style.display = "none";
      if (state.secondsRemaining < CODE_TIMEOUT_SECONDS) {
        timerMessage.style.display = "block";
      }
    }

    inputs.forEach((input) => {
      input.disabled = state.loading || state.isExpired;
    });

    updateSubmitState();
  }

  function updateTimerMessage() {
    if (state.isExpired) return;
    if (state.secondsRemaining <= 0) {
      timerMessage.style.display = "none";
      return;
    }
    timerMessage.textContent = `Code expires in ${formatSeconds(state.secondsRemaining)}`;
    timerMessage.style.display = "block";
  }

  function stopTimer() {
    if (timerHandle) {
      clearInterval(timerHandle);
      timerHandle = null;
    }
  }

  function setExpired(expired) {
    state.isExpired = expired;
    toggleExpiredUI();
  }

  function startTimer() {
    stopTimer();
    state.secondsRemaining = CODE_TIMEOUT_SECONDS;
    setExpired(false);
    updateTimerMessage();
    timerHandle = setInterval(() => {
      state.secondsRemaining -= 1;
      if (state.secondsRemaining <= 0) {
        stopTimer();
        state.secondsRemaining = 0;
        handleExpired();
      } else {
        updateTimerMessage();
      }
    }, 1000);
  }

  function setLoading(isLoading) {
    state.loading = isLoading;
    submitButton.disabled =
      isLoading || state.digits.some((digit) => digit === "") || state.isExpired;
    submitButton.textContent = isLoading ? "Verifying..." : "Continue";
    inputs.forEach((input) => {
      input.disabled = isLoading || state.isExpired;
    });
    resendPrimaryButton.disabled = isLoading;
  }

  function setError(message) {
    state.error = message;
    if (message) {
      errorMessage.textContent = message;
      errorMessage.style.display = "block";
      inputs.forEach((input) => input.classList.add("error"));
    } else {
      errorMessage.style.display = "none";
      inputs.forEach((input) => input.classList.remove("error"));
    }
  }

  function setInfo(message) {
    if (message) {
      infoMessage.textContent = message;
      infoMessage.style.display = "block";
    } else {
      infoMessage.style.display = "none";
    }
  }

  function resetCode({ focus = true } = {}) {
    state.digits.fill("");
    inputs.forEach((input) => {
      input.value = "";
    });
    updateSubmitState();
    if (focus) {
      inputs[0]?.focus();
    }
  }

  function handleExpired() {
    stopTimer();
    resetCode({ focus: false });
    setError(null);
    setInfo(null);
    setExpired(true);
  }

  function refreshCycle() {
    resetCode();
    setError(null);
    setInfo(null);
    startTimer();
  }

  startTimer();

  if (state.error) {
    setError(state.error);
  }

  return {
    element: shell,
    setLoading,
    setError,
    setInfo,
    resetCode,
    focusFirst: () => inputs[0]?.focus(),
    markExpired: handleExpired,
    restartCycle: refreshCycle,
    dispose: stopTimer
  };
}
