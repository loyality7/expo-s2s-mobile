package expo.modules.s2smobile

import android.content.Context
import com.s2s.mobile.model.ModelDownloader
import com.s2s.mobile.model.ModelRegistry
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File

class ModelDownloadBridge(
  private val sendEvent: (String, Map<String, Any?>) -> Unit
) {
  private var activeDownloader: ModelDownloader? = null

  fun useCustomRegistry(jsonString: String) {
    ModelRegistry.useRegistry(jsonString)
  }

  fun useDefaultRegistry() {
    ModelRegistry.useDefaultRegistry()
  }

  suspend fun getInstalledModels(context: Context): List<Map<String, Any>> {
    val modelsDir = File(context.getExternalFilesDir(null) ?: context.filesDir, "models")
    val downloader = ModelDownloader(modelsDir)
    val installed = downloader.getInstalledModels()

    return installed.map { info ->
      mapOf(
        "id" to info.spec.id,
        "category" to info.spec.category,
        "name" to info.spec.name,
        "isInstalled" to info.isInstalled,
        "diskUsageBytes" to info.diskUsageBytes,
        "path" to info.targetFile.absolutePath
      )
    }
  }

  suspend fun downloadModels(context: Context, huggingFaceToken: String?) {
    val modelsDir = File(context.getExternalFilesDir(null) ?: context.filesDir, "models")
    val downloader = ModelDownloader(modelsDir, huggingFaceToken = huggingFaceToken)
    activeDownloader = downloader

    try {
      withContext(Dispatchers.IO) {
        downloader.downloadAll(ModelRegistry.DEFAULT_STACK) { progress ->
          sendEvent(
            "onModelDownloadProgress",
            mapOf(
              "specName" to progress.specName,
              "percent" to progress.percent,
              "downloadedBytes" to progress.downloadedBytes,
              "totalBytes" to progress.totalBytes,
              "status" to progress.status.name
            )
          )
        }
      }
    } finally {
      activeDownloader = null
    }
  }

  fun cancelDownload() {
    activeDownloader?.cancelDownload()
    activeDownloader = null
  }
}
