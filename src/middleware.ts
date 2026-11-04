import { NextResponse, type NextRequest } from "next/server";

// Guard route panel: pengguna tanpa cookie session diarahkan ke /login.
// Validasi permission yang lebih rinci dilakukan di server pada tiap halaman/aksi.
const PANEL_PREFIX = "/dashboard";
const PUBLIC_AUTH = ["/login"];

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const punyaSesi = req.cookies.has("sims_session");

  if (pathname.startsWith(PANEL_PREFIX) && !punyaSesi) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  if (PUBLIC_AUTH.includes(pathname) && punyaSesi) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
