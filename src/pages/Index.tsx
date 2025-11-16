import { useState, useEffect } from "react";
import { ExpenseForm, Expense } from "@/components/ExpenseForm";
import { ExpenseList } from "@/components/ExpenseList";
import { ExpenseSummary } from "@/components/ExpenseSummary";
import { Wallet } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { user, signOut } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const navigate = useNavigate();

  const handleSaveToCloud = async () => {
    if (!user) {
      // prompt login
      toast("Please sign in to save your data to the cloud.");
      navigate("/login");
      return;
    }

    try {
      setSyncing(true);
      const s = localStorage.getItem("expenses");
      const local = s ? JSON.parse(s) : [];
      if (local.length === 0) {
        toast("No local expenses to save");
        setSyncing(false);
        return;
      }

      const payload = local.map((e: any) => ({ ...e, user_id: user.id }));
      const { error } = await supabase.from("expenses").upsert(payload, { onConflict: "id" });
      if (error) throw error;

      const { data: refreshed, error: refreshErr } = await supabase.from("expenses").select("*").eq("user_id", user.id);
      if (refreshErr) throw refreshErr;

      setExpenses(refreshed ?? []);
      localStorage.setItem("expenses", JSON.stringify(refreshed ?? []));
      toast.success("Saved to cloud and synced successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save to cloud");
    } finally {
      setSyncing(false);
    }
  };

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem("expenses");
    return saved ? JSON.parse(saved) : [];
  });

  // persist locally always
  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }, [expenses]);

  // When a user logs in, fetch their server-side expenses and merge with local
  useEffect(() => {
    if (!user) return;
    let mounted = true;

    (async () => {
      try {
        setSyncing(true);
        // fetch server expenses
        const { data: serverExpenses, error } = await supabase
          .from("expenses")
          .select("*")
          .eq("user_id", user.id);

        if (error) throw error;

        const local = (() => {
          const s = localStorage.getItem("expenses");
          return s ? JSON.parse(s) : [];
        })();

        // merge by id: keep server copy when id exists there
        const serverMap = new Map(serverExpenses?.map((e: any) => [e.id, e]));

        const toUpsert = [] as any[];

        // local items not present on server should be uploaded (migrated)
        for (const le of local) {
          if (!serverMap.has(le.id)) {
            toUpsert.push({ ...le, user_id: user.id });
          }
        }

        if (toUpsert.length > 0) {
          // upsert migrated items into server
          const { error: upsertErr } = await supabase.from("expenses").upsert(toUpsert, { onConflict: "id" });
          if (upsertErr) throw upsertErr;
        }

        // final authoritative list is server + any local-only that were uploaded
        const { data: refreshed, error: refreshErr } = await supabase.from("expenses").select("*").eq("user_id", user.id);
        if (refreshErr) throw refreshErr;

        if (!mounted) return;
        setExpenses(refreshed ?? []);
        localStorage.setItem("expenses", JSON.stringify(refreshed ?? []));
        setSyncing(false);
      } catch (err) {
        if (mounted) setSyncing(false);
        console.error("Sync error", err);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [user]);

  const handleAddExpense = async (newExpense: Omit<Expense, "id">) => {
    const expense: Expense = {
      ...newExpense,
      id: crypto.randomUUID(),
    };

    // Add locally first
    setExpenses((prev) => [expense, ...prev]);

    // If user logged in, also save to server
    if (user) {
      try {
        const payload = { ...expense, user_id: user.id } as any;
        const { error } = await supabase.from("expenses").insert(payload);
        if (error) console.error("Failed to save expense to server", error);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter((expense) => expense.id !== id));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary rounded-xl">
                <Wallet className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">Expense Tracker</h1>
                <p className="text-muted-foreground text-lg">Track your spending, stay on budget</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleSaveToCloud} disabled={syncing}>
                {syncing ? "Saving..." : "Save to Cloud"}
              </Button>

              {!user ? (
                <Link to="/login">
                  <Button>Login</Button>
                </Link>
              ) : (
                <Button variant="ghost" onClick={async () => { await signOut(); toast.success("Signed out"); }}>
                  Logout
                </Button>
              )}
            </div>
          </div>
        </div>

        {syncing ? (
          <div className="mb-4">
            <div className="p-3 bg-yellow-50 text-yellow-800 rounded border border-yellow-100">
              Syncing local data with cloud...
            </div>
          </div>
        ) : null}

        {/* Summary Cards */}
        <div className="mb-8">
          <ExpenseSummary expenses={expenses} />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Add New Expense</h2>
            <ExpenseForm onAddExpense={handleAddExpense} />
          </div>

          {/* List */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Recent Expenses</h2>
            <ExpenseList expenses={expenses} onDeleteExpense={handleDeleteExpense} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
