const { createRunOncePlugin, withAndroidManifest } = require('@expo/config-plugins');

const pkg = require('./package.json');

function withS2SMobile(config) {
  return withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults.manifest;

    // Ensure uses-permission list exists
    if (!androidManifest['uses-permission']) {
      androidManifest['uses-permission'] = [];
    }

    const permissionsNeeded = [
      'android.permission.RECORD_AUDIO',
      'android.permission.FOREGROUND_SERVICE',
      'android.permission.FOREGROUND_SERVICE_MICROPHONE',
      // Required by ModelDownloadService's foreground service on Android 14+
      // (API 34 hard-requires every foreground service type used at
      // startForeground() to have a matching manifest declaration + permission).
      'android.permission.FOREGROUND_SERVICE_DATA_SYNC',
      'android.permission.POST_NOTIFICATIONS',
      'android.permission.INTERNET',
    ];

    permissionsNeeded.forEach((permission) => {
      if (
        !androidManifest['uses-permission'].some(
          (item) => item.$ && item.$['android:name'] === permission
        )
      ) {
        androidManifest['uses-permission'].push({
          $: { 'android:name': permission },
        });
      }
    });

    // Ensure application service for VoiceSessionService
    if (!androidManifest.application) {
      androidManifest.application = [{}];
    }
    const application = androidManifest.application[0];
    if (!application.service) {
      application.service = [];
    }

    const servicesNeeded = [
      {
        name: 'com.s2s.mobile.audio.VoiceSessionService',
        foregroundServiceType: 'microphone',
      },
      {
        // Runs model downloads in the background with a status-bar
        // notification. Undeclared here means startForegroundService()
        // against it throws at runtime — see ModelDownloadService.kt.
        name: 'com.s2s.mobile.model.ModelDownloadService',
        foregroundServiceType: 'dataSync',
      },
    ];

    servicesNeeded.forEach(({ name, foregroundServiceType }) => {
      if (
        !application.service.some(
          (item) => item.$ && item.$['android:name'] === name
        )
      ) {
        application.service.push({
          $: {
            'android:name': name,
            'android:foregroundServiceType': foregroundServiceType,
            'android:exported': 'false',
          },
        });
      }
    });

    return config;
  });
}

module.exports = createRunOncePlugin(withS2SMobile, pkg.name, pkg.version);
