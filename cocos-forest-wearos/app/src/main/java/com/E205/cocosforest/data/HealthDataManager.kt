package com.E205.cocosforest.data

import android.content.Context
import androidx.health.services.client.HealthServices
import androidx.health.services.client.data.DataType
import androidx.health.services.client.data.DataTypeAvailability
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlin.random.Random

class HealthDataManager {

    // 임시 데이터 (실제 구현시 Health Services와 연동)
    fun getDailySteps(): Int {
        // 실제 구현에서는 Health Services API를 사용
        // 현재는 데모용 랜덤 데이터
        return Random.nextInt(5000, 15000)
    }

    fun getWeeklySteps(): List<Int> {
        return (1..7).map { Random.nextInt(3000, 12000) }
    }

    fun getHeartRate(): Int {
        return Random.nextInt(60, 100)
    }

    // 실제 Health Services 연동 예시 (주석처리)
    /*
    private lateinit var healthServicesClient: HealthServicesClient

    fun initHealthServices(context: Context) {
        healthServicesClient = HealthServices.getClient(context)
    }

    suspend fun getStepsData(): Flow<Int> = flow {
        val passiveMonitoringClient = healthServicesClient.passiveMonitoringClient

        // 걸음 수 데이터 요청
        val dataTypes = setOf(DataType.STEPS_DAILY)

        passiveMonitoringClient.setPassiveListenerCallback(
            dataTypes,
            object : PassiveListenerCallback {
                override fun onNewDataPointsReceived(dataPoints: DataPointContainer) {
                    val steps = dataPoints.getData(DataType.STEPS_DAILY)
                        .lastOrNull()?.value ?: 0
                    // emit(steps)
                }
            }
        )
    }
    */

    // 갤럭시 워치의 Samsung Health Platform 연동 예시
    /*
    fun connectToSamsungHealth(context: Context) {
        val healthConnector = HealthConnectionManager.getInstance()

        healthConnector.connectService(
            context,
            object : HealthConnectionManager.ConnectionListener() {
                override fun onConnected() {
                    // 연결 성공
                    requestStepsData()
                }

                override fun onConnectionFailed(error: HealthConnectionManager.ConnectionError) {
                    // 연결 실패
                }
            }
        )
    }

    private fun requestStepsData() {
        val healthDataService = HealthDataService()

        // 오늘 하루 걸음 수 요청
        val request = HealthDataRequest.Builder()
            .setDataType(HealthConstants.StepCount.HEALTH_DATA_TYPE)
            .setTimeRange(
                getTodayStartTime(),
                System.currentTimeMillis(),
                TimeUnit.MILLISECONDS
            )
            .build()

        healthDataService.readData(request) { result ->
            if (result.status.isSuccess) {
                val stepCount = result.dataSet?.let { dataSet ->
                    var totalSteps = 0
                    for (data in dataSet) {
                        totalSteps += data.getValue(HealthConstants.StepCount.COUNT).asInt()
                    }
                    totalSteps
                } ?: 0

                // UI 업데이트
                updateStepsUI(stepCount)
            }
        }
    }
    */
}

private fun getTodayStartTime(): Long {
    val calendar = java.util.Calendar.getInstance()
    calendar.set(java.util.Calendar.HOUR_OF_DAY, 0)
    calendar.set(java.util.Calendar.MINUTE, 0)
    calendar.set(java.util.Calendar.SECOND, 0)
    calendar.set(java.util.Calendar.MILLISECOND, 0)
    return calendar.timeInMillis
}