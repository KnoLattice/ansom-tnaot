"use client";

import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleIcon } from "@/components/ui/icons/GoogleIcon";
import { useAuth } from "@/lib/hooks";

const schema = z.object({
  fullName: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Minimum 8 characters"),
});

type RegisterValues = z.infer<typeof schema>;

interface RegisterFormProps {
  onRegistered: (workspaceName: string) => void;
}

export function RegisterForm({ onRegistered }: RegisterFormProps) {
  const form = useForm<RegisterValues>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: "", email: "", password: "" },
  });
  const { register: registerLearner, googleLogin, isSubmitting } = useAuth();

  const onSubmit = useCallback(
    async (values: RegisterValues) => {
      const success = await registerLearner(values, { redirectTo: false });
      if (success) {
        onRegistered(values.fullName);
      }
    },
    [onRegistered, registerLearner],
  );

  const disabled = isSubmitting || form.formState.isSubmitting;

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <Button
        type="button"
        variant="outline"
        className="w-full bg-white hover:bg-gray-100 border-gray-300 text-black hover:text-black font-medium"
        onClick={googleLogin}
      >
        <GoogleIcon className="w-5 h-5 mr-2" />
        CONTINUE WITH GOOGLE
      </Button>
      <div className=" flex items-center gap-3">
        <div className="h-px flex-1 bg-[var(--color-border-default)]" />
        <span className="kl-data-label">OR</span>
        <div className="h-px flex-1 bg-[var(--color-border-default)]" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="fullName" className="text-text-secondary">
          Full name
        </Label>
        <Input
          id="fullName"
          placeholder="Enter full name"
          className=" border rounded-md border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 "
          {...form.register("fullName")}
        />
        <FieldError message={form.formState.errors.fullName?.message} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email" className="text-text-secondary">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter email"
          className=" border rounded-md border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 "
          {...form.register("email")}
        />
        <FieldError message={form.formState.errors.email?.message} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="text-text-secondary">
          Password
        </Label>
        <Input
          id="password"
          type="password"
          placeholder="Creat a password"
          className="border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-md"
          {...form.register("password")}
        />
        <FieldError message={form.formState.errors.password?.message} />
      </div>
      <Button
        type="submit"
        disabled={disabled}
        className="ml-auto mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white border rounded-md font-medium shadow-sm px-8 py-3"
      >
        Create account
      </Button>
    </form>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-rose-300">{message}</p>;
}
