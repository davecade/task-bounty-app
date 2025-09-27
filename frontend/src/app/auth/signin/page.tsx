"use client";

import { useState } from "react";
import { signIn } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const signInResult = await signIn({
        username: email,
        password,
        options: {
          authFlowType: "USER_SRP_AUTH", // Always use the most secure flow
        },
      });

      // Handle "Remember Me" - this affects how long the session persists
      if (rememberMe) {
        // In AWS Cognito, this is typically handled by:
        // 1. Refresh token expiration (set in Cognito User Pool settings)
        // 2. Local storage of tokens (handled automatically by Amplify)
        console.log(
          "User chose to be remembered - session will persist longer"
        );
      }

      // Redirect to dashboard on successful sign in
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Sign in error:", err);

      // Handle specific error types
      if (err.name === "NotAuthorizedException") {
        setError("Invalid email or password");
      } else if (err.name === "UserNotFoundException") {
        setError("No account found with this email");
      } else if (err.name === "UserNotConfirmedException") {
        setError("Please confirm your email before signing in");
      } else if (err.name === "TooManyRequestsException") {
        setError("Too many failed attempts. Please try again later");
      } else {
        setError(err.message || "Failed to sign in");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center items-center space-x-2 mb-4">
            <span className="text-4xl">🎯</span>
            <h1 className="text-3xl font-bold text-gray-900">TaskBounty</h1>
          </div>
          <h2 className="text-xl text-gray-600">Sign in to your account</h2>
          <p className="mt-2 text-sm text-gray-500">
            Level up your productivity with gamified tasks
          </p>
        </div>

        {/* Sign In Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSignIn}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <div className="flex items-center">
                <span className="text-red-500 mr-2">⚠️</span>
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                required
              />
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-700"
              >
                Remember me
              </label>
            </div>

            <Link
              href="/auth/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Forgot password?
            </Link>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Signing in...
              </div>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Sign Up Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              href="/auth/signup"
              className="font-medium text-blue-600 hover:text-blue-700"
            >
              Sign up for free
            </Link>
          </p>
        </div>

        {/* Demo Features */}
        <div className="bg-blue-50 rounded-lg p-4 mt-6">
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            ✨ What's included:
          </h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>🤖 AI-powered task creation (20 credits/month free)</li>
            <li>🏆 Gamified progress tracking</li>
            <li>📊 Productivity analytics</li>
            <li>🔥 Streak tracking & achievements</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
