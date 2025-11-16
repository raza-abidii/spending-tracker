import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/AuthProvider";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const LoginPage: React.FC = () => {
  const { user, signIn, signUp, signOut } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect to home if already signed in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

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
        const errMsg = (res as any).error.message || "Sign in failed";
        toast.error(errMsg);
      } else {
        toast.success("Signed in successfully!");
        // Redirect happens via useEffect when user state updates
      }
    } catch (err) {
      setLoading(false);
      const errMsg = (err as any)?.message || String(err);
      toast.error("Sign in failed: " + errMsg);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    try {
      const res = await signUp(email, password);
      setLoading(false);
      if ((res as any).error) {
        const errMsg = (res as any).error.message || "Sign up failed";
        toast.error(errMsg);
      } else {
        toast.success("Sign up successful! You can now sign in.");
        // Clear form
        setPassword("");
      }
    } catch (err) {
      setLoading(false);
      const errMsg = (err as any)?.message || String(err);
      toast.error("Sign up failed: " + errMsg);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="p-6 w-full max-w-md">
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground mb-2">Expense Tracker</h2>
            <p className="text-muted-foreground">Sign in to sync your expenses across devices</p>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email"
              placeholder="your@email.com"
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password"
              placeholder="At least 6 characters"
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
            />
            <p className="text-xs text-muted-foreground mt-1">Minimum 6 characters</p>
          </div>
          <div className="flex flex-col gap-2">
            <Button onClick={handleSignIn} disabled={loading} className="w-full">
              {loading ? "Signing in..." : "Sign in"}
            </Button>
            <Button variant="outline" onClick={handleSignUp} disabled={loading} className="w-full">
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
