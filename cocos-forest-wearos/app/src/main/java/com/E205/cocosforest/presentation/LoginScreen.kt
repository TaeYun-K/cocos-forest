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
import kotlinx.coroutines.launch

@Composable
fun LoginScreen(
    onLoginSuccess: () -> Unit
) {
    val context = LocalContext.current
    val financialDataManager = remember { FinancialDataManager(context) }
    val coroutineScope = rememberCoroutineScope()

    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf("") }
    var showTokenInput by remember { mutableStateOf(false) }

    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
            modifier = Modifier.padding(16.dp)
        ) {
            Text(
                text = "🌲",
                style = MaterialTheme.typography.display1
            )

            Text(
                text = "Cocos Forest",
                style = MaterialTheme.typography.title2,
                color = MaterialTheme.colors.primary,
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(24.dp))

            if (isLoading) {
                CircularProgressIndicator(
                    modifier = Modifier.size(32.dp)
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "로그인 중...",
                    style = MaterialTheme.typography.caption1
                )
            } else {
                if (!showTokenInput) {
                    // 테스트 로그인 버튼
                    Button(
                        onClick = {
                            coroutineScope.launch {
                                isLoading = true
                                errorMessage = ""

                                financialDataManager.login("dnjswns3851@naver.com", "a12345678@@").fold(
                                    onSuccess = {
                                        isLoading = false
                                        onLoginSuccess()
                                    },
                                    onFailure = { exception ->
                                        isLoading = false
                                        errorMessage = exception.message ?: "로그인 실패"
                                    }
                                )
                            }
                        },
                        modifier = Modifier.fillMaxWidth(0.8f)
                    ) {
                        Text("테스트 로그인")
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    // 토큰 직접 입력 버튼
                    OutlinedButton(
                        onClick = { showTokenInput = true },
                        modifier = Modifier.fillMaxWidth(0.8f)
                    ) {
                        Text("토큰 입력")
                    }
                } else {
                    Text(
                        text = "액세스 토큰 입력",
                        style = MaterialTheme.typography.body2,
                        textAlign = TextAlign.Center
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    // 간단한 토큰 입력 (실제로는 입력 다이얼로그 사용)
                    Button(
                        onClick = {
                            // 테스트용 더미 토큰 설정
                            financialDataManager.setAuthToken("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test")
                            onLoginSuccess()
                        },
                        modifier = Modifier.fillMaxWidth(0.8f)
                    ) {
                        Text("더미 토큰 설정")
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    OutlinedButton(
                        onClick = { showTokenInput = false },
                        modifier = Modifier.fillMaxWidth(0.8f)
                    ) {
                        Text("뒤로")
                    }
                }

                if (errorMessage.isNotEmpty()) {
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = errorMessage,
                        color = Color.Red,
                        style = MaterialTheme.typography.caption1,
                        textAlign = TextAlign.Center
                    )
                }
            }
        }
    }
}