import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { useAuth } from "@/context/AuthContext";

type AuthMode = "login" | "signup";

type AuthDialogProps = {
  open: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
};

export function AuthDialog({
  open,
  onClose,
  initialMode = "login",
}: AuthDialogProps) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) setMode(initialMode);
  }, [open, initialMode]);

  if (!open) return null;

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError(null);
    setMessage(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setError(null);
    setMessage(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (mode === "signup" && !name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);

    const result =
      mode === "login"
        ? await signIn(email, password)
        : await signUp(name, email, password);

    setIsSubmitting(false);

    if (result) {
      if (mode === "signup" && result.includes("Check your email")) {
        setMessage(result);
        switchMode("login");
        return;
      }
      setError(result);
      return;
    }

    handleClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={handleClose}
    >
      <Card
        className="w-full max-w-md border-white/10 bg-neutral-950 ring-white/10"
        onClick={(event) => event.stopPropagation()}
      >
        <CardHeader>
          <CardTitle className="text-white">
            {mode === "login" ? "Log in" : "Create account"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" ? (
              <div className="space-y-2">
                <label htmlFor="auth-name" className="text-sm text-white/70">
                  Name
                </label>
                <Input
                  id="auth-name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="h-11 border-white/10 bg-black/30 text-white placeholder:text-white/40"
                />
              </div>
            ) : null}

            <div className="space-y-2">
              <label htmlFor="auth-email" className="text-sm text-white/70">
                Email
              </label>
              <Input
                id="auth-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-11 border-white/10 bg-black/30 text-white placeholder:text-white/40"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="auth-password" className="text-sm text-white/70">
                Password
              </label>
              <PasswordInput
                id="auth-password"
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="border-white/10 bg-black/30 text-white placeholder:text-white/40"
              />
            </div>

            {mode === "signup" ? (
              <div className="space-y-2">
                <label
                  htmlFor="auth-confirm-password"
                  className="text-sm text-white/70"
                >
                  Confirm password
                </label>
                <PasswordInput
                  id="auth-confirm-password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="border-white/10 bg-black/30 text-white placeholder:text-white/40"
                />
              </div>
            ) : null}

            {error ? (
              <p className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">
                {error}
              </p>
            ) : null}

            {message ? (
              <p className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
                {message}
              </p>
            ) : null}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 w-full rounded-xl bg-emerald-500 font-semibold text-black hover:bg-emerald-400"
            >
              {isSubmitting
                ? "Please wait..."
                : mode === "login"
                  ? "Log in"
                  : "Sign up"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-white/60">
            {mode === "login" ? "No account yet?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => switchMode(mode === "login" ? "signup" : "login")}
              className="font-medium text-emerald-300 hover:text-emerald-200"
            >
              {mode === "login" ? "Sign up" : "Log in"}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
