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

    stage('Code Quality') {
      steps { bat "npm run lint || exit /b 0" }
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
      when {
        expression { return env.BRANCH_NAME == 'main' }
      }
      steps {
        bat """
          git config user.email "ci@example.com"
          git config user.name "ci-bot"
          git tag -a v%BUILD_NUMBER% -m "CI build %BUILD_NUMBER%"
          git push origin --tags
        """
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
