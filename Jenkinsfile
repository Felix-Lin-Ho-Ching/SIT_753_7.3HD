pipeline {
  agent any
  options {
    timestamps()
    skipDefaultCheckout(true)
  }
  environment {
    CI = 'true'
  }
  stages {

    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build') {
      steps {
        bat 'node -v  && (npm ci || npm install)'
        archiveArtifacts artifacts: 'package.json,package-lock.json', fingerprint: true, onlyIfSuccessful: true
      }
    }

    stage('Test') {
      steps {
        bat 'if not exist reports mkdir reports'
        bat 'npm test'
        bat 'dir reports'
        junit allowEmptyResults: false, testResults: 'reports/*.xml'
        archiveArtifacts artifacts: 'coverage/lcov.info, reports/*.xml', fingerprint: true, onlyIfSuccessful: true
      }
    }

    stage('Code Quality (ESLint)') {
      steps {
        bat 'npm run lint || exit /b 0'
      }
    }
  }

  post {
    always {
      cleanWs()
    }
  }
}
