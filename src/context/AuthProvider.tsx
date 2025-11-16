import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface AuthContextValue {
  user: any | null;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    // check initial session
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) console.error("getSession error", error);
      setUser(data.session?.user ?? null);
    }).catch((e) => console.error("getSession exception", e));

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed", _event, session);
      setUser(session?.user ?? null);
    });

    return () => {
      try {
        sub.subscription.unsubscribe();
      } catch (e) {
        // ignore
      }
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const signUp = async (email: string, password: string) => {
    return await supabase.auth.signUp({ email, password });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
