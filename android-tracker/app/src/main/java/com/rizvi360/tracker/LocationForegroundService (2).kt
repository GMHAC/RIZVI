package com.rizvi360.tracker

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Intent
import android.os.IBinder
import android.os.Looper
import com.google.android.gms.location.*
import okhttp3.*
import org.json.JSONObject

class LocationForegroundService : Service() {
    private lateinit var fused: FusedLocationProviderClient
    private lateinit var client: OkHttpClient
    private var socket: WebSocket? = null
    private var locationCallback: LocationCallback? = null
    private val channelId = "rizvi_location"

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        startForeground(7002, notification())
        fused = LocationServices.getFusedLocationProviderClient(this)
        client = OkHttpClient()
        connect()
    }

    private fun connect() {
        val prefs=getSharedPreferences("rizvi", MODE_PRIVATE)
        val token=prefs.getString("token","") ?: ""
        val base=prefs.getString("ws","") ?: ""
        if(token.isBlank() || base.isBlank()) return
        val url=if(base.contains("?")) "$base&token=$token" else "$base?token=$token"
        socket=client.newWebSocket(Request.Builder().url(url).build(), object: WebSocketListener(){
            override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) { socket=null }
        })
        val req=LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 10000L).setMinUpdateIntervalMillis(5000L).build()
        try {
            locationCallback = object: LocationCallback(){
                override fun onLocationResult(result: LocationResult){
                    result.lastLocation?.let { loc ->
                        val payload=JSONObject().apply { put("type","location"); put("latitude",loc.latitude); put("longitude",loc.longitude); put("accuracy",loc.accuracy); put("consent",true) }
                        socket?.send(payload.toString())
                    }
                }
            }
            fused.requestLocationUpdates(req, locationCallback!!, Looper.getMainLooper())
        } catch(_: SecurityException) {}
    }
    private fun createNotificationChannel(){ val nm=getSystemService(NotificationManager::class.java); nm.createNotificationChannel(NotificationChannel(channelId,"RIZVI Live Location",NotificationManager.IMPORTANCE_LOW)) }
    private fun notification(): Notification = Notification.Builder(this,channelId).setContentTitle("RIZVI 360° Live Location").setContentText("Location sharing is active with employee authorization").setSmallIcon(android.R.drawable.ic_menu_mylocation).setOngoing(true).build()
    override fun onDestroy(){ locationCallback?.let { fused.removeLocationUpdates(it) }; socket?.close(1000,"stopped"); client.dispatcher.executorService.shutdown(); super.onDestroy() }
    override fun onBind(intent: Intent?): IBinder?=null
}
