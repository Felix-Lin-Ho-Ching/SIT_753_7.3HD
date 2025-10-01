pipeline {
  agent any

  environment {
    IMAGE_TAG = "${env.BUILD_NUMBER}"
  }

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Build') {
      steps {
        bat """
          node -v
          npm ci || npm install
        """
      }
      post {
        success {
          archiveArtifacts artifacts: 'package-lock.json', fingerprint: true
        }
      }
    }

    stage('Test') {
      steps {
        bat "npm test"
      }
      post {
        always {
          junit allowEmptyResults: true, testResults: 'junit*.xml'
          archiveArtifacts artifacts: 'coverage/**', allowEmptyArchive: true
        }
      }
    }

stage('Code Quality (ESLint)') {
  steps { bat "npm run lint || exit /b 0" }
}

stage('Code Quality (SonarQube)') {
  steps {
    withSonarQubeEnv('SonarLocal') {
      bat """
        npx jest --coverage --coverageReporters=lcov --coverageReporters=text-summary
        "%SONAR_SCANNER_HOME%\\bin\\sonar-scanner.bat"
      """
    }
  }
}

stage('Quality Gate') {
  steps {
    timeout(time: 2, unit: 'MINUTES') {
      waitForQualityGate abortPipeline: false
    }
  }
}


    stage('Security') {
      steps {
        bat "npm audit --production --audit-level=high"
      }
    }

    stage('Build Image') {
      steps {
        bat """
          docker version
          docker build -t sit753-7_3hd:%IMAGE_TAG% .
          docker tag sit753-7_3hd:%IMAGE_TAG% sit753-7_3hd:latest
        """
      }
    }

    stage('Deploy to Staging') {
      steps {
        bat """
          docker compose down || exit /b 0
          docker compose up -d --build
        """
      }
    }

stage('Release') {
  steps {
    bat '''
      for /f %%b in ('git rev-parse --abbrev-ref HEAD') do set BR=%%b
      echo Current branch: %BR%
      if /I "%BR%"=="main" (
        git config user.email "ci@example.com"
        git config user.name "ci-bot"
        git tag -a v%BUILD_NUMBER% -m "CI build %BUILD_NUMBER%"
        git push origin --tags || echo "Tag push failed (no creds?) - continuing"
      ) else (
        echo Skipping tag: not on main (branch=%BR%)
      )
    '''
  }
}

    stage('Monitoring & Health') {
      steps {
        bat """
          for /l %%i in (1,1,5) do (
            powershell -Command "Start-Sleep -Seconds 5"
            curl.exe http://localhost:3000/healthz && goto ok
          )
          echo Health check failed & exit /b 1
          :ok
        """
        bat "docker logs --tail=100 sit753-app || exit /b 0"
      }
    }
  }

  post {
    always { cleanWs() }
  }
}
