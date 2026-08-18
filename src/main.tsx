import React from "react"
import ReactDOM from "react-dom/client"
import App from "./app/App"
import "./index.css"

// Marked once, before the first render: a frame's contents are laid out the
// same but rasterised differently, and the stylesheet has to know. See
// `[data-framed]` in index.css.
if (window.self !== window.top) {
  document.documentElement.dataset.framed = ""
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
