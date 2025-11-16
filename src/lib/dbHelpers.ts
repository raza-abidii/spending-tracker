import { Expense } from "@/components/ExpenseForm";

// Database row type (snake_case)
export interface ExpenseRow {
  id: string;
  user_id: string;
  product_name: string;
  price: number;
  category: string;
  place: string;
  date: string;
  created_at?: string;
}

// Convert JavaScript expense (camelCase) to database row (snake_case)
export function expenseToRow(expense: Expense, userId: string): ExpenseRow {
  return {
    id: expense.id,
    user_id: userId,
    product_name: expense.productName,
    price: expense.price,
    category: expense.category,
    place: expense.place,
    date: expense.date,
  };
}

// Convert database row (snake_case) to JavaScript expense (camelCase)
export function rowToExpense(row: ExpenseRow): Expense {
  return {
    id: row.id,
    productName: row.product_name,
    price: row.price,
    category: row.category as any,
    place: row.place,
    date: row.date,
  };
}
