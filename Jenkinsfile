pipeline {
  agent any
  environment {
    NODE_ENV = "ci"
    IMAGE_TAG = "${env.GIT_COMMIT.take(7)}"
  }
  tools { nodejs "NodeJS20" }
  stages {
    stage('Checkout'){ steps { checkout scm } }
    stage('Build'){ steps { sh 'node -v && npm ci' } }
    stage('Test'){ steps { sh 'npm test' } }
    stage('Code Quality'){ steps { sh 'npm run lint || true' } }
    stage('Security'){ steps { sh 'npm audit --production --audit-level=high || (echo Security issues && exit 1)' } }
    stage('Build Image'){ steps { sh 'docker build -t sit753-7_3hd:${IMAGE_TAG} . && docker tag sit753-7_3hd:${IMAGE_TAG} sit753-7_3hd:latest' } }
    stage('Deploy to Staging'){ steps { sh 'docker compose down || true && docker compose up -d --build' } }
    stage('Release'){ when { branch 'main' } steps { sh 'git config user.email "ci@example.com"; git config user.name "ci-bot"; git tag -a v${BUILD_NUMBER} -m "CI build ${BUILD_NUMBER}"; git push origin --tags || true' } }
    stage('Monitoring & Health'){ steps { sh 'for i in 1 2 3 4 5; do sleep 5; if curl -fsS http://localhost:3000/healthz; then exit 0; fi; done; exit 1' } }
    stage('Security (Trivy)'){ steps { sh 'trivy image --exit-code 0 --severity MEDIUM sit753-7_3hd:latest || true; trivy image --exit-code 1 --severity HIGH,CRITICAL sit753-7_3hd:latest || true' } }
  }
  post { always { cleanWs() } }
}