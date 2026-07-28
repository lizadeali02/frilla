"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      setMessage("Şifrə minimum 6 simvol olmalıdır.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Şifrələr eyni deyil.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage("Şifrə uğurla dəyişdirildi. Giriş səhifəsinə yönləndirilirsiniz...");

    setTimeout(() => {
      router.push("/giris");
    }, 2000);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">

        <h1 className="text-3xl font-bold text-center mb-2">
          Yeni şifrə
        </h1>

        <p className="text-gray-500 text-center mb-8">
          Hesabınız üçün yeni şifrə yaradın.
        </p>

        <form onSubmit={handleResetPassword} className="space-y-5">

          <div>
            <label className="block mb-2 text-sm font-medium">
              Yeni şifrə
            </label>

            <input
              type="password"
              placeholder="Yeni şifrə"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-600"
              required
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">
              Şifrəni təkrar et
            </label>

            <input
              type="password"
              placeholder="Şifrəni təkrar et"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-600"
              required
            />
          </div>

          {message && (
            <div className="text-center text-sm text-red-600">
              {message}
            </div>
          )}

          <button
            disabled={loading}
            className="w-full bg-purple-700 hover:bg-purple-800 text-white py-3 rounded-xl font-semibold transition"
          >
            {loading ? "Dəyişdirilir..." : "Şifrəni dəyiş"}
          </button>

        </form>
      </div>
    </main>
  );
}