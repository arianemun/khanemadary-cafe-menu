import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { locales, routing, type AppLocale } from "./i18n/routing";
import {
  getLocaleFromPathname,
  getLocaleRuntimeConfig,
} from "./lib/locale-config-runtime";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const localeConfig = await getLocaleRuntimeConfig(request);
  const enabledLocales = localeConfig.enabled.filter((locale) =>
    locales.includes(locale)
  );
  const activeLocales =
    enabledLocales.length > 0 ? enabledLocales : (["fa"] as AppLocale[]);
  const defaultLocale = activeLocales.includes(localeConfig.default)
    ? localeConfig.default
    : activeLocales[0];

  const pathnameLocale = getLocaleFromPathname(pathname);
  if (pathnameLocale && !activeLocales.includes(pathnameLocale)) {
    const redirectUrl = request.nextUrl.clone();
    const suffix =
      pathname.replace(new RegExp(`^/${pathnameLocale}(?=/|$)`), "") || "/";
    redirectUrl.pathname = suffix.startsWith("/") ? suffix : `/${suffix}`;
    return NextResponse.redirect(redirectUrl);
  }

  const intlMiddleware = createMiddleware({
    ...routing,
    locales: activeLocales,
    defaultLocale,
    localeDetection: false,
  });

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/", "/(fa|en|ar|zh|ru|tr)/:path*", "/admin/:path*"],
};
