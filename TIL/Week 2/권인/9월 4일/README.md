# TIL - 2025년 9월 4일

## 1. Jetpack Compose 정리

### Jetpack Compose란?
**Jetpack Compose**는 Google에서 개발한 **선언형 UI 툴킷**으로, Android 앱의 UI를 빠르고 직관적으로 구축할 수 있게 해주는 모던 툴킷

### 핵심 개념

#### 1. 선언형 UI (Declarative UI)
**기존 방식 (명령형)**:
```kotlin
// 기존 View 시스템
val textView = findViewById<TextView>(R.id.textView)
textView.text = "Hello World"
textView.setTextColor(Color.BLUE)
```

**Compose 방식 (선언형)**:
```kotlin
// Jetpack Compose
@Composable
fun Greeting() {
    Text(
        text = "Hello World",
        color = Color.Blue
    )
}
```

#### 2. Composable 함수
- **@Composable** 어노테이션으로 표시
- UI 요소를 **함수로 정의**
- **재사용 가능**하고 **조합 가능**

```kotlin
@Composable
fun UserProfile(user: User) {
    Column {
        ProfileImage(user.imageUrl)
        UserName(user.name)
        UserEmail(user.email)
    }
}

@Composable
fun ProfileImage(imageUrl: String) {
    Image(
        painter = rememberAsyncImagePainter(imageUrl),
        contentDescription = "Profile Image",
        modifier = Modifier
            .size(80.dp)
            .clip(CircleShape)
    )
}
```

### 주요 구성 요소

#### 1. 기본 UI 요소
```kotlin
@Composable
fun BasicElements() {
    Column {
        // 텍스트
        Text(
            text = "Hello Compose",
            style = MaterialTheme.typography.headlineMedium
        )
        
        // 버튼
        Button(
            onClick = { /* 클릭 처리 */ }
        ) {
            Text("Click Me")
        }
        
        // 이미지
        Image(
            painter = painterResource(id = R.drawable.sample),
            contentDescription = "Sample Image",
            modifier = Modifier.size(100.dp)
        )
        
        // 입력 필드
        var text by remember { mutableStateOf("") }
        TextField(
            value = text,
            onValueChange = { text = it },
            label = { Text("Enter text") }
        )
    }
}
```

#### 2. 레이아웃 (Layout)
```kotlin
@Composable
fun LayoutExamples() {
    // 세로 배치
    Column(
        modifier = Modifier.fillMaxSize(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text("Item 1")
        Text("Item 2")
    }
    
    // 가로 배치
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text("Left")
        Text("Right")
    }
    
    // 자유 배치
    Box(
        modifier = Modifier.size(200.dp)
    ) {
        Text(
            "Top Start",
            modifier = Modifier.align(Alignment.TopStart)
        )
        Text(
            "Center",
            modifier = Modifier.align(Alignment.Center)
        )
        Text(
            "Bottom End",
            modifier = Modifier.align(Alignment.BottomEnd)
        )
    }
}
```

#### 3. Modifier 시스템
```kotlin
@Composable
fun ModifierExample() {
    Text(
        text = "Styled Text",
        modifier = Modifier
            .fillMaxWidth()                    // 전체 너비
            .padding(16.dp)                    // 여백
            .background(Color.LightGray)       // 배경색
            .clip(RoundedCornerShape(8.dp))    // 모서리 둥글게
            .clickable { /* 클릭 처리 */ }     // 클릭 가능
            .border(                           // 테두리
                width = 2.dp,
                color = Color.Blue,
                shape = RoundedCornerShape(8.dp)
            )
    )
}
```

### 상태 관리 (State Management)

#### 1. 기본 상태 관리
```kotlin
@Composable
fun Counter() {
    var count by remember { mutableStateOf(0) }
    
    Column(
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = "Count: $count",
            style = MaterialTheme.typography.headlineMedium
        )
        
        Row {
            Button(onClick = { count-- }) {
                Text("-")
            }
            
            Spacer(modifier = Modifier.width(16.dp))
            
            Button(onClick = { count++ }) {
                Text("+")
            }
        }
    }
}
```

#### 2. 상태 끌어올리기 (State Hoisting)
```kotlin
@Composable
fun ParentComponent() {
    var sharedState by remember { mutableStateOf("") }
    
    Column {
        InputComponent(
            value = sharedState,
            onValueChange = { sharedState = it }
        )
        
        DisplayComponent(text = sharedState)
    }
}

@Composable
fun InputComponent(
    value: String,
    onValueChange: (String) -> Unit
) {
    TextField(
        value = value,
        onValueChange = onValueChange,
        label = { Text("Enter text") }
    )
}

@Composable
fun DisplayComponent(text: String) {
    Text(
        text = "You entered: $text",
        style = MaterialTheme.typography.bodyLarge
    )
}
```

