"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { api } from "@repo/api";

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
      $fetch: {
        credentials: "include",
      },
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
    return (e: ChangeEvent<HTMLInputElement>) => setter(e.target.value);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded shadow-md w-full max-w-md mb-8"
      >
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        <label className="block mb-2">
          Email:
          <input
            type="email"
            value={loginEmail}
            onChange={handleChange(setLoginEmail)}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded"
          />
        </label>
        <label className="block mb-4">
          Password:
          <input
            type="password"
            value={loginPassword}
            onChange={handleChange(setLoginPassword)}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded"
          />
        </label>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded"
        >
          Login
        </button>
      </form>

      <hr className="w-full max-w-md my-8" />

      <form
        onSubmit={handleRegister}
        className="bg-white p-6 rounded shadow-md w-full max-w-md mb-8"
      >
        <h2 className="text-2xl font-bold mb-4">Register</h2>
        <label className="block mb-2">
          Name:
          <input
            type="text"
            value={registerName}
            onChange={handleChange(setRegisterName)}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded"
          />
        </label>
        <label className="block mb-2">
          Email:
          <input
            type="email"
            value={registerEmail}
            onChange={handleChange(setRegisterEmail)}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded"
          />
        </label>
        <label className="block mb-4">
          Password:
          <input
            type="password"
            value={registerPassword}
            onChange={handleChange(setRegisterPassword)}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded"
          />
        </label>
        <button
          type="submit"
          className="w-full bg-green-500 text-white p-2 rounded"
        >
          Register
        </button>
      </form>

      <button
        onClick={handleLogout}
        className="w-full max-w-md bg-red-500 text-white p-2 rounded"
      >
        Logout
      </button>
      <button
        onClick={handleGetMe}
        className="w-full max-w-md bg-green-500 text-white p-2 rounded"
      >
        Get Me
      </button>
    </div>
  );
}
