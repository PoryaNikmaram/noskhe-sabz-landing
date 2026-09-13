export const routes = {
  home: '/',
  features: '/features',
  pricing: '/pricing',
  demo: '/demo',
  blog: '/blog',
  about: '/about',
  contact: '/contact',
  login: '/login',
  privacy: '/privacy',
  terms: '/terms',
} as const;

export type RouteKey = keyof typeof routes;
export type RoutePath = (typeof routes)[RouteKey];
