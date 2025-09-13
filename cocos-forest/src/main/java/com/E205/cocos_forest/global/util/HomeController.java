package com.E205.cocos_forest.global.util;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * swagger 을 띄우기 위한 controller
 */
@Controller
public class HomeController {

    // http://host/ 또는 http://host/swagger 로 접속하면 Swagger UI로 보냄
    @GetMapping({"/", "/swagger"})
    public String index() {
        return "redirect:/swagger-ui/index.html";
    }
}
