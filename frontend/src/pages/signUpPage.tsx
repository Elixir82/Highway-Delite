import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/userContext.tsx';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from "@react-oauth/google";

interface UserData {
  name: string;
  email: string;
  dob: string;
}

interface ReturnedUser {
  message: string;
  user: {
    _id: string;
    name: string;
    email: string;
    dob: string;
    authProvider: 'email' | 'google';
    isVerified: boolean;
    googleId?: string;
    refreshToken?: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
}

interface VerifiedUser {
  message: string;
  token: string;
  user: {
    _id: string;
    name: string;
    email: string;
    dob: string;
    authProvider: 'email' | 'google';
    isVerified: boolean;
    googleId?: string;
    refreshToken?: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
}

function SignUpPage() {
  const { setUser, setToken } = useAuth();
  const [userDetail, setUserDetail] = useState<UserData>({
    name: '',
    email: '',
    dob: '',
  });
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [signupLoading, setSignupLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [keepLoggedIn] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

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
      setUser({ name: user.name, email: user.email, id: user._id });
      setToken(accessToken);

      if (keepLoggedIn) {
        localStorage.setItem("token", accessToken);
      }

      navigate("/");
    } catch (err) {
      setError("Google login failed, try again.");
    }
  };

  const userSubmitHandle = async () => {
    const { name, email, dob } = userDetail;
    if (!name || !email || !dob) {
      setError('Please fill in all details before submitting.');
      return;
    }

    try {
      setSignupLoading(true);
      await axios.post<ReturnedUser>('https://highway-delite-1-xnb2.onrender.com/auth/signup', {
        name,
        email,
        dob,
      });

      setOtpSent(true);
      setError(null);
      setInfoMessage("OTP sent successfully! Please check your inbox and spam folder for OTP.");
      setResendCooldown(30); 
    } catch (err: any) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setSignupLoading(false);
    }
  };

  const otpHandleSubmit = async () => {
    if (!otp || !userDetail.email) {
      setError('Please enter the OTP.');
      return;
    }

    try {
      setOtpLoading(true);
      const resp = await axios.post<VerifiedUser>('https://highway-delite-1-xnb2.onrender.com/auth/signupverify', {
        otp,
        email: userDetail.email,
      });

      const { user, token } = resp.data;

      setUser({ name: user.name, email: user.email, id: user._id });
      setToken(token);

      if (keepLoggedIn) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify({
          name: user.name,
          email: user.email,
          id: user._id,
        }));
        localStorage.setItem("persist", "true");
      } else {
        localStorage.removeItem("persist");
      }

      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'OTP verification failed.');
    } finally {
      setOtpLoading(false);
    }
  };

  const resendOtp = async () => {
    try {
      await axios.post('https://highway-delite-1-xnb2.onrender.com/auth/resend', {
        email: userDetail.email,
      });
      setInfoMessage("OTP resent successfully! Please check your inbox and spam folder.");
      setError(null);
      setResendCooldown(30);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend OTP.');
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8 bg-white">
        <div className="w-full max-w-md space-y-6">

          {/* Logo */}
          <div className="absolute top-6 left-6 z-10">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
              <span className="text-xl font-semibold text-gray-900">HD</span>
            </div>
          </div>

          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">Sign up</h1>
            <p className="text-gray-500 text-sm">Sign up to enjoy the feature of HD</p>
          </div>

          <div className="space-y-4">
            {/* Inputs */}
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
              <input
                type="text"
                placeholder="Jonas Khanwald"
                value={userDetail.name}
                onChange={(e) => setUserDetail({ ...userDetail, name: e.target.value })}
                disabled={otpSent}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            {/* DOB */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input
                type="date"
                value={userDetail.dob}
                onChange={(e) => setUserDetail({ ...userDetail, dob: e.target.value })}
                disabled={otpSent}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                placeholder="jonas_khanwald@gmail.com"
                value={userDetail.email}
                onChange={(e) => setUserDetail({ ...userDetail, email: e.target.value })}
                disabled={otpSent}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            {/* OTP */}
            {otpSent && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">OTP</label>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {/* Resend OTP link */}
                <button
                  type="button"
                  onClick={resendOtp}
                  disabled={resendCooldown > 0}
                  className="mt-2 text-sm text-blue-500 hover:text-blue-600 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  {resendCooldown > 0 
                    ? `Resend OTP in ${resendCooldown}s` 
                    : "Resend OTP"}
                </button>
              </div>
            )}

            {/* Keep me logged-in */}
            {/* <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={keepLoggedIn}
                onChange={(e) => setKeepLoggedIn(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label className="text-sm text-gray-600">Keep me logged in</label>
            </div> */}

            {/* Submit */}
            <button
              onClick={otpSent ? otpHandleSubmit : userSubmitHandle}
              disabled={(otpSent ? otpLoading : signupLoading)}
              className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {otpSent ? (otpLoading ? 'Verifying...' : 'Sign up') : (signupLoading ? 'Submitting...' : 'Sign up')}
            </button>

            {/* Messages */}
            {infoMessage && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-green-700 text-sm text-center">
                  {infoMessage.split('spam').map((part, i, arr) => 
                    i === arr.length - 1 ? part : 
                    <span key={i}>
                      {part}
                      <span className="font-bold text-green-800">spam</span>
                    </span>
                  )}
                </p>
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm text-center">{error}</p>
              </div>
            )}

            {/* Divider */}
            <div className="flex items-center my-4">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="px-2 text-sm text-gray-500">OR</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            {/* Google Login */}
            <div className="flex justify-center">
              <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError("Google Signup Failed")} />
            </div>

            {/* Sign In link */}
            <p className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <button onClick={() => navigate('/login')} className="text-blue-500 hover:text-blue-600 font-medium">
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>

      <div className="hidden lg:block lg:w-1/2 relative">
        <img src="./image.jpg" alt="Blue abstract background" className="w-full h-full object-cover" />
      </div>
    </div>
  );
}

export default SignUpPage;