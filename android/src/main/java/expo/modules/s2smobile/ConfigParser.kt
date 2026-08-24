package expo.modules.s2smobile

import com.s2s.mobile.config.AudioConfig
import com.s2s.mobile.config.LlmConfig
import com.s2s.mobile.config.ModelDownloadConfig
import com.s2s.mobile.config.ModelPaths
import com.s2s.mobile.config.S2SConfig
import com.s2s.mobile.config.SttConfig
import com.s2s.mobile.config.TtsConfig
import com.s2s.mobile.config.VadConfig
import com.s2s.mobile.pipeline.GenerationOverrides
import com.s2s.mobile.pipeline.LlmBackend
import com.s2s.mobile.config.SttBackend
import com.s2s.mobile.pipeline.ToolDefinition
import com.s2s.mobile.pipeline.ToolParameter
import com.s2s.mobile.pipeline.TtsBackend
import com.s2s.mobile.config.VadBackend

object ConfigParser {

  fun parseConfig(map: Map<String, Any?>): S2SConfig {
    val modelsMap = map["models"] as? Map<String, Any?>
      ?: throw IllegalArgumentException("Config missing 'models'")

    val modelPaths = ModelPaths(
      vadModel = modelsMap["vadModel"] as? String ?: "",
      sttDir = modelsMap["sttDir"] as? String ?: "",
      llmModel = modelsMap["llmModel"] as? String ?: "",
      ttsDir = modelsMap["ttsDir"] as? String ?: "",
      hdAudioRestorerModel = modelsMap["hdAudioRestorerModel"] as? String
    )

    val audioMap = map["audio"] as? Map<String, Any?>
    val audioConfig = if (audioMap != null) AudioConfig(
      sampleRate = (audioMap["sampleRate"] as? Number)?.toInt() ?: 16000,
      frameSize = (audioMap["frameSize"] as? Number)?.toInt() ?: 512,
      echoCancellation = audioMap["echoCancellation"] as? Boolean ?: true,
      noiseSuppression = audioMap["noiseSuppression"] as? Boolean ?: true,
      playbackSampleRate = (audioMap["playbackSampleRate"] as? Number)?.toInt(),
      manageForegroundService = audioMap["manageForegroundService"] as? Boolean ?: true,
      serviceNotificationTitle = audioMap["serviceNotificationTitle"] as? String ?: "Listening",
      serviceNotificationText = audioMap["serviceNotificationText"] as? String ?: "Voice assistant is active",
      serviceNotificationPausedTitle = audioMap["serviceNotificationPausedTitle"] as? String ?: "Paused",
      serviceNotificationPausedText = audioMap["serviceNotificationPausedText"] as? String ?: "Audio focus taken by another app",
      manageAudioFocus = audioMap["manageAudioFocus"] as? Boolean ?: true,
      pauseOnDuck = audioMap["pauseOnDuck"] as? Boolean ?: true,
      audioSource = audioMap["audioSource"] as? String ?: "VOICE_COMMUNICATION",
      notificationChannelId = audioMap["notificationChannelId"] as? String ?: "s2s_voice_session_channel",
      notificationId = (audioMap["notificationId"] as? Number)?.toInt() ?: 1002,
      notificationImportance = audioMap["notificationImportance"] as? String ?: "LOW",
      notificationSmallIconRes = (audioMap["notificationSmallIconRes"] as? Number)?.toInt() ?: android.R.drawable.ic_btn_speak_now,
      captureThreadPriority = (audioMap["captureThreadPriority"] as? Number)?.toInt() ?: Thread.MAX_PRIORITY,
      playbackThreadPriority = (audioMap["playbackThreadPriority"] as? Number)?.toInt() ?: Thread.MAX_PRIORITY,
      captureBufferFrameMultiplier = (audioMap["captureBufferFrameMultiplier"] as? Number)?.toInt() ?: 8,
      playbackBufferMultiplier = (audioMap["playbackBufferMultiplier"] as? Number)?.toInt() ?: 2,
      playbackPollIntervalMs = (audioMap["playbackPollIntervalMs"] as? Number)?.toLong() ?: 5L,
      releaseJoinTimeoutMs = (audioMap["releaseJoinTimeoutMs"] as? Number)?.toLong() ?: 300L
    ) else AudioConfig()

    val vadMap = map["vad"] as? Map<String, Any?>
    val vadConfig = if (vadMap != null) VadConfig(
      backend = when (vadMap["backend"] as? String) {
        "TEN" -> VadBackend.TEN
        else -> VadBackend.SILERO
      },
      threshold = (vadMap["threshold"] as? Number)?.toFloat() ?: 0.5f,
      minSilenceSeconds = (vadMap["minSilenceSeconds"] as? Number)?.toFloat() ?: 0.35f,
      minSpeechSeconds = (vadMap["minSpeechSeconds"] as? Number)?.toFloat() ?: 0.3f,
      maxSpeechSeconds = (vadMap["maxSpeechSeconds"] as? Number)?.toFloat() ?: 20f,
      bargeInFrames = (vadMap["bargeInFrames"] as? Number)?.toInt() ?: 8,
      bargeInGraceMs = (vadMap["bargeInGraceMs"] as? Number)?.toLong() ?: 400L,
      bargeInEnabled = vadMap["bargeInEnabled"] as? Boolean ?: true,
      numThreads = (vadMap["numThreads"] as? Number)?.toInt() ?: 1,
      provider = vadMap["provider"] as? String ?: "cpu"
    ) else VadConfig()

    val sttMap = map["stt"] as? Map<String, Any?>
    val sttConfig = if (sttMap != null) SttConfig(
      backend = when (sttMap["backend"] as? String) {
        "ZIPFORMER2_CTC" -> SttBackend.ZIPFORMER2_CTC
        "PARAFORMER" -> SttBackend.PARAFORMER
        "NEMO_CTC" -> SttBackend.NEMO_CTC
        "MOONSHINE" -> SttBackend.MOONSHINE
        "PARAKEET_TDT" -> SttBackend.PARAKEET_TDT
        "WHISPER" -> SttBackend.WHISPER
        "CANARY" -> SttBackend.CANARY
        else -> SttBackend.ZIPFORMER_TRANSDUCER
      },
      numThreads = (sttMap["numThreads"] as? Number)?.toInt() ?: 2,
      endpointTrailingSilence = (sttMap["endpointTrailingSilence"] as? Number)?.toFloat() ?: 0.8f,
      endpointSilenceOnly = (sttMap["endpointSilenceOnly"] as? Number)?.toFloat() ?: 2.0f,
      endpointMaxUtterance = (sttMap["endpointMaxUtterance"] as? Number)?.toFloat() ?: 25f,
      emitPartials = sttMap["emitPartials"] as? Boolean ?: true,
      preferInt8 = sttMap["preferInt8"] as? Boolean ?: true,
      decodingMethod = sttMap["decodingMethod"] as? String ?: "modified_beam_search",
      maxActivePaths = (sttMap["maxActivePaths"] as? Number)?.toInt() ?: 4,
      hotwords = (sttMap["hotwords"] as? List<*>)?.mapNotNull { it as? String } ?: emptyList(),
      hotwordsScore = (sttMap["hotwordsScore"] as? Number)?.toFloat() ?: 1.5f,
      provider = sttMap["provider"] as? String ?: "cpu",
      featureDim = (sttMap["featureDim"] as? Number)?.toInt() ?: 80,
      language = sttMap["language"] as? String ?: "en",
      targetLanguage = sttMap["targetLanguage"] as? String ?: (sttMap["language"] as? String ?: "en"),
      punctuation = sttMap["punctuation"] as? Boolean ?: true
    ) else SttConfig()

    val llmMap = map["llm"] as? Map<String, Any?>
    val llmConfig = if (llmMap != null) LlmConfig(
      systemPrompt = llmMap["systemPrompt"] as? String ?: "Talk Freely, but don't be rude. You are a helpful assistant.",
      temperature = (llmMap["temperature"] as? Number)?.toFloat() ?: 0.7f,
      topP = (llmMap["topP"] as? Number)?.toFloat() ?: 0.95f,
      topK = (llmMap["topK"] as? Number)?.toInt() ?: 40,
      repeatPenalty = (llmMap["repeatPenalty"] as? Number)?.toFloat() ?: 1.1f,
      maxTokens = (llmMap["maxTokens"] as? Number)?.toInt() ?: 256,
      stopSequences = (llmMap["stopSequences"] as? List<*>)?.mapNotNull { it as? String } ?: emptyList(),
      contextLength = (llmMap["contextLength"] as? Number)?.toInt() ?: 2048,
      numThreads = (llmMap["numThreads"] as? Number)?.toInt() ?: 4,
      batchSize = (llmMap["batchSize"] as? Number)?.toInt() ?: 512,
      gpuLayers = (llmMap["gpuLayers"] as? Number)?.toInt() ?: 0,
      useMmap = llmMap["useMmap"] as? Boolean ?: true,
      flashAttention = llmMap["flashAttention"] as? Boolean ?: false,
      historyTurns = (llmMap["historyTurns"] as? Number)?.toInt() ?: 3,
      compactHistory = llmMap["compactHistory"] as? Boolean ?: true,
      reuseKvCache = llmMap["reuseKvCache"] as? Boolean ?: true,
      toolsEnabled = llmMap["toolsEnabled"] as? Boolean ?: false,
      backend = LlmBackend.LLAMA_CPP
    ) else LlmConfig()

    val ttsMap = map["tts"] as? Map<String, Any?>
    val ttsConfig = if (ttsMap != null) TtsConfig(
      backend = when (ttsMap["backend"] as? String) {
        "VITS" -> TtsBackend.VITS
        "MATCHA" -> TtsBackend.MATCHA
        "KITTEN" -> TtsBackend.KITTEN
        "POCKET" -> TtsBackend.POCKET
        else -> TtsBackend.KOKORO
      },
      speakerId = (ttsMap["speakerId"] as? Number)?.toInt() ?: 0,
      speed = (ttsMap["speed"] as? Number)?.toFloat() ?: 1.05f,
      numThreads = (ttsMap["numThreads"] as? Number)?.toInt() ?: 2,
      preferInt8 = ttsMap["preferInt8"] as? Boolean ?: true,
      warmUp = ttsMap["warmUp"] as? Boolean ?: true,
      warmUpText = ttsMap["warmUpText"] as? String ?: "ok",
      noiseScale = (ttsMap["noiseScale"] as? Number)?.toFloat() ?: 0.667f,
      noiseScaleW = (ttsMap["noiseScaleW"] as? Number)?.toFloat() ?: 0.8f,
      firstChunkMinChars = (ttsMap["firstChunkMinChars"] as? Number)?.toInt() ?: 12,
      maxChunkChars = (ttsMap["maxChunkChars"] as? Number)?.toInt() ?: 80,
      minChunkChars = (ttsMap["minChunkChars"] as? Number)?.toInt() ?: 10,
      provider = ttsMap["provider"] as? String ?: "cpu",
      enableHdAudioRestorer = ttsMap["enableHdAudioRestorer"] as? Boolean ?: false
    ) else TtsConfig()

    return S2SConfig(
      models = modelPaths,
      audio = audioConfig,
      vad = vadConfig,
      stt = sttConfig,
      llm = llmConfig,
      tts = ttsConfig,
      warmUpOnInit = map["warmUpOnInit"] as? Boolean ?: true
    )
  }

