import { UserRole, Permission, ROLE_PERMISSIONS } from '@/constants/auth';
import { redirect } from 'next/navigation';

export async function getCurrentUser() {
  // Implement your user fetching logic here
  // This is just a placeholder
  return null;
}

export async function checkAuthentication() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }
  
  return user;
}

export async function checkAdminAccess() {
  const user = await getCurrentUser();
  
  if (!user || user.role !== UserRole.ADMIN) {
    redirect('/dashboard');
  }
  
  return user;
}

export function hasPermission(userRole: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) ?? false;
}

export function checkPermission(permission: Permission) {
  return async () => {
    const user = await getCurrentUser();
    
    if (!user || !hasPermission(user.role, permission)) {
      throw new Error('Unauthorized');
    }
    
    return true;
  };
}
