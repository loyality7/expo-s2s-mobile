package expo.modules.s2smobile

import com.s2s.mobile.S2SEngine
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class S2SMobileModule : Module() {
  private var engine: S2SEngine? = null
  private val moduleScope = CoroutineScope(Dispatchers.Main + SupervisorJob())

  private val eventBridge by lazy {
    EventBridge(moduleScope, sendEvent = { eventName, payload ->
      sendEvent(eventName, payload)
    })
  }

  private val toolBridge by lazy {
    ToolBridge { eventName, payload ->
      sendEvent(eventName, payload)
    }
  }

  private val downloadBridge by lazy {
    ModelDownloadBridge { eventName, payload ->
      sendEvent(eventName, payload)
    }
  }

  override fun definition() = ModuleDefinition {
    Name("S2SMobile")

    Events(
      "onUserTranscript",
      "onAssistantDelta",
      "onAssistantDone",
      "onStateChanged",
      "onBargeIn",
      "onSpeechStarted",
      "onSpeechEnded",
      "onMetrics",
      "onToolExecuted",
      "onAudioFocusLost",
      "onAudioFocusRegained",
      "onError",
      "onExecuteToolRequest",
      "onModelDownloadProgress"
    )

    AsyncFunction("initializeAsync") { configMap: Map<String, Any?>, promise: Promise ->
      moduleScope.launch {
        try {
          val context = appContext.reactContext
            ?: throw IllegalStateException("React Context unavailable")
          
          val s2sConfig = ConfigParser.parseConfig(configMap)
          
          withContext(Dispatchers.IO) {
            engine?.release()
          }

          val newEngine = S2SEngine(context, s2sConfig)
          
          withContext(Dispatchers.IO) {
            newEngine.initialize().getOrThrow()
          }

          engine = newEngine
          eventBridge.startCollection(newEngine)
          promise.resolve(null)
        } catch (e: Throwable) {
          promise.reject("ERR_S2S_INIT", e.message ?: "Failed to initialize S2SEngine", e)
        }
      }
    }

    AsyncFunction("getInstalledModelsAsync") { promise: Promise ->
      moduleScope.launch {
        try {
          val context = appContext.reactContext
            ?: throw IllegalStateException("React Context unavailable")
          val installed = downloadBridge.getInstalledModels(context)
          promise.resolve(installed)
        } catch (e: Throwable) {
          promise.reject("ERR_S2S_MODELS", e.message ?: "Failed to query installed models", e)
        }
      }
    }

    AsyncFunction("downloadModelsAsync") { modelIds: List<String>?, huggingFaceToken: String?, promise: Promise ->
      moduleScope.launch {
        try {
          val context = appContext.reactContext
            ?: throw IllegalStateException("React Context unavailable")
          downloadBridge.downloadModels(context, modelIds, huggingFaceToken)
          promise.resolve(null)
        } catch (e: Throwable) {
          promise.reject("ERR_S2S_DOWNLOAD", e.message ?: "Failed to download model bundle", e)
        }
      }
    }

    Function("useCustomModelRegistry") { jsonString: String ->
      downloadBridge.useCustomRegistry(jsonString)
    }

    Function("useDefaultModelRegistry") {
      downloadBridge.useDefaultRegistry()
    }

    Function("cancelModelDownload") {
      downloadBridge.cancelDownload()
    }

    Function("start") {
      engine?.start() ?: false
    }

    Function("stop") {
      engine?.stop()
    }

    AsyncFunction("releaseAsync") { promise: Promise ->
      moduleScope.launch {
        eventBridge.stopCollection()
        val engineToRelease = engine
        engine = null
        withContext(Dispatchers.IO) {
          engineToRelease?.release()
        }
        toolBridge.clear()
        promise.resolve(null)
      }
    }

    Function("interrupt") {
      engine?.interrupt()
    }

    Function("sendText") { text: String, overridesMap: Map<String, Any?>? ->
      val overrides = overridesMap?.let { ConfigParser.parseGenerationOverrides(it) }
      engine?.sendText(text, overrides)
    }

    Function("setSystemPrompt") { prompt: String ->
      engine?.setSystemPrompt(prompt)
    }

    Function("selectVoice") { voiceId: Int ->
      engine?.selectVoice(voiceId)
    }

    Function("resetConversation") {
      engine?.resetConversation()
    }

    Function("saveConversationState") {
      engine?.saveConversationState() ?: ""
    }

    Function("restoreConversationState") { json: String ->
      engine?.restoreConversationState(json)
    }

    Function("getConversationHistory") {
      engine?.conversationHistory()?.map { msg ->
        mapOf(
          "role" to msg.role,
          "content" to msg.content
        )
      } ?: emptyList<Map<String, String>>()
    }

    Function("getVoices") {
      engine?.voices?.map { v ->
        mapOf(
          "id" to v.id,
          "name" to v.name
        )
      } ?: emptyList<Map<String, Any>>()
    }

    Function("isHardwareAecActive") {
      engine?.isHardwareAecActive ?: false
    }

    Function("isHardwareNoiseSuppressionActive") {
      engine?.isHardwareNoiseSuppressionActive ?: false
    }

    Function("onTrimMemory") { level: Int ->
      engine?.onTrimMemory(level)
    }

    Function("registerTool") { defMap: Map<String, Any?> ->
      val activeEngine = engine ?: throw IllegalStateException("Engine not initialized")
      val definition = ConfigParser.parseToolDefinition(defMap)
      toolBridge.registerTool(activeEngine, definition)
    }

    Function("unregisterTool") { name: String ->
      engine?.tools?.unregister(name)
    }

    Function("resolveToolExecution") { callId: String, output: String, isError: Boolean? ->
      toolBridge.resolveToolExecution(callId, output, isError)
    }
  }
}
