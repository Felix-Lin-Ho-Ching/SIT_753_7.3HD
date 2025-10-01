pipeline {
  agent any
  options { timestamps() }

  environment {
    NODE_ENV = 'ci'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build') {
      steps {
        bat 'node -v'
        bat 'npm ci || npm install'
        archiveArtifacts artifacts: 'package*.json,package-lock.json', fingerprint: true, onlyIfSuccessful: true
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
        junit allowEmptyResults: false, testResults: 'reports/junit.xml'
        archiveArtifacts artifacts: 'coverage/**', onlyIfSuccessful: true
      }
    }

    stage('Code Quality (ESLint)') {
      steps {
        bat 'npm run lint || exit /b 0'
      }
    }

    stage('Code Quality (SonarQube)') {
      when { expression { return fileExists('sonar-project.properties') } }
      steps {
        withSonarQubeEnv('SonarLocal') {
          bat '''
            if not exist sonar-scanner (
              curl -L -o sonar-scanner.zip https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-6.2.1.4610-windows.zip
              powershell -Command "Expand-Archive -Path sonar-scanner.zip -DestinationPath . -Force"
              for /d %%i in (sonar-scanner-*) do ren "%%i" "sonar-scanner"
            )
            set PATH=%CD%\\sonar-scanner\\bin;%PATH%
            sonar-scanner -Dsonar.host.url=%SONAR_HOST_URL% -Dsonar.token=%SONAR_AUTH_TOKEN%
          '''
        }
      }
    }

    stage('Quality Gate') {
      when { expression { return fileExists('sonar-project.properties') } }
      steps {
        timeout(time: 2, unit: 'MINUTES') {
          waitForQualityGate()
        }
      }
    }

    stage('Build Image') {
      steps {
        bat 'echo Skipping Docker build in this Windows setup'
      }
    }

    stage('Deploy to Staging') {
      steps {
        bat 'echo Skipping deploy in this environment'
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
        bat 'node -e "console.log(\\"health check placeholder\\")"'
      }
    }
  }

  post {
    always {
      cleanWs()
    }
  }
}
