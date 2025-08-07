// JWT Token Demo Component
'use client';

import React, { useState } from 'react';
import { useMockAuth } from '@/providers/MockAuthProvider';
import { DemoJWTService } from '@/utils/demoJWT';
import { Button } from '@/components/ui';

export const JWTTokenDemo: React.FC = () => {
  const { user, accessToken, refreshToken, tokenInfo, refreshAccessToken } = useMockAuth();
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const copyToClipboard = async (text: string, tokenType: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedToken(tokenType);
      setTimeout(() => setCopiedToken(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatTokenForDisplay = (token: string) => {
    if (!token) return 'No token available';
    
    const parts = token.split('.');
    if (parts.length !== 3) return 'Invalid token format';
    
    return `${parts[0].substring(0, 20)}...${parts[1].substring(0, 20)}...${parts[2].substring(0, 20)}`;
  };

  const decodeTokenPayload = (token: string) => {
    const decoded = DemoJWTService.decodeToken(token);
    if (!decoded) return null;
    
    return {
      ...decoded,
      iat: new Date(decoded.iat * 1000).toLocaleString(),
      exp: new Date(decoded.exp * 1000).toLocaleString(),
    };
  };

  if (!user) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">🔐 JWT Token Demo</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Please log in to see JWT token demonstration.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">🔐 JWT Token Demo</h3>
      
      {/* Token Status Overview */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h4 className="font-medium mb-3">Token Status</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className={`p-3 rounded-lg text-center ${
            tokenInfo.hasAccessToken 
              ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200' 
              : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
          }`}>
            <div className="text-2xl mb-1">{tokenInfo.hasAccessToken ? '✅' : '❌'}</div>
            <div className="font-medium">Access Token</div>
            <div className="text-xs">{tokenInfo.hasAccessToken ? 'Present' : 'Missing'}</div>
          </div>
          
          <div className={`p-3 rounded-lg text-center ${
            !tokenInfo.isExpired 
              ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200' 
              : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
          }`}>
            <div className="text-2xl mb-1">{tokenInfo.isExpired ? '⏰' : '✅'}</div>
            <div className="font-medium">Token Status</div>
            <div className="text-xs">{tokenInfo.isExpired ? 'Expired' : 'Valid'}</div>
          </div>
          
          <div className="p-3 rounded-lg text-center bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200">
            <div className="text-2xl mb-1">⏱️</div>
            <div className="font-medium">Expires At</div>
            <div className="text-xs">
              {tokenInfo.expiresAt ? new Date(tokenInfo.expiresAt).toLocaleTimeString() : 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Access Token */}
      {accessToken && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium">🎫 Access Token</h4>
            <div className="flex gap-2">
              <Button
                onClick={() => copyToClipboard(accessToken, 'access')}
                size="sm"
                variant="outline"
              >
                {copiedToken === 'access' ? '✅ Copied!' : '📋 Copy Token'}
              </Button>
              <Button
                onClick={() => window.open(`https://jwt.io/#debugger-io?token=${accessToken}`, '_blank')}
                size="sm"
                variant="outline"
              >
                🌐 View on JWT.io
              </Button>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="p-3 bg-gray-100 dark:bg-gray-600 rounded-lg">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Token (truncated):</div>
              <div className="font-mono text-xs break-all text-gray-600 dark:text-gray-400">
                {formatTokenForDisplay(accessToken)}
              </div>
            </div>
            
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">Decoded Payload:</div>
              <pre className="text-xs text-blue-700 dark:text-blue-300 overflow-x-auto">
                {JSON.stringify(decodeTokenPayload(accessToken), null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Refresh Token */}
      {refreshToken && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium">🔄 Refresh Token</h4>
            <Button
              onClick={() => copyToClipboard(refreshToken, 'refresh')}
              size="sm"
              variant="outline"
            >
              {copiedToken === 'refresh' ? '✅ Copied!' : '📋 Copy Token'}
            </Button>
          </div>
          
          <div className="p-3 bg-gray-100 dark:bg-gray-600 rounded-lg">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Token (truncated):</div>
            <div className="font-mono text-xs break-all text-gray-600 dark:text-gray-400">
              {formatTokenForDisplay(refreshToken)}
            </div>
          </div>
          
          <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">Decoded Payload:</div>
            <pre className="text-xs text-green-700 dark:text-green-300 overflow-x-auto">
              {JSON.stringify(decodeTokenPayload(refreshToken), null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Token Actions */}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={refreshAccessToken}
          className="bg-green-600 hover:bg-green-700"
        >
          🔄 Refresh Access Token
        </Button>
        
        <Button
          onClick={() => {
            const payload = accessToken ? DemoJWTService.decodeToken(accessToken) : null;
            if (payload) {
              console.log('JWT Payload:', payload);
              alert('JWT payload logged to console');
            }
          }}
          variant="outline"
        >
          🔍 Log Payload to Console
        </Button>
        
        <Button
          onClick={() => {
            const isExpired = accessToken ? DemoJWTService.isTokenExpired(accessToken) : true;
            alert(`Token is ${isExpired ? 'EXPIRED' : 'VALID'}`);
          }}
          variant="outline"
        >
          ⏰ Check Expiration
        </Button>
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <h5 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
          💡 JWT Token Information
        </h5>
        <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
          <li>• <strong>Access Token:</strong> Used for API authentication (expires in 1 hour)</li>
          <li>• <strong>Refresh Token:</strong> Used to get new access tokens (expires in 7 days)</li>
          <li>• <strong>Payload:</strong> Contains user info, role, and permissions</li>
          <li>• <strong>Signature:</strong> Ensures token integrity and authenticity</li>
          <li>• <strong>Demo Secret:</strong> "demo-secret-key-for-development-only"</li>
        </ul>
      </div>
    </div>
  );
};