import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export type ExpenseCategory = 
  | "food" 
  | "clothes" 
  | "electronics" 
  | "entertainment" 
  | "transport" 
  | "health" 
  | "other";

export interface Expense {
  id: string;
  productName: string;
  price: number;
  category: ExpenseCategory;
  place?: string;
  date: string;
}

interface ExpenseFormProps {
  onAddExpense: (expense: Omit<Expense, "id">) => void;
  onUpdateExpense?: (expense: Expense) => void;
  editingExpense?: Expense | null;
}

export const ExpenseForm = ({ onAddExpense, onUpdateExpense, editingExpense }: ExpenseFormProps) => {
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<ExpenseCategory | "">("");
  const [place, setPlace] = useState("");
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  // Populate form when editing
  useEffect(() => {
    if (editingExpense) {
      setProductName(editingExpense.productName);
      setPrice(editingExpense.price.toString());
      setCategory(editingExpense.category);
      setPlace(editingExpense.place || "");
      setDate(new Date(editingExpense.date).toISOString().split('T')[0]);
    } else {
      // Reset form when not editing
      setProductName("");
      setPrice("");
      setCategory("");
      setPlace("");
      const today = new Date();
      setDate(today.toISOString().split('T')[0]);
    }
  }, [editingExpense]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!productName || !price || !category || !date) {
      toast.error("Please fill in required fields (product name, price, category, date)");
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    if (editingExpense && onUpdateExpense) {
      // Update existing expense
      onUpdateExpense({
        ...editingExpense,
        productName,
        price: priceNum,
        category,
        place: place || undefined,
        date: new Date(date).toISOString(),
      });
      toast.success("Expense updated successfully!");
    } else {
      // Add new expense
      onAddExpense({
        productName,
        price: priceNum,
        category,
        place: place || undefined,
        date: new Date(date).toISOString(),
      });
      toast.success("Expense added successfully!");
    }

    // Reset form
    setProductName("");
    setPrice("");
    setCategory("");
    setPlace("");
    const today = new Date();
    setDate(today.toISOString().split('T')[0]);
  };

  return (
    <Card className="p-6 shadow-[var(--shadow-card)]">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="productName">Product Name</Label>
          <Input
            id="productName"
            placeholder="e.g., Grocery shopping"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="transition-all focus:shadow-[var(--shadow-soft)]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Price (₹)</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="transition-all focus:shadow-[var(--shadow-soft)]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={(value) => setCategory(value as ExpenseCategory)}>
            <SelectTrigger id="category" className="transition-all focus:shadow-[var(--shadow-soft)]">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="food">🍔 Food</SelectItem>
              <SelectItem value="clothes">👕 Clothes</SelectItem>
              <SelectItem value="electronics">💻 Electronics</SelectItem>
              <SelectItem value="entertainment">🎮 Entertainment</SelectItem>
              <SelectItem value="transport">🚗 Transport</SelectItem>
              <SelectItem value="health">⚕️ Health</SelectItem>
              <SelectItem value="other">📦 Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="place">Place (Optional)</Label>
          <Input
            id="place"
            placeholder="e.g., Walmart (optional)"
            value={place}
            onChange={(e) => setPlace(e.target.value)}
            className="transition-all focus:shadow-[var(--shadow-soft)]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="transition-all focus:shadow-[var(--shadow-soft)]"
          />
        </div>

        <Button type="submit" className="w-full" size="lg">
          <Plus className="mr-2 h-4 w-4" />
          {editingExpense ? "Update Expense" : "Add Expense"}
        </Button>
      </form>
    </Card>
  );
};
