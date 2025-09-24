import { BaseApiClient } from '@/lib/baseApiClient';
import {
    CreateSubscriptionRequest,
    CheckoutResponse,
    Subscription,
    PaymentHistoryResponse,
    PricingError
} from '@/types/pricing';

/* ===================== Pricing Service ===================== */

export class PricingService {

    /**
     * Create a new subscription checkout session
     * POST /api/payments/checkout
     */
    static async createCheckoutSession(
        request: CreateSubscriptionRequest
    ): Promise<CheckoutResponse> {
        try {
            console.log('🚀 Creating checkout session:', request);

            const response = await BaseApiClient.post<CheckoutResponse>(
                '/api/payments/checkout',
                request
            );

            console.log('✅ Checkout session created:', response);
            return response;
        } catch (error: any) {
            console.error('❌ Failed to create checkout session:', error);
            throw new Error(error.message || 'Failed to create checkout session');
        }
    }

    /**
     * Get current user subscription
     * GET /api/payments/subscription
     */
    static async getCurrentSubscription(): Promise<Subscription | null> {
        try {
            console.log('📋 Fetching current subscription...');

            const response = await BaseApiClient.get<Subscription>(
                '/api/payments/subscription'
            );

            console.log('✅ Current subscription fetched:', response);
            return response;
        } catch (error: any) {
            console.error('❌ Failed to fetch current subscription:', error);

            // If no subscription found (404), return null instead of throwing
            if (error.message?.includes('404') || error.message?.includes('not found')) {
                console.log('ℹ️ No active subscription found');
                return null;
            }

            throw new Error(error.message || 'Failed to fetch current subscription');
        }
    }

    /**
     * Get payment history with pagination
     * GET /api/payments/history
     */
    static async getPaymentHistory(
        page: number = 0,
        size: number = 20
    ): Promise<PaymentHistoryResponse> {
        try {
            console.log('📈 Fetching payment history...', { page, size });

            const response = await BaseApiClient.get<PaymentHistoryResponse>(
                '/api/payments/history',
                { page, size }
            );

            console.log('✅ Payment history fetched:', response);
            return response;
        } catch (error: any) {
            console.error('❌ Failed to fetch payment history:', error);
            throw new Error(error.message || 'Failed to fetch payment history');
        }
    }

    /**
     * Cancel current subscription
     * DELETE /api/payments/subscription
     * (Assuming this endpoint exists for cancellation)
     */
    static async cancelSubscription(): Promise<{ success: boolean; message: string }> {
        try {
            console.log('❌ Cancelling subscription...');

            const response = await BaseApiClient.delete<{ success: boolean; message: string }>(
                '/api/payments/subscription'
            );

            console.log('✅ Subscription cancelled:', response);
            return response;
        } catch (error: any) {
            console.error('❌ Failed to cancel subscription:', error);
            throw new Error(error.message || 'Failed to cancel subscription');
        }
    }

    /**
     * Update subscription plan
     * PUT /api/payments/subscription
     * (Assuming this endpoint exists for plan changes)
     */
    static async updateSubscriptionPlan(
        planType: CreateSubscriptionRequest['planType']
    ): Promise<Subscription> {
        try {
            console.log('🔄 Updating subscription plan to:', planType);

            const response = await BaseApiClient.put<Subscription>(
                '/api/payments/subscription',
                { planType }
            );

            console.log('✅ Subscription plan updated:', response);
            return response;
        } catch (error: any) {
            console.error('❌ Failed to update subscription plan:', error);
            throw new Error(error.message || 'Failed to update subscription plan');
        }
    }

    /**
     * Get subscription status for user
     * Helper method to check if user has active subscription
     */
    static async isUserPremium(): Promise<boolean> {
        try {
            const subscription = await this.getCurrentSubscription();
            return subscription?.status === 'ACTIVE';
        } catch (error) {
            console.error('❌ Failed to check premium status:', error);
            return false;
        }
    }

    /**
     * Redirect to Stripe checkout
     * Helper method to handle checkout URL redirection
     */
    static redirectToCheckout(checkoutUrl: string): void {
        try {
            console.log('🌐 Redirecting to checkout:', checkoutUrl);
            window.location.href = checkoutUrl;
        } catch (error) {
            console.error('❌ Failed to redirect to checkout:', error);
            throw new Error('Failed to redirect to checkout page');
        }
    }

    /**
     * Format subscription for display
     * Helper method to format subscription data
     */
    static formatSubscription(subscription: Subscription) {
        return {
            ...subscription,
            formattedAmount: `$${subscription.amount}`,
            formattedPeriod: {
                start: new Date(subscription.currentPeriodStart).toLocaleDateString(),
                end: new Date(subscription.currentPeriodEnd).toLocaleDateString(),
            },
            isActive: subscription.status === 'ACTIVE',
            daysUntilRenewal: Math.ceil(
                (new Date(subscription.currentPeriodEnd).getTime() - new Date().getTime()) /
                (1000 * 60 * 60 * 24)
            ),
        };
    }

    /**
     * Format payment history for display
     * Helper method to format payment history data
     */
    static formatPaymentHistory(payments: PaymentHistoryResponse) {
        return {
            ...payments,
            content: payments.content.map(payment => ({
                ...payment,
                formattedAmount: `$${payment.amount}`,
                formattedDate: new Date(payment.createdAt).toLocaleDateString(),
                isSuccessful: payment.status === 'SUCCEEDED',
            })),
        };
    }
}

/* ===================== Export Default ===================== */
export default PricingService;
