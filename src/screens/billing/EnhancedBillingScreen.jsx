import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { SUBSCRIPTION_PLANS, getCustomerPortalUrl } from '../../lib/stripe'
import { format } from 'date-fns'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../components/common/SafeIcon'

const { FiCreditCard, FiCheckCircle, FiDownload, FiChevronRight, FiAlertCircle, FiStar, FiUsers, FiHardDrive, FiShield, FiZap } = FiIcons

const EnhancedBillingScreen = () => {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [companyData, setCompanyData] = useState(null)
  const [subscriptionData, setSubscriptionData] = useState(null)

  // Only admin users can access billing
  if (user?.role !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="card text-center py-12">
          <SafeIcon icon={FiShield} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Access Restricted
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Only company administrators can access billing information.
          </p>
        </div>
      </div>
    )
  }

  useEffect(() => {
    if (user?.company_id) {
      loadBillingData()
    }
  }, [user?.company_id])

  const loadBillingData = async () => {
    try {
      setLoading(true)
      setError('')
      
      // In production, these would be real API calls
      // For now, using mock data based on user information
      const mockCompanyData = {
        id: user.company_id,
        name: user.company || 'Your Company',
        stripe_customer_id: 'cus_mock123',
        subscription_status: 'active',
        plan_id: 'admin_plan',
        seats_used: 3,
        seats_total: 5,
        storage_used_gb: 12.5,
        storage_total_gb: 35, // 25 base + (2 additional users × 5GB)
        billing_cycle: 'monthly',
        next_billing_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }

      const mockSubscriptionData = {
        current_period_start: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000).toISOString(),
        current_period_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        cancel_at_period_end: false,
        trial_end: null
      }

      setCompanyData(mockCompanyData)
      setSubscriptionData(mockSubscriptionData)
    } catch (err) {
      console.error('Error loading billing data:', err)
      setError('Failed to load billing information')
    } finally {
      setLoading(false)
    }
  }

  const handleManageSubscription = async () => {
    try {
      setLoading(true)
      
      if (companyData?.stripe_customer_id) {
        const portalUrl = await getCustomerPortalUrl(companyData.stripe_customer_id)
        window.open(portalUrl, '_blank')
      } else {
        setError('No billing account found. Please contact support.')
      }
    } catch (err) {
      console.error('Error opening customer portal:', err)
      setError('Failed to open billing portal')
    } finally {
      setLoading(false)
    }
  }

  const calculateMonthlyCost = () => {
    if (!companyData) return 0
    
    const adminPlan = SUBSCRIPTION_PLANS.admin_plan.price
    const additionalUsers = Math.max(0, companyData.seats_used - 1) // Admin is included
    const additionalUserCost = additionalUsers * SUBSCRIPTION_PLANS.sub_account_plan.price
    
    return adminPlan + additionalUserCost
  }

  const getStoragePercentage = () => {
    if (!companyData) return 0
    return Math.round((companyData.storage_used_gb / companyData.storage_total_gb) * 100)
  }

  if (loading && !companyData) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-gray-200 dark:border-gray-700 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Loading billing information...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
        Billing & Subscription
      </h1>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Current Subscription Overview */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Current Subscription
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">
                  Professional Plan
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {companyData?.billing_cycle === 'monthly' ? 'Monthly billing' : 'Annual billing'}
                </p>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                Active
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Monthly Cost</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  ${calculateMonthlyCost().toFixed(2)}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Next Billing</span>
                <span className="text-gray-900 dark:text-gray-100">
                  {companyData?.next_billing_date && format(new Date(companyData.next_billing_date), 'MMM d, yyyy')}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Active Users</span>
                <span className="text-gray-900 dark:text-gray-100">
                  {companyData?.seats_used || 0} of {companyData?.seats_total || 0}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
              Storage Usage
            </h4>
            
            <div className="mb-2">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">
                  {companyData?.storage_used_gb?.toFixed(1) || 0} GB used
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {companyData?.storage_total_gb || 0} GB total
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    getStoragePercentage() > 90 ? 'bg-red-500' : 
                    getStoragePercentage() > 75 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(getStoragePercentage(), 100)}%` }}
                />
              </div>
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {getStoragePercentage()}% of storage used
            </p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleManageSubscription}
            disabled={loading}
            className="btn-primary py-2 px-4 flex items-center"
          >
            <SafeIcon icon={FiCreditCard} className="w-4 h-4 mr-2" />
            {loading ? 'Loading...' : 'Manage Subscription'}
          </button>
        </div>
      </div>

      {/* Usage Breakdown */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Usage Breakdown
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <SafeIcon icon={FiUsers} className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {companyData?.seats_used || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Active Users</div>
            <div className="text-xs text-gray-500 mt-1">
              ${SUBSCRIPTION_PLANS.admin_plan.price} admin + ${((companyData?.seats_used || 1) - 1) * SUBSCRIPTION_PLANS.sub_account_plan.price} users
            </div>
          </div>

          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <SafeIcon icon={FiHardDrive} className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {companyData?.storage_total_gb || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">GB Storage</div>
            <div className="text-xs text-gray-500 mt-1">
              25 GB base + {((companyData?.seats_used || 1) - 1) * 5} GB users
            </div>
          </div>

          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <SafeIcon icon={FiZap} className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Unlimited
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Projects</div>
            <div className="text-xs text-gray-500 mt-1">
              No project limits
            </div>
          </div>
        </div>
      </div>

      {/* Plan Features */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Your Plan Includes
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SUBSCRIPTION_PLANS.admin_plan.features.map((feature, index) => (
            <div key={index} className="flex items-center">
              <SafeIcon icon={FiCheckCircle} className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Billing History */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Recent Invoices
        </h2>
        
        <div className="space-y-3">
          {/* Mock invoice data */}
          {[
            { id: 'INV-2024-001', date: '2024-01-01', amount: calculateMonthlyCost(), status: 'paid' },
            { id: 'INV-2023-012', date: '2023-12-01', amount: calculateMonthlyCost(), status: 'paid' },
            { id: 'INV-2023-011', date: '2023-11-01', amount: calculateMonthlyCost(), status: 'paid' }
          ].map((invoice) => (
            <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {invoice.id}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {format(new Date(invoice.date), 'MMMM d, yyyy')}
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    ${invoice.amount.toFixed(2)}
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    {invoice.status}
                  </span>
                </div>
                <button className="text-primary-600 hover:text-primary-500 dark:text-primary-400">
                  <SafeIcon icon={FiDownload} className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Support Section */}
      <div className="card bg-gray-50 dark:bg-gray-800">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <SafeIcon icon={FiAlertCircle} className="h-6 w-6 text-gray-600 dark:text-gray-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">
              Need help with billing?
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              If you have questions about your subscription, usage, or need to make changes to your account, our support team is here to help.
            </p>
            <div className="mt-3">
              <a
                href="mailto:billing@aximsystems.com"
                className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
              >
                Contact Billing Support
                <SafeIcon icon={FiChevronRight} className="ml-1 w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnhancedBillingScreen