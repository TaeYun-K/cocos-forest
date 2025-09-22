package com.E205.cocosforest.data

import android.content.Context
import android.content.SharedPreferences
import android.util.Log
import com.E205.cocosforest.data.api.ApiClient
import com.E205.cocosforest.data.model.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.text.SimpleDateFormat
import java.util.*

class FinancialDataManager(private val context: Context) {

    private val authManager = AuthManager(context)
    private val apiService = ApiClient.apiService

    companion object {
        private const val TAG = "FinancialDataManager"
    }

    // 인증 토큰 설정 (AuthManager 사용)
    fun setAuthToken(token: String) {
        authManager.setTokenManually(token)
    }

    fun getAuthToken(): String? {
        return authManager.getAccessToken()
    }

    // 로그인 상태 확인
    fun isLoggedIn(): Boolean {
        return authManager.isLoggedIn()
    }

    // 로그인
    suspend fun login(email: String, password: String): Result<TokenInfo> {
        return authManager.login(email, password)
    }

    // 로그아웃
    fun logout() {
        authManager.logout()
    }

    // 일별 카드 사용 상세 내역 조회
    suspend fun getDailyDetails(date: String): CardDailyDetailsResponse? {
        return withContext(Dispatchers.IO) {
            try {
                val token = getAuthToken()
                if (token == null) {
                    Log.e(TAG, "No auth token available for getDailyDetails")
                    return@withContext null
                }

                val authHeader = "Bearer $token"
                Log.d(TAG, "Calling getDailyDetails API for date: $date with auth header: ${authHeader.take(30)}...")
                val response = apiService.getDailyDetails(authHeader, date)
                Log.d(TAG, "API response code: ${response.code()}")

                if (response.isSuccessful) {
                    val result = response.body()?.result
                    Log.d(TAG, "API response success: $result")
                    result
                } else {
                    val errorBody = response.errorBody()?.string()
                    Log.e(TAG, "getDailyDetails failed: code=${response.code()}, body=$errorBody")
                    null
                }
            } catch (e: Exception) {
                Log.e(TAG, "getDailyDetails error", e)
                null
            }
        }
    }

    // 월별 카드 사용 내역 조회
    suspend fun getMonthlySummary(yearMonth: String): CardMonthlySummaryResponse? {
        return withContext(Dispatchers.IO) {
            try {
                val token = getAuthToken() ?: return@withContext null
                val authHeader = "Bearer $token"
                val response = apiService.getMonthlySummary(authHeader, yearMonth)

                if (response.isSuccessful) {
                    response.body()?.result
                } else {
                    Log.e(TAG, "getMonthlySummary failed: ${response.errorBody()?.string()}")
                    null
                }
            } catch (e: Exception) {
                Log.e(TAG, "getMonthlySummary error", e)
                null
            }
        }
    }

    // 카테고리별 월별 상세 내역 조회
    suspend fun getMonthlyTransactionsByCategory(
        categoryId: String,
        yearMonth: String
    ): CardCategoryMonthlyDetailsResponse? {
        return withContext(Dispatchers.IO) {
            try {
                val token = getAuthToken() ?: return@withContext null
                val authHeader = "Bearer $token"
                val response = apiService.getMonthlyTransactionsByCategory(authHeader, categoryId, yearMonth)

                if (response.isSuccessful) {
                    response.body()?.result
                } else {
                    Log.e(TAG, "getMonthlyTransactionsByCategory failed: ${response.errorBody()?.string()}")
                    null
                }
            } catch (e: Exception) {
                Log.e(TAG, "getMonthlyTransactionsByCategory error", e)
                null
            }
        }
    }

    // 카드 연결
    suspend fun linkCard(request: CardLinkRequest): CardLinkResponse? {
        return withContext(Dispatchers.IO) {
            try {
                val token = getAuthToken() ?: return@withContext null
                val authHeader = "Bearer $token"
                val response = apiService.linkCard(authHeader, request)

                if (response.isSuccessful) {
                    response.body()?.result
                } else {
                    Log.e(TAG, "linkCard failed: ${response.errorBody()?.string()}")
                    null
                }
            } catch (e: Exception) {
                Log.e(TAG, "linkCard error", e)
                null
            }
        }
    }

