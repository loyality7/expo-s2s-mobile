package expo.modules.s2smobile

import com.s2s.mobile.S2SEngine
import com.s2s.mobile.S2SEvent
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import java.util.concurrent.atomic.AtomicBoolean

/**
 * EventBridge collects engine events and dispatches them across the Expo JS bridge.
 * Includes native event coalescing/throttling for high-frequency token streaming (AssistantDelta)
 * to prevent JS thread event loop saturation.
 */
class EventBridge(
  private val scope: CoroutineScope,
  private val sendEvent: (String, Map<String, Any?>) -> Unit,
  private val flushIntervalMs: Long = 35L
) {
  private var collectionJob: Job? = null
  private var tickerJob: Job? = null

  private val deltaBuffer = StringBuilder()
  private val hasPendingDelta = AtomicBoolean(false)

  fun startCollection(s2sEngine: S2SEngine) {
    stopCollection()

    // Start ticker for coalescing LLM tokens
    tickerJob = scope.launch {
      while (isActive) {
        delay(flushIntervalMs)
        flushDeltaBuffer()
      }
    }

    collectionJob = scope.launch {
      launch {
        s2sEngine.events.collect { event ->
          when (event) {
            is S2SEvent.UserTranscript -> {
              sendEvent(
                "onUserTranscript",
                mapOf("text" to event.text, "isFinal" to event.isFinal)
              )
            }
            is S2SEvent.AssistantDelta -> {
              synchronized(deltaBuffer) {
                deltaBuffer.append(event.text)
                hasPendingDelta.set(true)
              }
            }
            is S2SEvent.AssistantDone -> {
              flushDeltaBuffer()
              sendEvent(
                "onAssistantDone",
                mapOf("text" to event.text)
              )
            }
            is S2SEvent.StateChanged -> {
              sendEvent(
                "onStateChanged",
                mapOf("state" to event.state.name)
              )
            }
            is S2SEvent.BargeIn -> {
              flushDeltaBuffer()
              sendEvent("onBargeIn", emptyMap<String, Any>())
            }
            is S2SEvent.SpeechStarted -> sendEvent("onSpeechStarted", emptyMap<String, Any>())
            is S2SEvent.SpeechEnded -> sendEvent("onSpeechEnded", emptyMap<String, Any>())
            is S2SEvent.Metrics -> sendEvent(
              "onMetrics",
              mapOf(
                "metrics" to mapOf(
                  "timeToFirstTokenMs" to event.metrics.timeToFirstTokenMs,
                  "timeToFirstAudioMs" to event.metrics.timeToFirstAudioMs
                )
              )
            )
            is S2SEvent.ToolExecuted -> sendEvent(
              "onToolExecuted",
              mapOf(
                "name" to event.name,
                "output" to event.output,
                "isError" to event.isError
              )
            )
            is S2SEvent.AudioFocusLost -> sendEvent(
              "onAudioFocusLost",
              mapOf("willResume" to event.willResume)
            )
            is S2SEvent.AudioFocusRegained -> sendEvent("onAudioFocusRegained", emptyMap<String, Any>())
            is S2SEvent.Error -> {
              flushDeltaBuffer()
              sendEvent(
                "onError",
                mapOf("message" to event.message, "cause" to event.cause?.message)
              )
            }
          }
        }
      }

      launch {
        s2sEngine.state.collect { state ->
          sendEvent("onStateChanged", mapOf("state" to state.name))
        }
      }
    }
  }

  private fun flushDeltaBuffer() {
    if (!hasPendingDelta.get()) return
    val textToSend: String
    synchronized(deltaBuffer) {
      if (deltaBuffer.isEmpty()) return
      textToSend = deltaBuffer.toString()
      deltaBuffer.setLength(0)
      hasPendingDelta.set(false)
    }
    sendEvent("onAssistantDelta", mapOf("text" to textToSend))
  }

  fun stopCollection() {
    tickerJob?.cancel()
    tickerJob = null
    collectionJob?.cancel()
    collectionJob = null
    synchronized(deltaBuffer) {
      deltaBuffer.setLength(0)
      hasPendingDelta.set(false)
    }
  }
}
