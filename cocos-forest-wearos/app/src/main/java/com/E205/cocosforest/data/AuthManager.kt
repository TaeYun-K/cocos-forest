package com.E205.cocosforest.data

import android.content.Context
import android.content.SharedPreferences
import android.util.Log
import com.E205.cocosforest.data.api.ApiClient
import com.E205.cocosforest.data.model.LoginRequest
import com.E205.cocosforest.data.model.ReissueRequest
import com.E205.cocosforest.data.model.TokenInfo
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class AuthManager(private val context: Context) {

    private val sharedPreferences: SharedPreferences =
        context.getSharedPreferences("auth_prefs", Context.MODE_PRIVATE)

    private val apiService = ApiClient.apiService

    companion object {
        private const val TAG = "AuthManager"
        private const val ACCESS_TOKEN_KEY = "access_token"
        private const val REFRESH_TOKEN_KEY = "refresh_token"
        private const val GRANT_TYPE_KEY = "grant_type"
    }

    // 로그인
    suspend fun login(email: String, password: String): Result<TokenInfo> {
        return withContext(Dispatchers.IO) {
            try {
                val request = LoginRequest(email, password)
                val response = apiService.login(request)

                if (response.isSuccessful && response.body()?.result != null) {
                    val tokenInfo = response.body()!!.result!!
                    saveTokenInfo(tokenInfo)
                    Log.d(TAG, "Login successful")
                    Result.success(tokenInfo)
                } else {
                    val errorMsg = "Login failed: ${response.errorBody()?.string()}"
                    Log.e(TAG, errorMsg)
                    Result.failure(Exception(errorMsg))
                }
            } catch (e: Exception) {
                Log.e(TAG, "Login error", e)
                Result.failure(e)
            }
        }
    }

    // 토큰 재발급
    suspend fun reissueToken(): Result<TokenInfo> {
        return withContext(Dispatchers.IO) {
            try {
                val refreshToken = getRefreshToken()
                if (refreshToken.isNullOrEmpty()) {
                    return@withContext Result.failure(Exception("No refresh token"))
                }

                val request = ReissueRequest(refreshToken)
                val response = apiService.reissue(request)

                if (response.isSuccessful && response.body()?.result != null) {
                    val tokenInfo = response.body()!!.result!!
                    saveTokenInfo(tokenInfo)
                    Log.d(TAG, "Token reissued successfully")
                    Result.success(tokenInfo)
                } else {
                    val errorMsg = "Token reissue failed: ${response.errorBody()?.string()}"
                    Log.e(TAG, errorMsg)
                    Result.failure(Exception(errorMsg))
                }
            } catch (e: Exception) {
                Log.e(TAG, "Token reissue error", e)
                Result.failure(e)
            }
        }
    }

    // 토큰 정보 저장
    private fun saveTokenInfo(tokenInfo: TokenInfo) {
        sharedPreferences.edit().apply {
            putString(ACCESS_TOKEN_KEY, tokenInfo.accessToken)
            putString(REFRESH_TOKEN_KEY, tokenInfo.refreshToken)
            putString(GRANT_TYPE_KEY, tokenInfo.grantType)
            apply()
        }
    }

    // 액세스 토큰 가져오기 (Bearer 포함)
    fun getAccessToken(): String? {
        val token = sharedPreferences.getString(ACCESS_TOKEN_KEY, null)
        // Bearer 접두사가 있으면 제거
        return if (token?.startsWith("Bearer ") == true) {
            token.substring(7) // "Bearer " 제거
        } else {
            token
        }
    }

    // 리프레시 토큰 가져오기
    private fun getRefreshToken(): String? {
        return sharedPreferences.getString(REFRESH_TOKEN_KEY, null)
    }

    // 로그인 상태 확인
    fun isLoggedIn(): Boolean {
        return getAccessToken() != null
    }

    // 로그아웃 (토큰 삭제)
    fun logout() {
        sharedPreferences.edit().clear().apply()
        Log.d(TAG, "Logged out")
    }

    // 토큰 수동 설정 (테스트용)
    fun setTokenManually(accessToken: String, refreshToken: String = "", grantType: String = "Bearer") {
        val tokenInfo = TokenInfo(grantType, accessToken, refreshToken)
        saveTokenInfo(tokenInfo)
        Log.d(TAG, "Token set manually")
    }
}