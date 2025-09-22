package com.E205.cocosforest.data.repository

import android.content.Context
import android.util.Log
import com.E205.cocosforest.data.FinancialDataManager
import com.E205.cocosforest.data.model.DailyData
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow

class DailyDataRepository(private val context: Context) {
    private val financialDataManager = FinancialDataManager(context)

    companion object {
        private const val TAG = "DailyDataRepository"
    }

    fun getTodayData(): Flow<Result<DailyData>> = flow {
        try {
            Log.d(TAG, "Attempting to get today's data from API")

            // 로그인 상태 확인
            if (!financialDataManager.isLoggedIn()) {
                Log.w(TAG, "User not logged in, using mock data")
                emit(Result.success(getMockData()))
                return@flow
            }

            val todayData = financialDataManager.getTodayData()
            Log.d(TAG, "API response: $todayData")

            if (todayData != null) {
                Log.d(TAG, "Successfully retrieved API data: carbon=${todayData.dailyCarbonEmission}, expense=${todayData.totalExpense}")
                emit(Result.success(todayData))
            } else {
                Log.w(TAG, "API returned null, using mock data")
                emit(Result.success(getMockData()))
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error fetching today's data", e)
            emit(Result.success(getMockData()))
        }
    }

    fun setAuthToken(token: String) {
        Log.d(TAG, "Setting auth token")
        financialDataManager.setAuthToken(token)
    }

    private fun getMockData(): DailyData {
        Log.d(TAG, "Using mock data")
        return DailyData(
            dailyCarbonEmission = 15.5f,
            totalExpense = 45000,
            date = "2024-09-22"
        )
    }
}