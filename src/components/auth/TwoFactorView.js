import { AuthShell } from "../ui/AuthShell.js";
import { AuthHeader } from "../ui/AuthHeader.js";
import { Button } from "../ui/Button.js";
import { createElement } from "../../utils/dom.js";

const CODE_LENGTH = 6;

export function createTwoFactorView({ onSubmit, onRequestNew, onBack }) {
  const state = {
    digits: Array(CODE_LENGTH).fill(""),
    loading: false,
    error: null
  };

  // Cooldown duration (in seconds) before the "Get new" button can be used again.
  // Adjust this value to change how long users must wait before requesting another code.
  const RESEND_COOLDOWN_SECONDS = 30;
  let resendCountdown = 0;
  let countdownIntervalId = null;

  const header = createElement("div");

  if (onBack) {
    const backButton = createElement("button", {
      classes: ["back-button"],
      attrs: { type: "button" }
    });
    backButton.innerHTML = `
      <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      Back`;
    backButton.addEventListener("click", () => onBack());
    header.appendChild(backButton);
  }

  header.appendChild(
      AuthHeader({
        title: "Two-Factor Authentication",
        subtitle: "Enter the 6-digit code from the Google Authenticator app"
      })
  );

  const form = createElement("form");

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
    submitButton.disabled = !isComplete || state.loading;
  }

  function handleInput(index, event) {
    const value = event.target.value.replace(/\D/g, "");
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
      classes: ["two-factor-input"],
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

  const errorMessage = createElement("p", {
    classes: ["two-factor-error"],
    text: "",
    attrs: { style: "display:none;" }
  });

  form.append(grid, errorMessage, submitButton);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (state.loading || submitButton.disabled) return;
    clearError();
    onSubmit?.(state.digits.join(""));
  });

  const footer = createElement("div", { attrs: { style: "text-align:center;" } });
  // Create the "Get new" button without an immediate click handler.
  const resendButton = Button({
    label: "Get new",
    variant: "ghost",
    type: "button"
  });
  // Helper to start the cooldown timer and update the button text/disabled state.
  function startResendTimer() {
    // Reset any existing timer
    if (countdownIntervalId) {
      clearInterval(countdownIntervalId);
    }
    resendCountdown = RESEND_COOLDOWN_SECONDS;
    // Disable the button during countdown
    resendButton.disabled = true;
    resendButton.textContent = `Get new (${resendCountdown})`;
    countdownIntervalId = setInterval(() => {
      resendCountdown -= 1;
      if (resendCountdown <= 0) {
        clearInterval(countdownIntervalId);
        countdownIntervalId = null;
        // Re-enable the button and restore its label
        resendButton.disabled = false;
        resendButton.textContent = "Get new";
      } else {
        // Update the label to show remaining seconds
        resendButton.textContent = `Get new (${resendCountdown})`;
      }
    }, 1000);
  }
  // Attach click handler manually so that we can control when requests are allowed.
  resendButton.addEventListener("click", () => {
    // Ignore clicks if the button is disabled
    if (resendButton.disabled) return;
    clearError();
    resetCode();
    onRequestNew?.();
    // Restart the cooldown after a new code is requested
    startResendTimer();
  });
  footer.appendChild(resendButton);

  const shell = AuthShell({ header, body: [form], footer });

  function setLoading(isLoading) {
    state.loading = isLoading;
    submitButton.disabled = isLoading || state.digits.some((digit) => digit === "");
    submitButton.textContent = isLoading ? "Verifying..." : "Continue";
    inputs.forEach((input) => {
      input.disabled = isLoading;
    });
    // Only disable the resend button during loading if it isn't already disabled.
    if (isLoading) {
      resendButton.disabled = true;
    } else if (resendCountdown <= 0) {
      // Re-enable the button if cooldown has finished
      resendButton.disabled = false;
    }
  }

  function setError(message) {
    state.error = message;
    if (message) {
      errorMessage.textContent = message;
      errorMessage.style.display = "block";
      inputs.forEach((input) => input.classList.add("error"));
    } else {
      clearError();
    }
  }

  function clearError() {
    state.error = null;
    errorMessage.style.display = "none";
    inputs.forEach((input) => input.classList.remove("error"));
  }

  function resetCode() {
    state.digits.fill("");
    inputs.forEach((input) => {
      input.value = "";
      input.classList.remove("error");
    });
    updateSubmitState();
    inputs[0]?.focus();
  }

  // Initialize the resend timer when the view is first created.
  // This prevents immediate repeated requests for new codes until the cooldown expires.
  startResendTimer();

  return {
    element: shell,
    setLoading,
    setError,
    resetCode,
    focusFirst: () => inputs[0]?.focus()
  };
}