import { AuthShell } from "../ui/AuthShell.js";
import { AuthHeader } from "../ui/AuthHeader.js";
import { Button } from "../ui/Button.js";
import { createElement } from "../../utils/dom.js";

export function createSuccessView({ onRestart }) {
  const header = AuthHeader({
    title: "You're signed in!",
    subtitle: "This is a mocked flow for demonstration purposes."
  });

  const message = createElement("p", {
    classes: ["success-message"],
    text: "Feel free to go back and try the flow again."
  });

  const restart = Button({
    label: "Restart",
    variant: "secondary",
    type: "button",
    onClick: () => onRestart?.()
  });

  const shell = AuthShell({ header, body: [message], footer: restart });

  return { element: shell };
}
