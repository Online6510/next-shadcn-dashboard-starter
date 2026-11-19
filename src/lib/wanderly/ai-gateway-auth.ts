import 'server-only';

/** Vercel delivers the short-lived OIDC token via request context at runtime. */
export function gatewayCredentialsAvailable(request: Request):boolean {
 return Boolean(
  process.env.AI_GATEWAY_API_KEY ||
  process.env.VERCEL_OIDC_TOKEN ||
  request.headers.get('x-vercel-oidc-token')
 );
}
