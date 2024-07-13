"use client";

import { api } from "@repo/api";
import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";

export default function HomePage() {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const { data, error } = await api.auth.authorize.post({
      email: loginEmail,
      password: loginPassword,
    });

    if (error) {
      console.error(error);
    } else {
      console.log(data);
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
      console.error(error);
    } else {
      console.log(data);
    }
  }

  async function handleLogout() {
    const { data, error } = await api.auth.logout.post();

    if (error) {
      console.error(error);
    } else {
      console.log(data);
    }
  }

  async function handleGetMe() {
    const { data, error } = await api.auth.me.get();

    if (error) {
      console.error(error);
    } else {
      console.log(data);
    }
  }

  function handleChange(setter: React.Dispatch<React.SetStateAction<string>>) {
    return (e: ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
    };
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <form
        className="bg-white p-6 rounded shadow-md w-full max-w-md mb-8"
        onSubmit={handleLogin}
      >
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        <label className="block mb-2">
          Email:
          <input
            className="mt-1 block w-full p-2 border border-gray-300 rounded"
            onChange={handleChange(setLoginEmail)}
            required
            type="email"
            value={loginEmail}
          />
        </label>
        <label className="block mb-4">
          Password:
          <input
            className="mt-1 block w-full p-2 border border-gray-300 rounded"
            onChange={handleChange(setLoginPassword)}
            required
            type="password"
            value={loginPassword}
          />
        </label>
        <button
          className="w-full bg-blue-500 text-white p-2 rounded"
          type="submit"
        >
          Login
        </button>
      </form>

      <hr className="w-full max-w-md my-8" />

      <form
        className="bg-white p-6 rounded shadow-md w-full max-w-md mb-8"
        onSubmit={handleRegister}
      >
        <h2 className="text-2xl font-bold mb-4">Register</h2>
        <label className="block mb-2">
          Name:
          <input
            className="mt-1 block w-full p-2 border border-gray-300 rounded"
            onChange={handleChange(setRegisterName)}
            required
            type="text"
            value={registerName}
          />
        </label>
        <label className="block mb-2">
          Email:
          <input
            className="mt-1 block w-full p-2 border border-gray-300 rounded"
            onChange={handleChange(setRegisterEmail)}
            required
            type="email"
            value={registerEmail}
          />
        </label>
        <label className="block mb-4">
          Password:
          <input
            className="mt-1 block w-full p-2 border border-gray-300 rounded"
            onChange={handleChange(setRegisterPassword)}
            required
            type="password"
            value={registerPassword}
          />
        </label>
        <button
          className="w-full bg-green-500 text-white p-2 rounded"
          type="submit"
        >
          Register
        </button>
      </form>

      <div className="w-full max-w-md space-y-3">
        <button
          className="w-full bg-red-500 text-white p-2 rounded"
          onClick={handleLogout}
          type="button"
        >
          Logout
        </button>
        <button
          className="w-full bg-green-500 text-white p-2 rounded"
          onClick={handleGetMe}
          type="button"
        >
          Get Me
        </button>
      </div>
    </div>
  );
}