#### 3. ViewModel과 연동
```kotlin
class UserViewModel : ViewModel() {
    private val _users = MutableLiveData<List<User>>()
    val users: LiveData<List<User>> = _users
    
    private val _isLoading = MutableLiveData(false)
    val isLoading: LiveData<Boolean> = _isLoading
    
    fun loadUsers() {
        _isLoading.value = true
        // 데이터 로딩 로직
        viewModelScope.launch {
            delay(1000) // 네트워크 요청 시뮬레이션
            _users.value = getSampleUsers()
            _isLoading.value = false
        }
    }
}

@Composable
fun UserListScreen(
    viewModel: UserViewModel = viewModel()
) {
    val users by viewModel.users.observeAsState(emptyList())
    val isLoading by viewModel.isLoading.observeAsState(false)
    
    LaunchedEffect(Unit) {
        viewModel.loadUsers()
    }
    
    if (isLoading) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            CircularProgressIndicator()
        }
    } else {
        LazyColumn {
            items(users) { user ->
                UserCard(user = user)
            }
        }
    }
}
```

### 리스트와 그리드

#### 1. LazyColumn (세로 스크롤 리스트)
```kotlin
@Composable
fun UserList(users: List<User>) {
    LazyColumn(
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items(users) { user ->
            UserCard(user = user)
        }
        
        item {
            Text(
                text = "End of list",
                modifier = Modifier.fillMaxWidth(),
                textAlign = TextAlign.Center
            )
        }
    }
}

@Composable
fun UserCard(user: User) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { /* 사용자 클릭 처리 */ },
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Image(
                painter = rememberAsyncImagePainter(user.profileImage),
                contentDescription = null,
                modifier = Modifier
                    .size(50.dp)
                    .clip(CircleShape)
            )
            
            Spacer(modifier = Modifier.width(16.dp))
            
            Column {
                Text(
                    text = user.name,
                    style = MaterialTheme.typography.titleMedium
                )
                Text(
                    text = user.email,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}
```

#### 2. LazyVerticalGrid (그리드)
```kotlin
@Composable
fun PhotoGrid(photos: List<Photo>) {
    LazyVerticalGrid(
        columns = GridCells.Fixed(2),
        contentPadding = PaddingValues(8.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items(photos) { photo ->
            PhotoItem(photo = photo)
        }
    }
}

@Composable
fun PhotoItem(photo: Photo) {
    Card(
        modifier = Modifier.aspectRatio(1f)
    ) {
        Image(
            painter = rememberAsyncImagePainter(photo.url),
            contentDescription = photo.title,
            contentScale = ContentScale.Crop,
            modifier = Modifier.fillMaxSize()
        )
    }
}
```

### 애니메이션

#### 1. 기본 애니메이션
```kotlin
@Composable
fun AnimationExamples() {
    var expanded by remember { mutableStateOf(false) }
    
    Column {
        // 크기 애니메이션
        val size by animateDpAsState(
            targetValue = if (expanded) 200.dp else 100.dp,
            animationSpec = tween(durationMillis = 300)
        )
        
        Box(
            modifier = Modifier
                .size(size)
                .background(Color.Blue)
                .clickable { expanded = !expanded }
        )
        
        // 색상 애니메이션
        val color by animateColorAsState(
            targetValue = if (expanded) Color.Red else Color.Green,
            animationSpec = tween(durationMillis = 300)
        )
        
        Box(
            modifier = Modifier
                .size(100.dp)
                .background(color)
        )
        
        // 회전 애니메이션
        val rotation by animateFloatAsState(
            targetValue = if (expanded) 360f else 0f,
            animationSpec = tween(durationMillis = 1000)
        )
        
        Icon(
            imageVector = Icons.Default.Refresh,
            contentDescription = "Refresh",
            modifier = Modifier
                .size(50.dp)
                .rotate(rotation)
                .clickable { expanded = !expanded }
        )
    }
}
```

