const MOCK_USER = {
  email: "info@mail.com",
  password: "password123",
  requiresTwoFactor: true
};

let activeCode = "133311";

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
    return simulateDelay({ requiresTwoFactor: true, email: MOCK_USER.email }, false);
  }

  return simulateDelay({ requiresTwoFactor: false, token: "mock-token" }, false);
}

export function verifyTwoFactor(code) {
  if (!code || code.length !== activeCode.length) {
    return simulateDelay(new Error("Enter the full 6-digit code."), true, 500);
  }

  if (code !== activeCode) {
    return simulateDelay(new Error("Invalid code. Try again."), true, 700);
  }

  return simulateDelay({ success: true, token: "mock-session-token" }, false, 800);
}

export function requestNewCode() {
  activeCode = String(Math.floor(100000 + Math.random() * 900000));
  return simulateDelay({ code: activeCode }, false, 650);
}
