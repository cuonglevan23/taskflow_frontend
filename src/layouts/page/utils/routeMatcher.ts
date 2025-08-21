export interface RouteMatch {
  config: string;
  params: Record<string, string>;
  isMatch: boolean;
}

export const matchRoute = (pathname: string, routes: string[]): RouteMatch => {
  for (const route of routes) {
    const match = matchSingleRoute(pathname, route);
    if (match.isMatch) {
      return { ...match, config: route };
    }
  }
  
  return { config: '', params: {}, isMatch: false };
};

const matchSingleRoute = (pathname: string, routePattern: string): Omit<RouteMatch, 'config'> => {
  // Handle exact match first
  if (pathname === routePattern) {
    return { params: {}, isMatch: true };
  }
  
  // Handle simple prefix matching (non-dynamic routes)
  if (!routePattern.includes(':') && pathname.startsWith(routePattern)) {
    return { params: {}, isMatch: true };
  }
  
  // Handle dynamic routes like /projects/:id
  if (routePattern.includes(':')) {
    const routeParts = routePattern.split('/');
    const pathParts = pathname.split('/');
    
    // For dynamic routes, path must have at least as many parts as route pattern
    if (pathParts.length < routeParts.length) {
      return { params: {}, isMatch: false };
    }
    
    const params: Record<string, string> = {};
    let matches = true;
    
    // Only match the parts defined in the route pattern
    for (let i = 0; i < routeParts.length; i++) {
      const routePart = routeParts[i];
      const pathPart = pathParts[i];
      
      if (routePart.startsWith(':')) {
        // Dynamic parameter
        const paramName = routePart.slice(1);
        params[paramName] = pathPart;
      } else if (routePart !== pathPart) {
        // Static part doesn't match
        matches = false;
        break;
      }
    }
    
    return { params, isMatch: matches };
  }
  
  return { params: {}, isMatch: false };
};

export const buildNavigationItems = (
  navItems: Array<{
    label: string;
    href: string | ((params: Record<string, string>) => string);
    icon?: any;
  }>,
  params: Record<string, string>
) => {
  return navItems.map(item => ({
    ...item,
    href: typeof item.href === 'function' ? item.href(params) : item.href
  }));
};