#### 2. 리스트 애니메이션
```kotlin
@Composable
fun AnimatedList() {
    var items by remember { mutableStateOf((1..5).toList()) }
    
    Column {
        Button(
            onClick = {
                items = items + (items.size + 1)
            }
        ) {
            Text("Add Item")
        }
        
        LazyColumn {
            items(
                items = items,
                key = { it }
            ) { item ->
                AnimatedVisibility(
                    visible = true,
                    enter = slideInVertically() + fadeIn(),
                    exit = slideOutVertically() + fadeOut()
                ) {
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(8.dp)
                    ) {
                        Text(
                            text = "Item $item",
                            modifier = Modifier.padding(16.dp)
                        )
                    }
                }
            }
        }
    }
}
```

### 테마와 스타일링

#### 1. Material Design 3
```kotlin
@Composable
fun MyAppTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) {
        darkColorScheme(
            primary = Purple80,
            secondary = PurpleGrey80,
            tertiary = Pink80
        )
    } else {
        lightColorScheme(
            primary = Purple40,
            secondary = PurpleGrey40,
            tertiary = Pink40
        )
    }
    
    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}

// 사용
@Composable
fun App() {
    MyAppTheme {
        Surface(
            modifier = Modifier.fillMaxSize(),
            color = MaterialTheme.colorScheme.background
        ) {
            MainScreen()
        }
    }
}
```

#### 2. 커스텀 컴포넌트
```kotlin
@Composable
fun CustomButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true
) {
    Surface(
        modifier = modifier
            .clip(RoundedCornerShape(8.dp))
            .clickable(enabled = enabled) { onClick() },
        color = if (enabled) MaterialTheme.colorScheme.primary 
                else MaterialTheme.colorScheme.surfaceVariant,
        shadowElevation = if (enabled) 4.dp else 0.dp
    ) {
        Text(
            text = text,
            color = if (enabled) MaterialTheme.colorScheme.onPrimary
                    else MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.padding(16.dp),
            textAlign = TextAlign.Center
        )
    }
}
```

### Navigation

#### 1. 기본 네비게이션
```kotlin
// build.gradle
dependencies {
    implementation "androidx.navigation:navigation-compose:2.7.5"
}

@Composable
fun AppNavigation() {
    val navController = rememberNavController()
    
    NavHost(
        navController = navController,
        startDestination = "home"
    ) {
        composable("home") {
            HomeScreen(
                onNavigateToProfile = { userId ->
                    navController.navigate("profile/$userId")
                }
            )
        }
        
        composable(
            "profile/{userId}",
            arguments = listOf(navArgument("userId") { type = NavType.StringType })
        ) { backStackEntry ->
            val userId = backStackEntry.arguments?.getString("userId") ?: ""
            ProfileScreen(
                userId = userId,
                onNavigateBack = {
                    navController.popBackStack()
                }
            )
        }
    }
}
```

### 성능 최적화

#### 1. 재구성 최적화
```kotlin
@Composable
fun OptimizedComponent() {
    // remember로 계산 결과 캐싱
    val expensiveValue = remember {
        computeExpensiveValue()
    }
    
    // derivedStateOf로 파생 상태 최적화
    var input by remember { mutableStateOf("") }
    val isValid by remember {
        derivedStateOf {
            input.length > 5 && input.contains("@")
        }
    }
    
    Column {
        TextField(
            value = input,
            onValueChange = { input = it }
        )
        
        if (isValid) {
            Text("Valid input")
        }
    }
}

// Stable 클래스 사용
@Stable
data class User(
    val id: String,
    val name: String,
    val email: String
)
```

#### 2. LazyList 최적화
```kotlin
@Composable
fun OptimizedList(items: List<Item>) {
    LazyColumn {
        items(
            items = items,
            key = { item -> item.id } // 키 지정으로 재구성 최적화
        ) { item ->
            ItemCard(item = item)
        }
    }
}

@Composable
fun ItemCard(item: Item) {
    // 무거운 연산을 remember로 캐싱
    val processedData = remember(item.id) {
        processItemData(item)
    }
    
    Card {
        Text(text = processedData.title)
    }
}
```

### 장점과 단점

#### 장점
- **선언형 프로그래밍**: 코드 가독성과 유지보수성 향상
- **재사용성**: Composable 함수의 높은 재사용성
- **상태 관리**: 간편하고 직관적인 상태 관리
- **성능**: 스마트 리컴포지션으로 효율적인 렌더링
- **타입 안전성**: Kotlin의 타입 시스템 활용
- **테스트**: 쉬운 UI 테스트 작성

#### 단점
- **러닝 커브**: 기존 View 시스템과 다른 패러다임
- **메모리 사용량**: 초기 메모리 사용량이 높을 수 있음
- **디버깅**: 새로운 디버깅 도구와 기법 필요
- **라이브러리 호환성**: 일부 기존 라이브러리와 호환성 이슈