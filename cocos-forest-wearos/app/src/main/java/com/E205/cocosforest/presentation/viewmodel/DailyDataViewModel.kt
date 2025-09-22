package com.E205.cocosforest.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.E205.cocosforest.data.model.DailyData
import com.E205.cocosforest.data.repository.DailyDataRepository
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

    private var repository: DailyDataRepository? = null

    fun initialize(repository: DailyDataRepository) {
        this.repository = repository
        loadTodayData()
    }

    private fun loadTodayData() {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null

            try {
                repository?.getTodayData()?.collect { result ->
                    _isLoading.value = false
                    result.fold(
                        onSuccess = { data ->
                            _dailyData.value = data
                        },
                        onFailure = { exception ->
                            _error.value = exception.message
                            // API 실패 시 Mock 데이터 사용
                            loadMockData()
                        }
                    )
                } ?: loadMockData()
            } catch (e: Exception) {
                _isLoading.value = false
                _error.value = e.message
                loadMockData()
            }
        }
    }

    private fun loadMockData() {
        _dailyData.value = DailyData(
            dailyCarbonEmission = 15.5f,
            totalExpense = 45000,
            date = "2024-09-22"
        )
    }

    fun refresh() {
        loadTodayData()
    }

    fun setAuthToken(token: String) {
        repository?.setAuthToken(token)
        loadTodayData()
    }
}