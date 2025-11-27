// src/pages/stock/Inventory.jsx
import { useState, useEffect } from "react";
import AxiosInstance from "../../../components/AxiosInstance";
import toast from "react-hot-toast";
import DamageModal from "./DamageModal";

export default function Stocks() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStock, setSelectedStock] = useState(null);
 
  // Fetch stocks from API
  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const res = await AxiosInstance.get("/stocks/");
        setItems(res.data);
      } catch (err) {
        console.error("Failed to fetch stocks:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStocks();
  }, []);


  const updateItem = (updatedStock) => {
    setItems((prev) =>
      prev.map((i) => (i.id === updatedStock.id ? updatedStock : i))
    );
  };


  // KPI calculations
  const totalOnHand = items.reduce((sum, i) => sum + i.current_stock_quantity, 0);
  const lowStockCount = items.filter((i) => i.current_stock_quantity <= i.reorder_level).length;
  const fastMovingCount = items.filter((i) => i.moving_speed === "Fast-moving").length;
  const damagedCount = items.reduce((sum, i) => sum + i.damage_quantity, 0);

  const stockStatusClass = (item) => {
    if (item.current_stock_quantity <= item.reorder_level) return "bg-red-100 text-red-700";
    if (item.moving_speed === "Fast-moving") return "bg-green-100 text-green-700";
    return "bg-yellow-100 text-yellow-700";
  };

  if (loading) return <p>Loading inventory...</p>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Inventory Management</h1>
          <p className="text-sm text-slate-500 max-w-2xl">
            Maintain optimal inventory levels with real-time tracking of purchases, sales, and stock
            movement. Reduce carrying costs, prevent stock-outs, and make informed decisions with
            demand forecasting.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Units On Hand"
          value={totalOnHand}
          description="All active inventory items currently in stock."
        />
        <StatCard
          title="Low Stock Items"
          value={lowStockCount}
          description="Reached or below reorder level, needs attention."
          tone="warn"
        />
        <StatCard
          title="Fast-moving Items"
          value={fastMovingCount}
          description="High-demand items to replenish continuously."
          tone="good"
        />
        <StatCard
          title="Damaged / Lost"
          value={damagedCount}
          description="Recorded damaged or written-off items."
          tone="bad"
        />
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search by product name / SKU / category"
              className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 w-72 focus:outline-none focus:ring focus:ring-blue-500/30"
            />
            <select className="text-sm border border-slate-200 rounded-lg px-3 py-1.5">
              <option>Filter: All</option>
              <option>Fast-moving</option>
              <option>Low stock</option>
              <option>Slow moving</option>
            </select>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead className="border-b bg-slate-50">
            <tr className="text-left text-slate-500">
              <th className="py-2 px-2">Product</th>
              <th className="py-2 px-2">Code</th>
              <th className="py-2 px-2 text-right">Purchase Qty</th>
              <th className="py-2 px-2 text-right">Sale Qty</th>
              <th className="py-2 px-2 text-right">On Hand</th>
              <th className="py-2 px-2 text-right">Damage Qty</th>
              <th className="py-2 px-2">Status</th>
              <th className="py-2 px-2">Add Damage</th>
              <th className="py-2 px-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b last:border-0">
                <td className="py-2 px-2 font-medium">{item.product.product_name}</td>
                <td className="py-2 px-2 text-xs font-mono">{item.product.product_code}</td>
                <td className="py-2 px-2 text-right">{item.purchase_quantity}</td>
                <td className="py-2 px-2 text-right">{item.sale_quantity}</td>
                <td className="py-2 px-2 text-right">{item.current_stock_quantity}</td>
                <td className="py-2 px-2 text-right">{item.damage_quantity}</td>
                <td className="py-2 px-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${stockStatusClass(item)}`}>
                    {item.current_stock_quantity <= 10 ? "Low Stock" : "Healthy"}
                  </span>
                </td>
                <td
                  className="text-center cursor-pointer text-green-600 font-bold text-2xl"
                  onClick={() => setSelectedStock(item)}
                >
                  +
                </td>
                <td className="py-2 px-2 text-right text-xs space-x-2">
                  <button className="px-2 py-1 rounded border border-slate-200 hover:border-blue-500">
                    Adjust
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Damage Modal Component */}
      {selectedStock && (
        <DamageModal
          stock={selectedStock}
          onClose={() => setSelectedStock(null)}
          onUpdated={updateItem}
        />
      )}

    </div>
  );
}

// --- Helper Components ---
function StatCard({ title, value, description, tone = "neutral" }) {
  const toneClasses = {
    neutral: "bg-white border-slate-200",
    good: "bg-emerald-50 border-emerald-100",
    warn: "bg-amber-50 border-amber-100",
    bad: "bg-red-50 border-red-100",
  };
  return (
    <div className={`rounded-xl border shadow-sm p-4 ${toneClasses[tone]}`}>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{title}</div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
      <div className="mt-1 text-xs text-slate-500">{description}</div>
    </div>
  );
}

function FeatureCard({ title, points }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
      <h2 className="text-sm font-semibold mb-2">{title}</h2>
      <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
        {points.map((p) => <li key={p}>{p}</li>)}
      </ul>
    </div>
  );
}
