package com.E205.cocosforest.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.E205.cocosforest.data.model.DailyData
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class DailyDataViewModel : ViewModel() {
    private val _dailyData = MutableStateFlow<DailyData?>(null)
    val dailyData: StateFlow<DailyData?> = _dailyData.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    init {
        loadMockData()
    }

    private fun loadMockData() {
        _dailyData.value = DailyData(
            dailyCarbonEmission = 15.5f,
            totalExpense = 45000,
            date = "2024-09-22"
        )
    }

    fun refresh() {
        loadMockData()
    }

    fun setAuthToken(token: String) {
        // 나중에 실제 API 연동 시 사용
        loadMockData()
    }
}