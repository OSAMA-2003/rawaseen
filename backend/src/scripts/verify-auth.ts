import http from "http";
import { createApp } from "../app";
import { connectDB } from "../config/db";
import { User, UserRole } from "../models";

async function verifyAuthFlow() {
  console.log("Connecting to MongoDB Atlas...");
  const conn = await connectDB();

  // 1. Create a test user
  const email = `auth_test_${Date.now()}@rawasin.sa`;
  const password = "ValidPassword2026!";
  const testUser = await User.create({
    name: "Tarek Al-Rawi",
    email,
    phone: "+201122334455",
    password,
    role: UserRole.MANAGER,
  });
  console.log("✅ Test Manager created:", testUser.email);

  // 2. Start temporary Express test server
  const app = createApp();
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as any;
  const baseUrl = `http://127.0.0.1:${address.port}`;
  console.log("✅ Test HTTP server listening on:", baseUrl);

  try {
    // Test 3: Invalid email format
    const badEmailRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "invalid-email-string", password: "123" }),
    });
    const badEmailData = (await badEmailRes.json()) as any;
    console.log("Test 3 (Bad payload validation - 400 expected):", badEmailRes.status, badEmailData.message);
    if (badEmailRes.status !== 400) throw new Error("Expected 400 for invalid payload");

    // Test 4: Wrong password
    const wrongPassRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: "WrongPassword999!" }),
    });
    const wrongPassData = (await wrongPassRes.json()) as any;
    console.log("Test 4 (Wrong password - 401 expected):", wrongPassRes.status, wrongPassData.message);
    if (wrongPassRes.status !== 401) throw new Error("Expected 401 for incorrect password");

    // Test 5: Successful Login
    const loginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const loginData = (await loginRes.json()) as any;
    const setCookie = loginRes.headers.get("set-cookie");
    console.log("Test 5 (Valid login - 200 expected):", loginRes.status, loginData.message);
    console.log("Set-Cookie header present:", Boolean(setCookie));
    if (loginRes.status !== 200 || !loginData.data?.token) throw new Error("Login failed");
    const token = loginData.data.token;

    // Test 6: Access protected /api/v1/auth/me without token -> 401
    const unauthRes = await fetch(`${baseUrl}/api/v1/auth/me`);
    console.log("Test 6 (Unauthenticated /me - 401 expected):", unauthRes.status);
    if (unauthRes.status !== 401) throw new Error("Protected route did not reject unauthenticated request");

    // Test 7: Access protected /api/v1/auth/me with Bearer token -> 200
    const authHeaderRes = await fetch(`${baseUrl}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const authHeaderData = (await authHeaderRes.json()) as any;
    console.log("Test 7 (Bearer /me - 200 expected):", authHeaderRes.status, authHeaderData.data?.email);
    if (authHeaderRes.status !== 200 || authHeaderData.data?.email !== email) {
      throw new Error("Failed to fetch user with Bearer token");
    }

    // Test 8: Access protected /api/v1/auth/me with Cookie -> 200
    const cookieHeader = setCookie?.split(";")[0] || `token=${token}`;
    const authCookieRes = await fetch(`${baseUrl}/api/v1/auth/me`, {
      headers: { Cookie: cookieHeader },
    });
    const authCookieData = (await authCookieRes.json()) as any;
    console.log("Test 8 (Cookie /me - 200 expected):", authCookieRes.status, authCookieData.data?.role);
    if (authCookieRes.status !== 200 || authCookieData.data?.role !== UserRole.MANAGER) {
      throw new Error("Failed to fetch user with Cookie");
    }

    // Test 9: Logout -> clears cookie
    const logoutRes = await fetch(`${baseUrl}/api/v1/auth/logout`, { method: "POST" });
    const logoutCookie = logoutRes.headers.get("set-cookie");
    console.log("Test 9 (Logout - 200 expected):", logoutRes.status, "Clear-Cookie:", Boolean(logoutCookie));
    if (logoutRes.status !== 200) throw new Error("Logout failed");

    console.log("🎉 ALL AUTHENTICATION TESTS PASSED WITH 100% SUCCESS");
  } finally {
    // Clean up
    await User.findByIdAndDelete(testUser._id);
    server.close();
    await conn.disconnect();
    console.log("🧹 Test cleanup completed.");
  }
}

verifyAuthFlow().catch((err) => {
  console.error("Fatal test error:", err);
  process.exit(1);
});
