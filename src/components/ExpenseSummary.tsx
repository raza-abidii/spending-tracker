import { Expense, ExpenseCategory } from "./ExpenseForm";
import { Card } from "@/components/ui/card";
import { useMemo } from "react";

interface ExpenseSummaryProps {
  expenses: Expense[];
}

export const ExpenseSummary = ({ expenses }: ExpenseSummaryProps) => {
  const summary = useMemo(() => {
    const total = expenses.reduce((sum, expense) => sum + expense.price, 0);
    
    const byCategory: Record<ExpenseCategory, number> = {
      food: 0,
      clothes: 0,
      electronics: 0,
      entertainment: 0,
      transport: 0,
      health: 0,
      other: 0,
    };

    expenses.forEach((expense) => {
      byCategory[expense.category] += expense.price;
    });

    const topCategory = Object.entries(byCategory).reduce(
      (max, [category, amount]) => 
        amount > max.amount ? { category: category as ExpenseCategory, amount } : max,
      { category: "other" as ExpenseCategory, amount: 0 }
    );

    return { total, byCategory, topCategory, count: expenses.length };
  }, [expenses]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="p-6 shadow-[var(--shadow-card)] bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <h3 className="text-sm font-medium opacity-90">Total Spent</h3>
        <p className="text-3xl font-bold mt-2">₹{summary.total.toFixed(2)}</p>
        <p className="text-xs opacity-75 mt-1">{summary.count} transactions</p>
      </Card>

      <Card className="p-6 shadow-[var(--shadow-card)]">
        <h3 className="text-sm font-medium text-muted-foreground">Average per Transaction</h3>
        <p className="text-3xl font-bold mt-2 text-foreground">
          ₹{summary.count > 0 ? (summary.total / summary.count).toFixed(2) : "0.00"}
        </p>
      </Card>

      <Card className="p-6 shadow-[var(--shadow-card)]">
        <h3 className="text-sm font-medium text-muted-foreground">Top Category</h3>
        <p className="text-3xl font-bold mt-2 text-foreground capitalize">
          {summary.topCategory.amount > 0 ? summary.topCategory.category : "N/A"}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          ₹{summary.topCategory.amount.toFixed(2)}
        </p>
      </Card>
    </div>
  );
};
