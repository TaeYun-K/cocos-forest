🤔 코틀린(Kotlin)을 사용하는 이유와 프론트엔드 개발 문법

📖 목차
왜 코틀린을 사용해야 할까요?

코틀린으로 프론트엔드 개발하기 (Kotlin/JS)

DOM(Document Object Model) 조작하기

이벤트 처리하기

동적으로 요소 생성 및 추가하기

1. 왜 코틀린을 사용해야 할까요?
코틀린은 단순히 '더 나은 자바'를 넘어, 다양한 플랫폼에서 생산적이고 안전한 개발을 가능하게 하는 현대적인 언어입니다.

✨ 1.1 간결하고 뛰어난 가독성
같은 기능을 구현하더라도 자바에 비해 훨씬 적은 양의 코드를 작성할 수 있습니다. 특히 data class, 람다식, 확장 함수 등은 코드의 양을 획기적으로 줄여줍니다.

Java 예시:

// User.java
public class User {
    private final String name;
    private final int age;

    public User(String name, int age) {
        this.name = name;
        this.age = age;
    }

    // equals(), hashCode(), toString(), ...
}

Kotlin 예시:

// 단 한 줄로 위의 자바 코드와 동일한 기능을 수행합니다.
data class User(val name: String, val age: Int)

🛡️ 1.2 NPE로부터의 해방 (Null Safety)
코틀린의 타입 시스템은 NullPointerException(NPE)을 컴파일 시점에서 예방하도록 설계되었습니다. Nullable 타입(?)을 명시적으로 선언하고, 컴파일러가 Null 안전성을 강제하여 런타임 오류 가능성을 크게 낮춥니다.

var name: String = "Kotlin"
// name = null // 컴파일 오류 발생

var nullableName: String? = "World"
nullableName = null // 가능

// Nullable 타입은 반드시 안전한 방법으로 접근해야 합니다.
println(nullableName?.length) // Safe Call

🔄 1.3 완벽한 상호운용성
코틀린은 기존의 자바(Java) 및 자바스크립트(JavaScript) 코드와 100% 호환됩니다. 기존 프로젝트에 코틀린을 점진적으로 도입할 수 있으며, 방대한 양의 자바/JS 라이브러리를 그대로 활용할 수 있습니다.

🌍 1.4 하나의 언어로 모든 것을 (Multiplatform)
코틀린은 안드로이드, 서버(백엔드), 웹(프론트엔드), 심지어 iOS와 데스크톱 애플리케이션까지 개발할 수 있는 진정한 멀티플랫폼 언어입니다. 플랫폼 간에 비즈니스 로직을 공유하여 개발 시간과 비용을 절약할 수 있습니다.

⚡ 1.5 강력한 동시성 처리 (Coroutines)
코루틴(Coroutines)을 통해 비동기 코드를 마치 동기 코드처럼 쉽고 직관적으로 작성할 수 있습니다. 복잡한 콜백 지옥(Callback Hell)에서 벗어나 깔끔하고 유지보수하기 좋은 코드를 만들 수 있습니다.

2. 코틀린으로 프론트엔드 개발하기 (Kotlin/JS)
코틀린 코드는 자바스크립트로 컴파일되어 모든 웹 브라우저에서 실행될 수 있습니다. 다음은 웹페이지의 요소를 조작하는 핵심 문법 예제입니다.

(아래 예제는 kotlinx.browser 라이브러리를 사용합니다.)

2.1 DOM 조작하기
웹 페이지의 HTML 요소를 가져와서 내용을 변경하는 방법입니다.

import kotlinx.browser.document
import org.w3c.dom.HTMLHeadingElement

fun main() {
    // DOM 로드가 완료된 후 코드를 실행합니다.
    document.addEventListener("DOMContentLoaded", {
        // ID가 "title"인 h1 요소를 가져옵니다.
        // as 키워드를 통해 타입을 안전하게 캐스팅합니다.
        val titleElement = document.getElementById("title") as HTMLHeadingElement

        // 요소의 텍스트 내용을 변경합니다.
        titleElement.textContent = "코틀린으로 제목 변경 완료!"

        // 요소의 스타일을 변경합니다.
        titleElement.style.color = "blue"
    })
}

/*
[HTML 코드 예시]
<h1 id="title">기존 제목</h1>
*/

2.2 이벤트 처리하기
버튼 클릭과 같은 사용자 이벤트를 처리하는 방법입니다.

import kotlinx.browser.document
import kotlinx.browser.window
import org.w3c.dom.HTMLButtonElement

fun main() {
    document.addEventListener("DOMContentLoaded", {
        val actionButton = document.getElementById("actionButton") as HTMLButtonElement

        // 버튼에 클릭 이벤트 리스너를 추가합니다.
        actionButton.onclick = {
            window.alert("버튼이 클릭되었습니다!")
        }
    })
}

/*
[HTML 코드 예시]
<button id="actionButton">클릭하세요</button>
*/

2.3 동적으로 요소 생성 및 추가하기
코틀린 코드로 새로운 HTML 요소를 만들어 페이지에 추가하는 방법입니다.

import kotlinx.browser.document
import org.w3c.dom.HTMLParagraphElement

fun main() {
    document.addEventListener("DOMContentLoaded", {
        // 새로운 <p> (문단) 요소를 생성합니다.
        val newParagraph = document.createElement("p") as HTMLParagraphElement

        // 새 요소의 텍스트 내용을 설정합니다.
        newParagraph.textContent = "이 문단은 코틀린 코드로 동적으로 생성되었습니다."

        // 새 요소의 글자 크기를 설정합니다.
        newParagraph.style.fontSize = "18px"

        // body 태그의 자식 요소로 새로 만든 <p> 요소를 추가합니다.
        document.body?.appendChild(newParagraph)
    })
}

/*
[HTML 코드 예시]
<body>
    <!-- 이 아래에 새로운 <p> 태그가 추가됩니다. -->
</body>
*/
