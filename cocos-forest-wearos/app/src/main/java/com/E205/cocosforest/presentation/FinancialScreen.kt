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
import kotlinx.coroutines.delay

@Composable
fun FinancialScreen(
    onNavigateBack: () -> Unit,
    onLogout: () -> Unit = {},
    onNavigateToDebug: () -> Unit = {}
) {
    var monthlySpending by remember { mutableStateOf(0L) }
    var carbonEmission by remember { mutableStateOf(0.0) }
    var isLoading by remember { mutableStateOf(true) }
    val context = LocalContext.current
    val financialDataManager = remember { FinancialDataManager(context) }

    LaunchedEffect(key1 = true) {
        try {
            isLoading = true
            // 모바일 앱에서 데이터 동기화
            monthlySpending = financialDataManager.getMonthlySpending()
            carbonEmission = financialDataManager.calculateCarbonEmission()
            delay(1000) // 로딩 효과
        } finally {
            isLoading = false
        }
    }

    if (isLoading) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                CircularProgressIndicator(
                    modifier = Modifier.size(32.dp)
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "데이터 로딩중...",
                    style = MaterialTheme.typography.caption1
                )
            }
        }
    } else {
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
                text = "이달의 소비분석",
                style = MaterialTheme.typography.title2,
                color = MaterialTheme.colors.primary,
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(8.dp))

            // 총 소비 금액
            Card(
                modifier = Modifier.fillMaxWidth(),
                onClick = { }
            ) {
                Column(
                    modifier = Modifier.padding(12.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "💳",
                        style = MaterialTheme.typography.display3
                    )
                    Text(
                        text = "총 소비 금액",
                        style = MaterialTheme.typography.caption1,
                        color = MaterialTheme.colors.onSurfaceVariant
                    )
                    Text(
                        text = formatCurrency(monthlySpending),
                        style = MaterialTheme.typography.title1,
                        color = MaterialTheme.colors.primary
                    )
                    Text(
                        text = "원",
                        style = MaterialTheme.typography.caption1
                    )
                }
            }

            // 탄소 배출량
            Card(
                modifier = Modifier.fillMaxWidth(),
                onClick = { }
            ) {
                Column(
                    modifier = Modifier.padding(12.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "🏭",
                        style = MaterialTheme.typography.display3
                    )
                    Text(
                        text = "예상 탄소배출량",
                        style = MaterialTheme.typography.caption1,
                        color = MaterialTheme.colors.onSurfaceVariant
                    )
                    Text(
                        text = String.format("%.1f", carbonEmission),
                        style = MaterialTheme.typography.title1,
                        color = Color(0xFFFF5722)
                    )
                    Text(
                        text = "kg CO₂",
                        style = MaterialTheme.typography.caption1
                    )
                }
            }

            // 카테고리별 분석 (간단화)
            Card(
                modifier = Modifier.fillMaxWidth(),
                onClick = { }
            ) {
                Column(
                    modifier = Modifier.padding(12.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "📊",
                        style = MaterialTheme.typography.display3
                    )
                    Text(
                        text = "주요 소비처",
                        style = MaterialTheme.typography.caption1,
                        color = MaterialTheme.colors.onSurfaceVariant
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    // 카테고리별 요약
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceEvenly
                    ) {
                        CategoryItem("🍔", "식비", (monthlySpending * 0.3).toLong())
                        CategoryItem("🛍️", "쇼핑", (monthlySpending * 0.2).toLong())
                        CategoryItem("🚗", "교통", (monthlySpending * 0.15).toLong())
                    }
                }
            }

            // 환경 개선 제안
            Card(
                modifier = Modifier.fillMaxWidth(),
                onClick = { }
            ) {
                Column(
                    modifier = Modifier.padding(12.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "💡",
                        style = MaterialTheme.typography.display3
                    )
                    Text(
                        text = "친환경 팁",
                        style = MaterialTheme.typography.caption1,
                        color = MaterialTheme.colors.onSurfaceVariant
                    )
                    Text(
                        text = "대중교통 이용시\n월 ${String.format("%.1f", carbonEmission * 0.2)}kg CO₂ 절약!",
                        style = MaterialTheme.typography.body2,
                        textAlign = TextAlign.Center,
                        color = Color(0xFF4CAF50)
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // 뒤로가기 버튼
            Button(
                onClick = onNavigateBack,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("← 뒤로가기")
            }

            Spacer(modifier = Modifier.height(8.dp))

            // 디버그 버튼
            OutlinedButton(
                onClick = onNavigateToDebug,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("🐛 디버그")
            }

            Spacer(modifier = Modifier.height(8.dp))

            // 로그아웃 버튼
            OutlinedButton(
                onClick = onLogout,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("🚪 로그아웃")
            }
        }
    }
}

@Composable
private fun CategoryItem(
    emoji: String,
    category: String,
    amount: Long
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = emoji,
            style = MaterialTheme.typography.body1
        )
        Text(
            text = category,
            style = MaterialTheme.typography.caption2
        )
        Text(
            text = formatShortCurrency(amount),
            style = MaterialTheme.typography.caption1,
            color = MaterialTheme.colors.primary
        )
    }
}

private fun formatCurrency(amount: Long): String {
    return String.format("%,d", amount)
}

private fun formatShortCurrency(amount: Long): String {
    return when {
        amount >= 1000000 -> "${amount / 1000000}M"
        amount >= 1000 -> "${amount / 1000}K"
        else -> "$amount"
    }
}