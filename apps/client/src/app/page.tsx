"use client";

import { api } from "@repo/api/client";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { toast } from "@repo/ui/sonner";
import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";

export default function HomePage() {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [changeOldPassword, setChangeOldPassword] = useState("");
  const [changeNewPassword, setChangeNewPassword] = useState("");
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const { data, error } = await api.auth.authorize.post({
      email: loginEmail,
      password: loginPassword,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(data.message);
    }
  }

  async function handleRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const { data, error } = await api.auth.register.post({
      email: registerEmail,
      password: registerPassword,
      name: registerName,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(data);
    }
  }

  async function handleChangePassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const { data, error } = await api.auth["change-password"].post({
      oldPassword: changeOldPassword,
      newPassword: changeNewPassword,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(data);
    }
  }

  async function handleLogout() {
    const { data, error } = await api.auth.logout.post();

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(data);
    }
  }

  async function handleGetMe() {
    const { data, error } = await api.auth.me.get();

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(data);
    }
  }

  async function handleForgotPassword() {
    const { data, error } = await api.auth.logout.post();

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(data);
    }
  }

  function handleChange(setter: React.Dispatch<React.SetStateAction<string>>) {
    return (e: ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
    };
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center space-y-5 bg-gray-100">
      <form
        className="w-full max-w-md rounded bg-white p-6 shadow-md"
        onSubmit={handleLogin}
      >
        <h2 className="mb-4 text-2xl font-bold">Login</h2>
        <div className="mb-4 grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="loginEmail">Email</Label>
          <Input
            id="loginEmail"
            onChange={handleChange(setLoginEmail)}
            placeholder="Email"
            required
            type="email"
            value={loginEmail}
          />
        </div>
        <div className="mb-4 grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="loginPassword">Password</Label>
          <Input
            id="loginPassword"
            onChange={handleChange(setLoginPassword)}
            placeholder="Password"
            required
            type="password"
            value={loginPassword}
          />
        </div>
        <Button className="w-full" size="lg" type="submit">
          Login
        </Button>
      </form>

      <form
        className="w-full max-w-md rounded bg-white p-6 shadow-md"
        onSubmit={handleRegister}
      >
        <h2 className="mb-4 text-2xl font-bold">Register</h2>
        <div className="mb-4 grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="registerName">Name</Label>
          <Input
            id="registerName"
            onChange={handleChange(setRegisterName)}
            placeholder="Name"
            required
            type="text"
            value={registerName}
          />
        </div>
        <div className="mb-4 grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="registerEmail">Email</Label>
          <Input
            id="registerEmail"
            onChange={handleChange(setRegisterEmail)}
            placeholder="Email"
            required
            type="email"
            value={registerEmail}
          />
        </div>
        <div className="mb-4 grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="registerPassword">Password</Label>
          <Input
            id="registerPassword"
            onChange={handleChange(setRegisterPassword)}
            placeholder="Password"
            required
            type="password"
            value={registerPassword}
          />
        </div>
        <Button className="w-full" size="lg" type="submit">
          Register
        </Button>
      </form>

      <form
        className="w-full max-w-md rounded bg-white p-6 shadow-md"
        onSubmit={handleChangePassword}
      >
        <h2 className="mb-4 text-2xl font-bold">Change Password</h2>
        <div className="mb-4 grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="changeOldPassword">Old Password</Label>
          <Input
            id="changeOldPassword"
            onChange={handleChange(setChangeOldPassword)}
            placeholder="Old Password"
            required
            type="password"
            value={changeOldPassword}
          />
        </div>
        <div className="mb-4 grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="changeNewPassword">New Password</Label>
          <Input
            id="changeNewPassword"
            onChange={handleChange(setChangeNewPassword)}
            placeholder="New Password"
            required
            type="password"
            value={changeNewPassword}
          />
        </div>
        <Button className="w-full" size="lg" type="submit">
          Change Password
        </Button>
      </form>

      <form
        className="w-full max-w-md rounded bg-white p-6 shadow-md"
        onSubmit={handleForgotPassword}
      >
        <h2 className="mb-4 text-2xl font-bold">Forgot Password</h2>
        <div className="mb-4 grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="forgotPasswordEmail">Email</Label>
          <Input
            id="forgotPasswordEmail"
            onChange={handleChange(setForgotPasswordEmail)}
            placeholder="email@website.com"
            required
            type="email"
            value={forgotPasswordEmail}
          />
        </div>
        <Button className="w-full" size="lg" type="submit">
          Send Reset Password Email
        </Button>
      </form>

      <div className="w-full max-w-md space-y-3">
        <Button
          className="w-full"
          onClick={handleLogout}
          size="lg"
          type="button"
          variant="destructive"
        >
          Logout
        </Button>
        <Button
          className="w-full"
          onClick={handleGetMe}
          size="lg"
          type="button"
          variant="outline"
        >
          Get Me
        </Button>
      </div>
    </div>
  );
}
