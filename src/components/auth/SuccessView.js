import { AuthShell } from "../ui/AuthShell.js";
import { AuthHeader } from "../ui/AuthHeader.js";
import { createElement } from "../../utils/dom.js";

export function createSuccessView({ onRestart }) {
  const header = AuthHeader({
    title: "You're signed in!",
    subtitle: "This is a mocked flow for demonstration purposes. Feel free to go back and try the flow again."
  });

  const restart = createElement("button", {
    classes: ["button", "button--ghost"],
    text: "Restart",
    attrs: { type: "button" }
  });
  restart.addEventListener("click", () => onRestart?.());

  const shell = AuthShell({ header, body: [], footer: restart });

  return { element: shell };
}