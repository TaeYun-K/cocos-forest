package com.E205.cocosforest.data.repository

import android.content.Context
import com.E205.cocosforest.data.FinancialDataManager
import com.E205.cocosforest.data.model.DailyData
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow

class DailyDataRepository(private val context: Context) {
    private val financialDataManager = FinancialDataManager(context)

    fun getTodayData(): Flow<Result<DailyData>> = flow {
        try {
            val todayData = financialDataManager.getTodayData()

            if (todayData != null) {
                emit(Result.success(todayData))
            } else {
                // API 호출 실패 시 목업 데이터 사용
                emit(Result.success(getMockData()))
            }
        } catch (e: Exception) {
            // 네트워크 오류 등의 경우 목업 데이터 사용
            emit(Result.success(getMockData()))
        }
    }

    fun setAuthToken(token: String) {
        financialDataManager.setAuthToken(token)
    }

    private fun getMockData(): DailyData {
        return DailyData(
            dailyCarbonEmission = 15.5f,
            totalExpense = 45000,
            date = "2024-09-22"
        )
    }
}