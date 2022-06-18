import { createRoot } from "react-dom/client";

// Find root container element and render.

const container: HTMLElement | null = document.getElementById("root");
if (!container) {
  throw new Error("Cannot find root element!");
}
const root = createRoot(container);
root.render(<div />);

// Handle events to channels.

window.electron.ipcRenderer.once("ipc-example", (arg) => {
  console.log(arg);
});

window.electron.ipcRenderer.sendMessage("ipc-example", ["ping"]);
