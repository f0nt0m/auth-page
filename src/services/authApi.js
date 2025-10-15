const MOCK_USER = {
  email: "info@mail.com",
  password: "password123",
  requiresTwoFactor: true
};

const CODE_TTL_MS = 60_000;

let activeCode = "";
let codeExpiresAt = 0;

function simulateDelay(result, shouldReject = false, delay = 900) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldReject) {
        reject(result);
      } else {
        resolve(result);
      }
    }, delay);
  });
}

function issueNewCode() {
  activeCode = String(Math.floor(100000 + Math.random() * 900000));
  codeExpiresAt = Date.now() + CODE_TTL_MS;
  return { code: activeCode, expiresAt: codeExpiresAt };
}

export function login({ email, password }) {
  if (!email || !password) {
    return simulateDelay(new Error("Please enter your email and password."), true, 600);
  }

  const isValidEmail = email.toLowerCase() === MOCK_USER.email;
  const isValidPassword = password === MOCK_USER.password;

  if (!isValidEmail || !isValidPassword) {
    return simulateDelay(new Error("The provided credentials are incorrect."), true);
  }

  if (MOCK_USER.requiresTwoFactor) {
    const { expiresAt } = issueNewCode();
    return simulateDelay(
      { requiresTwoFactor: true, email: MOCK_USER.email, expiresAt },
      false
    );
  }

  return simulateDelay({ requiresTwoFactor: false, token: "mock-token" }, false);
}

export function verifyTwoFactor(code) {
  if (!code || code.length !== activeCode.length) {
    return simulateDelay(new Error("Enter the full 6-digit code."), true, 500);
  }

  if (!activeCode || Date.now() > codeExpiresAt) {
    const error = new Error("Code expired. Request a new one.");
    error.code = "CODE_EXPIRED";
    return simulateDelay(error, true, 500);
  }

  if (code !== activeCode) {
    const error = new Error("Invalid code. Try again." );
    error.code = "CODE_INVALID";
    return simulateDelay(error, true, 700);
  }

  return simulateDelay({ success: true, token: "mock-session-token" }, false, 800);
}

export function requestNewCode() {
  const details = issueNewCode();
  return simulateDelay(details, false, 650);
}

export function getActiveCode() {
  return { code: activeCode, expiresAt: codeExpiresAt };
}
