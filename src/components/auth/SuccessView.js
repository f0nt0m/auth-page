import { AuthShell } from "../ui/AuthShell.js";
import { AuthHeader } from "../ui/AuthHeader.js";
import { createElement } from "../../utils/dom.js";

export function createSuccessView({ onRestart }) {
  const header = AuthHeader({
    title: "You're signed in!",
    subtitle: "This is a mocked flow for demonstration purposes."
  });

  const message = createElement("div", { classes: ["auth-shell__subtitle"] });
  message.style.textAlign = "center";
  message.style.color = "#1d4ed8";
  message.textContent = "Feel free to go back and try the flow again.";

  const restart = createElement("button", {
    classes: ["button", "button--ghost"],
    text: "Restart",
    attrs: { type: "button", style: "width:100%;" }
  });
  restart.addEventListener("click", () => onRestart?.());

  const shell = AuthShell({ header, body: [message], footer: restart });

  return { element: shell };
}
