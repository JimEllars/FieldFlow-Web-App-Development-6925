# Supabase Authentication Configuration for Production

## 🔐 **Update Supabase Auth Settings**

### **Step 1: Access Supabase Dashboard**
1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your FieldFlow project

### **Step 2: Configure Authentication**

1. **Go to Authentication → Settings**

2. **Site URL Configuration:**
   ```
   Site URL: https://fieldflow.yourdomain.com
   ```

3. **Redirect URLs (Add these):**
   ```
   https://fieldflow.yourdomain.com/auth/callback
   https://fieldflow.yourdomain.com/auth/login
   https://fieldflow.yourdomain.com/app/dashboard
   http://localhost:3000 (keep for development)
   ```

4. **Email Templates (Optional):**
   - Customize confirmation and recovery email templates
   - Update links to use your domain

### **Step 3: Database Configuration**

1. **Go to SQL Editor**
2. **Run this query to update any hardcoded URLs:**
   ```sql
   -- Update any stored URLs if they exist
   UPDATE auth.users 
   SET raw_app_meta_data = jsonb_set(
     COALESCE(raw_app_meta_data, '{}'), 
     '{app_url}', 
     '"https://fieldflow.yourdomain.com"'
   );
   ```

### **Step 4: Security Settings**

1. **JWT Settings:**
   - JWT expiry: 3600 seconds (1 hour) recommended
   - Refresh token expiry: 604800 seconds (7 days)

2. **Rate Limiting:**
   - Enable rate limiting for auth endpoints
   - Max requests per hour: 100 (adjust as needed)

3. **Password Policy:**
   - Minimum length: 6 characters
   - Require special characters: Optional
   - Require numbers: Optional

---

## 🔧 **Environment Variables Update**

### **Update Your .env.production:**
```env
# Replace with your actual domain
VITE_APP_BASE_URL=https://fieldflow.yourdomain.com

# Ensure test mode is disabled for production
VITE_TEST_MODE=false

# Your actual Supabase credentials
VITE_SUPABASE_URL=https://pehaktnlutpofluqcele.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## ✅ **Verification Steps**

### **Test Authentication Flow:**
1. Visit your deployed app
2. Click "Sign up" 
3. Register with a real email address
4. Check email for confirmation (if enabled)
5. Login with new credentials
6. Verify all app features work

### **Test Features:**
- [ ] User registration/login
- [ ] Project creation and management  
- [ ] Task management
- [ ] Daily logs
- [ ] Time tracking
- [ ] Document upload
- [ ] Mobile responsiveness
- [ ] Offline functionality

---

## 🚨 **Common Issues & Solutions**

### **Issue: Redirect Loop**
**Solution:** Check Site URL matches exactly:
- ✅ Correct: `https://fieldflow.yourdomain.com`
- ❌ Wrong: `https://fieldflow.yourdomain.com/`

### **Issue: CORS Errors**
**Solution:** Add your domain to Supabase CORS settings

### **Issue: Email Confirmation Not Working**
**Solution:** 
1. Check email template URLs
2. Update confirmation URL in Supabase
3. Test with a real email address

### **Issue: Database Permission Errors**
**Solution:** Verify RLS policies are properly configured for your tables

---

## 📊 **Monitoring Production**

### **Supabase Dashboard Monitoring:**
- Authentication → Users (track registrations)
- Database → Logs (monitor queries)
- Storage → Usage (track file uploads)
- Settings → API (monitor usage limits)

### **Application Monitoring:**
- Browser dev tools for JavaScript errors
- Network tab for failed requests
- Application tab for service worker status
- Performance tab for loading metrics