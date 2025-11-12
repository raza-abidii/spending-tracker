import { useState, useEffect } from "react";
import { ExpenseForm, Expense } from "@/components/ExpenseForm";
import { ExpenseList } from "@/components/ExpenseList";
import { ExpenseSummary } from "@/components/ExpenseSummary";
import { Wallet } from "lucide-react";

const Index = () => {
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem("expenses");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }, [expenses]);

  const handleAddExpense = (newExpense: Omit<Expense, "id">) => {
    const expense: Expense = {
      ...newExpense,
      id: crypto.randomUUID(),
    };
    setExpenses([expense, ...expenses]);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter((expense) => expense.id !== id));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="p-3 bg-primary rounded-xl">
              <Wallet className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Expense Tracker
          </h1>
          <p className="text-muted-foreground text-lg">
            Track your spending, stay on budget
          </p>
        </div>

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
