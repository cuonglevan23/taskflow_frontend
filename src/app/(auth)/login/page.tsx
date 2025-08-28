// Login Page - NextAuth.js Integration
'use client';

import React from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { LIGHT_THEME } from '@/constants/theme';

export default function LoginPage() {
  return (
    <div 
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: LIGHT_THEME.background.weak }}
    >
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}