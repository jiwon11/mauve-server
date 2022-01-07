# Mauve API Server

main branch를 통해 AWS ECS에 Mauve API Server 배포

## Host

http://api.mauve.care

### Route

#### Application Route

`{{Host}}/app`

#### Socket Route

`{{Host}}/socket.io`

## Tech Stack

### Backend

- Nodejs
  - Web Application Framework
    - Express
  - Authentication
    - JWT
  - ODM
    - Mongoose.js
  - multipart/form-data handler
    - Multer
  - Date library(parsing, validating, manipulating, and formatting)
    - Moment.js
  - Process Manager
    - PM2
  - Unit Test
    - Jest

### Data

- Database
  - MongoDB
  - redis

### Infra

- Docker & Docker Compose
- AWS
  - ECS
  - ECR
  - S3
  - cloudFront
  - Route53
- Firebase
  - FCM : 푸시 알림 교차 플랫폼 메시징 API
- Naver Cloud Platform
  - Simple & Easy Notification Service : 문자 전송 API
- NginX

### Monitoring

- AWS cloudwatch
- AWS X-ray

## 참고

- git workflow 기반 branch 개발
- ECS / ECR / Github Action으로 자동화 CI/CD를 처리합니다.
- api 문서는 postman에 배포합니다.
