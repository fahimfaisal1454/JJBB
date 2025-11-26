import { useMemo, useState } from "react";

const STATUS_STYLES = {
  Balanced: "bg-emerald-100 text-emerald-700",
  Short: "bg-rose-100 text-rose-700",
  Excess: "bg-amber-100 text-amber-700",
};

const INITIAL_DENOMINATIONS = [
  { id: 1, label: "৳ 1,000", value: 1000 },
  { id: 2, label: "৳ 500", value: 500 },
  { id: 3, label: "৳ 200", value: 200 },
  { id: 4, label: "৳ 100", value: 100 },
  { id: 5, label: "৳ 50", value: 50 },
  { id: 6, label: "৳ 20", value: 20 },
  { id: 7, label: "৳ 10", value: 10 },
  { id: 8, label: "৳ 5", value: 5 },
  { id: 9, label: "৳ 2", value: 2 },
  { id: 10, label: "৳ 1", value: 1 },
];

export default function CashReconciliation() {
  // Book / system side
  const [cashForm, setCashForm] = useState({
    date: "",
    cashier: "",
    openingBalance: "",
    receipts: "",
    payments: "",
    remarks: "",
  });

  // Denomination counts
  const [denoms, setDenoms] = useState(
    INITIAL_DENOMINATIONS.map((d) => ({ ...d, count: "" }))
  );

  // Saved reconciliation history
  const [reconciliations, setReconciliations] = useState([]);

  // ===== Derived values =====

  const opening = Number(cashForm.openingBalance) || 0;
  const receipts = Number(cashForm.receipts) || 0;
  const payments = Number(cashForm.payments) || 0;

  // System (book) closing = opening + receipts – payments
  const systemClosing = useMemo(
    () => opening + receipts - payments,
    [opening, receipts, payments]
  );

  const physicalTotal = useMemo(
    () =>
      denoms.reduce((sum, d) => {
        const count = Number(d.count) || 0;
        return sum + d.value * count;
      }, 0),
    [denoms]
  );

  const difference = useMemo(
    () => physicalTotal - systemClosing,
    [physicalTotal, systemClosing]
  );

  let status = "Balanced";
  if (difference < 0) status = "Short";
  if (difference > 0) status = "Excess";

  // ===== Handlers =====

  const handleCashFormChange = (e) => {
    const { name, value } = e.target;
    setCashForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDenomChange = (id, value) => {
    setDenoms((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              count: value.replace(/[^0-9]/g, ""),
            }
          : d
      )
    );
  };

  const resetForm = () => {
    setCashForm({
      date: "",
      cashier: "",
      openingBalance: "",
      receipts: "",
      payments: "",
      remarks: "",
    });
    setDenoms(INITIAL_DENOMINATIONS.map((d) => ({ ...d, count: "" })));
  };

  const saveReconciliation = (e) => {
    e.preventDefault();
    if (!cashForm.date || !cashForm.cashier) return;

    const newItem = {
      id: Date.now(),
      date: cashForm.date,
      cashier: cashForm.cashier,
      systemClosing,
      physicalTotal,
      difference,
      status,
      remarks: cashForm.remarks,
    };

    setReconciliations((prev) => [newItem, ...prev]);
    resetForm();
  };

  // ===== UI =====

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-slate-50 px-4 py-4 sm:px-6 sm:py-5 shadow-sm border border-slate-800/60">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-700/80 text-xl">
              🧾
            </span>
            <div>
              <h1 className="text-lg sm:text-xl font-semibold tracking-tight">
                Cash Reconciliation
              </h1>
              <p className="text-xs sm:text-sm text-slate-300">
                Compare system cash balance with physical cash in hand and record
                differences.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-700/70 px-3 py-1">
              System Closing:
              <span className="font-semibold">
                ৳ {systemClosing.toLocaleString()}
              </span>
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-700/70 px-3 py-1">
              Physical Cash:
              <span className="font-semibold">
                ৳ {physicalTotal.toLocaleString()}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4">
        <SummaryCard
          label="System Closing (Book)"
          value={`৳ ${systemClosing.toLocaleString()}`}
          subtitle="Opening + Receipts – Payments"
        />
        <SummaryCard
          label="Physical Cash Counted"
          value={`৳ ${physicalTotal.toLocaleString()}`}
          subtitle="Total of denominations"
        />
        <SummaryCard
          label="Difference"
          value={`৳ ${difference.toLocaleString()}`}
          subtitle={
            difference === 0
              ? "No difference"
              : difference > 0
              ? "Excess cash in hand"
              : "Short cash in hand"
          }
        />
        <SummaryCard
          label="Status"
          value={status}
          subtitle="Result of this reconciliation"
          status={status}
        />
      </div>

      {/* Main content: left = book side, right = denomination table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Book / system side */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3 text-sm">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-semibold text-slate-800">
              Book / System Balance
            </h2>
            <span className="text-[11px] text-slate-500">
              From cash book / software
            </span>
          </div>

          <form onSubmit={saveReconciliation} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={cashForm.date}
                  onChange={handleCashFormChange}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  Cashier / User *
                </label>
                <input
                  name="cashier"
                  value={cashForm.cashier}
                  onChange={handleCashFormChange}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                  placeholder="Person performing reconciliation"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <NumberField
                label="Opening Balance"
                name="openingBalance"
                value={cashForm.openingBalance}
                onChange={handleCashFormChange}
              />
              <NumberField
                label="Total Receipts"
                name="receipts"
                value={cashForm.receipts}
                onChange={handleCashFormChange}
              />
              <NumberField
                label="Total Payments"
                name="payments"
                value={cashForm.payments}
                onChange={handleCashFormChange}
              />
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">System Closing Balance</span>
                <span className="font-semibold">
                  ৳ {systemClosing.toLocaleString()}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                This is the closing cash according to your system. It will be
                compared against the physical cash counted on the right.
              </p>
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1">
                Remarks / Notes
              </label>
              <textarea
                name="remarks"
                value={cashForm.remarks}
                onChange={handleCashFormChange}
                rows={2}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                placeholder="Example: shift closing, daily reconciliation, cash handover, etc."
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={resetForm}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                Clear form
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-900 text-white text-xs font-medium shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/40"
              >
                Save Reconciliation
              </button>
            </div>
          </form>
        </div>

        {/* Denomination counting */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 text-sm space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-semibold text-slate-800">
              Physical Cash Count (Denominations)
            </h2>
            <span className="text-[11px] text-slate-500">
              Enter quantity of each note / coin
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-left text-slate-500">
                  <th className="py-2.5 px-3 w-32">Denomination</th>
                  <th className="py-2.5 px-3 w-32">Quantity</th>
                  <th className="py-2.5 px-3 text-right w-40">
                    Amount (৳)
                  </th>
                </tr>
              </thead>
              <tbody>
                {denoms.map((d) => {
                  const count = Number(d.count) || 0;
                  const amount = d.value * count;
                  return (
                    <tr
                      key={d.id}
                      className="border-t border-slate-100 hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="py-2 px-3 text-slate-700">{d.label}</td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={d.count}
                          onChange={(e) =>
                            handleDenomChange(d.id, e.target.value)
                          }
                          className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-1 focus:ring-slate-900/20 focus:border-slate-400"
                          placeholder="0"
                        />
                      </td>
                      <td className="py-2 px-3 text-right text-slate-800">
                        ৳ {amount.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-50 border-t border-slate-200">
                <tr>
                  <td className="py-2.5 px-3 text-xs font-medium text-slate-600">
                    Total Physical Cash
                  </td>
                  <td />
                  <td className="py-2.5 px-3 text-right font-semibold">
                    ৳ {physicalTotal.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <QuickInfoCard
              label="System Closing"
              value={`৳ ${systemClosing.toLocaleString()}`}
            />
            <QuickInfoCard
              label="Physical Cash"
              value={`৳ ${physicalTotal.toLocaleString()}`}
            />
            <QuickInfoCard
              label={
                difference === 0
                  ? "Difference"
                  : difference > 0
                  ? "Excess Amount"
                  : "Short Amount"
              }
              value={`৳ ${difference.toLocaleString()}`}
              status={status}
            />
          </div>
        </div>
      </div>

      {/* Reconciliation history */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 text-sm">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-slate-800">
            Reconciliation History
          </h2>
          <span className="text-[11px] text-slate-500">
            Recently saved reconciliation sessions
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-left text-slate-500">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Cashier</th>
                <th className="py-2.5 px-3 text-right">System Closing</th>
                <th className="py-2.5 px-3 text-right">Physical Cash</th>
                <th className="py-2.5 px-3 text-right">Difference</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {reconciliations.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-5 px-3 text-center text-sm text-slate-500"
                  >
                    No reconciliations recorded yet.
                  </td>
                </tr>
              )}
              {reconciliations.map((r) => (
                <tr
                  key={r.id}
                  className="border-t border-slate-100 hover:bg-slate-50/60 transition-colors"
                >
                  <td className="py-2.5 px-3">{r.date}</td>
                  <td className="py-2.5 px-3">{r.cashier}</td>
                  <td className="py-2.5 px-3 text-right">
                    ৳ {r.systemClosing.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    ৳ {r.physicalTotal.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    ৳ {r.difference.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 text-[11px] rounded-full font-medium ${
                        STATUS_STYLES[r.status] || "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td
                    className="py-2.5 px-3 max-w-xs truncate text-xs"
                    title={r.remarks}
                  >
                    {r.remarks}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ===== Small reusable components ===== */

function SummaryCard({ label, value, subtitle, status }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
          {label}
        </div>
        {status && (
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full ${
              STATUS_STYLES[status] || "bg-slate-100 text-slate-700"
            }`}
          >
            {status}
          </span>
        )}
      </div>
      <div className="text-xl font-semibold tracking-tight">{value}</div>
      <div className="text-xs text-slate-500">{subtitle}</div>
    </div>
  );
}

function NumberField({ label, name, value, onChange }) {
  return (
    <div>
      <label className="block text-xs text-slate-500 mb-1">{label}</label>
      <div className="relative">
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-slate-400">
          ৳
        </span>
        <input
          type="number"
          name={name}
          value={value}
          onChange={onChange}
          className="w-full border border-slate-200 rounded-xl pl-6 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
        />
      </div>
    </div>
  );
}

function QuickInfoCard({ label, value, status }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 flex items-center justify-between">
      <div className="text-[11px] text-slate-500">{label}</div>
      <div
        className={`text-xs font-semibold ${
          status === "Short"
            ? "text-rose-600"
            : status === "Excess"
            ? "text-amber-600"
            : "text-slate-800"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
