# FieldFlow Bluehost Deployment Guide

## 🎯 **Deployment Overview**
Deploy FieldFlow as a static React app on Bluehost subdomain with production-ready configuration.

## 📋 **Pre-Deployment Checklist**

### **1. Bluehost Requirements**
- ✅ Bluehost hosting account with subdomain support
- ✅ File Manager or FTP/SFTP access
- ✅ Subdomain setup (e.g., `fieldflow.yourdomain.com`)

### **2. Build Requirements**
- ✅ Node.js 18+ installed locally
- ✅ Production environment variables configured
- ✅ Supabase project ready

---

## 🚀 **Step-by-Step Deployment**

### **Step 1: Prepare Production Build**

1. **Update Environment Variables**
   ```bash
   # Create .env.production
   VITE_TEST_MODE=false
   VITE_SUPABASE_URL=https://pehaktnlutpofluqcele.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   VITE_APP_BASE_URL=https://fieldflow.yourdomain.com
   ```

2. **Build for Production**
   ```bash
   npm run build
   ```
   This creates a `dist/` folder with all static files.

### **Step 2: Bluehost Subdomain Setup**

1. **Create Subdomain in Bluehost cPanel**
   - Login to Bluehost cPanel
   - Go to "Subdomains" 
   - Create: `fieldflow.yourdomain.com`
   - Document root: `/public_html/fieldflow/`

2. **Verify Subdomain Creation**
   - Subdomain should be accessible (showing default page)
   - Note the file path: `/public_html/fieldflow/`

### **Step 3: Upload Files to Bluehost**

**Option A: File Manager (Recommended)**
1. Open Bluehost cPanel → File Manager
2. Navigate to `/public_html/fieldflow/`
3. Delete default files (index.html, etc.)
4. Upload entire contents of `dist/` folder
5. Extract if uploaded as ZIP

**Option B: FTP/SFTP**
```bash
# Using FileZilla or similar FTP client
Host: yourdomain.com
Username: your_cpanel_username
Password: your_cpanel_password
Port: 21 (FTP) or 22 (SFTP)

# Upload all files from dist/ to /public_html/fieldflow/
```

### **Step 4: Configure for Single Page App (SPA)**

Create `.htaccess` file in `/public_html/fieldflow/`:

```apache
# FieldFlow SPA Configuration
RewriteEngine On

# Handle Angular and React Router
RewriteBase /

# Handle client-side routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Security Headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"

# Cache Control
<filesMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg)$">
    Header set Cache-Control "max-age=31536000, public, immutable"
</filesMatch>

<filesMatch "\.(html|json)$">
    Header set Cache-Control "max-age=0, no-cache, no-store, must-revalidate"
</filesMatch>

# Compression
<ifModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</ifModule>

# Error Pages
ErrorDocument 404 /index.html
```

---

## 🔧 **Production Configuration**

### **Update Environment for Production**