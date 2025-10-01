pipeline {
  agent any
  options { timestamps() }

  stages {
    stage('Checkout') {
      steps {
        echo 'JF_MARKER: r6'
        checkout scm
      }
    }

    stage('Build') {
      steps {
        bat 'node -v  && (npm ci  || npm install)'
        archiveArtifacts artifacts: 'package-lock.json,coverage/lcov.info', fingerprint: true, onlyIfSuccessful: false
      }
    }

    stage('Test') {
      steps {
        bat 'if not exist reports mkdir reports'
        bat 'npm i --no-save jest-junit@16'
        bat 'set JEST_JUNIT_OUTPUT=reports\\junit.xml && npx jest --ci --runInBand --coverage --coverageReporters=lcov --reporters=default --reporters=jest-junit'
        bat 'echo ===== DIR REPORTS ===== & dir reports'
        junit testResults: '**/reports/*.xml', keepLongStdio: true
      }
    }

    stage('Code Quality (ESLint)') {
      steps {
        bat 'npm run lint  || exit /b 0'
      }
    }

    stage('Code Quality (SonarQube)') {
      when { expression { false } } // leave off unless you enable Sonar later
      steps {
        withSonarQubeEnv('SonarLocal') {
          bat 'echo sonar disabled'
        }
      }
    }
  }

  post {
    always { cleanWs() }
  }
}
