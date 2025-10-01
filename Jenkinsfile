pipeline {
  agent any
  options { timestamps(); skipDefaultCheckout(true) }

  environment {
    NODE_OPTIONS = "--max_old_space_size=2048"
    SCANNER_VERSION = "6.2.1.4610"
  }

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Build') {
      steps {
        bat 'node -v  && (npm ci  || npm install )'
      }
      post { always { archiveArtifacts artifacts: 'package*.json', fingerprint: true } }
    }

    stage('Test') {
      steps {
        // 1) ensure folder exists  2) run Jest and write JUnit  3) keep going even if tests fail so we can publish the report
        catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
          bat '''
if not exist reports mkdir reports
npx jest --ci --runInBand --coverage --coverageReporters=lcov --reporters=default --reporters=jest-junit
'''
        }
      }
      post {
        always {
          junit 'reports/junit*.xml'
          archiveArtifacts artifacts: 'reports/**,coverage/**', fingerprint: true, allowEmptyArchive: true
        }
      }
    }

    stage('Code Quality (ESLint)') {
      steps {
        // non-blocking; Sonar will run anyway
        catchError(buildResult: 'SUCCESS', stageResult: 'UNSTABLE') {
          bat 'npx eslint .'
        }
      }
    }

    stage('Code Quality (SonarQube)') {
      steps {
        withSonarQubeEnv('SonarLocal') {
          withCredentials([string(credentialsId: 'sonar-token', variable: 'SONAR_TOKEN')]) {
            bat '''
if not exist .scanner mkdir .scanner
set ZIP=sonar-scanner-cli-%SCANNER_VERSION%-windows.zip
if not exist .scanner\\%ZIP% powershell -Command "Invoke-WebRequest -Uri https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/%ZIP% -OutFile .scanner\\%ZIP%"
powershell -Command "Expand-Archive -Force .scanner\\%ZIP% .scanner"
for /d %%D in (.scanner\\sonar-scanner-*) do set SCANNER_DIR=%%D
set PATH=%CD%\\%SCANNER_DIR%\\bin;%PATH%
%SCANNER_DIR%\\bin\\sonar-scanner.bat ^
 -Dsonar.projectKey=sit_753_7_3hd ^
 -Dsonar.projectName=SIT_753_7.3HD ^
 -Dsonar.sources=. ^
 -Dsonar.tests=__tests__ ^
 -Dsonar.test.inclusions=__tests__\\**\\*.test.js ^
 -Dsonar.javascript.lcov.reportPaths=coverage\\lcov.info ^
 -Dsonar.sourceEncoding=UTF-8 ^
 -Dsonar.token=%SONAR_TOKEN% ^
 -Dsonar.host.url=%SONAR_HOST_URL%
'''
          }
        }
      }
    }

    stage('Quality Gate') {
      steps { timeout(time: 2, unit: 'MINUTES') { waitForQualityGate abortPipeline: false } }
    }
  }

  post { always { cleanWs() } }
}
