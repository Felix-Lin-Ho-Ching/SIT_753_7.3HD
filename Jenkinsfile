pipeline {
  agent any
  options { timestamps(); skipDefaultCheckout(true) }
  parameters {
    booleanParam(name: 'RUN_SONAR', defaultValue: true, description: 'Run SonarQube analysis')
    booleanParam(name: 'RUN_DOCKER', defaultValue: false, description: 'Build and run Docker image')
  }
  environment {
    NODE_OPTIONS = "--max_old_space_size=2048"
    SCANNER_VERSION = "6.2.1.4610"
  }
  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }
    stage('Build') {
      steps {
        bat 'node -v  && (npm ci  || npm install )'
      }
      post {
        always {
          archiveArtifacts artifacts: 'package.json,package-lock.json', fingerprint: true, allowEmptyArchive: true
        }
      }
    }
    stage('Test') {
      steps {
        bat '''
if not exist reports mkdir reports
npm i --no-save jest-junit@16
set JEST_JUNIT_OUTPUT=reports\\junit.xml
npx jest --ci --runInBand --coverage --coverageReporters=lcov --reporters=default --reporters=jest-junit
'''
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
        catchError(buildResult: 'SUCCESS', stageResult: 'UNSTABLE') {
          bat 'npx eslint .'
        }
      }
    }
    stage('Code Quality (SonarQube)') {
      when { expression { return params.RUN_SONAR } }
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
      when { expression { return params.RUN_SONAR } }
      steps {
        timeout(time: 2, unit: 'MINUTES') {
          waitForQualityGate abortPipeline: false
        }
      }
    }
    stage('Security') {
      steps {
        bat 'npm audit --omit=dev --audit-level=high || exit /b 0'
      }
    }
    stage('Build Image') {
      when { expression { return params.RUN_DOCKER } }
      steps {
        bat 'docker version && docker build -t sit753-7_3hd:%BUILD_NUMBER% .'
      }
    }
    stage('Deploy to Staging') {
      when { expression { return params.RUN_DOCKER } }
      steps {
        bat 'docker rm -f sit753-7_3hd || echo ok'
        bat 'docker run -d --name sit753-7_3hd -p 3000:3000 sit753-7_3hd:%BUILD_NUMBER%'
      }
    }
    stage('Monitoring & Health') {
      when { expression { return params.RUN_DOCKER } }
      steps {
        bat 'powershell -Command "Invoke-WebRequest http://localhost:3000/healthz -UseBasicParsing | Out-Null"'
      }
    }
    stage('Release') {
      when { branch 'main' }
      steps {
        bat 'git config user.email "ci@example.com" & git config user.name "ci-bot" & git tag -a v%BUILD_NUMBER% -m "CI build %BUILD_NUMBER%" & git push origin --tags || exit /b 0'
      }
    }
  }
  post {
    always {
      cleanWs()
    }
  }
}
