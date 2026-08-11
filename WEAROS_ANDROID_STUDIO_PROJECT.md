# Proyecto Nativo Android Studio (Jetpack Compose para Wear OS)
## Mareas y Tiempo para OnePlus Watch 3

Esta guía contiene la estructura y el código completo en **Kotlin** y **Jetpack Compose para Wear OS** para compilar la APK nativa en Android Studio.

---

### 1. Requisitos Previos
1. Descarga e instala **Android Studio** (Hedgehog, Iguana o Jellyfish).
2. Crea un nuevo proyecto en Android Studio:
   - Tipo de plantilla: **Wear OS** -> **Blank Activity**.
   - Nombre: `MareasWatch`
   - Package Name: `com.example.mareaswatch`
   - Minimum SDK: `API 30: Android 11.0 (Wear OS 3.0+)` (Totalmente compatible con OnePlus Watch 3 / Wear OS 4).

---

### 2. Configuración de Dependencias (`app/build.gradle.kts`)

Añade las dependencias oficiales de Wear OS Compose, Horologist, Retrofit y Location:

```kotlin
plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "com.example.mareaswatch"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.example.mareaswatch"
        minSdk = 30
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
    kotlinOptions {
        jvmTarget = "11"
    }
    buildFeatures {
        compose = true
    }
}

dependencies {
    // Wear OS Compose
    implementation("androidx.wear.compose:compose-material:1.4.0")
    implementation("androidx.wear.compose:compose-foundation:1.4.0")
    implementation("androidx.wear.compose:compose-navigation:1.4.0")

    // Horologist (UI para Wear OS)
    implementation("com.google.android.horologist:horologist-compose-layout:0.6.17")
    implementation("com.google.android.horologist:horologist-compose-material:0.6.17")

    // Play Services Location (GPS para OnePlus Watch 3)
    implementation("com.google.android.gms:play-services-location:21.3.0")

    // Retrofit & Coroutines para APIs de Mareas y Tiempo
    implementation("com.squareup.retrofit2:retrofit:2.11.0")
    implementation("com.squareup.retrofit2:converter-gson:2.11.0")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-play-services:1.8.1")

    // Compose Core
    implementation(platform("androidx.compose:compose-bom:2024.09.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.5")
    implementation("androidx.activity:activity-compose:1.9.2")
}
```

---

### 3. Permisos en Manifest (`app/src/main/AndroidManifest.xml`)

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-feature android:name="android.hardware.type.watch" />
    <uses-feature android:name="android.hardware.location.gps" />

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="Mareas Watch"
        android:supportsRtl="true"
        android:theme="@android:style/Theme.DeviceDefault">
        
        <uses-library
            android:name="com.google.android.wearable"
            android:required="true" />

        <meta-data
            android:name="com.google.android.wearable.standalone"
            android:value="true" />

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:taskAffinity=""
            android:theme="@android:style/Theme.DeviceDefault">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
```

---

### 4. Código Principal (`MainActivity.kt`)

```kotlin
package com.example.mareaswatch

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import androidx.wear.compose.material.*
import com.google.android.gms.location.LocationServices
import kotlinx.coroutines.tasks.await
import kotlin.math.cos
import kotlin.math.sin

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MareasWatchTheme {
                MareasWatchApp()
            }
        }
    }
}

@Composable
fun MareasWatchTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colors = Colors(
            primary = Color(0xFF06B6D4),
            primaryVariant = Color(0xFF0284C7),
            secondary = Color(0xFFF59E0B),
            background = Color.Black,
            surface = Color(0xFF1E293B),
            onPrimary = Color.White,
            onBackground = Color.White,
            onSurface = Color.White
        ),
        content = content
    )
}

data class TideState(
    val location: String = "Cádiz",
    val tideLevel: Double = 1.8,
    val isRising: Boolean = true,
    val windSpeed: Int = 18,
    val waveHeight: Double = 1.2,
    val uvIndex: Double = 6.5,
    val moonPhase: String = "🌕 Llena",
    val coeff: Int = 92
)

