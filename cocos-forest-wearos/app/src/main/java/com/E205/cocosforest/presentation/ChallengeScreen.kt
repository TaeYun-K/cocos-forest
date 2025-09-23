package com.E205.cocosforest.presentation

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.wear.compose.material.*
import com.E205.cocosforest.data.HealthDataManager
import kotlinx.coroutines.delay

@Composable
fun ChallengeScreen(
    onNavigateToFinancial: () -> Unit
) {
    var steps by remember { mutableStateOf(0) }
    var carbonSaved by remember { mutableStateOf(0.0) }
    val healthDataManager = remember { HealthDataManager() }

    LaunchedEffect(key1 = true) {
        while (true) {
            steps = healthDataManager.getDailySteps()
            carbonSaved = calculateCarbonSaved(steps)
            delay(5000) // 5초마다 업데이트
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        // 제목
        Text(
            text = "환경 챌린지",
            style = MaterialTheme.typography.title2,
            color = MaterialTheme.colors.primary,
            textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(8.dp))

        // 발걸음 수 표시
        Card(
            modifier = Modifier.fillMaxWidth(),
            onClick = { }
        ) {
            Column(
                modifier = Modifier.padding(12.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "👣",
                    style = MaterialTheme.typography.display3
                )
                Text(
                    text = "오늘의 걸음",
                    style = MaterialTheme.typography.caption1,
                    color = MaterialTheme.colors.onSurfaceVariant
                )
                Text(
                    text = "$steps",
                    style = MaterialTheme.typography.title1,
                    color = MaterialTheme.colors.primary
                )
                Text(
                    text = "걸음",
                    style = MaterialTheme.typography.caption1
                )
            }
        }

        // 탄소 절약량 표시
        Card(
            modifier = Modifier.fillMaxWidth(),
            onClick = { }
        ) {
            Column(
                modifier = Modifier.padding(12.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "🌱",
                    style = MaterialTheme.typography.display3
                )
                Text(
                    text = "탄소 절약량",
                    style = MaterialTheme.typography.caption1,
                    color = MaterialTheme.colors.onSurfaceVariant
                )
                Text(
                    text = String.format("%.2f", carbonSaved),
                    style = MaterialTheme.typography.title1,
                    color = Color(0xFF4CAF50)
                )
                Text(
                    text = "kg CO₂",
                    style = MaterialTheme.typography.caption1
                )
            }
        }

        // 진행률 표시
        val progressPercent = (steps / 10000f).coerceAtMost(1f)
        Card(
            modifier = Modifier.fillMaxWidth(),
            onClick = { }
        ) {
            Column(
                modifier = Modifier.padding(12.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "목표 달성률",
                    style = MaterialTheme.typography.caption1,
                    color = MaterialTheme.colors.onSurfaceVariant
                )

                Spacer(modifier = Modifier.height(8.dp))

                CircularProgressIndicator(
                    progress = progressPercent,
                    modifier = Modifier.size(50.dp),
                    strokeWidth = 4.dp,
                    trackColor = MaterialTheme.colors.onSurface.copy(alpha = 0.1f)
                )

                Spacer(modifier = Modifier.height(4.dp))

                Text(
                    text = "${(progressPercent * 100).toInt()}%",
                    style = MaterialTheme.typography.body2,
                    color = MaterialTheme.colors.primary
                )
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        // 금융 정보로 이동 버튼
        Button(
            onClick = onNavigateToFinancial,
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("소비 분석 →")
        }
    }
}

private fun calculateCarbonSaved(steps: Int): Double {
    // 1000걸음당 약 0.4kg의 CO2 절약 (대중교통 이용 대신 걷기)
    return (steps / 1000.0) * 0.4
}