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

    private val sharedPreferences: SharedPreferences =
        context.getSharedPreferences("user_prefs", Context.MODE_PRIVATE)

    private val apiService = ApiClient.apiService

    companion object {
        private const val TAG = "FinancialDataManager"
        private const val AUTH_TOKEN_KEY = "auth_token"
    }

    // 인증 토큰 설정
    fun setAuthToken(token: String) {
        sharedPreferences.edit().putString(AUTH_TOKEN_KEY, "Bearer $token").apply()
    }

    private fun getAuthToken(): String? {
        return sharedPreferences.getString(AUTH_TOKEN_KEY, null)
    }

    // 일별 카드 사용 상세 내역 조회
    suspend fun getDailyDetails(date: String): CardDailyDetailsResponse? {
        return withContext(Dispatchers.IO) {
            try {
                val token = getAuthToken() ?: return@withContext null
                val response = apiService.getDailyDetails(token, date)

                if (response.isSuccessful) {
                    response.body()?.result
                } else {
                    Log.e(TAG, "getDailyDetails failed: ${response.errorBody()?.string()}")
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
                val response = apiService.getMonthlySummary(token, yearMonth)

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
                val response = apiService.getMonthlyTransactionsByCategory(token, categoryId, yearMonth)

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
                val response = apiService.linkCard(token, request)

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
                val response = apiService.pay(token, request)

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
                val response = apiService.getUserCards(token)

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
        val dailyDetails = getDailyDetails(today)
        return dailyDetails?.let { DailyData.fromCardDailyDetails(it) }
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