  fun parseModelDownloadConfig(map: Map<String, Any?>?): ModelDownloadConfig {
    if (map == null) return ModelDownloadConfig()
    return ModelDownloadConfig(
      connectTimeoutMs = (map["connectTimeoutMs"] as? Number)?.toInt() ?: 30_000,
      readTimeoutMs = (map["readTimeoutMs"] as? Number)?.toInt() ?: 120_000,
      maxRedirects = (map["maxRedirects"] as? Number)?.toInt() ?: 5,
      bufferSizeBytes = (map["bufferSizeBytes"] as? Number)?.toInt() ?: (1 shl 16),
      userAgent = map["userAgent"] as? String ?: "S2S-Mobile-SDK/1.1",
      huggingFaceTokenHosts = (map["huggingFaceTokenHosts"] as? List<*>)?.mapNotNull { it as? String }
        ?: listOf("huggingface.co"),
      modelsDirName = map["modelsDirName"] as? String ?: "models",
      notificationChannelId = map["notificationChannelId"] as? String ?: "s2s_model_download_channel",
      notificationChannelName = map["notificationChannelName"] as? String ?: "Model Downloads",
      notificationChannelDescription = map["notificationChannelDescription"] as? String
        ?: "Shows progress while model files are downloading",
      notificationId = (map["notificationId"] as? Number)?.toInt() ?: 1001,
      notificationIconRes = (map["notificationIconRes"] as? Number)?.toInt()
        ?: android.R.drawable.stat_sys_download
    )
  }

