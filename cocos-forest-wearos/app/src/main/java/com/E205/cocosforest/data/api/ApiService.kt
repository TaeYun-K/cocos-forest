package com.E205.cocosforest.data.api

import com.E205.cocosforest.data.model.*
import retrofit2.Response
import retrofit2.http.*

interface ApiService {
    // 일별 카드 사용 상세 내역 조회
    @GET("api/finance/user-cards/transactions/daily-details")
    suspend fun getDailyDetails(
        @Header("Authorization") authorization: String,
        @Query("date") date: String
    ): Response<BaseResponse<CardDailyDetailsResponse>>

    // 월별 카드 사용 내역 조회
    @GET("api/finance/user-cards/transactions/monthly-summary")
    suspend fun getMonthlySummary(
        @Header("Authorization") authorization: String,
        @Query("yearMonth") yearMonth: String
    ): Response<BaseResponse<CardMonthlySummaryResponse>>

    // 월별 카드 사용 내역 조회 (카테고리별)
    @GET("api/finance/user-cards/transactions/{categoryId}")
    suspend fun getMonthlyTransactionsByCategory(
        @Header("Authorization") authorization: String,
        @Path("categoryId") categoryId: String,
        @Query("yearMonth") yearMonth: String
    ): Response<BaseResponse<CardCategoryMonthlyDetailsResponse>>

    // 카드 연결
    @POST("api/finance/user-cards")
    suspend fun linkCard(
        @Header("Authorization") authorization: String,
        @Body request: CardLinkRequest
    ): Response<BaseResponse<CardLinkResponse>>

    // 카드 결제
    @POST("api/finance/user-cards/transactions/pay")
    suspend fun pay(
        @Header("Authorization") authorization: String,
        @Body request: CardPaymentRequest
    ): Response<BaseResponse<CardPaymentResponse>>

    // 연결된 카드 목록 조회
    @GET("api/finance/user-cards")
    suspend fun getUserCards(
        @Header("Authorization") authorization: String
    ): Response<BaseResponse<List<UserCardResponse>>>
}