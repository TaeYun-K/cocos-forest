package com.E205.cocosforest.wear

import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.google.android.gms.wearable.MessageClient
import com.google.android.gms.wearable.MessageEvent
import com.google.android.gms.wearable.NodeClient
import com.google.android.gms.wearable.Wearable
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await
import java.nio.charset.StandardCharsets
import java.util.concurrent.atomic.AtomicBoolean

class WearBridgeModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext),
    LifecycleEventListener,
    MessageClient.OnMessageReceivedListener {

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private val messageClient: MessageClient by lazy { Wearable.getMessageClient(reactContext) }
    private val nodeClient: NodeClient by lazy { Wearable.getNodeClient(reactContext) }
    private val listenerRegistered = AtomicBoolean(false)

    override fun getName(): String = "WearBridge"

    override fun initialize() {
        super.initialize()
        registerListeners()
    }

    @ReactMethod
    fun sendMessage(path: String, data: String?, promise: Promise) {
        scope.launch {
            try {
                val payload = data?.toByteArray(StandardCharsets.UTF_8) ?: ByteArray(0)
                val nodes = nodeClient.connectedNodes.await()

                nodes.forEach { node ->
                    messageClient.sendMessage(node.id, path, payload).await()
                }

                promise.resolve(null)
            } catch (ex: Exception) {
                Log.e(TAG, "Failed to send message to wear node", ex)
                promise.reject("WEAR_SEND_FAILED", ex)
            }
        }
    }

    override fun onMessageReceived(messageEvent: MessageEvent) {
        if (!reactContext.hasActiveCatalystInstance()) {
            Log.w(TAG, "Received wearable message before JS is ready: ${messageEvent.path}")
            return
        }

        val payload = messageEvent.data?.let { String(it, StandardCharsets.UTF_8) }
        val params = Arguments.createMap().apply {
            putString("path", messageEvent.path)
            putString("data", payload)
        }

        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(EVENT_NAME, params)
    }

    private fun registerListeners() {
        if (listenerRegistered.compareAndSet(false, true)) {
            messageClient.addListener(this)
            reactContext.addLifecycleEventListener(this)
        }
    }

    private fun unregisterListeners() {
        if (listenerRegistered.compareAndSet(true, false)) {
            messageClient.removeListener(this)
            reactContext.removeLifecycleEventListener(this)
        }
    }

    override fun onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy()
        unregisterListeners()
        scope.cancel()
    }

    override fun onHostResume() {
        registerListeners()
    }

    override fun onHostPause() {
        // no-op
    }

    override fun onHostDestroy() {
        unregisterListeners()
    }

    companion object {
        private const val TAG = "WearBridgeModule"
        private const val EVENT_NAME = "WearBridgeMessage"
    }
}