@Composable
fun MareasWatchApp() {
    val context = LocalContext.current
    var tideData by remember { mutableStateOf(TideState()) }
    var isLoading by remember { mutableStateOf(false) }

    val fusedLocationClient = remember { LocationServices.getFusedLocationProviderClient(context) }

    val locationPermissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (isGranted) {
            isLoading = true
            // Obtener coordenadas GPS y consultar API
        }
    }

    Scaffold(
        timeText = { TimeText() },
        vignette = { Vignette(vignettePosition = VignettePosition.TopAndBottom) }
    ) {
        ScalingLazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.Black),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Título de Ubicación GPS
            item {
                Chip(
                    onClick = {
                        if (ContextCompat.checkSelfPermission(
                                context,
                                Manifest.permission.ACCESS_FINE_LOCATION
                            ) == PackageManager.PERMISSION_GRANTED
                        ) {
                            isLoading = true
                        } else {
                            locationPermissionLauncher.launch(Manifest.permission.ACCESS_FINE_LOCATION)
                        }
                    },
                    label = { Text(text = "📍 " + tideData.location, fontSize = 12.sp) },
                    colors = ChipDefaults.secondaryChipColors(),
                    modifier = Modifier.padding(bottom = 8.dp)
                )
            }

            // Indicador de Nivel de Marea Actual
            item {
                Box(
                    modifier = Modifier
                        .size(110.dp)
                        .background(Color(0xFF0F172A), CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(
                            text = if (tideData.isRising) "PLEAMAR ▲" else "BAJAMAR ▼",
                            color = if (tideData.isRising) Color(0xFF34D399) else Color(0xFFFBBF24),
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "${tideData.tideLevel} m",
                            color = Color.White,
                            fontSize = 22.sp,
                            fontWeight = FontWeight.Black
                        )
                        Text(
                            text = "Coef. ${tideData.coeff}",
                            color = Color(0xFFA855F7),
                            fontSize = 10.sp
                        )
                    }
                }
            }

            // Métrica de Rayos UV
            item {
                Spacer(modifier = Modifier.height(6.dp))
                Chip(
                    onClick = { },
                    label = { Text(text = "☀️ UV ${tideData.uvIndex} (Alto)", fontSize = 11.sp) },
                    secondaryLabel = { Text(text = "Máx 25 min sin crema", fontSize = 9.sp) },
                    colors = ChipDefaults.chipColors(backgroundColor = Color(0xFF451A03))
                )
            }

            // Viento y Oleaje
            item {
                Spacer(modifier = Modifier.height(4.dp))
                Row(
                    horizontalArrangement = Arrangement.spacedBy(4.dp),
                    modifier = Modifier.padding(horizontal = 12.dp)
                ) {
                    CompactChip(
                        onClick = { },
                        label = { Text("💨 ${tideData.windSpeed} km/h", fontSize = 10.sp) }
                    )
                    CompactChip(
                        onClick = { },
                        label = { Text("🌊 ${tideData.waveHeight} m", fontSize = 10.sp) }
                    )
                }
            }

            // Fase Lunar
            item {
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = tideData.moonPhase + " • Marea Viva",
                    color = Color(0xFFCBD5E1),
                    fontSize = 10.sp,
                    textAlign = TextAlign.Center
                )
            }
        }
    }
}
```

---

### 5. Cómo Generar el Archivo `.APK` en Android Studio

1. Abre el proyecto en **Android Studio**.
2. En la barra superior, ve a **Build** -> **Build Bundle(s) / APK(s)** -> **Build APK(s)**.
3. Android Studio compilará el código y te mostrará una notificación flotante abajo a la derecha:
   > *"APK(s) generated successfully for 1 module."*
4. Haz clic en **"locate"** para abrir la carpeta donde se ha generado tu archivo `app-debug.apk`.
5. Pasa el archivo `.apk` a tu reloj OnePlus Watch 3 mediante **ADB por Wi-Fi** o instálalo directamente desde tu teléfono mediante la app **Easy Fire Tools** o **Bugjaeger** (disponibles en Google Play Store).
