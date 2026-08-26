package com.rizvi360.tracker

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat

class MainActivity : AppCompatActivity() {
    private val requestCode = 7001
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val token = EditText(this).apply { hint = "RIZVI JWT access token" }
        val wsUrl = EditText(this).apply { hint = "wss://your-domain/ws/location/employee"; setText("wss://YOUR_DOMAIN/ws/location/employee") }
        val consent = TextView(this).apply { text = "By pressing START, the employee explicitly authorizes this device to share GPS/network location while tracking is active."; setPadding(20,20,20,20) }
        val start = Button(this).apply { text = "START LIVE TRACKING" }
        val stop = Button(this).apply { text = "STOP" }
        start.setOnClickListener {
            if (!hasLocationPermission()) { ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION), requestCode); return@setOnClickListener }
            getSharedPreferences("rizvi", MODE_PRIVATE).edit().putString("token", token.text.toString()).putString("ws", wsUrl.text.toString()).apply()
            ContextCompat.startForegroundService(this, Intent(this, LocationForegroundService::class.java))
        }
        stop.setOnClickListener { stopService(Intent(this, LocationForegroundService::class.java)) }
        setContentView(LinearLayout(this).apply { orientation=LinearLayout.VERTICAL; setPadding(20,40,20,20); addView(consent); addView(token); addView(wsUrl); addView(start); addView(stop) })
    }
    private fun hasLocationPermission() = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED || ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED
}