  fun parseGenerationOverrides(map: Map<String, Any?>): GenerationOverrides {
    return GenerationOverrides(
      temperature = (map["temperature"] as? Number)?.toFloat(),
      topP = (map["topP"] as? Number)?.toFloat(),
      topK = (map["topK"] as? Number)?.toInt(),
      repeatPenalty = (map["repeatPenalty"] as? Number)?.toFloat(),
      maxTokens = (map["maxTokens"] as? Number)?.toInt(),
      stopSequences = (map["stopSequences"] as? List<*>)?.mapNotNull { it as? String }
    )
  }

  fun parseToolDefinition(map: Map<String, Any?>): ToolDefinition {
    val name = map["name"] as? String
      ?: throw IllegalArgumentException("ToolDefinition missing 'name'")
    val description = map["description"] as? String ?: ""
    val parameters = (map["parameters"] as? Map<*, *>)?.entries?.associate {
      it.key.toString() to it.value.toString()
    } ?: emptyMap()

    val schemaMap = map["schema"] as? Map<*, *>
    val schema = schemaMap?.entries?.associate { (key, value) ->
      val paramMap = value as? Map<*, *>
      val paramDesc = paramMap?.get("description") as? String ?: ""
      val paramType = paramMap?.get("type") as? String ?: "string"
      val paramReq = paramMap?.get("required") as? Boolean ?: true
      val paramEnum = (paramMap?.get("enum") as? List<*>)?.mapNotNull { it as? String } ?: emptyList()
      key.toString() to ToolParameter(paramDesc, paramType, paramReq, paramEnum)
    } ?: emptyMap()

    return ToolDefinition(name, description, parameters, schema)
  }
}
