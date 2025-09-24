"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useThemeContext } from '@/providers/ThemeProvider';
import { useAuth } from '@/components/auth/AuthProvider';
import PricingService from '@/services/pricing';
import { CheckCircle, Loader2, CreditCard, Calendar, ArrowRight } from "lucide-react";
import { toast } from 'react-hot-toast';

export default function PaymentSuccessPage() {
  const { theme } = useThemeContext();
  const { user, refreshAuth } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    const sessionIdParam = searchParams.get('session_id');

    if (sessionIdParam) {
      setSessionId(sessionIdParam);
      handlePaymentSuccess(sessionIdParam);
    } else {
      // No session ID, redirect to pricing
      toast.error('Invalid payment session');
      router.push('/pricing');
    }
  }, [searchParams]);

  const handlePaymentSuccess = async (sessionId: string) => {
    try {
      setLoading(true);

      console.log('Processing payment success for session:', sessionId);

      // Refresh user auth to get updated info
      await refreshAuth();

      // Fetch updated subscription info
      const updatedSubscription = await PricingService.getCurrentSubscription();
      setSubscription(updatedSubscription);

      toast.success('Payment successful! Welcome to Premium! 🎉');
    } catch (error: any) {
      console.error('Error processing payment success:', error);
      toast.error('Payment was successful but there was an error updating your account');
    } finally {
      setLoading(false);
    }
  };

  const goToHome = () => {
    router.push('/home');
  };

  const goToPricing = () => {
    router.push('/pricing');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.background.primary }}>
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: theme.text.primary }} />
          <h2 className="text-xl font-semibold mb-2" style={{ color: theme.text.primary }}>
            Processing your payment...
          </h2>
          <p style={{ color: theme.text.secondary }}>
            Please wait while we confirm your subscription
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.background.primary }}>
      {/* Success Header */}
      <div
        className="relative py-20 px-6"
        style={{
          background: "linear-gradient(135deg, #10B981 0%, #059669 50%, #047857 100%)",
        }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm shadow-xl">
              <CheckCircle className="w-16 h-16 text-white drop-shadow-lg" />
            </div>
          </div>

          <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
            Payment Successful! 🎉
          </h1>

          <p className="text-white/95 text-xl mb-4">
            Welcome to TaskFlow Premium, {user?.name ? user.name.split(' ')[0] : 'there'}!
          </p>

          <p className="text-white/90 text-lg max-w-2xl mx-auto leading-relaxed">
            Your subscription has been activated. You now have access to all premium features.
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-6 py-16">

        {/* Subscription Details */}
        {subscription && (
          <div
            className="p-8 rounded-xl border shadow-lg mb-8"
            style={{
              backgroundColor: theme.background.secondary,
              borderColor: theme.status.success
            }}
          >
            <div className="flex items-center space-x-4 mb-6">
              <div
                className="p-3 rounded-full"
                style={{ backgroundColor: theme.status.success }}
              >
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold" style={{ color: theme.text.primary }}>
                  Subscription Active
                </h3>
                <p style={{ color: theme.text.secondary }}>
                  Your {subscription.planType} plan is now active
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div
                className="p-4 rounded-lg"
                style={{ backgroundColor: theme.background.primary }}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <CreditCard className="w-5 h-5" style={{ color: theme.text.secondary }} />
                  <span className="font-medium" style={{ color: theme.text.primary }}>
                    Plan Type
                  </span>
                </div>
                <p className="text-xl font-bold" style={{ color: theme.text.primary }}>
                  {subscription.planType}
                </p>
              </div>

              <div
                className="p-4 rounded-lg"
                style={{ backgroundColor: theme.background.primary }}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-lg">💰</span>
                  <span className="font-medium" style={{ color: theme.text.primary }}>
                    Amount
                  </span>
                </div>
                <p className="text-xl font-bold" style={{ color: theme.text.primary }}>
                  ${subscription.amount}
                </p>
              </div>

              <div
                className="p-4 rounded-lg"
                style={{ backgroundColor: theme.background.primary }}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <Calendar className="w-5 h-5" style={{ color: theme.text.secondary }} />
                  <span className="font-medium" style={{ color: theme.text.primary }}>
                    Next Billing
                  </span>
                </div>
                <p className="text-xl font-bold" style={{ color: theme.text.primary }}>
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Premium Features Unlocked */}
        <div
          className="p-8 rounded-xl border mb-8"
          style={{
            backgroundColor: theme.background.secondary,
            borderColor: theme.border.default
          }}
        >
          <h3 className="text-2xl font-bold mb-6" style={{ color: theme.text.primary }}>
            🚀 Premium Features Unlocked
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: "✅", title: "Unlimited Tasks", desc: "Create as many tasks as you need" },
              { icon: "📊", title: "Advanced Analytics", desc: "Detailed insights and reports" },
              { icon: "⚡", title: "Priority Support", desc: "Get help when you need it" },
              { icon: "👥", title: "Team Collaboration", desc: "Work together seamlessly" },
              { icon: "🔗", title: "Custom Integrations", desc: "Connect with your favorite tools" },
              { icon: "🛡️", title: "Advanced Security", desc: "Enterprise-grade protection" }
            ].map((feature, index) => (
              <div
                key={index}
                className="flex items-center space-x-4 p-4 rounded-lg border"
                style={{
                  backgroundColor: theme.background.primary,
                  borderColor: theme.border.default
                }}
              >
                <span className="text-2xl">{feature.icon}</span>
                <div>
                  <h4 className="font-semibold" style={{ color: theme.text.primary }}>
                    {feature.title}
                  </h4>
                  <p className="text-sm" style={{ color: theme.text.secondary }}>
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Next Steps */}
        <div
          className="p-8 rounded-xl border"
          style={{
            backgroundColor: theme.background.secondary,
            borderColor: theme.border.default
          }}
        >
          <h3 className="text-2xl font-bold mb-6" style={{ color: theme.text.primary }}>
            What's Next?
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border" style={{ borderColor: theme.border.default }}>
              <div>
                <h4 className="font-semibold" style={{ color: theme.text.primary }}>
                  Start using premium features
                </h4>
                <p className="text-sm" style={{ color: theme.text.secondary }}>
                  Explore your new capabilities in the dashboard
                </p>
              </div>
              <button
                onClick={goToHome}
                className="flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold text-white transition-all hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                }}
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border" style={{ borderColor: theme.border.default }}>
              <div>
                <h4 className="font-semibold" style={{ color: theme.text.primary }}>
                  Manage your subscription
                </h4>
                <p className="text-sm" style={{ color: theme.text.secondary }}>
                  View billing details and change plans
                </p>
              </div>
              <button
                onClick={goToPricing}
                className="px-6 py-3 rounded-lg font-semibold border-2 transition-all hover:scale-105"
                style={{
                  color: theme.text.primary,
                  borderColor: theme.border.default,
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.background.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                View Pricing
              </button>
            </div>
          </div>
        </div>

        {/* Session Info (for debugging) */}
        {sessionId && (
          <div className="mt-8 p-4 rounded-lg bg-gray-100 border">
            <p className="text-sm text-gray-600">
              Session ID: <code className="bg-gray-200 px-2 py-1 rounded">{sessionId}</code>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
