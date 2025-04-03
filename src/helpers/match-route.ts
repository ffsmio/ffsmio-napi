export function matchRoute(route: string,  path: string) {
  if (!route && !path) {
    return {};
  }

  if (!route || !path) {
    return null;
  }

  const routeParts = route.replace(/^\/|\/$/g, '').split('/').filter(Boolean);
  const pathParts = path.replace(/^\/|\/$/g, '').split('/').filter(Boolean);

  const routeLength = routeParts.length;

  if (pathParts.length > routeLength) {
    return null;
  }

  const params: Record<string, string> = {};

  for (let i = 0; i < routeLength; i++) {
    const routePart = routeParts[i];
    const pathPart = pathParts[i];

    if (routePart.startsWith(':')) {
      const paramName = routePart.slice(1);
      params[paramName] = pathPart;
      continue;
    }

    if (routePart !== pathPart) {
      return null;
    }
  }

  return params;
}