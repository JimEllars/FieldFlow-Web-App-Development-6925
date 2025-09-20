# Bluehost Setup Guide for ForemanOS

## 🌐 **Subdomain Creation**

### **Step 1: Access Bluehost cPanel**
1. Log into your Bluehost account
2. Click "Advanced" → "cPanel"
3. Look for "Subdomains" in the "Domains" section

### **Step 2: Create Subdomain**
1. **Subdomain:** `foremanos`
2. **Domain:** Select your main domain
3. **Document Root:** Leave as auto-generated (`public_html/foremanos`)
4. Click "Create"

**Result:** Your subdomain will be `foremanos.yourdomain.com`

---

## 📁 **File Upload Methods**

### **Method 1: File Manager (Easiest)**
1. cPanel → "File Manager"
2. Navigate to `public_html/foremanos/`
3. Delete any default files
4. Upload `foremanos-production-deploy.zip`
5. Right-click ZIP → "Extract"
6. Delete the ZIP file after extraction

### **Method 2: FTP/SFTP**
```
Host: yourdomain.com
Username: your_cpanel_username  
Password: your_cpanel_password
Port: 21 (FTP) or 22 (SFTP)
Directory: /public_html/foremanos/
```

---

## ⚙️ **Post-Upload Configuration**

### **1. Verify File Structure**
Your `/public_html/foremanos/` should contain:
```
index.html
assets/
  - index-[hash].js
  - index-[hash].css
foremanos-icon.svg
manifest.json
sw.js
.htaccess
```

### **2. Set File Permissions**
- **Folders:** 755 (rwxr-xr-x)
- **Files:** 644 (rw-r--r--)
- **.htaccess:** 644 (rw-r--r--)

### **3. Test Deployment**
1. Visit `https://foremanos.yourdomain.com`
2. Should show ForemanOS login page
3. Test registration and login
4. Verify mobile responsiveness

---

## 🔐 **SSL Certificate Setup**

### **Enable SSL for Subdomain**
1. cPanel → "SSL/TLS"
2. "Manage SSL sites"
3. Find your subdomain
4. Click "Browse Certificates"
5. Select "Use a certificate on the server"
6. Save

**Bluehost usually auto-provisions SSL certificates for subdomains.**

---

## 🚨 **Troubleshooting**

### **Common Issues:**

**1. 404 Error on Refresh**
- ✅ **Fix:** Ensure `.htaccess` file is uploaded and contains SPA routing rules
- Check file permissions: `.htaccess` should be 644

**2. Assets Not Loading**
- ✅ **Fix:** Check file paths in browser dev tools
- Ensure all files from `dist/assets/` are uploaded

**3. Blank Page**
- ✅ **Fix:** Check browser console for errors
- Verify Supabase credentials in `.env.production`

**4. Authentication Issues**
- ✅ **Fix:** Update Supabase Auth settings:
  - Add your subdomain to "Site URL"
  - Add to "Redirect URLs"

### **Performance Optimization**
1. **Enable Gzip Compression** (usually enabled by default on Bluehost)
2. **Check Page Speed:** Use Google PageSpeed Insights
3. **Monitor Loading:** Check Network tab in browser dev tools

---

## 📊 **Monitoring & Maintenance**

### **Regular Checks:**
- ✅ SSL certificate renewal (auto on Bluehost)
- ✅ Supabase database usage
- ✅ Application performance
- ✅ User feedback and bug reports

### **Updates:**
1. Build new version locally
2. Upload new `dist/` contents
3. Clear browser cache for testing

---

## 🎯 **Production Checklist**

### **Before Go-Live:**
- [ ] Subdomain created and accessible
- [ ] All files uploaded correctly
- [ ] .htaccess configured for SPA routing
- [ ] SSL certificate active
- [ ] Test authentication flow
- [ ] Test mobile responsiveness
- [ ] Verify offline functionality
- [ ] Check browser console for errors

### **After Go-Live:**
- [ ] Monitor application performance
- [ ] Check Supabase usage metrics
- [ ] Gather user feedback
- [ ] Document any custom configurations

---

## 📞 **Support**

**Technical Issues:**
- Bluehost Support: 24/7 chat/phone
- ForemanOS Support: support@aximsystems.com

**Resources:**
- Bluehost Knowledge Base: help.bluehost.com
- React Deployment Guide: create-react-app.dev/docs/deployment