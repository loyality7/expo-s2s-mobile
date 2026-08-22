# ProGuard / R8 Rules for Expo S2S Mobile Module
-keep class com.s2s.mobile.** { *; }
-keep class expo.modules.s2smobile.** { *; }
-keep class com.llamatik.** { *; }
-keep class com.k2fsa.sherpa.onnx.** { *; }

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}
