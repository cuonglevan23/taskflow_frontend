"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useThemeContext } from '@/providers/ThemeProvider';
import { useAuth } from '@/components/auth/AuthProvider';
import { XCircle, ArrowLeft, CreditCard, HelpCircle } from "lucide-react";

export default function PaymentCancelPage() {
  const { theme } = useThemeContext();
  const { user } = useAuth();
  const router = useRouter();

  const goToPricing = () => {
    router.push('/pricing');
  };

  const goToHome = () => {
    router.push('/home');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.background.primary }}>
      {/* Cancel Header */}
      <div
        className="relative py-20 px-6"
        style={{
          background: "linear-gradient(135deg, #EF4444 0%, #DC2626 50%, #B91C1C 100%)",
        }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm shadow-xl">
              <XCircle className="w-16 h-16 text-white drop-shadow-lg" />
            </div>
          </div>

          <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
            Payment Cancelled
          </h1>

          <p className="text-white/95 text-xl mb-4">
            No worries, {user?.name ? user.name.split(' ')[0] : 'there'}!
          </p>

          <p className="text-white/90 text-lg max-w-2xl mx-auto leading-relaxed">
            Your payment was cancelled and no charges were made to your account.
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-6 py-16">

        {/* What Happened */}
        <div
          className="p-8 rounded-xl border mb-8"
          style={{
            backgroundColor: theme.background.secondary,
            borderColor: theme.border.default
          }}
        >
          <div className="flex items-center space-x-4 mb-6">
            <div
              className="p-3 rounded-full"
              style={{ backgroundColor: theme.status.warning }}
            >
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold" style={{ color: theme.text.primary }}>
                Payment Process Cancelled
              </h3>
              <p style={{ color: theme.text.secondary }}>
                You chose to cancel the payment process
              </p>
            </div>
          </div>

          <div
            className="p-4 rounded-lg"
            style={{ backgroundColor: theme.background.primary }}
          >
            <p style={{ color: theme.text.primary }}>
              • No charges were made to your payment method<br />
              • Your account remains on the free plan<br />
              • You can try again anytime you're ready
            </p>
          </div>
        </div>

        {/* Why Upgrade */}
        <div
          className="p-8 rounded-xl border mb-8"
          style={{
            backgroundColor: theme.background.secondary,
            borderColor: theme.border.default
          }}
        >
          <h3 className="text-2xl font-bold mb-6" style={{ color: theme.text.primary }}>
            💎 Premium Features You're Missing
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: "✅", title: "Unlimited Tasks", desc: "No limits on task creation" },
              { icon: "📊", title: "Advanced Analytics", desc: "Detailed productivity insights" },
              { icon: "⚡", title: "Priority Support", desc: "Get help faster" },
              { icon: "👥", title: "Team Collaboration", desc: "Work with your team" },
              { icon: "🔗", title: "Custom Integrations", desc: "Connect your tools" },
              { icon: "🛡️", title: "Advanced Security", desc: "Enterprise protection" }
            ].map((feature, index) => (
              <div
                key={index}
                className="flex items-center space-x-4 p-4 rounded-lg border opacity-60"
                style={{
                  backgroundColor: theme.background.primary,
                  borderColor: theme.border.default
                }}
              >
                <span className="text-2xl grayscale">{feature.icon}</span>
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

        {/* Action Options */}
        <div
          className="p-8 rounded-xl border"
          style={{
            backgroundColor: theme.background.secondary,
            borderColor: theme.border.default
          }}
        >
          <h3 className="text-2xl font-bold mb-6" style={{ color: theme.text.primary }}>
            What would you like to do?
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border" style={{ borderColor: theme.border.default }}>
              <div>
                <h4 className="font-semibold" style={{ color: theme.text.primary }}>
                  Try upgrading again
                </h4>
                <p className="text-sm" style={{ color: theme.text.secondary }}>
                  Go back to pricing and choose a plan
                </p>
              </div>
              <button
                onClick={goToPricing}
                className="flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold text-white transition-all hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                }}
              >
                <CreditCard className="w-4 h-4" />
                <span>View Pricing</span>
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border" style={{ borderColor: theme.border.default }}>
              <div>
                <h4 className="font-semibold" style={{ color: theme.text.primary }}>
                  Continue with free plan
                </h4>
                <p className="text-sm" style={{ color: theme.text.secondary }}>
                  Go back to your dashboard
                </p>
              </div>
              <button
                onClick={goToHome}
                className="flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold border-2 transition-all hover:scale-105"
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
                <ArrowLeft className="w-4 h-4" />
                <span>Go to Dashboard</span>
              </button>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div
          className="mt-8 p-6 rounded-xl border"
          style={{
            backgroundColor: theme.background.secondary,
            borderColor: theme.border.default
          }}
        >
          <div className="flex items-center space-x-4">
            <HelpCircle className="w-8 h-8" style={{ color: theme.text.secondary }} />
            <div>
              <h4 className="font-semibold" style={{ color: theme.text.primary }}>
                Need Help?
              </h4>
              <p className="text-sm" style={{ color: theme.text.secondary }}>
                If you encountered any issues during payment, please contact our support team at support@taskflow.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