    // 카드 결제
    suspend fun pay(request: CardPaymentRequest): CardPaymentResponse? {
        return withContext(Dispatchers.IO) {
            try {
                val token = getAuthToken() ?: return@withContext null
                val authHeader = "Bearer $token"
                val response = apiService.pay(authHeader, request)

                if (response.isSuccessful) {
                    response.body()?.result
                } else {
                    Log.e(TAG, "pay failed: ${response.errorBody()?.string()}")
                    null
                }
            } catch (e: Exception) {
                Log.e(TAG, "pay error", e)
                null
            }
        }
    }

    // 연결된 카드 목록 조회
    suspend fun getUserCards(): List<UserCardResponse>? {
        return withContext(Dispatchers.IO) {
            try {
                val token = getAuthToken() ?: return@withContext null
                val authHeader = "Bearer $token"
                val response = apiService.getUserCards(authHeader)

                if (response.isSuccessful) {
                    response.body()?.result
                } else {
                    Log.e(TAG, "getUserCards failed: ${response.errorBody()?.string()}")
                    null
                }
            } catch (e: Exception) {
                Log.e(TAG, "getUserCards error", e)
                null
            }
        }
    }

    // WearOS용 간단한 데이터 변환 함수들
    suspend fun getTodayData(): DailyData? {
        val today = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
        Log.d(TAG, "Getting today's data for date: $today")

        val dailyDetails = getDailyDetails(today)
        Log.d(TAG, "Daily details response: $dailyDetails")

        if (dailyDetails != null) {
            val dailyData = DailyData.fromCardDailyDetails(dailyDetails)
            Log.d(TAG, "Converted daily data: carbon=${dailyData.dailyCarbonEmission}, expense=${dailyData.totalExpense}")
            return dailyData
        }

        // 오늘 데이터가 없으면 최근 몇일 시도
        Log.d(TAG, "No data for today, trying recent dates...")
        for (daysBack in 1..7) {
            val cal = Calendar.getInstance()
            cal.add(Calendar.DAY_OF_MONTH, -daysBack)
            val dateToTry = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(cal.time)

            Log.d(TAG, "Trying date: $dateToTry")
            val recentDetails = getDailyDetails(dateToTry)

            if (recentDetails != null) {
                val dailyData = DailyData.fromCardDailyDetails(recentDetails)
                Log.d(TAG, "Found data for $dateToTry: carbon=${dailyData.dailyCarbonEmission}, expense=${dailyData.totalExpense}")
                return dailyData
            }
        }

        // 모든 일일 데이터가 없으면 월간 데이터를 일평균으로 계산
        Log.d(TAG, "No daily data found, calculating from monthly data...")
        try {
            val yearMonth = SimpleDateFormat("yyyy-MM", Locale.getDefault()).format(Date())
            val monthlySummary = getMonthlySummary(yearMonth)

            if (monthlySummary != null) {
                val cal = Calendar.getInstance()
                val daysInMonth = cal.getActualMaximum(Calendar.DAY_OF_MONTH)
                val currentDay = cal.get(Calendar.DAY_OF_MONTH)

                val dailyAvgExpense = (monthlySummary.totals.amountTotal / currentDay).toInt()
                val dailyAvgCarbon = (monthlySummary.totals.carbonTotalKg.toDouble() / currentDay).toFloat()

                Log.d(TAG, "Using monthly average: expense=$dailyAvgExpense, carbon=$dailyAvgCarbon")
                return DailyData(
                    dailyCarbonEmission = dailyAvgCarbon,
                    totalExpense = dailyAvgExpense,
                    date = today
                )
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error calculating from monthly data", e)
        }

        Log.d(TAG, "No data found for any recent dates")
        return null
    }

    suspend fun getMonthlySpending(): Long {
        val yearMonth = SimpleDateFormat("yyyy-MM", Locale.getDefault()).format(Date())
        val monthlySummary = getMonthlySummary(yearMonth)
        return monthlySummary?.totals?.amountTotal ?: 0L
    }

    suspend fun calculateCarbonEmission(): Double {
        val yearMonth = SimpleDateFormat("yyyy-MM", Locale.getDefault()).format(Date())
        val monthlySummary = getMonthlySummary(yearMonth)
        return monthlySummary?.totals?.carbonTotalKg?.toDouble() ?: 0.0
    }

    suspend fun getCategorySpending(): Map<String, Long> {
        val yearMonth = SimpleDateFormat("yyyy-MM", Locale.getDefault()).format(Date())
        val monthlySummary = getMonthlySummary(yearMonth)

        return monthlySummary?.categories?.associate {
            it.categoryName to it.amountTotal
        } ?: emptyMap()
    }

}