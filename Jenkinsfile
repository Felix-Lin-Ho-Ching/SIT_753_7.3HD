pipeline {
  agent any
  options { timestamps(); skipDefaultCheckout(false) }
  environment { CI = 'true' }

  stages {
    stage('Checkout') {
      steps {
        echo 'JF_MARKER: r4'
        checkout scm
      }
    }

    stage('Build') {
      steps {
        bat 'node -v && (npm ci || npm install)'
        archiveArtifacts artifacts: 'package*.json,package-lock.json', fingerprint: true, onlyIfSuccessful: true
      }
    }

    stage('Test') {
      steps {
        bat 'if not exist reports mkdir reports && npm i --no-save jest-junit@16 && set JEST_JUNIT_OUTPUT=reports\\junit.xml && npx jest --ci --runInBand --coverage --coverageReporters=lcov --reporters=default --reporters=jest-junit'
        junit 'reports/junit.xml'
        archiveArtifacts artifacts: 'coverage/**,reports/junit.xml', fingerprint: true
      }
    }

    stage('Code Quality (ESLint)') {
      steps { bat 'npx eslint . || exit /b 0' }
    }

    stage('Code Quality (SonarQube)') {
      when { expression { return fileExists('sonar-project.properties') } }
      steps {
        withSonarQubeEnv('SonarLocal') {
          script {
            def scannerHome = tool name: 'SonarScanner', type: 'hudson.plugins.sonar.SonarRunnerInstallation'
            bat "\"${scannerHome}\\bin\\sonar-scanner.bat\""
          }
        }
      }
    }

    stage('Quality Gate') {
      when { expression { return fileExists('sonar-project.properties') } }
      steps {
        timeout(time: 2, unit: 'MINUTES') { waitForQualityGate abortPipeline: true }
      }
    }
  }

  post { always { cleanWs() } }
}
