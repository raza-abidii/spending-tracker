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
import { expenseToRow, rowToExpense } from "@/lib/dbHelpers";

const Index = () => {
  const { user, signOut } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
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

      console.log("Saving to cloud:", local);
      const payload = local.map((e: Expense) => expenseToRow(e, user.id));
      console.log("Converted payload:", payload);
      const { error, data } = await supabase.from("expenses").upsert(payload, { onConflict: "id" });
      
      if (error) {
        console.error("Upsert error:", error);
        throw new Error(`Database error: ${error.message} (${error.code || 'unknown'})`);
      }

      console.log("Upsert result:", data);

      const { data: refreshed, error: refreshErr } = await supabase.from("expenses").select("*").eq("user_id", user.id);
      if (refreshErr) {
        console.error("Refresh error:", refreshErr);
        throw new Error(`Refresh error: ${refreshErr.message}`);
      }

      console.log("Refreshed from cloud:", refreshed);
      const expenses = (refreshed ?? []).map(rowToExpense);
      setExpenses(expenses);
      localStorage.setItem("expenses", JSON.stringify(expenses));
      toast.success(`Saved ${payload.length} expense(s) to cloud successfully!`);
    } catch (err: any) {
      console.error("Save to cloud error:", err);
      toast.error(err?.message || "Failed to save to cloud");
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
            toUpsert.push(expenseToRow(le, user.id));
          }
        }

        if (toUpsert.length > 0) {
          console.log("Migrating local expenses to cloud:", toUpsert);
          // upsert migrated items into server
          const { error: upsertErr } = await supabase.from("expenses").upsert(toUpsert, { onConflict: "id" });
          if (upsertErr) {
            console.error("Migration upsert error:", upsertErr);
            throw upsertErr;
          }
          console.log("Migration successful");
        }

        // final authoritative list is server + any local-only that were uploaded
        const { data: refreshed, error: refreshErr } = await supabase.from("expenses").select("*").eq("user_id", user.id);
        if (refreshErr) throw refreshErr;

        if (!mounted) return;
        const expenses = (refreshed ?? []).map(rowToExpense);
        setExpenses(expenses);
        localStorage.setItem("expenses", JSON.stringify(expenses));
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
        const payload = expenseToRow(expense, user.id);
        console.log("Inserting new expense to cloud:", payload);
        const { error } = await supabase.from("expenses").insert(payload);
        if (error) {
          console.error("Failed to save expense to server:", error);
          toast.error(`Failed to sync: ${error.message}`);
        } else {
          console.log("Expense saved to cloud successfully");
        }
      } catch (e) {
        console.error("Exception saving expense:", e);
      }
    }
  };

  const handleDeleteExpense = async (id: string) => {
    setExpenses(expenses.filter((expense) => expense.id !== id));

    // If user logged in, also delete from server
    if (user) {
      try {
        const { error } = await supabase.from("expenses").delete().eq("id", id).eq("user_id", user.id);
        if (error) {
          console.error("Failed to delete expense from server:", error);
          toast.error(`Failed to sync deletion: ${error.message}`);
        } else {
          console.log("Expense deleted from cloud successfully");
        }
      } catch (e) {
        console.error("Exception deleting expense:", e);
      }
    }
  };

  const handleUpdateExpense = async (updatedExpense: Expense) => {
    // Update locally
    setExpenses(prev => prev.map(e => e.id === updatedExpense.id ? updatedExpense : e));
    
    // Clear editing state
    setEditingExpense(null);

    // If user logged in, also update on server
    if (user) {
      try {
        const payload = expenseToRow(updatedExpense, user.id);
        console.log("Updating expense in cloud:", payload);
        const { error } = await supabase.from("expenses").update(payload).eq("id", updatedExpense.id).eq("user_id", user.id);
        if (error) {
          console.error("Failed to update expense on server:", error);
          toast.error(`Failed to sync update: ${error.message}`);
        } else {
          console.log("Expense updated in cloud successfully");
        }
      } catch (e) {
        console.error("Exception updating expense:", e);
      }
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary rounded-xl">
                <Wallet className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-1">Expense Tracker</h1>
                <p className="text-muted-foreground text-sm sm:text-lg">Track your spending, stay on budget</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <Button variant="outline" onClick={handleSaveToCloud} disabled={syncing} className="w-full sm:w-auto">
                {syncing ? "Saving..." : "Save to Cloud"}
              </Button>

              {!user ? (
                <Link to="/login" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto">Login</Button>
                </Link>
              ) : (
                <Button variant="ghost" onClick={async () => { await signOut(); toast.success("Signed out"); }} className="w-full sm:w-auto">
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
            <h2 className="text-xl font-semibold mb-4 text-foreground">
              {editingExpense ? "Edit Expense" : "Add New Expense"}
            </h2>
            {editingExpense && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setEditingExpense(null)}
                className="mb-3 w-full"
              >
                Cancel Edit
              </Button>
            )}
            <ExpenseForm 
              onAddExpense={handleAddExpense} 
              onUpdateExpense={handleUpdateExpense}
              editingExpense={editingExpense}
            />
          </div>

          {/* List */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Recent Expenses</h2>
            <ExpenseList 
              expenses={expenses} 
              onDeleteExpense={handleDeleteExpense}
              onEditExpense={handleEditExpense}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
