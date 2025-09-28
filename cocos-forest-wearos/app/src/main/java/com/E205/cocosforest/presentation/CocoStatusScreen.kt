package com.E205.cocosforest.presentation

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.Image
import androidx.compose.foundation.gestures.detectHorizontalDragGestures
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.wear.compose.material.MaterialTheme
import androidx.wear.compose.material.Text
import coil.compose.rememberAsyncImagePainter
import coil.decode.GifDecoder
import coil.request.ImageRequest
import kotlin.math.abs
import java.io.IOException

@Composable
fun CocoStatusScreen(
    dailyCarbonEmission: Float = 15.5f, // 임시 데이터
    onSwipeNext: () -> Unit
) {
    val context = LocalContext.current

    // 탄소배출량에 따른 코코 상태 결정
    val (assetFileName, statusText) = when {
        dailyCarbonEmission <= 10f -> Pair("coco-smile-unscreen.gif", "Great!")
        dailyCarbonEmission <= 20f -> Pair("coco-init-unscreen.gif", "Good")
        else -> Pair("coco-sad-unscreen.gif", "Try Better")
    }

    val painter = rememberAsyncImagePainter(
        model = ImageRequest.Builder(context)
            .data("file:///android_asset/$assetFileName")
            .decoderFactory(GifDecoder.Factory())
            .crossfade(true)
            .build()
    )

    Box(
        modifier = Modifier
            .fillMaxSize()
            .pointerInput(Unit) {
                detectHorizontalDragGestures { _, dragAmount ->
                    if (dragAmount < -50f) { // 왼쪽으로 스와이프
                        onSwipeNext()
                    }
                }
            },
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Image(
                painter = painter,
                contentDescription = "Coco Status",
                modifier = Modifier.size(180.dp), // wearOS에 맞게 크기 증가
                contentScale = ContentScale.Fit
            )

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = statusText,
                style = MaterialTheme.typography.title2,
                color = MaterialTheme.colors.primary
            )

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "Swipe left →",
                style = MaterialTheme.typography.caption1,
                color = MaterialTheme.colors.onSurface.copy(alpha = 0.6f)
            )
        }
    }
}