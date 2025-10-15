import { clearChildren } from "./utils/dom.js";
import { createLoginView } from "./components/auth/LoginView.js";
import { createTwoFactorView } from "./components/auth/TwoFactorView.js";
import { createSuccessView } from "./components/auth/SuccessView.js";
import * as authApi from "./services/authApi.js";

const appRoot = document.getElementById("app");

let loginView = null;
let twoFactorView = null;

function mount(view) {
  clearChildren(appRoot);
  appRoot.appendChild(view.element);
}

function showLogin(initialEmail = "") {
  if (twoFactorView) {
    twoFactorView.dispose?.();
    twoFactorView = null;
  }
  loginView = createLoginView({
    initialEmail,
    onSubmit: handleLogin
  });
  mount(loginView);
}

async function handleLogin({ email, password }) {
  loginView.setLoading(true);
  loginView.setError(null);
  try {
    const response = await authApi.login({ email, password });
    if (response.requiresTwoFactor) {
      showTwoFactor(response.email);
    } else {
      showSuccess();
    }
  } catch (error) {
    loginView.setError(error.message ?? "Unable to sign in. Try again later.");
  } finally {
    loginView.setLoading(false);
  }
}

function showTwoFactor(email) {
  if (twoFactorView) {
    twoFactorView.dispose?.();
  }
  twoFactorView = createTwoFactorView({
    onSubmit: handleVerifyCode,
    onRequestNew: handleRequestNewCode,
    onBack: () => showLogin(email)
  });
  mount(twoFactorView);
  twoFactorView.focusFirst();
  logActiveCode("Initial");
}

async function handleVerifyCode(code) {
  twoFactorView.setLoading(true);
  twoFactorView.setError(null);
  try {
    console.info("Submitting 2FA code", code);
    await authApi.verifyTwoFactor(code);
    showSuccess();
  } catch (error) {
    twoFactorView.setError(error.message ?? "Unable to verify the code.");
    if (error.code === "CODE_EXPIRED") {
      twoFactorView.markExpired();
    } else {
      twoFactorView.resetCode();
    }
  } finally {
    twoFactorView.setLoading(false);
  }
}

async function handleRequestNewCode() {
  twoFactorView.setLoading(true);
  twoFactorView.setError(null);
  try {
    await authApi.requestNewCode();
    twoFactorView.restartCycle();
    twoFactorView.setInfo("A new code has been sent to your authenticator.");
    logActiveCode("Resent");
  } catch (error) {
    twoFactorView.setError(error.message ?? "Unable to request a new code.");
  } finally {
    twoFactorView.setLoading(false);
  }
}

function showSuccess() {
  if (twoFactorView) {
    twoFactorView.dispose?.();
    twoFactorView = null;
  }
  const successView = createSuccessView({ onRestart: () => showLogin() });
  mount(successView);
}

function logActiveCode(context) {
  const { code, expiresAt } = authApi.getActiveCode();
  if (code) {
    const expiresIn = Math.max(0, Math.round((expiresAt - Date.now()) / 1000));
    console.info(`[${context}] 2FA code: ${code} (expires in ${expiresIn}s)`);
  }
}

showLogin();
