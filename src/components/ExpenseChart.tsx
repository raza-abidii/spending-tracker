import { Expense, ExpenseCategory } from "./ExpenseForm";
import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ExpenseChartProps {
  expenses: Expense[];
  selectedCategory: ExpenseCategory | null;
  onCategorySelect: (category: ExpenseCategory | null) => void;
}

const categoryColors: Record<ExpenseCategory, string> = {
  food: "#ef4444",
  clothes: "#f97316",
  electronics: "#3b82f6",
  entertainment: "#8b5cf6",
  transport: "#10b981",
  health: "#ec4899",
  other: "#6b7280",
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

export const ExpenseChart = ({ expenses, selectedCategory, onCategorySelect }: ExpenseChartProps) => {
  // Group expenses by category
  const categoryData = expenses.reduce((acc, expense) => {
    const category = expense.category;
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += expense.price;
    return acc;
  }, {} as Record<ExpenseCategory, number>);

  // Convert to array for recharts
  const chartData = Object.entries(categoryData).map(([category, value]) => ({
    name: category,
    value: value,
    color: categoryColors[category as ExpenseCategory],
    icon: categoryIcons[category as ExpenseCategory],
  }));

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.price, 0);

  if (expenses.length === 0) {
    return (
      <Card className="p-8 text-center shadow-[var(--shadow-card)]">
        <p className="text-muted-foreground">No expenses to display in chart</p>
      </Card>
    );
  }

  const handlePieClick = (data: any) => {
    const category = data.name as ExpenseCategory;
    if (selectedCategory === category) {
      onCategorySelect(null); // Deselect if clicking the same category
    } else {
      onCategorySelect(category);
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = ((data.value / totalExpenses) * 100).toFixed(1);
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold flex items-center gap-2">
            <span>{data.payload.icon}</span>
            <span className="capitalize">{data.name}</span>
          </p>
          <p className="text-sm text-muted-foreground">₹{data.value.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">{percentage}% of total</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-foreground">Expenses by Category</h3>
        {selectedCategory && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCategorySelect(null)}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Clear Filter
          </Button>
        )}
      </div>

      {selectedCategory && (
        <div className="mb-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
          <p className="text-sm font-medium flex items-center gap-2">
            <span>{categoryIcons[selectedCategory]}</span>
            <span>Filtered by: <span className="capitalize font-bold">{selectedCategory}</span></span>
          </p>
        </div>
      )}

      <div className="w-full h-[300px] md:h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              onClick={handlePieClick}
              cursor="pointer"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  opacity={selectedCategory && selectedCategory !== entry.name ? 0.3 : 1}
                  stroke={selectedCategory === entry.name ? "#000" : "none"}
                  strokeWidth={selectedCategory === entry.name ? 3 : 0}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value) => {
                const icon = categoryIcons[value as ExpenseCategory];
                return `${icon} ${value.charAt(0).toUpperCase() + value.slice(1)}`;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 p-4 bg-muted rounded-lg">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Expenses</p>
            <p className="text-2xl font-bold text-foreground">₹{totalExpenses.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Categories</p>
            <p className="text-2xl font-bold text-foreground">{chartData.length}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 text-xs text-muted-foreground text-center">
        Click on a category in the chart to filter expenses
      </div>
    </Card>
  );
};
