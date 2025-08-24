import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../components/common/SafeIcon'

const { 
  FiCreditCard, FiCheckCircle, FiDownload,
  FiChevronRight, FiAlertCircle, FiStar
} = FiIcons

const BillingScreen = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  
  // Mock billing data
  const subscription = user?.subscription || {
    plan: 'professional',
    status: 'active',
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  }
  
  const paymentMethod = {
    type: 'card',
    brand: 'Visa',
    last4: '4242',
    expMonth: 12,
    expYear: 2025
  }
  
  const invoices = [
    {
      id: 'INV-001',
      date: '2024-04-01',
      amount: 49.99,
      status: 'paid',
      description: 'Professional Plan - Monthly'
    },
    {
      id: 'INV-002',
      date: '2024-03-01',
      amount: 49.99,
      status: 'paid',
      description: 'Professional Plan - Monthly'
    },
    {
      id: 'INV-003',
      date: '2024-02-01',
      amount: 49.99,
      status: 'paid',
      description: 'Professional Plan - Monthly'
    }
  ]
  
  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: 29.99,
      features: [
        '3 Active Projects',
        'Unlimited Tasks',
        'Basic Reporting',
        'Mobile App Access'
      ]
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 49.99,
      features: [
        'Unlimited Projects',
        'Advanced Reporting',
        'Document Management',
        'Time Tracking',
        'QuickBooks Integration'
      ],
      current: subscription.plan === 'professional'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 99.99,
      features: [
        'Everything in Professional',
        'Priority Support',
        'Custom Branding',
        'API Access',
        'Advanced Security Features'
      ]
    }
  ]
  
  const handleChangePlan = (planId) => {
    setLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      alert(`Plan would be changed to ${planId} in a real application`)
    }, 1000)
  }
  
  const handleUpdatePayment = () => {
    setLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      alert('Payment method would be updated in a real application')
    }, 1000)
  }
  
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }
  
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
        Billing & Subscription
      </h1>
      
      {/* Current Plan */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Current Plan
        </h2>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center">
              <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">
                {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} Plan
              </h3>
              <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                subscription.status === 'active'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  : subscription.status === 'trial'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
              }`}>
                {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
              </span>
            </div>
            
            {subscription.expiresAt && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {subscription.status === 'trial'
                  ? `Trial expires on ${formatDate(subscription.expiresAt)}`
                  : `Next billing date: ${formatDate(subscription.expiresAt)}`
                }
              </p>
            )}
          </div>
          
          <button
            onClick={() => {}}
            className="btn-primary py-2 px-4"
          >
            Manage Subscription
          </button>
        </div>
      </div>
      
      {/* Payment Method */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Payment Method
        </h2>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-500 rounded-md flex items-center justify-center mr-3">
              <SafeIcon icon={FiCreditCard} className="w-6 h-6 text-white" />
            </div>
            
            <div>
              <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">
                {paymentMethod.brand} •••• {paymentMethod.last4}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Expires {paymentMethod.expMonth}/{paymentMethod.expYear}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleUpdatePayment}
            disabled={loading}
            className="btn-secondary py-2 px-4"
          >
            {loading ? 'Processing...' : 'Update Payment Method'}
          </button>
        </div>
      </div>
      
      {/* Available Plans */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Available Plans
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div 
              key={plan.id} 
              className={`border rounded-lg p-4 ${
                plan.current
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {plan.name}
                  </h3>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
                    ${plan.price}
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-normal">
                      /month
                    </span>
                  </p>
                </div>
                
                {plan.current && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300">
                    Current
                  </span>
                )}
              </div>
              
              <ul className="space-y-2 mb-4">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <SafeIcon 
                      icon={FiCheckCircle} 
                      className={`w-5 h-5 mr-2 ${
                        plan.current
                          ? 'text-primary-600 dark:text-primary-400'
                          : 'text-green-600 dark:text-green-400'
                      }`} 
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              
              <button
                onClick={() => handleChangePlan(plan.id)}
                disabled={plan.current || loading}
                className={`w-full py-2 px-4 rounded-lg text-center ${
                  plan.current
                    ? 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 cursor-not-allowed'
                    : 'btn-primary'
                }`}
              >
                {plan.current ? 'Current Plan' : 'Select Plan'}
              </button>
            </div>
          ))}
        </div>
        
        <div className="mt-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <SafeIcon icon={FiStar} className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                Need a custom plan?
              </h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                <p>
                  Contact our sales team for custom enterprise solutions and special pricing.
                </p>
              </div>
              <div className="mt-3">
                <a
                  href="#"
                  className="text-sm font-medium text-blue-700 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300"
                >
                  Contact Sales <span aria-hidden="true">&rarr;</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Billing History */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Billing History
        </h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Invoice
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                    {invoice.id}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(invoice.date)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    ${invoice.amount.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      invoice.status === 'paid'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : invoice.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <button
                      className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                    >
                      <SafeIcon icon={FiDownload} className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Need Help */}
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
              If you have any questions about your subscription or need assistance with billing,
              our support team is here to help.
            </p>
            <div className="mt-3">
              <a
                href="#"
                className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
              >
                Contact Support
                <SafeIcon icon={FiChevronRight} className="ml-1 w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BillingScreen