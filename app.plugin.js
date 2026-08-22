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

    const serviceName = 'com.s2s.mobile.audio.VoiceSessionService';
    if (
      !application.service.some(
        (item) => item.$ && item.$['android:name'] === serviceName
      )
    ) {
      application.service.push({
        $: {
          'android:name': serviceName,
          'android:foregroundServiceType': 'microphone',
          'android:exported': 'false',
        },
      });
    }

    return config;
  });
}

module.exports = createRunOncePlugin(withS2SMobile, pkg.name, pkg.version);
