import "@hotwired/turbo"
import { Application } from "@hotwired/stimulus"
import HelloController from "./controllers/hello_controller"
import CalloutController from "./controllers/callout_controller"

const application = Application.start()
application.register("hello", HelloController)
application.register("callout", CalloutController)

// Are we in an <iframe>?
if (window.top !== window) {
  // 🎶 Never Gonna Give You Up 🎶
  location.replace("https://www.youtube.com/embed/dQw4w9WgXcQ")
}
