import { CookieOptions } from 'express';

export const AUTH_COOKIE_NAME = 'access_token';

export const authCookieOptions = (isProd: boolean): CookieOptions => ({
  httpOnly: true,                        // JS del navegador no puede leerla (mitiga XSS)
  secure: isProd,                        // solo HTTPS en producción
  sameSite: isProd ? 'strict' : 'lax',   // mitiga CSRF
  maxAge: 1000 * 60 * 60,                // 1h; alinealo con el expiresIn del JWT
  path: '/',
});