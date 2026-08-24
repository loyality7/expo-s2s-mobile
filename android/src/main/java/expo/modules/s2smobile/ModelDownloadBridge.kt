package expo.modules.s2smobile

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import androidx.core.app.NotificationCompat
import com.s2s.mobile.config.ModelDownloadConfig
import com.s2s.mobile.model.ModelDownloader
import com.s2s.mobile.model.ModelRegistry
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.util.Locale

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
        "approxBytes" to info.spec.approxBytes,
        "path" to info.targetFile.absolutePath
      )
    }
  }

  suspend fun downloadModels(
    context: Context,
    modelIds: List<String>?,
    huggingFaceToken: String?,
    downloadConfig: ModelDownloadConfig = ModelDownloadConfig()
  ) {
    val modelsDir = File(context.getExternalFilesDir(null) ?: context.filesDir, downloadConfig.modelsDirName)
    val downloader = ModelDownloader(modelsDir, huggingFaceToken, downloadConfig)
    activeDownloader = downloader

    val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val channel = NotificationChannel(
        downloadConfig.notificationChannelId,
        downloadConfig.notificationChannelName,
        NotificationManager.IMPORTANCE_LOW
      ).apply {
        description = downloadConfig.notificationChannelDescription
      }
      notificationManager.createNotificationChannel(channel)
    }

    try {
      withContext(Dispatchers.IO) {
        val targetSpecs = if (!modelIds.isNullOrEmpty()) {
          val byId = ModelRegistry.ALL_MODELS.associateBy { it.id }
          modelIds.mapNotNull { id -> byId[id] }
        } else {
          ModelRegistry.DEFAULT_STACK
        }

        // Real sha256 from the registry is kept intact — ModelDownloader
        // hard-fails a checksum mismatch, which is the point of having one.
        downloader.downloadAll(targetSpecs) { progress ->
          val pct = progress.percent.coerceIn(0, 100)
          val actionText = "${progress.status.name.lowercase(Locale.ROOT)}: ${progress.modelName}"

          val builder = NotificationCompat.Builder(context, downloadConfig.notificationChannelId)
            .setContentTitle("S2S Model Manager")
            .setContentText(actionText)
            .setSmallIcon(downloadConfig.notificationIconRes)
            .setProgress(100, pct, false)
            .setOngoing(true)

          notificationManager.notify(downloadConfig.notificationId, builder.build())

          sendEvent(
            "onModelDownloadProgress",
            mapOf(
              "modelName" to progress.modelName,
              "percent" to progress.percent,
              "downloadedBytes" to progress.downloadedBytes,
              "totalBytes" to progress.totalBytes,
              "status" to progress.status.name
            )
          )
        }
      }
    } finally {
      notificationManager.cancel(downloadConfig.notificationId)
      activeDownloader = null
    }
  }

  fun cancelDownload() {
    activeDownloader?.cancelDownload()
    activeDownloader = null
  }
}
