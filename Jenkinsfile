pipeline {
  agent any
  options { timestamps() }

  stages {
    stage('Checkout') {
      steps {
        echo 'JF_MARKER: r5'
        checkout scm
      }
    }

    stage('Build') {
      steps {
        bat '''
          node -v  && (npm ci  || npm install)
        '''
        archiveArtifacts artifacts: 'package-lock.json,coverage/lcov.info', fingerprint: true, onlyIfSuccessful: false
      }
    }

    stage('Test') {
      steps {
        bat '''
          if not exist reports mkdir reports
          npm i --no-save jest-junit@16
          set "JEST_JUNIT_OUTPUT=reports\\junit.xml"
          npx jest --ci --runInBand --coverage --coverageReporters=lcov --reporters=default --reporters=jest-junit
          echo ===== DIR REPORTS =====
          if exist reports (dir reports) else (echo reports folder missing)
        '''
        junit testResults: '**/reports/*.xml', keepLongStdio: true
      }
    }

    stage('Code Quality (ESLint)') {
      steps {
        bat 'npm run lint  || exit /b 0'
      }
    }

    stage('Code Quality (SonarQube)') {
      when { expression { return false } } // disabled unless you re-enable Sonar later
      steps {
        withSonarQubeEnv('SonarLocal') {
          bat 'echo sonar disabled for now'
        }
      }
    }
  }

  post {
    always {
      cleanWs()
    }
  }
}
