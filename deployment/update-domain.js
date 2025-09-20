#!/usr/bin/env node

/**
 * Update domain configuration for production deployment
 * Run this script to update domain-specific settings
 */

const fs = require('fs')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(prompt) {
  return new Promise(resolve => {
    rl.question(prompt, resolve)
  })
}

async function updateDomainConfig() {
  console.log('🔧 ForemanOS Domain Configuration')
  console.log('=================================')
  
  // Get domain information
  const domain = await question('Enter your main domain (e.g., mycompany.com): ')
  const subdomain = await question('Enter subdomain name [foremanos]: ') || 'foremanos'
  
  const fullDomain = `${subdomain}.${domain}`
  
  console.log(`\n✅ Configuration:`)
  console.log(`   Full URL: https://${fullDomain}`)
  console.log(`   Upload Path: /public_html/${subdomain}/`)
  
  // Update production environment
  const productionEnv = `# Production Environment - Updated ${new Date().toISOString()}
VITE_TEST_MODE=false
VITE_SUPABASE_URL=https://pehaktnlutpofluqcele.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlaGFrdG5sdXRwb2ZsdXFjZWxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNzU4MDksImV4cCI6MjA3MTY1MTgwOX0.z_e7IsTMytAVO9YPVVJURY6qw3w_--DHy9hmMAWZNco

VITE_APP_NAME=ForemanOS
VITE_APP_VERSION=2.0.0
VITE_APP_BASE_URL=https://${fullDomain}

# Production Features
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
  
  // Update build script
  const buildScript = fs.readFileSync('deployment/build-and-deploy.sh', 'utf8')
  const updatedBuildScript = buildScript.replace(
    /yourdomain\.com/g, 
    domain
  ).replace(
    /foremanos\.yourdomain\.com/g,
    fullDomain
  )
  
  fs.writeFileSync('deployment/build-and-deploy.sh', updatedBuildScript)
  
  console.log('\n✅ Configuration updated!')
  console.log('\n📋 Next Steps:')
  console.log('1. Run: npm run build')
  console.log(`2. Create subdomain: ${fullDomain}`)
  console.log(`3. Upload dist/ contents to: /public_html/${subdomain}/`)
  console.log('4. Upload .htaccess file')
  console.log(`5. Visit: https://${fullDomain}`)
  
  rl.close()
}

updateDomainConfig().catch(console.error)