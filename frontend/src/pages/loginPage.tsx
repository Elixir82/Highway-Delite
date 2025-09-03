import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/userContext";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

interface loginResponse {
  message: string;
}

interface loginVerifyResponse {
  message: string;
  token: string;
  user: {
    _id: string;
    name: string;
    email: string;
    dob: string;
    authProvider: "email" | "google";
    isVerified: boolean;
    googleId?: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
}

function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const navigate = useNavigate();

  
  useEffect(() => {
  let interval: number | undefined;
  if (resendCooldown > 0) {
    interval = window.setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
  }
  return () => {
    if (interval !== undefined) {
      clearInterval(interval);
    }
  };
}, [resendCooldown]);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const resp = await axios.post("https://highway-delite-1-xnb2.onrender.com/auth/authGoogle", {
        token: credentialResponse.credential,
      });

      const { accessToken, user } = resp.data;

      login(
        { name: user.name, email: user.email, id: user._id },
        accessToken,
        keepLoggedIn
      );

      navigate("/");
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Google login failed. Please try again."
      );
    }
  };
  
  const handleLoginRequest = async () => {
    try {
      setLoading(true);
      await axios.post<loginResponse>(
        "https://highway-delite-1-xnb2.onrender.com/auth/login",
        { email }
      );
      setOtpSent(true);
      setError(null);
      setMessage("OTP sent successfully! Please check your inbox and spam folder.");
      setResendCooldown(30);
    } catch (err: any) {
      setMessage(null);
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleOtpVerify = async () => {
    try {
      setLoading(true);
      const resp = await axios.post<loginVerifyResponse>(
        "https://highway-delite-1-xnb2.onrender.com/auth/loginverify",
        {
          email,
          otp,
        }
      );

      const { token, user } = resp.data;

      login(
        { name: user.name, email: user.email, id: user._id },
        token,
        keepLoggedIn
      );

      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setLoading(true);
      await axios.post<loginResponse>(
        "https://highway-delite-1-xnb2.onrender.com/auth/resend",
        { email }
      );
      setMessage("OTP resent successfully! Please check your inbox and spam folder.");
      setError(null);
      setResendCooldown(30);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative">
      {/* Logo */}
      <div className="absolute top-6 left-6 z-10">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
          <span className="text-xl font-semibold text-gray-900">HD</span>
        </div>
      </div>

      {/* Left Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8 bg-white">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="space-y-2 pt-16 lg:pt-0">
            <h1 className="text-2xl font-bold text-gray-900">Sign in</h1>
            <p className="text-gray-500 text-sm">
              Sign in to enjoy the feature of HD
            </p>
          </div>

          {/* Form */}
          <div className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={otpSent}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
              />
            </div>

            {/* OTP Input */}
            {otpSent && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  OTP
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-3 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                <button
                  onClick={handleResendOtp}
                  disabled={loading || resendCooldown > 0}
                  className="mt-2 text-sm text-blue-500 hover:text-blue-600 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  {resendCooldown > 0 
                    ? `Resend OTP in ${resendCooldown}s` 
                    : "Resend OTP"}
                </button>
              </div>
            )}

            {/* Keep me logged in */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="keepLoggedIn"
                checked={keepLoggedIn}
                onChange={(e) => setKeepLoggedIn(e.target.checked)}
              />
              <label
                htmlFor="keepLoggedIn"
                className="text-sm text-gray-700 cursor-pointer"
              >
                Keep me logged in
              </label>
            </div>

            {/* Submit Button */}
            <button
              onClick={otpSent ? handleOtpVerify : handleLoginRequest}
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {otpSent
                ? loading
                  ? "Verifying..."
                  : "Sign in"
                : loading
                  ? "Sending OTP..."
                  : "Send OTP"}
            </button>

            {/* Success Message */}
            {message && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-green-700 text-sm text-center">
                  {message.split('spam').map((part, i, arr) => 
                    i === arr.length - 1 ? part : 
                    <span key={i}>
                      {part}
                      <span className="font-bold text-green-800">spam</span>
                    </span>
                  )}
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm text-center">{error}</p>
              </div>
            )}

            {/* Divider */}
            <div className="flex items-center my-4">
              <hr className="flex-grow border-gray-300" />
              <span className="px-2 text-gray-500 text-sm">OR</span>
              <hr className="flex-grow border-gray-300" />
            </div>

            {/* Google Login */}
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google Login Failed")}
              />
            </div>

            {/* Sign Up Link */}
            <p className="text-center text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <button
                onClick={() => navigate("/signup")}
                className="text-blue-500 hover:text-blue-600 font-medium"
              >
                Sign up
              </button>
            </p>
            {/* Deployment Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
              <p className="text-blue-700 text-xs text-center">
                ℹ️ Note: As this project is hosted on a free tier, the first request may take up to a minute to load after periods of inactivity. Once active, it will work normally.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img
          src="./image.jpg"
          alt="Blue abstract background"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}

export default LoginPage;