package expo.modules.s2smobile

import com.s2s.mobile.S2SEngine
import com.s2s.mobile.pipeline.ToolDefinition
import com.s2s.mobile.pipeline.ToolFunction
import java.util.UUID
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit

class ToolBridge(private val sendEvent: (String, Map<String, Any?>) -> Unit) {

  private val pendingToolCalls = ConcurrentHashMap<String, CountDownLatch>()
  private val pendingToolResults = ConcurrentHashMap<String, ToolResultHolder>()

  private data class ToolResultHolder(val output: String, val isError: Boolean)

  fun registerTool(engine: S2SEngine, definition: ToolDefinition) {
    engine.registerTool(definition, ToolFunction { args ->
      val callId = UUID.randomUUID().toString()
      val latch = CountDownLatch(1)
      pendingToolCalls[callId] = latch

      sendEvent(
        "onExecuteToolRequest",
        mapOf(
          "callId" to callId,
          "name" to definition.name,
          "arguments" to args
        )
      )

      val completed = latch.await(30, TimeUnit.SECONDS)
      pendingToolCalls.remove(callId)
      val result = pendingToolResults.remove(callId)

      if (!completed) {
        throw java.util.concurrent.TimeoutException("Tool execution timed out after 30s")
      }

      if (result?.isError == true) {
        throw RuntimeException(result.output)
      }

      result?.output ?: ""
    })
  }

  fun resolveToolExecution(callId: String, output: String, isError: Boolean?) {
    val latch = pendingToolCalls[callId] ?: return
    pendingToolResults[callId] = ToolResultHolder(output = output, isError = isError == true)
    latch.countDown()
  }

  fun clear() {
    pendingToolCalls.clear()
    pendingToolResults.clear()
  }
}
