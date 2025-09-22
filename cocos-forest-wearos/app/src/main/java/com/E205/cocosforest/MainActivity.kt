package com.E205.cocosforest

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.wear.compose.material.MaterialTheme
import androidx.wear.compose.material.TimeText
import androidx.wear.compose.navigation.SwipeDismissableNavHost
import androidx.wear.compose.navigation.composable
import androidx.wear.compose.navigation.rememberSwipeDismissableNavController
import com.E205.cocosforest.presentation.CocoStatusScreen
import com.E205.cocosforest.presentation.CarbonEmissionScreen
import com.E205.cocosforest.presentation.ExpenseScreen
import com.E205.cocosforest.presentation.ChallengeButtonScreen
import com.E205.cocosforest.presentation.ChallengeScreen
import com.E205.cocosforest.presentation.FinancialScreen
import com.E205.cocosforest.presentation.viewmodel.DailyDataViewModel

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            WearApp()
        }
    }
}

@Composable
fun WearApp() {
    MaterialTheme {
        val navController = rememberSwipeDismissableNavController()
        val viewModel: DailyDataViewModel = viewModel()
        val dailyData by viewModel.dailyData.collectAsState()

        SwipeDismissableNavHost(
            navController = navController,
            startDestination = "coco_status",
            modifier = Modifier.fillMaxSize()
        ) {
            composable("coco_status") {
                CocoStatusScreen(
                    dailyCarbonEmission = dailyData?.dailyCarbonEmission ?: 15.5f,
                    onSwipeNext = {
                        navController.navigate("carbon_emission")
                    }
                )
            }

            composable("carbon_emission") {
                CarbonEmissionScreen(
                    dailyCarbonEmission = dailyData?.dailyCarbonEmission ?: 15.5f,
                    onSwipeNext = {
                        navController.navigate("expense")
                    },
                    onSwipePrevious = {
                        navController.navigate("coco_status")
                    }
                )
            }

            composable("expense") {
                ExpenseScreen(
                    totalExpense = dailyData?.totalExpense ?: 45000,
                    onSwipeNext = {
                        navController.navigate("challenge_button")
                    },
                    onSwipePrevious = {
                        navController.navigate("carbon_emission")
                    }
                )
            }

            composable("challenge_button") {
                ChallengeButtonScreen(
                    onNavigateToChallenge = {
                        navController.navigate("challenge")
                    },
                    onSwipePrevious = {
                        navController.navigate("expense")
                    }
                )
            }

            composable("challenge") {
                ChallengeScreen(
                    onNavigateToFinancial = {
                        navController.navigate("financial")
                    }
                )
            }

            composable("financial") {
                FinancialScreen(
                    onNavigateBack = {
                        navController.popBackStack()
                    }
                )
            }
        }

        TimeText()
    }
}

@Preview(device = "id:wearos_small_round", showSystemUi = true)
@Composable
fun DefaultPreview() {
    WearApp()
}