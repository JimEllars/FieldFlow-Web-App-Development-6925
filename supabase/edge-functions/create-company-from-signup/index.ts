import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SignupData {
  email: string
  name: string
  company: string
  plan_id?: string
  stripe_customer_id?: string
  trial_days?: number
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify the request is from your website/PLG OS
    const authHeader = req.headers.get('Authorization')
    const apiKey = req.headers.get('X-API-Key')
    
    // In production, validate the API key against your secure webhook secret
    if (!apiKey || apiKey !== Deno.env.get('WEBHOOK_SECRET')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const signupData: SignupData = await req.json()
    
    // Validate required fields
    if (!signupData.email || !signupData.name || !signupData.company) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields: email, name, company' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create the company first
    const { data: company, error: companyError } = await supabase
      .from('companies_ff2024')
      .insert({
        name: signupData.company,
        subscription_status: 'trial',
        plan_id: signupData.plan_id || 'admin_plan',
        stripe_customer_id: signupData.stripe_customer_id,
        seats_used: 1,
        seats_total: 1,
        storage_limit_bytes: 26843545600, // 25 GB
        trial_ends_at: new Date(Date.now() + (signupData.trial_days || 14) * 24 * 60 * 60 * 1000)
      })
      .select()
      .single()

    if (companyError) {
      console.error('Error creating company:', companyError)
      return new Response(
        JSON.stringify({ error: 'Failed to create company' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create the user account
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: signupData.email,
      email_confirm: true, // Auto-confirm email for smooth onboarding
      user_metadata: {
        name: signupData.name,
        company: signupData.company,
        company_id: company.id
      }
    })

    if (authError) {
      console.error('Error creating user:', authError)
      
      // Cleanup: delete the company if user creation failed
      await supabase
        .from('companies_ff2024')
        .delete()
        .eq('id', company.id)

      return new Response(
        JSON.stringify({ error: 'Failed to create user account' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create the admin profile (this should be handled by the trigger, but let's ensure it)
    const { error: profileError } = await supabase
      .from('profiles_ff2024')
      .upsert({
        id: authUser.user.id,
        company_id: company.id,
        name: signupData.name,
        email: signupData.email,
        role: 'admin'
      })

    if (profileError) {
      console.error('Error creating profile:', profileError)
      // Don't fail the entire process for this, as the trigger should handle it
    }

    // Create subscription record if Stripe customer ID provided
    if (signupData.stripe_customer_id) {
      const { error: subscriptionError } = await supabase
        .from('subscriptions_ff2024')
        .insert({
          company_id: company.id,
          stripe_subscription_id: null, // Will be updated when subscription is created
          status: 'trialing',
          trial_start: new Date().toISOString(),
          trial_end: new Date(Date.now() + (signupData.trial_days || 14) * 24 * 60 * 60 * 1000).toISOString()
        })

      if (subscriptionError) {
        console.error('Error creating subscription record:', subscriptionError)
        // Don't fail for this either, can be created later
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        company_id: company.id,
        user_id: authUser.user.id,
        message: 'Company and user account created successfully'
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})