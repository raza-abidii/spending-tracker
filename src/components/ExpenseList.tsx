import { Expense, ExpenseCategory } from "./ExpenseForm";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface ExpenseListProps {
  expenses: Expense[];
  onDeleteExpense: (id: string) => void;
  onEditExpense: (expense: Expense) => void;
}

const categoryColors: Record<ExpenseCategory, string> = {
  food: "bg-category-food text-white",
  clothes: "bg-category-clothes text-white",
  electronics: "bg-category-electronics text-white",
  entertainment: "bg-category-entertainment text-white",
  transport: "bg-category-transport text-white",
  health: "bg-category-health text-white",
  other: "bg-category-other text-white",
};

const categoryIcons: Record<ExpenseCategory, string> = {
  food: "🍔",
  clothes: "👕",
  electronics: "💻",
  entertainment: "🎮",
  transport: "🚗",
  health: "⚕️",
  other: "📦",
};

export const ExpenseList = ({ expenses, onDeleteExpense, onEditExpense }: ExpenseListProps) => {
  if (expenses.length === 0) {
    return (
      <Card className="p-8 text-center shadow-[var(--shadow-card)]">
        <p className="text-muted-foreground">No expenses yet. Add your first expense above!</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {expenses.map((expense) => (
        <Card
          key={expense.id}
          className="p-4 shadow-[var(--shadow-card)] hover:shadow-lg transition-all duration-200"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="text-2xl">{categoryIcons[expense.category]}</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">
                  {expense.productName}
                </h3>
                <p className="text-sm text-muted-foreground truncate">
                  {expense.place || "No place specified"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge className={categoryColors[expense.category]}>
                {expense.category}
              </Badge>
              <div className="text-right">
                <p className="font-bold text-lg text-foreground">
                  ₹{expense.price.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(expense.date), "MMM d, yyyy")}
                </p>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEditExpense(expense)}
                  className="text-primary hover:text-primary hover:bg-primary/10"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDeleteExpense(expense.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
