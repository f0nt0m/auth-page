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
  twoFactorView = createTwoFactorView({
    onSubmit: handleVerifyCode,
    onRequestNew: handleRequestNewCode,
    onBack: () => showLogin(email)
  });
  mount(twoFactorView);
  twoFactorView.focusFirst();
}

async function handleVerifyCode(code) {
  twoFactorView.setLoading(true);
  twoFactorView.setError(null);
  try {
    await authApi.verifyTwoFactor(code);
    showSuccess();
  } catch (error) {
    twoFactorView.setError(error.message ?? "Unable to verify the code.");
    twoFactorView.resetCode();
    twoFactorView.focusFirst();
  } finally {
    twoFactorView.setLoading(false);
  }
}

async function handleRequestNewCode() {
  twoFactorView.setLoading(true);
  twoFactorView.setError(null);
  try {
    const { code } = await authApi.requestNewCode();
    twoFactorView.resetCode();
    twoFactorView.setInfo(`New code generated: ${code}`);
    console.info("Mock 2FA code:", code);
    twoFactorView.focusFirst();
  } catch (error) {
    twoFactorView.setError(error.message ?? "Unable to request a new code.");
  } finally {
    twoFactorView.setLoading(false);
  }
}

function showSuccess() {
  const successView = createSuccessView({ onRestart: () => showLogin() });
  mount(successView);
}

showLogin();
