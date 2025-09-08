#!/usr/bin/env node

/**
 * FieldFlow Production Build Script
 * Automates the build process for Bluehost deployment
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🚀 FieldFlow Production Build Starting...')
console.log('=====================================')

// Configuration
const config = {
  buildDir: 'dist',
  deploymentDir: 'deployment-package',
  domain: 'yourdomain.com', // Replace with actual domain
  subdomain: 'fieldflow'
}

function createProductionEnv() {
  console.log('🔧 Creating production environment...')
  
  const productionEnv = `# Production Environment - Auto Generated
VITE_TEST_MODE=false
VITE_SUPABASE_URL=https://pehaktnlutpofluqcele.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlaGFrdG5sdXRwb2ZsdXFjZWxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNzU4MDksImV4cCI6MjA3MTY1MTgwOX0.z_e7IsTMytAVO9YPVVJURY6qw3w_--DHy9hmMAWZNco

VITE_APP_NAME=FieldFlow
VITE_APP_VERSION=2.0.0
VITE_APP_BASE_URL=https://${config.subdomain}.${config.domain}

# Production Feature Flags
VITE_ENABLE_OFFLINE_MODE=true
VITE_ENABLE_PERFORMANCE_MONITORING=true
VITE_ENABLE_ERROR_REPORTING=true
VITE_ENABLE_CRM=true
VITE_ENABLE_BILLING=true
VITE_ENABLE_TEAM_MANAGEMENT=true

# Production Settings
VITE_DEBUG_MODE=false
`

  fs.writeFileSync('.env.production', productionEnv)
  console.log('✅ Production environment created')
}

function cleanPreviousBuild() {
  console.log('🧹 Cleaning previous build...')
  
  if (fs.existsSync(config.buildDir)) {
    fs.rmSync(config.buildDir, { recursive: true, force: true })
  }
  
  if (fs.existsSync(config.deploymentDir)) {
    fs.rmSync(config.deploymentDir, { recursive: true, force: true })
  }
  
  console.log('✅ Previous build cleaned')
}

function buildProduction() {
  console.log('🏗️  Building for production...')
  
  try {
    execSync('npm run build', { stdio: 'pipe' })
    console.log('✅ Production build completed')
  } catch (error) {
    console.error('❌ Build failed:', error.message)
    process.exit(1)
  }
}

function createDeploymentPackage() {
  console.log('📦 Creating deployment package...')
  
  // Create deployment directory
  fs.mkdirSync(config.deploymentDir, { recursive: true })
  
  // Copy all dist files
  const distFiles = fs.readdirSync(config.buildDir)
  distFiles.forEach(file => {
    const srcPath = path.join(config.buildDir, file)
    const destPath = path.join(config.deploymentDir, file)
    
    if (fs.statSync(srcPath).isDirectory()) {
      fs.cpSync(srcPath, destPath, { recursive: true })
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  })
  
  // Copy .htaccess file
  const htaccessContent = fs.readFileSync('deployment/bluehost-htaccess.txt', 'utf8')
  fs.writeFileSync(path.join(config.deploymentDir, '.htaccess'), htaccessContent)
  
  console.log('✅ Deployment package created')
}

function createDeploymentInstructions() {
  console.log('📋 Creating deployment instructions...')
  
  const instructions = `FieldFlow Bluehost Deployment Instructions
==========================================

DEPLOYMENT READY! 🎉

📁 UPLOAD LOCATION:
Upload all files in this folder to: /public_html/${config.subdomain}/

🌐 SUBDOMAIN SETUP:
1. Bluehost cPanel → Subdomains
2. Create: ${config.subdomain}.${config.domain}
3. Document Root: /public_html/${config.subdomain}/

📂 FILE UPLOAD:
Method 1 - File Manager:
- cPanel → File Manager
- Navigate to /public_html/${config.subdomain}/
- Upload and extract fieldflow-production-deploy.zip

Method 2 - FTP:
- Host: ${config.domain}
- Upload all files to /public_html/${config.subdomain}/

🔒 IMPORTANT FILES:
- .htaccess (enables SPA routing) ✅ INCLUDED
- index.html (main app file) ✅ INCLUDED  
- assets/ folder (CSS/JS files) ✅ INCLUDED

🧪 TESTING:
1. Visit: https://${config.subdomain}.${config.domain}
2. Should show FieldFlow login page
3. Test user registration/login
4. Verify mobile functionality

⚙️ PRODUCTION SETTINGS:
- Real Supabase authentication (no test mode)
- Offline PWA capabilities enabled
- Performance monitoring active
- Mobile-optimized interface

🆘 SUPPORT:
- Bluehost: 24/7 support chat
- FieldFlow: support@aximsystems.com

Generated: ${new Date().toLocaleString()}
Build Version: 2.0.0
`

  fs.writeFileSync(path.join(config.deploymentDir, 'DEPLOYMENT_INSTRUCTIONS.txt'), instructions)
  console.log('✅ Deployment instructions created')
}

function createZipPackage() {
  console.log('🗜️  Creating ZIP package...')
  
  try {
    execSync(`cd ${config.deploymentDir} && zip -r ../fieldflow-production-deploy.zip . -x "*.DS_Store"`, { stdio: 'pipe' })
    console.log('✅ ZIP package created: fieldflow-production-deploy.zip')
  } catch (error) {
    console.log('⚠️  ZIP creation failed, use folder contents instead')
  }
}

function displaySummary() {
  console.log('')
  console.log('🎉 DEPLOYMENT READY!')
  console.log('===================')
  console.log(`📁 Deployment files: ./${config.deploymentDir}/`)
  console.log(`📦 ZIP package: ./fieldflow-production-deploy.zip`)
  console.log(`🌐 Target URL: https://${config.subdomain}.${config.domain}`)
  console.log('')
  console.log('📋 NEXT STEPS:')
  console.log('1. Create subdomain in Bluehost cPanel')
  console.log('2. Upload deployment files to /public_html/fieldflow/')
  console.log('3. Test the deployment')
  console.log('')
  console.log('✨ Features Enabled:')
  console.log('  • Real Supabase authentication')
  console.log('  • Offline PWA capabilities')  
  console.log('  • Mobile-responsive design')
  console.log('  • Advanced project management')
  console.log('  • Time tracking & daily logs')
  console.log('  • Document management')
  console.log('  • Team collaboration')
  console.log('')
  console.log('🆘 Need help? Contact support@aximsystems.com')
}

// Run the build process
async function main() {
  try {
    createProductionEnv()
    cleanPreviousBuild()
    buildProduction()
    createDeploymentPackage()
    createDeploymentInstructions()
    createZipPackage()
    displaySummary()
  } catch (error) {
    console.error('❌ Deployment preparation failed:', error.message)
    process.exit(1)
  }
}

main()