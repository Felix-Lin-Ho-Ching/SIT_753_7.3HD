pipeline {
  agent any
  options { timestamps(); skipDefaultCheckout(false) }

  environment {
    CI = 'true'
  }

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Build') {
      steps {
        bat '''
          node -v
          npm ci || npm install
        '''
        archiveArtifacts artifacts: 'package*.json, package-lock.json', fingerprint: true, onlyIfSuccessful: false
      }
    }

    stage('Test') {
      steps {
        bat '''
          npm i --no-save jest-junit@16
          set JEST_JUNIT_OUTPUT=junit.xml
          npx jest --runInBand --coverage --coverageReporters=lcov --coverageReporters=text-summary --reporters=default --reporters=jest-junit
        '''
        junit 'junit.xml'
        archiveArtifacts artifacts: 'coverage/**, junit.xml', fingerprint: true, allowEmptyArchive: true
      }
    }

    stage('Code Quality (ESLint)') {
      steps {
        bat 'npx eslint . || exit /b 0'
      }
    }

    stage('Code Quality (SonarQube)') {
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
      steps {
        timeout(time: 2, unit: 'MINUTES') {
          waitForQualityGate abortPipeline: true
        }
      }
    }

    stage('Security') {
      steps { bat 'npm audit --production --audit-level=high || exit /b 0' }
    }

    stage('Build Image') {
      when { expression { return fileExists('Dockerfile') } }
      steps {
        bat '''
          where docker || exit /b 0
          docker build -t sit753-7_3hd:dev .
        '''
      }
    }

    stage('Deploy to Staging') {
      when { expression { return fileExists('docker-compose.yml') } }
      steps {
        bat '''
          where docker-compose || exit /b 0
          docker compose up -d || exit /b 0
        '''
      }
    }

    stage('Release') {
      when { branch 'main' }
      steps {
        bat '''
          git config user.email "ci@example.com"
          git config user.name "ci-bot"
          git tag -a v%BUILD_NUMBER% -m "CI build %BUILD_NUMBER%"
          git push origin --tags || exit /b 0
        '''
      }
    }

    stage('Monitoring & Health') {
      steps {
        bat 'curl.exe http://localhost:3000/healthz || exit /b 0'
      }
    }
  }

  post {
    always { cleanWs() }
  }
}
