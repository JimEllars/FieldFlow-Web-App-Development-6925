#!/bin/bash

# ForemanOS Production Build and Deploy Script
# Run this script to build and prepare for Bluehost deployment

echo "🚀 ForemanOS Production Deployment Script"
echo "========================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed  
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --silent

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Create production environment file
echo "🔧 Setting up production environment..."
cat > .env.production << EOL
VITE_TEST_MODE=false
VITE_SUPABASE_URL=https://pehaktnlutpofluqcele.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlaGFrdG5sdXRwb2ZsdXFjZWxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNzU4MDksImV4cCI6MjA3MTY1MTgwOX0.z_e7IsTMytAVO9YPVVJURY6qw3w_--DHy9hmMAWZNco
VITE_APP_NAME=ForemanOS
VITE_APP_VERSION=2.0.0
VITE_APP_BASE_URL=https://foremanos.yourdomain.com
VITE_ENABLE_OFFLINE_MODE=true
VITE_ENABLE_PERFORMANCE_MONITORING=true
VITE_DEBUG_MODE=false
EOL

echo "✅ Production environment configured"

# Build for production
echo "🏗️  Building for production..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Production build completed successfully"

# Create deployment package
echo "📦 Creating deployment package..."
mkdir -p deployment-package
cp -r dist/* deployment-package/
cp deployment/bluehost-htaccess.txt deployment-package/.htaccess

# Create deployment instructions
cat > deployment-package/DEPLOYMENT_INSTRUCTIONS.txt << EOL
ForemanOS Deployment Instructions for Bluehost
==============================================

1. Create subdomain in Bluehost cPanel:
   - Subdomain: foremanos
   - Document Root: public_html/foremanos

2. Upload all files in this folder to: /public_html/foremanos/
   
3. Ensure .htaccess file is uploaded and visible

4. Update your domain in the following files if needed:
   - Update VITE_APP_BASE_URL in build process

5. Test the deployment:
   - Visit: https://foremanos.yourdomain.com
   - Should show ForemanOS login page

6. Default login credentials:
   - Any email/password (since VITE_TEST_MODE=false, use real Supabase auth)
   - Or create account through registration

For support: support@aximsystems.com
EOL

# Create ZIP file for easy upload
if command -v zip &> /dev/null; then
    cd deployment-package
    zip -r ../foremanos-production-deploy.zip . -x "*.DS_Store" "*.git*"
    cd ..
    echo "✅ Created foremanos-production-deploy.zip"
else
    echo "⚠️  ZIP not available, use deployment-package folder contents"
fi

echo ""
echo "🎉 DEPLOYMENT READY!"
echo "==================="
echo "📁 Files ready in: ./deployment-package/"
echo "📦 ZIP package: ./foremanos-production-deploy.zip"
echo ""
echo "📋 Next Steps:"
echo "1. Create subdomain 'foremanos' in Bluehost cPanel"
echo "2. Upload deployment-package contents to /public_html/foremanos/"
echo "3. Ensure .htaccess file is properly uploaded"
echo "4. Visit https://foremanos.yourdomain.com"
echo ""
echo "🔧 Production Features:"
echo "✅ Real Supabase authentication (VITE_TEST_MODE=false)"
echo "✅ Offline-first PWA capabilities"
echo "✅ Mobile-responsive design"
echo "✅ Advanced caching and compression"
echo "✅ SEO-friendly routing with .htaccess"
echo ""