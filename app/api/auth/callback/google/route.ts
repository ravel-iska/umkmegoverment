import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSession } from "@/lib/session";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const error = url.searchParams.get("error");

    if (error) {
      return NextResponse.redirect(new URL("/login?error=GoogleLoginDibatalkan", request.url));
    }

    if (!code) {
      return NextResponse.redirect(new URL("/login?error=InvalidGoogleCode", request.url));
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${url.origin}/api/auth/callback/google`;

    if (!clientId || !clientSecret) {
      console.error("Google Client ID atau Secret belum dikonfigurasi.");
      return NextResponse.redirect(new URL("/login?error=ServerConfigurationError", request.url));
    }

    // 1. Tukar kode dengan Access Token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("Error from Google Token API:", tokenData);
      return NextResponse.redirect(new URL("/login?error=GoogleTokenError", request.url));
    }

    // 2. Ambil Profil Pengguna
    const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const userData = await userResponse.json();

    if (!userResponse.ok || !userData.email) {
      console.error("Error fetching Google user profile:", userData);
      return NextResponse.redirect(new URL("/login?error=GoogleProfileError", request.url));
    }

    // 3. Cek atau Buat Pengguna di Database
    let user = await db.user.findUnique({
      where: { email: userData.email }
    });

    if (!user) {
      // Register otomatis sebagai Pembeli
      user = await db.user.create({
        data: {
          name: userData.name || userData.given_name || "Pengguna Google",
          email: userData.email,
          role: "Pembeli",
          avatar: userData.picture || null,
        }
      });
    } else if (!user.avatar && userData.picture) {
      // Update avatar jika belum ada
      user = await db.user.update({
        where: { id: user.id },
        data: { avatar: userData.picture }
      });
    }

    // 4. Buat Sesi JWT
    await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as "Admin" | "Penjual" | "Pembeli",
    });

    // 5. Cek kelengkapan data
    if (!user.phone) {
      return NextResponse.redirect(new URL("/lengkapi-profil", request.url));
    }

    // 6. Redirect ke beranda atau dashboard
    return NextResponse.redirect(new URL("/", request.url));

  } catch (err) {
    console.error("Google Auth Callback Error:", err);
    return NextResponse.redirect(new URL("/login?error=InternalServerError", request.url));
  }
}
