// Stripe configuration with fallback for build environment
let stripePromise = null

// Lazy load Stripe to avoid build issues
export const getStripe = async () => {
  if (!stripePromise) {
    try {
      const { loadStripe } = await import('@stripe/stripe-js')
      const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_demo_key'
      stripePromise = loadStripe(publishableKey)
    } catch (error) {
      console.warn('Stripe not available:', error)
      return null
    }
  }
  return stripePromise
}

// Stripe configuration
export const STRIPE_CONFIG = {
  publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_demo_key',
  webhookSecret: import.meta.env.VITE_STRIPE_WEBHOOK_SECRET || 'whsec_demo_secret',
  baseUrl: import.meta.env.VITE_APP_BASE_URL || 'http://localhost:3000'
}

// Subscription plans configuration
export const SUBSCRIPTION_PLANS = {
  admin_plan: {
    id: 'admin_plan',
    name: 'Admin Plan',
    price: 49.99,
    currency: 'usd',
    interval: 'month',
    features: [
      'Full admin access',
      '25 GB base storage',
      'Unlimited projects',
      'Advanced reporting',
      'Priority support'
    ],
    maxSubAccounts: 10
  },
  sub_account_plan: {
    id: 'sub_account_plan',
    name: 'Additional User',
    price: 19.99,
    currency: 'usd',
    interval: 'month',
    features: [
      'Field user access',
      '+5 GB storage per user',
      'Mobile app access',
      'Time tracking',
      'Photo uploads'
    ]
  }
}

// Mock API helpers for development/demo
export const createCustomer = async (email, name, companyId) => {
  try {
    // In development, return mock data
    if (import.meta.env.DEV || !import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
      return {
        id: `cus_mock_${Date.now()}`,
        email,
        name,
        metadata: { company_id: companyId }
      }
    }

    const response = await fetch('/api/stripe/create-customer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        name,
        metadata: {
          company_id: companyId
        }
      })
    })
    
    if (!response.ok) {
      throw new Error('Failed to create customer')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error creating Stripe customer:', error)
    throw error
  }
}

export const createSubscription = async (customerId, priceId, quantity = 1) => {
  try {
    // In development, return mock data
    if (import.meta.env.DEV || !import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
      return {
        id: `sub_mock_${Date.now()}`,
        customer: customerId,
        status: 'active',
        current_period_start: Date.now() / 1000,
        current_period_end: (Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000
      }
    }

    const response = await fetch('/api/stripe/create-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer_id: customerId,
        price_id: priceId,
        quantity
      })
    })
    
    if (!response.ok) {
      throw new Error('Failed to create subscription')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error creating subscription:', error)
    throw error
  }
}

export const getCustomerPortalUrl = async (customerId) => {
  try {
    // In development, return demo URL
    if (import.meta.env.DEV || !import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
      return 'https://billing.stripe.com/p/login/demo'
    }

    const response = await fetch('/api/stripe/customer-portal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer_id: customerId,
        return_url: window.location.origin + '/app/billing'
      })
    })
    
    if (!response.ok) {
      throw new Error('Failed to get customer portal URL')
    }
    
    const { url } = await response.json()
    return url
  } catch (error) {
    console.error('Error getting customer portal URL:', error)
    throw error
  }
}

export default getStripe