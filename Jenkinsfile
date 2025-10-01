pipeline {
  agent any
  options { timestamps() }

  stages {
    stage('Checkout') {
      steps {
        echo 'JF_MARKER: r7'
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
        // Ensure reports dir exists and the reporter module is present (safe even if already installed)
        bat '''
          if not exist reports mkdir reports
          npm i --no-save jest-junit@16
          npx jest --ci --runInBand --coverage --coverageReporters=lcov
          echo ===== DIR WORKSPACE ===== & dir
          echo ===== DIR REPORTS ===== & dir reports
        '''
        // Pick up either the configured path or any junit*.xml as a fallback
        junit testResults: '**/reports/junit.xml, **/junit*.xml', keepLongStdio: true
      }
    }

    stage('Code Quality (ESLint)') {
      steps { bat 'npm run lint  || exit /b 0' }
    }

    // Leave Sonar disabled unless you've configured it in Jenkins
    stage('Code Quality (SonarQube)') {
      when { expression { false } }
      steps { echo 'Sonar disabled in this pipeline for now.' }
    }
  }

  post {
    always { cleanWs() }
  }
}
