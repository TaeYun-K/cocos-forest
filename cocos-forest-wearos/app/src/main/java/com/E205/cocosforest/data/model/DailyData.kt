package com.E205.cocosforest.data.model

import com.google.gson.annotations.SerializedName
import java.math.BigDecimal

data class CardDailyDetailsResponse(
    @SerializedName("userCardId")
    val userCardId: String,

    @SerializedName("date")
    val date: String,

    @SerializedName("currency")
    val currency: String = "KRW",

    @SerializedName("totals")
    val totals: Totals,

    @SerializedName("transactions")
    val transactions: List<TransactionItem>? = null,

    @SerializedName("meta")
    val meta: Meta? = null
)

data class Totals(
    @SerializedName("amountTotal")
    val amountTotal: Long,

    @SerializedName("carbonTotalKg")
    val carbonTotalKg: BigDecimal,

    @SerializedName("transactionCount")
    val transactionCount: Long
)

data class TransactionItem(
    @SerializedName("externalTransactionId")
    val externalTransactionId: String,

    @SerializedName("merchantName")
    val merchantName: String,

    @SerializedName("amountKrw")
    val amountKrw: Long,

    @SerializedName("categoryName")
    val categoryName: String,

    @SerializedName("carbonKg")
    val carbonKg: BigDecimal,

    @SerializedName("txDate")
    val txDate: String,

    @SerializedName("txTime")
    val txTime: String
)

data class Meta(
    @SerializedName("lockAcquired")
    val lockAcquired: Boolean,

    @SerializedName("durationMs")
    val durationMs: Long,

    @SerializedName("retry")
    val retry: Int,

    @SerializedName("error")
    val error: String?
)

data class BaseResponse<T>(
    @SerializedName("result")
    val result: T?,

    @SerializedName("resultCode")
    val resultCode: String,

    @SerializedName("resultMessage")
    val resultMessage: String
)

// 월별 요약 데이터
data class CardMonthlySummaryResponse(
    @SerializedName("userCardId")
    val userCardId: String,

    @SerializedName("yearMonth")
    val yearMonth: String,

    @SerializedName("currency")
    val currency: String = "KRW",

    @SerializedName("totals")
    val totals: Totals,

    @SerializedName("categories")
    val categories: List<CategorySummary>? = null
)

data class CategorySummary(
    @SerializedName("categoryId")
    val categoryId: String,

    @SerializedName("categoryName")
    val categoryName: String,

    @SerializedName("amountTotal")
    val amountTotal: Long,

    @SerializedName("carbonTotalKg")
    val carbonTotalKg: BigDecimal,

    @SerializedName("transactionCount")
    val transactionCount: Long
)

// 카테고리별 월별 상세 데이터
data class CardCategoryMonthlyDetailsResponse(
    @SerializedName("userCardId")
    val userCardId: String,

    @SerializedName("yearMonth")
    val yearMonth: String,

    @SerializedName("categoryId")
    val categoryId: String,

    @SerializedName("categoryName")
    val categoryName: String,

    @SerializedName("currency")
    val currency: String = "KRW",

    @SerializedName("totals")
    val totals: Totals,

    @SerializedName("transactions")
    val transactions: List<TransactionItem>? = null
)

// 카드 연결 요청 데이터
data class CardLinkRequest(
    @SerializedName("cardNumber")
    val cardNumber: String,

    @SerializedName("expiryDate")
    val expiryDate: String,

    @SerializedName("cvv")
    val cvv: String,

    @SerializedName("cardPassword")
    val cardPassword: String
)

// 카드 연결 응답 데이터
data class CardLinkResponse(
    @SerializedName("userCardId")
    val userCardId: String,

    @SerializedName("cardNumber")
    val cardNumber: String,

    @SerializedName("cardName")
    val cardName: String,

    @SerializedName("isLinked")
    val isLinked: Boolean
)

// 카드 결제 요청 데이터
data class CardPaymentRequest(
    @SerializedName("userCardId")
    val userCardId: String,

    @SerializedName("merchantId")
    val merchantId: String,

    @SerializedName("merchantName")
    val merchantName: String,

    @SerializedName("amountKrw")
    val amountKrw: Long,

    @SerializedName("categoryId")
    val categoryId: String
)

// 카드 결제 응답 데이터
data class CardPaymentResponse(
    @SerializedName("transactionId")
    val transactionId: String,

    @SerializedName("externalTransactionId")
    val externalTransactionId: String,

    @SerializedName("merchantName")
    val merchantName: String,

    @SerializedName("amountKrw")
    val amountKrw: Long,

    @SerializedName("carbonKg")
    val carbonKg: BigDecimal,

    @SerializedName("txDate")
    val txDate: String,

    @SerializedName("txTime")
    val txTime: String,

    @SerializedName("success")
    val success: Boolean
)

// 사용자 카드 목록 응답 데이터
data class UserCardResponse(
    @SerializedName("userCardId")
    val userCardId: String,

    @SerializedName("cardNumber")
    val cardNumber: String,

    @SerializedName("cardName")
    val cardName: String,

    @SerializedName("isLinked")
    val isLinked: Boolean,

    @SerializedName("isDefault")
    val isDefault: Boolean
)

// 로그인 요청 데이터
data class LoginRequest(
    @SerializedName("email")
    val email: String,

    @SerializedName("password")
    val password: String
)

// 토큰 정보 응답 데이터
data class TokenInfo(
    @SerializedName("grantType")
    val grantType: String,

    @SerializedName("accessToken")
    val accessToken: String,

    @SerializedName("refreshToken")
    val refreshToken: String
)

// 토큰 재발급 요청 데이터
data class ReissueRequest(
    @SerializedName("refreshToken")
    val refreshToken: String
)

// wearOS에서 사용할 간단한 데이터 클래스
data class DailyData(
    val dailyCarbonEmission: Float,
    val totalExpense: Int,
    val date: String
) {
    companion object {
        fun fromCardDailyDetails(response: CardDailyDetailsResponse): DailyData {
            return DailyData(
                dailyCarbonEmission = response.totals.carbonTotalKg.toFloat(),
                totalExpense = response.totals.amountTotal.toInt(),
                date = response.date
            )
        }
    }
}