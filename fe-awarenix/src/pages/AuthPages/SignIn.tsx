import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  const token = localStorage.getItem("token");
  const nav = useNavigate();

  useEffect(() => {
    if (token) nav("/dashboard", { replace: true });
  }, [token, nav]);

  return (
    <AuthLayout>
      <SignInForm />
    </AuthLayout>
  );
}
