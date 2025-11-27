import React, { useEffect, useState } from "react";
import AxiosInstance from "../../components/AxiosInstance";

export default function ExpensePage() {
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({
    cost_category: "",
    amount: "",
    note: "",
    expense_date: "",
    recorded_by: "",
  });
  const [saving, setSaving] = useState(false);

  // Fetch cost categories
  const loadCategories = async () => {
    try {
      const res = await AxiosInstance.get("cost-categories/");
      setCategories(res.data);
    } catch (e) {
      console.error("Failed to load cost categories", e);
    }
  };

  // Fetch existing expenses
  const loadExpenses = async () => {
    try {
      const res = await AxiosInstance.get("expenses/");
      setExpenses(res.data);
    } catch (e) {
      console.error("Failed to load expenses", e);
    }
  };

  useEffect(() => {
    loadCategories();
    loadExpenses();
  }, []);

  // Generic onChange
  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Submit handler
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.cost_category || !form.amount || !form.expense_date || !form.recorded_by) {
      return alert("Please fill all required fields");
    }

    setSaving(true);
    try {
      await AxiosInstance.post("expenses/", form);
      alert("Expense saved!");
      setForm({ cost_category: "", amount: "", note: "", expense_date: "", recorded_by: "" });
      await loadExpenses();
    } catch (error) {
      console.error("Save failed:", error);
      alert("Save failed");
    } finally {
      setSaving(false);
    }
  };

  // Delete handler
  const onDelete = async (id) => {
    if (!confirm("Delete this expense?")) return;
    try {
      await AxiosInstance.delete(`expenses/${id}/`);
      await loadExpenses();
    } catch (e) {
      console.error("Delete failed", e);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
        Expenses
      </h2>

      {/* Form */}
      <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-4">
        {/* Cost Category */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Cost Category <span className="text-red-600">*</span>
          </label>
          <select
            name="cost_category"
            value={form.cost_category}
            onChange={onChange}
            required
            className="border border-gray-300 rounded px-3 py-1 w-64 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">-- Select --</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.category_name}
              </option>
            ))}
          </select>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Amount (৳) <span className="text-red-600">*</span>
          </label>
          <input
            type="number"
            name="amount"
            value={form.amount}
            onChange={onChange}
            step="0.01"
            placeholder="Enter amount"
            required
            className="border border-gray-300 rounded px-3 py-1 w-64 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Date <span className="text-red-600">*</span>
          </label>
          <input
            type="date"
            name="expense_date"
            value={form.expense_date}
            onChange={onChange}
            required
            className="border border-gray-300 rounded px-3 py-1 w-52 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Note */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Note
          </label>
          <input
            type="text"
            name="note"
            value={form.note}
            onChange={onChange}
            placeholder="Optional note"
            className="border border-gray-300 rounded px-3 py-1 w-64 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Recorded By */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Recorded By <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            name="recorded_by"
            value={form.recorded_by}
            onChange={onChange}
            placeholder="e.g., Accountant / Cashier"
            required
            className="border border-gray-300 rounded px-3 py-1 w-64 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mb-1">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-950 hover:bg-blue-700 text-white px-3 py-[6px] rounded-md disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            type="reset"
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
            onClick={() =>
              setForm({ cost_category: "", amount: "", note: "", expense_date: "", recorded_by: "" })
            }
          >
            Reset
          </button>
        </div>
      </form>

      {/* Table */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full border border-collapse text-sm">
          <thead className="bg-slate-50 border-b">
            <tr className="text-left text-slate-600">
              <th className="py-2 px-2">SL</th>
              <th className="py-2 px-2">Date</th>
              <th className="py-2 px-2">Category</th>
              <th className="py-2 px-2 text-right">Amount</th>
              <th className="py-2 px-2">Note</th>
              <th className="py-2 px-2">Recorded By</th>
              <th className="py-2 px-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((e, idx) => (
              <tr key={e.id} className="border-b last:border-0">
                <td className="py-2 px-2">{idx + 1}</td>
                <td className="py-2 px-2">{e.expense_date}</td>
                <td className="py-2 px-2">{e.cost_category_name}</td>
                <td className="py-2 px-2 text-right">
                  ৳ {Number(e.amount).toFixed(2)}
                </td>
                <td className="py-2 px-2">{e.note || "-"}</td>
                <td className="py-2 px-2">{e.recorded_by || "-"}</td>
                <td className="py-2 px-2 text-right">
                  <button
                    onClick={() => onDelete(e.id)}
                    className="px-2 py-1 rounded border border-slate-200 hover:border-red-500 text-xs"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {expenses.length === 0 && (
              <tr>
                <td colSpan={7} className="py-4 px-2 text-center text-slate-400">
                  No expenses yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
