import { useState, type FormEvent } from "react";

interface SignInProps {
  onSignIn: (email: string, password: string) => Promise<void> | void;
  error?: string;
  isSubmitting?: boolean;
}

export default function SignIn({ onSignIn, error, isSubmitting }: SignInProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSignIn(email, password);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#24231f] relative overflow-hidden w-full px-4">
      <div className="relative z-10 w-full max-w-sm rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.35)] p-8 flex flex-col items-center">
        <div className="flex items-center gap-4 mb-6">
          <img
            src="/Atum Logo.png"
            alt="Atum Logo"
            className="h-14 w-14 object-contain"
          />
          <h2 className="font-serif text-3xl font-light tracking-[0.18em] text-white">
            ATUM AI
          </h2>
        </div>

        <form className="flex flex-col w-full gap-4" onSubmit={handleSubmit}>
          <div className="w-full flex flex-col gap-3">
            <input
              placeholder="Email"
              type="email"
              value={email}
              className="w-full px-5 py-3 rounded-xl bg-white/10 text-white placeholder:text-white/45 text-sm focus:outline-none focus:ring-2 focus:ring-white/25"
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
            />
            <input
              placeholder="Password"
              type="password"
              value={password}
              className="w-full px-5 py-3 rounded-xl bg-white/10 text-white placeholder:text-white/45 text-sm focus:outline-none focus:ring-2 focus:ring-white/25"
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
            />
            {error && <div className="text-sm text-red-300 text-left">{error}</div>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-white/10 text-white font-medium px-5 py-3 rounded-full shadow hover:bg-white/15 transition text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
