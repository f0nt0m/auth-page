import { clearChildren } from "./utils/dom.js";
import { createLoginView } from "./components/auth/LoginView.js";
import { createTwoFactorView } from "./components/auth/TwoFactorView.js";
import { createSuccessView } from "./components/auth/SuccessView.js";
import * as authApi from "./services/authApi.js";

const appRoot = document.getElementById("app");

let loginView = null;
let twoFactorView = null;
let userEmail = "";

function mount(view) {
  clearChildren(appRoot);
  appRoot.appendChild(view.element);
}

function showLogin(initialEmail = "") {
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
      userEmail = response.email;
      showTwoFactor();
    } else {
      showSuccess();
    }
  } catch (error) {
    loginView.setError(error.message ?? "Unable to sign in. Try again later.");
  } finally {
    loginView.setLoading(false);
  }
}

function showTwoFactor() {
  twoFactorView = createTwoFactorView({
    onSubmit: handleVerifyCode,
    onRequestNew: handleRequestNewCode,
    onBack: () => showLogin(userEmail)
  });
  mount(twoFactorView);
  twoFactorView.focusFirst();
}

async function handleVerifyCode(code) {
  twoFactorView.setLoading(true);
  try {
    await authApi.verifyTwoFactor(code);
    showSuccess();
  } catch (error) {
    twoFactorView.setError(error.message ?? "Invalid code");
    twoFactorView.resetCode();
    twoFactorView.focusFirst();
  } finally {
    twoFactorView.setLoading(false);
  }
}

async function handleRequestNewCode() {
  twoFactorView.setLoading(true);
  try {
    const { code } = await authApi.requestNewCode();
    console.info("New 2FA code:", code);
    twoFactorView.resetCode();
    twoFactorView.focusFirst();
  } catch (error) {
    twoFactorView.setError(error.message ?? "Unable to request a new code.");
  } finally {
    twoFactorView.setLoading(false);
  }
}

function showSuccess() {
  const successView = createSuccessView({
    onRestart: () => {
      userEmail = "";
      showLogin();
    }
  });
  mount(successView);
}

showLogin();