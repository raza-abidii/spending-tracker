import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/AuthProvider";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";

const LoginPage: React.FC = () => {
  const { user, signIn, signUp, signOut } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDebug, setShowDebug] = useState(true);
  const [lastError, setLastError] = useState<string | null>(null);

  const handleSignIn = async () => {
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    setLoading(true);
    setLastError(null);
    try {
      const res = await signIn(email, password);
      setLoading(false);
      if ((res as any).error) {
        console.error("Sign in error:", res);
        const errMsg = (res as any).error.message || "Sign in failed";
        setLastError(JSON.stringify(res, null, 2));
        toast.error(errMsg);
      } else {
        toast.success("Signed in");
      }
    } catch (err) {
      setLoading(false);
      console.error("Sign in exception:", err);
      const errMsg = (err as any)?.message || String(err);
      setLastError(errMsg);
      toast.error("Sign in failed: " + errMsg);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    setLoading(true);
    setLastError(null);
    try {
      const res = await signUp(email, password);
      setLoading(false);
      if ((res as any).error) {
        console.error("Sign up error:", res);
        const errMsg = (res as any).error.message || "Sign up failed";
        setLastError(JSON.stringify(res, null, 2));
        toast.error(errMsg);
      } else {
        toast.success("Sign up successful. Check your email for confirmation if required.");
      }
    } catch (err) {
      setLoading(false);
      console.error("Sign up exception:", err);
      const errMsg = (err as any)?.message || String(err);
      setLastError(errMsg);
      toast.error("Sign up failed: " + errMsg);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="p-6 w-full max-w-md">
        {!user ? (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Sign in / Sign up</h2>
            
            {showDebug && (
              <div className="p-3 bg-blue-50 rounded text-xs space-y-2 border border-blue-200">
                <div><strong>Supabase URL:</strong> {import.meta.env.VITE_SUPABASE_URL || "❌ NOT SET"}</div>
                <div><strong>Anon Key:</strong> {import.meta.env.VITE_SUPABASE_ANON_KEY ? `✅ ${import.meta.env.VITE_SUPABASE_ANON_KEY.slice(0,20)}...` : "❌ NOT SET"}</div>
                <div><strong>Supabase client:</strong> {supabase ? "✅ Initialized" : "❌ Not initialized"}</div>
                <div><strong>User:</strong> {user ? `✅ ${user.email}` : "Not signed in"}</div>
                <Button variant="ghost" size="sm" onClick={() => setShowDebug(false)} className="mt-2">Hide Debug</Button>
              </div>
            )}

            {lastError && (
              <div className="p-3 bg-red-50 text-red-800 rounded text-xs border border-red-200 max-h-40 overflow-auto">
                <strong>Last Error:</strong>
                <pre className="mt-1 whitespace-pre-wrap">{lastError}</pre>
              </div>
            )}

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
