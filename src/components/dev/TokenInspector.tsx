// JWT Token Inspector for Development
'use client';

import React, { useState } from 'react';
import { useMockAuth } from '@/providers/MockAuthProvider';
import { DemoJWTService } from '@/utils/demoJWT';
import { Button } from '@/components/ui';

export const TokenInspector: React.FC = () => {
  const { accessToken, refreshToken, tokenInfo, refreshAccessToken } = useMockAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const formatToken = (token: string) => {
    if (!token) return 'No token';
    
    const parts = token.split('.');
    if (parts.length !== 3) return 'Invalid token format';
    
    return {
      header: parts[0],
      payload: parts[1],
      signature: parts[2],
      decoded: DemoJWTService.decodeToken(token)
    };
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm"
          size="sm"
        >
          🔍 JWT Inspector
        </Button>
      </div>
    );
  }

  const accessTokenData = accessToken ? formatToken(accessToken) : null;
  const refreshTokenData = refreshToken ? formatToken(refreshToken) : null;

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 max-w-2xl max-h-96 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          🔍 JWT Token Inspector
        </h3>
        <Button
          onClick={() => setIsOpen(false)}
          variant="outline"
          size="sm"
        >
          ✕
        </Button>
      </div>

      {/* Token Status */}
      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Token Status</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className={`p-2 rounded ${tokenInfo.hasAccessToken ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            Access Token: {tokenInfo.hasAccessToken ? '✅ Present' : '❌ Missing'}
          </div>
          <div className={`p-2 rounded ${tokenInfo.hasRefreshToken ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            Refresh Token: {tokenInfo.hasRefreshToken ? '✅ Present' : '❌ Missing'}
          </div>
          <div className={`p-2 rounded ${!tokenInfo.isExpired ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            Status: {tokenInfo.isExpired ? '❌ Expired' : '✅ Valid'}
          </div>
          <div className="p-2 rounded bg-blue-100 text-blue-800">
            Expires: {tokenInfo.expiresAt ? new Date(tokenInfo.expiresAt).toLocaleTimeString() : 'N/A'}
          </div>
        </div>
      </div>

      {/* Access Token */}
      {accessTokenData && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium text-gray-900 dark:text-white">Access Token</h4>
            <Button
              onClick={() => copyToClipboard(accessToken!)}
              size="sm"
              variant="outline"
            >
              📋 Copy
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="p-2 bg-gray-100 dark:bg-gray-600 rounded text-xs font-mono break-all">
              <strong>Header:</strong> {accessTokenData.header}
            </div>
            <div className="p-2 bg-gray-100 dark:bg-gray-600 rounded text-xs font-mono break-all">
              <strong>Payload:</strong> {accessTokenData.payload}
            </div>
            <div className="p-2 bg-gray-100 dark:bg-gray-600 rounded text-xs font-mono break-all">
              <strong>Signature:</strong> {accessTokenData.signature}
            </div>
          </div>

          {accessTokenData.decoded && (
            <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
              <strong className="text-blue-800 dark:text-blue-200">Decoded Payload:</strong>
              <pre className="text-xs mt-1 text-blue-700 dark:text-blue-300">
                {JSON.stringify(accessTokenData.decoded, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Refresh Token */}
      {refreshTokenData && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium text-gray-900 dark:text-white">Refresh Token</h4>
            <Button
              onClick={() => copyToClipboard(refreshToken!)}
              size="sm"
              variant="outline"
            >
              📋 Copy
            </Button>
          </div>
          
          <div className="p-2 bg-gray-100 dark:bg-gray-600 rounded text-xs font-mono break-all">
            {refreshToken}
          </div>

          {refreshTokenData.decoded && (
            <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded">
              <strong className="text-green-800 dark:text-green-200">Decoded Payload:</strong>
              <pre className="text-xs mt-1 text-green-700 dark:text-green-300">
                {JSON.stringify(refreshTokenData.decoded, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          onClick={refreshAccessToken}
          size="sm"
          className="bg-green-600 hover:bg-green-700"
        >
          🔄 Refresh Token
        </Button>
        <Button
          onClick={() => window.open('https://jwt.io', '_blank')}
          size="sm"
          variant="outline"
        >
          🌐 JWT.io
        </Button>
      </div>
    </div>
  );
};