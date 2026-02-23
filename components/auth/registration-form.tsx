"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterSchema } from "@/schemas/index";
import { AuthCardWrapper } from "@/components/auth/auth-card-wrapper";
import { EvoFormInputError } from "@/components/error/form-input-error";
import { z } from "zod";
import { ShowFormError } from "@/components/ui/form-error";
import { ShowFormSuccess } from "@/components/ui/form-success";
import { register as registerUser } from "@/actions/register";
import { login } from "@/actions/login";
import axios from "@/utils/axios/axios";
import { useRouter } from "next/navigation";
import { DEFAULT_SIGNIN_REDIRECT_USER } from "@/routeslist";
import { IoEye, IoEyeOff } from "react-icons/io5";

const RegistrationForm = () => {
  const router = useRouter();
  const [formerror, setFormError] = useState<string>("");
  const [formsuccess, setFormSuccess] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof RegisterSchema>) => {
    setFormError(""); // Reset error message
    setFormSuccess(""); // Reset success message

    const registerResult = await registerUser(data);

    if (registerResult && typeof registerResult === "object") {
      if ("error" in registerResult && registerResult.error) {
        setFormError(registerResult.error);
        return;
      }

      if ("success" in registerResult && registerResult.success) {
        setFormSuccess(registerResult.success);

        // Auto-login the user after successful registration
        const loginResult = await login({
          email: data.email,
          password: data.password,
        });

        if (loginResult && loginResult.success) {
          // Link any guest orders to this newly registered user
          try {
            await axios.post("/api/order/link-guest-orders", {
              email: data.email,
            });
          } catch (error) {
            // Silently fail - linking is not critical
          }

          // Redirect to user dashboard
          setTimeout(() => {
            router.push(DEFAULT_SIGNIN_REDIRECT_USER);
            router.refresh();
          }, 500);
        }
      }
    }
  };

  return (
    <AuthCardWrapper
      headerLabel="Create an account"
      headerDescription="Fill in the fields to get started"
      bottomText="Already have an account?"
      bottomButtonLabel="Sign in"
      bottomButtonHref="/login"
    >
      <form
        id="userregform"
        className="flex flex-col gap-3 w-full"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex flex-col relative w-full h-fit pt-1.5">
          <input
            type="text"
            id="firstName"
            {...register("firstName")}
            autoCorrect="off"
            autoComplete="off"
            spellCheck="false"
            placeholder="John"
            className="custom-input-style1 peer w-full h-[40px]"
          />
          <label
            htmlFor="firstName"
            className="custom-floating-label1 text-[11px] sm:text-[12px] font-[600] leading-3 text-stone-500 before:border-stone-400 peer-focus:before:border-[#0866FF] after:border-stone-400 peer-focus:after:border-[#0866FF] peer-focus:text-[#0866FF] peer-disabled:before:border-stone-300 peer-disabled:after:border-stone-300"
          >
            {`First Name*`}
          </label>
          {errors.firstName && (
            <EvoFormInputError>{errors.firstName.message}</EvoFormInputError>
          )}
        </div>

        <div className="flex flex-col relative w-full h-fit pt-1.5">
          <input
            type="text"
            id="lastName"
            {...register("lastName")}
            autoCorrect="off"
            autoComplete="off"
            spellCheck="false"
            placeholder="Doe"
            className="custom-input-style1 peer w-full h-[40px]"
          />
          <label
            htmlFor="lastName"
            className="custom-floating-label1 text-[11px] sm:text-[12px] font-[600] leading-3 text-stone-500 before:border-stone-400 peer-focus:before:border-[#0866FF] after:border-stone-400 peer-focus:after:border-[#0866FF] peer-focus:text-[#0866FF] peer-disabled:before:border-stone-300 peer-disabled:after:border-stone-300"
          >
            {`Last Name`}
          </label>
          {errors.lastName && (
            <EvoFormInputError>{errors.lastName.message}</EvoFormInputError>
          )}
        </div>

        <div className="flex flex-col relative w-full h-fit pt-1.5">
          <input
            type="text"
            id="email"
            {...register("email")}
            autoCorrect="off"
            autoComplete="email"
            spellCheck="false"
            inputMode="email"
            placeholder="johndoe@example.com"
            className="custom-input-style1 peer w-full h-[40px]"
          />
          <label
            htmlFor="email"
            className="custom-floating-label1 text-[11px] sm:text-[12px] font-[600] leading-3 text-stone-500 before:border-stone-400 peer-focus:before:border-[#0866FF] after:border-stone-400 peer-focus:after:border-[#0866FF] peer-focus:text-[#0866FF] peer-disabled:before:border-stone-300 peer-disabled:after:border-stone-300"
          >
            {`Email*`}
          </label>
          {errors.email && (
            <EvoFormInputError>{errors.email.message}</EvoFormInputError>
          )}
        </div>

        <div className="flex flex-col relative w-full h-fit pt-1.5">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            {...register("password")}
            autoCorrect="off"
            autoComplete="off"
            spellCheck="false"
            placeholder="********"
            className="custom-input-style1 peer w-full h-[40px] pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[50%] translate-y-[-20%] text-stone-500 hover:text-stone-700 transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <IoEyeOff className="w-5 h-5" />
            ) : (
              <IoEye className="w-5 h-5" />
            )}
          </button>
          <label
            htmlFor="password"
            className="custom-floating-label1 text-[11px] sm:text-[12px] font-[600] leading-3 text-stone-500 before:border-stone-400 peer-focus:before:border-[#0866FF] after:border-stone-400 peer-focus:after:border-[#0866FF] peer-focus:text-[#0866FF] peer-disabled:before:border-stone-300 peer-disabled:after:border-stone-300"
          >
            {`Password*`}
          </label>
          {errors.password && (
            <EvoFormInputError>{errors.password.message}</EvoFormInputError>
          )}
        </div>

        <div className="flex flex-col relative w-full h-fit pt-1.5">
          <input
            type={showConfirmPassword ? "text" : "password"}
            id="confirmPassword"
            {...register("confirmPassword")}
            autoCorrect="off"
            autoComplete="off"
            spellCheck="false"
            placeholder="********"
            className="custom-input-style1 peer w-full h-[40px] pr-10"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-[50%] translate-y-[-20%] text-stone-500 hover:text-stone-700 transition-colors"
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
          >
            {showConfirmPassword ? (
              <IoEyeOff className="w-5 h-5" />
            ) : (
              <IoEye className="w-5 h-5" />
            )}
          </button>
          <label
            htmlFor="confirmPassword"
            className="custom-floating-label1 text-[11px] sm:text-[12px] font-[600] leading-3 text-stone-500 before:border-stone-400 peer-focus:before:border-[#0866FF] after:border-stone-400 peer-focus:after:border-[#0866FF] peer-focus:text-[#0866FF] peer-disabled:before:border-stone-300 peer-disabled:after:border-stone-300"
          >
            {`Confirm Password*`}
          </label>
          {errors.confirmPassword && (
            <EvoFormInputError>
              {errors.confirmPassword.message}
            </EvoFormInputError>
          )}
        </div>

        {formerror && <ShowFormError message={formerror} />}
        {formsuccess && <ShowFormSuccess message={formsuccess} />}

        <button
          type="submit"
          aria-label="sign-up button"
          disabled={isSubmitting}
          className="w-full h-fit px-4 py-2.5 sm:py-3 mt-3 text-center bg-stone-800 text-stone-50 text-[13px] font-[500] leading-4 rounded-[6px] hover:bg-stone-900 transition-colors ease-linear duration-200"
        >
          {isSubmitting ? "Processing..." : "Sign up"}
        </button>
      </form>
    </AuthCardWrapper>
  );
};

export default RegistrationForm;
