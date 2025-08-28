"use client";

import React, { useState } from "react";
import { Check, Star } from "lucide-react";
import Button from "@/components/ui/Button/Button";
import { LIGHT_THEME } from "@/constants/theme";

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: "Starter",
      description: "Perfect for small teams getting started",
      monthlyPrice: 0,
      annualPrice: 0,
      features: [
        "Up to 5 team members",
        "Unlimited tasks",
        "Basic project templates",
        "Mobile app access",
        "Email support",
        "2GB file storage"
      ],
      cta: "Get started free",
      popular: false
    },
    {
      name: "Professional",
      description: "Best for growing teams and businesses",
      monthlyPrice: 12,
      annualPrice: 10,
      features: [
        "Up to 25 team members",
        "Advanced analytics",
        "Custom workflows",
        "Time tracking",
        "Priority support",
        "50GB file storage",
        "Calendar integration",
        "Custom fields"
      ],
      cta: "Start free trial",
      popular: true
    },
    {
      name: "Enterprise",
      description: "For large organizations with advanced needs",
      monthlyPrice: 25,
      annualPrice: 20,
      features: [
        "Unlimited team members",
        "Advanced security & compliance",
        "Custom integrations",
        "Dedicated account manager",
        "24/7 phone support",
        "Unlimited file storage",
        "Advanced reporting",
        "SSO & SAML",
        "API access"
      ],
      cta: "Contact sales",
      popular: false
    }
  ];

  return (
    <section
      id="pricing"
      className="py-20"
      style={{ backgroundColor: LIGHT_THEME.background.secondary }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2
            className="text-3xl sm:text-4xl font-bold mb-4"
            style={{ color: LIGHT_THEME.text.primary }}
          >
            Simple, transparent pricing
          </h2>
          <p
            className="text-xl max-w-3xl mx-auto mb-8"
            style={{ color: LIGHT_THEME.text.secondary }}
          >
            Choose the plan that works best for your team. All plans include a 14-day free trial.
          </p>

          {/* Billing toggle */}
          <div
            className="inline-flex items-center rounded-lg p-1 border"
            style={{
              backgroundColor: LIGHT_THEME.background.primary,
              borderColor: LIGHT_THEME.border.default
            }}
          >
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                !isAnnual
                  ? "bg-blue-600 text-white"
                  : "hover:text-gray-900"
              }`}
              style={!isAnnual ? {} : { color: LIGHT_THEME.text.secondary }}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isAnnual
                  ? "bg-blue-600 text-white"
                  : "hover:text-gray-900"
              }`}
              style={isAnnual ? {} : { color: LIGHT_THEME.text.secondary }}
            >
              Annual
              <span className="ml-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => {
            const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
            return (
              <div
                key={plan.name}
                className={`relative shadow-sm border-2 p-8 rounded-2xl ${
                  plan.popular
                    ? "border-blue-500 ring-2 ring-blue-100"
                    : ""
                }`}
                style={{
                  backgroundColor: LIGHT_THEME.background.primary,
                  borderColor: plan.popular ? "#3b82f6" : LIGHT_THEME.border.default
                }}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <Star className="w-4 h-4 fill-current" />
                      Most popular
                    </div>
                  </div>
                )}

                {/* Plan header */}
                <div className="text-center mb-8">
                  <h3
                    className="text-2xl font-bold mb-2"
                    style={{ color: LIGHT_THEME.text.primary }}
                  >
                    {plan.name}
                  </h3>
                  <p
                    className="mb-6"
                    style={{ color: LIGHT_THEME.text.secondary }}
                  >
                    {plan.description}
                  </p>

                  <div className="mb-4">
                    <span
                      className="text-5xl font-bold"
                      style={{ color: LIGHT_THEME.text.primary }}
                    >
                      ${price}
                    </span>
                    <span
                      className="ml-1"
                      style={{ color: LIGHT_THEME.text.secondary }}
                    >
                      /{isAnnual ? "month" : "month"}
                    </span>
                  </div>

                  {isAnnual && plan.monthlyPrice > 0 && (
                    <p className="text-sm text-green-600">
                      Save ${(plan.monthlyPrice - plan.annualPrice) * 12} per year
                    </p>
                  )}
                </div>

                {/* Features list */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span style={{ color: LIGHT_THEME.text.secondary }}>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA button */}
                <Button
                  variant={plan.popular ? "primary" : "outline"}
                  size="lg"
                  className="w-full"
                >
                  {plan.cta}
                </Button>
              </div>
            );
          })}
        </div>

        {/* Bottom note */}
        <div
          className="text-center mt-16 p-6 rounded-xl"
          style={{ backgroundColor: LIGHT_THEME.background.primary }}
        >
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: LIGHT_THEME.text.primary }}
          >
            Need a custom solution?
          </h3>
          <p
            className="mb-4"
            style={{ color: LIGHT_THEME.text.secondary }}
          >
            We offer custom plans for large enterprises with specific requirements.
          </p>
          <Button variant="ghost" className="text-blue-600">
            Contact our sales team
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
