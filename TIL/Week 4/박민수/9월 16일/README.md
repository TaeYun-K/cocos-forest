### Nginx - HTTP 요청을 HTTPS로 리디렉션하기

오늘은 Nginx에서 HTTP 요청을 HTTPS로 자동 리디렉션하는 설정을 배웠다.

server {
    listen 80;
    server_name example.com;

    location / {
        return 301 https://$host$request_uri;
    }
}


👉 SSL 인증서와 함께 적용하면 보안 접속을 강제할 수 있다.