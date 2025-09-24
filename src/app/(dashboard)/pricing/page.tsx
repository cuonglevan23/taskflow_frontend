"use client";

import React, { useState, useEffect } from "react";
import { useThemeContext } from '@/providers/ThemeProvider';
import { useLanguageContext } from '@/providers/LanguageProvider';
import { useAuth } from '@/components/auth/AuthProvider';
import PricingService from '@/services/pricing/pricing';
import { Subscription, PaymentHistoryResponse, PlanType } from '@/types/pricing';
import { Crown, Star, Check, Zap, CreditCard, Calendar, AlertCircle, Loader2 } from "lucide-react";
import { toast } from 'react-hot-toast';

/* ===================== Main Page Component ===================== */
export default function PricingPage() {
  const { theme } = useThemeContext();
  const { messages } = useLanguageContext();
  const { user } = useAuth();

  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryResponse | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('MONTHLY');
  const [loading, setLoading] = useState(true);
  const [upgradeLoading, setUpgradeLoading] = useState(false);

  // Helper function to extract first name from full name
  const getFirstName = (fullName: string): string => {
    return fullName.split(' ')[0];
  };

  // Helper function to get translated text
  const t = (key: string, params?: Record<string, string>): string => {
    const keys = key.split('.');
    let value: any = messages;
    for (const k of keys) {
      value = value?.[k];
    }
    let result = value || key;

    if (params) {
      Object.keys(params).forEach(param => {
        result = result.replace(`{${param}}`, params[param]);
      });
    }

    return result;
  };

  // Pricing plans configuration
  const pricingPlans = [
    {
      id: 'MONTHLY' as PlanType,
      name: 'Monthly Plan',
      description: 'Perfect for getting started',
      price: 9.99,
      billing: '/month',
      savings: null,
      isPopular: false,
      features: [
        'Unlimited Tasks',
        'Basic Analytics',
        'Email Support',
        'Mobile App Access',
        '5GB Storage'
      ]
    },
    {
      id: 'QUARTERLY' as PlanType,
      name: 'Quarterly Plan',
      description: 'Best value for teams',
      price: 24.99,
      billing: '/3 months',
      savings: 'Save 17%',
      isPopular: true,
      features: [
        'Everything in Monthly',
        'Advanced Analytics',
        'Priority Support',
        'Team Collaboration',
        '25GB Storage',
        'Custom Integrations'
      ]
    },
    {
      id: 'YEARLY' as PlanType,
      name: 'Yearly Plan',
      description: 'Maximum savings',
      price: 89.99,
      billing: '/year',
      savings: 'Save 25%',
      isPopular: false,
      features: [
        'Everything in Quarterly',
        'Advanced Security',
        'Phone Support',
        'Custom Branding',
        '100GB Storage',
        'API Access'
      ]
    }
  ];

  // Load subscription data
  useEffect(() => {
    const loadSubscriptionData = async () => {
      try {
        setLoading(true);

        // Load current subscription
        const subscription = await PricingService.getCurrentSubscription();
        setCurrentSubscription(subscription);

        // Load payment history if user has subscription
        if (subscription) {
          const history = await PricingService.getPaymentHistory(0, 10);
          setPaymentHistory(history);
        }
      } catch (error: any) {
        console.error('Failed to load subscription data:', error);
        toast.error('Failed to load subscription data');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      loadSubscriptionData();
    }
  }, [user?.id]);

  // Handle plan upgrade
  const handleUpgrade = async (planType: PlanType) => {
    if (!user?.id) {
      toast.error('Please log in to upgrade');
      return;
    }

    try {
      setUpgradeLoading(true);

      const checkoutResponse = await PricingService.createCheckoutSession({
        planType,
        userId: parseInt(user.id) // Convert string to number
      });

      if (checkoutResponse.success && checkoutResponse.checkoutUrl) {
        // Redirect to Stripe checkout
        PricingService.redirectToCheckout(checkoutResponse.checkoutUrl);
      } else {
        throw new Error(checkoutResponse.message || 'Failed to create checkout session');
      }
    } catch (error: any) {
      console.error('Upgrade failed:', error);
      toast.error(error.message || 'Failed to upgrade plan');
    } finally {
      setUpgradeLoading(false);
    }
  };

  // Handle plan change for existing subscription
  const handlePlanChange = async (planType: PlanType) => {
    try {
      setUpgradeLoading(true);

      const updatedSubscription = await PricingService.updateSubscriptionPlan(planType);
      setCurrentSubscription(updatedSubscription);

      toast.success('Plan updated successfully!');
    } catch (error: any) {
      console.error('Plan change failed:', error);
      toast.error(error.message || 'Failed to update plan');
    } finally {
      setUpgradeLoading(false);
    }
  };

  // Handle subscription cancellation
  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) {
      return;
    }

    try {
      setUpgradeLoading(true);

      const result = await PricingService.cancelSubscription();

      if (result.success) {
        setCurrentSubscription(null);
        toast.success('Subscription cancelled successfully');
      }
    } catch (error: any) {
      console.error('Cancellation failed:', error);
      toast.error(error.message || 'Failed to cancel subscription');
    } finally {
      setUpgradeLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.background.primary }}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: theme.text.primary }} />
          <p style={{ color: theme.text.secondary }}>Loading pricing information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.background.primary }}>
      {/* Header Section */}
      <div
        className="relative py-20 px-6"
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
        }}
      >
        {/* Background decorations */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10">
            <Star className="w-16 h-16 text-white animate-pulse" />
          </div>
          <div className="absolute top-16 right-16">
            <Crown className="w-12 h-12 text-white animate-bounce" />
          </div>
          <div className="absolute bottom-10 left-20">
            <Zap className="w-10 h-10 text-white animate-pulse" />
          </div>
          <div className="absolute top-1/2 right-20">
            <Star className="w-8 h-8 text-white animate-ping" />
          </div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm shadow-xl">
              <Crown className="w-16 h-16 text-white drop-shadow-lg" />
            </div>
          </div>

          <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
            Choose Your Plan
          </h1>

          {user?.name && (
            <p className="text-white/95 text-xl font-medium mb-4">
              Welcome back, {getFirstName(user.name)}! 👋
            </p>
          )}

          <p className="text-white/90 text-xl max-w-2xl mx-auto leading-relaxed">
            Unlock the full potential of TaskFlow with premium features designed for productivity champions.
          </p>
        </div>
      </div>

      {/* Current Subscription Status */}
      {currentSubscription && (
        <div className="max-w-6xl mx-auto px-6 -mt-10 relative z-20">
          <div
            className="p-6 rounded-xl border shadow-lg"
            style={{
              backgroundColor: theme.background.secondary,
              borderColor: theme.status.success
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div
                  className="p-3 rounded-full"
                  style={{ backgroundColor: theme.status.success }}
                >
                  <Check className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold" style={{ color: theme.text.primary }}>
                    Active Subscription - {currentSubscription.planType} Plan
                  </h3>
                  <p style={{ color: theme.text.secondary }}>
                    ${currentSubscription.amount}/month • Renews on {new Date(currentSubscription.currentPeriodEnd).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCancelSubscription}
                disabled={upgradeLoading}
                className="px-4 py-2 rounded-lg border border-red-500 text-red-500 hover:bg-red-50 transition-colors"
              >
                Cancel Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Plans */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative p-8 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                plan.isPopular ? 'border-blue-500 shadow-2xl' : 'border-gray-200 shadow-lg'
              }`}
              style={{
                backgroundColor: plan.isPopular
                  ? 'linear-gradient(135deg, #667eea10, #764ba210)'
                  : theme.background.secondary,
                borderColor: plan.isPopular ? '#3B82F6' : theme.border.default
              }}
            >
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-orange-400 to-pink-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                    🔥 Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2" style={{ color: theme.text.primary }}>
                  {plan.name}
                </h3>
                <p className="text-sm opacity-80 mb-6" style={{ color: theme.text.secondary }}>
                  {plan.description}
                </p>

                <div className="mb-4">
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-bold" style={{ color: theme.text.primary }}>
                      ${plan.price}
                    </span>
                    <span className="text-lg ml-2" style={{ color: theme.text.secondary }}>
                      {plan.billing}
                    </span>
                  </div>
                  {plan.savings && (
                    <p className="text-green-600 font-bold text-sm mt-2 bg-green-100 px-3 py-1 rounded-full inline-block">
                      💰 {plan.savings}
                    </p>
                  )}
                </div>
              </div>

              {/* Features List */}
              <div className="mb-8">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <div
                        className="p-1 rounded-full flex-shrink-0"
                        style={{ backgroundColor: theme.status.success }}
                      >
                        <Check className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm" style={{ color: theme.text.primary }}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <button
                onClick={() =>
                  currentSubscription
                    ? handlePlanChange(plan.id)
                    : handleUpgrade(plan.id)
                }
                disabled={upgradeLoading || currentSubscription?.planType === plan.id}
                className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl ${
                  currentSubscription?.planType === plan.id
                    ? 'bg-green-500 text-white cursor-default'
                    : ''
                }`}
                style={{
                  background: currentSubscription?.planType === plan.id
                    ? theme.status.success
                    : "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
                  color: 'white'
                }}
              >
                {upgradeLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : currentSubscription?.planType === plan.id ? (
                  'Current Plan'
                ) : currentSubscription ? (
                  'Switch to This Plan'
                ) : (
                  `Upgrade to ${plan.name}`
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Payment History */}
      {paymentHistory && paymentHistory.content.length > 0 && (
        <div className="max-w-6xl mx-auto px-6 pb-16">
          <h2 className="text-2xl font-bold mb-6" style={{ color: theme.text.primary }}>
            <CreditCard className="inline w-6 h-6 mr-2" />
            Payment History
          </h2>

          <div
            className="rounded-xl border overflow-hidden"
            style={{
              backgroundColor: theme.background.secondary,
              borderColor: theme.border.default
            }}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: theme.background.primary }}>
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium" style={{ color: theme.text.primary }}>
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium" style={{ color: theme.text.primary }}>
                      Description
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium" style={{ color: theme.text.primary }}>
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium" style={{ color: theme.text.primary }}>
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paymentHistory.content.map((payment, index) => (
                    <tr
                      key={payment.id}
                      className={index % 2 === 0 ? '' : 'opacity-50'}
                      style={{ backgroundColor: index % 2 === 0 ? 'transparent' : theme.background.primary }}
                    >
                      <td className="px-6 py-4 text-sm" style={{ color: theme.text.primary }}>
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: theme.text.primary }}>
                        {payment.description}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium" style={{ color: theme.text.primary }}>
                        ${payment.amount} {payment.currency}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            payment.status === 'SUCCEEDED'
                              ? 'bg-green-100 text-green-800'
                              : payment.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-bold text-center mb-8" style={{ color: theme.text.primary }}>
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {[
            {
              question: "Can I cancel my subscription anytime?",
              answer: "Yes, you can cancel your subscription at any time. You'll continue to have access to premium features until the end of your billing period."
            },
            {
              question: "Do you offer refunds?",
              answer: "We offer a 30-day money-back guarantee for all new subscriptions. If you're not satisfied, contact our support team."
            },
            {
              question: "Can I change my plan later?",
              answer: "Absolutely! You can upgrade or downgrade your plan at any time. Changes take effect immediately."
            }
          ].map((faq, index) => (
            <div
              key={index}
              className="p-6 rounded-lg border"
              style={{
                backgroundColor: theme.background.secondary,
                borderColor: theme.border.default
              }}
            >
              <h3 className="font-semibold mb-2" style={{ color: theme.text.primary }}>
                {faq.question}
              </h3>
              <p style={{ color: theme.text.secondary }}>
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
