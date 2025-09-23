package com.E205.cocosforest.presentation

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.wear.compose.material.*
import com.E205.cocosforest.data.FinancialDataManager

@Composable
fun DebugScreen(
    onNavigateBack: () -> Unit,
    onForceLogout: () -> Unit
) {
    val context = LocalContext.current
    val financialDataManager = remember { FinancialDataManager(context) }

    val isLoggedIn = financialDataManager.isLoggedIn()
    val accessToken = financialDataManager.getAuthToken() ?: "없음"

    var todayData by remember { mutableStateOf<String>("로딩 중...") }
    var monthlyData by remember { mutableStateOf<String>("로딩 중...") }

    LaunchedEffect(Unit) {
        try {
            val today = financialDataManager.getTodayData()
            todayData = if (today != null) {
                "✅ 탄소: ${today.dailyCarbonEmission}kg, 소비: ${today.totalExpense}원"
            } else {
                "❌ 오늘 데이터 없음"
            }
        } catch (e: Exception) {
            todayData = "❌ 오류: ${e.message}"
        }

        try {
            val monthly = financialDataManager.getMonthlySpending()
            val carbon = financialDataManager.calculateCarbonEmission()
            monthlyData = "✅ 월간 소비: ${monthly}원, 탄소: ${carbon}kg"
        } catch (e: Exception) {
            monthlyData = "❌ 오류: ${e.message}"
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
        Text(
            text = "🐛 디버그 정보",
            style = MaterialTheme.typography.title2,
            color = MaterialTheme.colors.primary,
            textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(16.dp))

        // 로그인 상태
        Card(
            modifier = Modifier.fillMaxWidth(),
            onClick = { }
        ) {
            Column(
                modifier = Modifier.padding(12.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "로그인 상태",
                    style = MaterialTheme.typography.caption1,
                    color = MaterialTheme.colors.onSurfaceVariant
                )
                Text(
                    text = if (isLoggedIn) "✅ 로그인됨" else "❌ 로그아웃됨",
                    style = MaterialTheme.typography.title3,
                    color = if (isLoggedIn) Color.Green else Color.Red
                )
            }
        }

        // 토큰 상태
        Card(
            modifier = Modifier.fillMaxWidth(),
            onClick = { }
        ) {
            Column(
                modifier = Modifier.padding(12.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "액세스 토큰",
                    style = MaterialTheme.typography.caption1,
                    color = MaterialTheme.colors.onSurfaceVariant
                )
                Text(
                    text = if (accessToken != "없음")
                        "✅ ${accessToken.take(20)}..."
                    else "❌ 토큰 없음",
                    style = MaterialTheme.typography.caption2,
                    color = if (accessToken != "없음") Color.Green else Color.Red,
                    textAlign = TextAlign.Center
                )
            }
        }

        // 오늘 데이터 상태
        Card(
            modifier = Modifier.fillMaxWidth(),
            onClick = { }
        ) {
            Column(
                modifier = Modifier.padding(12.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "오늘 데이터",
                    style = MaterialTheme.typography.caption1,
                    color = MaterialTheme.colors.onSurfaceVariant
                )
                Text(
                    text = todayData,
                    style = MaterialTheme.typography.caption2,
                    textAlign = TextAlign.Center
                )
            }
        }

        // 월간 데이터 상태
        Card(
            modifier = Modifier.fillMaxWidth(),
            onClick = { }
        ) {
            Column(
                modifier = Modifier.padding(12.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "월간 데이터",
                    style = MaterialTheme.typography.caption1,
                    color = MaterialTheme.colors.onSurfaceVariant
                )
                Text(
                    text = monthlyData,
                    style = MaterialTheme.typography.caption2,
                    textAlign = TextAlign.Center
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // 강제 로그아웃 버튼
        Button(
            onClick = onForceLogout,
            modifier = Modifier.fillMaxWidth(),
            colors = ButtonDefaults.buttonColors(
                backgroundColor = Color.Red
            )
        ) {
            Text(
                text = "🚪 강제 로그아웃",
                color = Color.White
            )
        }

        Spacer(modifier = Modifier.height(8.dp))

        // 뒤로가기 버튼
        OutlinedButton(
            onClick = onNavigateBack,
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("← 뒤로가기")
        }
    }
}