import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import { useUserSession } from "../context/UserSessionContext";
import Swal from "../utils/AlertContainer";

type LoginErrors = {
  email?: string;
  password?: string;
  general?: string;
};

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useUserSession();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (!email) return setErrors({ email: "Email is required" });
    if (!password) return setErrors({ password: "Password is required" });

    setLoading(true);
    try {
      const res = await fetch(
        "http://localhost:3000/api/v1/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, status: isChecked ? "KeepMeLoggedIn" : "", }),
        }
      );

      const body = await res.json();
      // validation / credentials error
      if (res.status === 400 || res.status === 401 || res.status == 500) {
        if (body.errors) {
          setErrors(body.errors);
        } else if (body.error) {
          Swal.fire({
            text: body.error || 'Username or Password invalid',
            icon: 'error',
            duration: 2000
          })
        } else {
          setErrors({ general: "Login gagal" });
        }
        return;
      }

      if (!res.ok) {
        throw new Error("Server error");
      }

      // SAVE DATA LOGIN (SESSION)
      localStorage.setItem("token", body.token);
      localStorage.setItem("token_expired", body.expires_at);
      localStorage.setItem("user", JSON.stringify(body.user));
      setUser(body.user);
      navigate('/dashboard');
    } catch (err: unknown) {
      console.error(err);
      // let errorMessage = "Login gagal";
      // if (err instanceof Error) {
      //   errorMessage = err.message;
      // }
      // setErrors({ general: errorMessage });
      Swal.fire({
        text: 'Login failed',
        icon: 'error',
        duration: 2000
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col flex-1 w-full max-w-md mx-auto justify-start lg:justify-center py-18">
        <div className="mb-5 sm:mb-8">
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
            Sign In
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enter your email and password to sign in!
          </p>
        </div>
        <div className="mt-10">
          {errors.general && (
            <p className="mb-4 text-center text-red-500">{errors.general}</p>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <Label>
                Email <span className="text-error-500">*</span>
              </Label>
              <Input
                placeholder="info@gmail.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
                autoComplete="true"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <Label>
                Password <span className="text-error-500">*</span>
              </Label>
              <div className="relative mt-1">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="true"
                />
                <span
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute z-30 right-4 top-1/2 -translate-y-1/2 cursor-pointer"
                >
                  {showPassword ? (
                    <EyeIcon className="size-5 fill-gray-500" />
                  ) : (
                    <EyeCloseIcon className="size-5 fill-gray-500" />
                  )}
                </span>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Keep me logged in & Forgot */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Checkbox checked={isChecked} onChange={setIsChecked} />
                <span className="text-theme-sm text-gray-700 dark:text-gray-400">
                  Keep me logged in
                </span>
              </div>
              {/* <Link
                to="/reset-password"
                className="text-sm text-brand-500 hover:text-brand-600"
              >
                Forgot password?
              </Link> */}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full"
              size="sm"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
