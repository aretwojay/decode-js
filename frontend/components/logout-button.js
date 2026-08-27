import { clearToken } from "../lib/auth.js";

export default function LogoutButton() {
  return {
    type: "button",
    attributes: [["class", ["logout-btn"]]],
    children: ["Se déconnecter"],
    events: [
      [
        "click",
        () => {
          clearToken();
          window.history.pushState({}, "", "/");
          window.dispatchEvent(new Event("pushstate"));
        },
      ],
    ],
  };
}
