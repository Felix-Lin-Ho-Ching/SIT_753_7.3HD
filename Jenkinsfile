pipeline {
  agent any
  options { timestamps() }

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Build') {
      steps {
        bat 'node -v && (npm ci || npm install)'
        archiveArtifacts artifacts: 'package-lock.json', fingerprint: true
      }
    }

    stage('Test') {
      steps {
        bat '''
if not exist reports mkdir reports
npx jest --ci --runInBand --coverage --coverageReporters=lcov
'''
      }
      post {
        always {
          junit 'reports\\junit.xml'
          archiveArtifacts artifacts: 'reports\\junit.xml,coverage\\**\\*', allowEmptyArchive: true
        }
      }
    }

    stage('Code Quality (ESLint)') {
      steps {
        bat 'npm run lint || exit /b 0'
      }
    }

    stage('Code Quality (SonarQube)') {
      steps {
        withSonarQubeEnv('SonarLocal') {
          script {
            def scannerHome = tool name: 'SonarScanner', type: 'hudson.plugins.sonar.SonarRunnerInstallation'
            bat "\"%scannerHome%\\bin\\sonar-scanner.bat\" -Dsonar.projectKey=sit_753_7_3hd -Dsonar.projectName=SIT_753_7.3HD -Dsonar.sources=. -Dsonar.tests=__tests__ -Dsonar.test.inclusions=__tests__/**/*.test.js -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info"
          }
        }
      }
    }

    stage('Quality Gate') {
      steps {
        timeout(time: 2, unit: 'MINUTES') { waitForQualityGate abortPipeline: false }
      }
    }

    stage('Security') {
      steps {
        bat 'npm audit --production --audit-level=high || exit /b 0'
      }
    }

    stage('Build Image') {
      when { expression { fileExists('Dockerfile') } }
      steps {
        bat 'docker build -t sit753-7_3hd:dev .'
      }
    }

    stage('Deploy to Staging') {
      when { anyOf { expression { fileExists('docker-compose.yml') }; expression { return true } } }
      steps {
        script {
          if (fileExists('docker-compose.yml')) {
            bat 'docker compose up -d'
          } else {
            bat 'docker rm -f sit753-7_3hd || exit /b 0'
            bat 'docker run -d -p 3000:3000 --name sit753-7_3hd sit753-7_3hd:dev'
          }
        }
      }
    }

    stage('Monitoring & Health') {
      steps {
        bat 'curl.exe -s http://localhost:3000/healthz || exit /b 0'
      }
    }
  }

  post {
    always { cleanWs() }
  }
}
