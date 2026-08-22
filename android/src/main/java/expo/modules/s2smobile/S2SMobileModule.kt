package expo.modules.s2smobile

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class S2SMobileModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("S2SMobile")

    Events("onChange")

    Constant("PI") {
      Math.PI
    }

    Function("hello") {
      "Hello world! 👋"
    }

    AsyncFunction("setValueAsync") { value: String ->
      sendEvent("onChange", mapOf(
        "value" to value
      ))
    }
  }
}
