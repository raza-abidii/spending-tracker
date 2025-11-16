import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/AuthProvider";
import { toast } from "sonner";

const LoginPage: React.FC = () => {
  const { user, signIn, signUp, signOut } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      const res = await signIn(email, password);
      setLoading(false);
      if ((res as any).error) {
        console.error("Sign in error:", res);
        toast.error((res as any).error.message || "Sign in failed");
      } else {
        toast.success("Signed in");
      }
    } catch (err) {
      setLoading(false);
      console.error("Sign in exception:", err);
      toast.error((err as any)?.message || "Sign in failed (network)");
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      const res = await signUp(email, password);
      setLoading(false);
      if ((res as any).error) {
        console.error("Sign up error:", res);
        toast.error((res as any).error.message || "Sign up failed");
      } else {
        toast.success("Sign up successful. Check your email for confirmation if required.");
      }
    } catch (err) {
      setLoading(false);
      console.error("Sign up exception:", err);
      toast.error((err as any)?.message || "Sign up failed (network)");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="p-6 w-full max-w-md">
        {!user ? (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Sign in / Sign up</h2>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSignIn} disabled={loading}>
                Sign in
              </Button>
              <Button variant="secondary" onClick={handleSignUp} disabled={loading}>
                Sign up
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Signed in as</h2>
            <p className="text-sm">{user?.email}</p>
            <div className="flex gap-2">
              <Button onClick={async () => { await signOut(); toast.success("Signed out"); }}>
                Sign out
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default LoginPage;
