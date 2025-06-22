import { Link, useNavigate } from "react-router";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import { ChevronLeftIcon } from "../../icons";

export default function ForgotPasswordForm() {
  const navigate = useNavigate();

  function handleSubmit(e: React.FormEvent){
    e.preventDefault(); 
    navigate("/dashboard");
  };

  return (
    <div className="flex flex-col flex-1">
        <div className="w-full max-w-md mx-auto sm:pt-10">
        <Link
            to="/"
            className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            <ChevronLeftIcon className="size-5" />
            Back to Login
        </Link>
        </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Forgot Your Password
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
                Enter the email address linked to your account, and we’ll send you a link to reset your password.
            </p>
          </div>
          <div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input placeholder="info@gmail.com" />
                </div>
                <div>
                  {/* <Button className="w-full" size="sm" onClick={handleSubmit}>
                    Reset Password
                  </Button> */}
                </div>
              </div>
            </form>            
          </div>
        </div>
      </div>
    </div>
  );
}