import { useMemo, useState } from "react";

const TAB_LIST = [
  { key: "Overview", label: "Overview", emoji: "📋" },
  { key: "Requisitions", label: "Requisitions", emoji: "📝" },
  { key: "Vouchers", label: "Vouchers", emoji: "💸" },
  { key: "Replenishments", label: "Replenishments", emoji: "🔁" },
];

const STATUS_COLORS = {
  Draft: "bg-slate-100 text-slate-700",
  Pending: "bg-amber-100 text-amber-700",
  Approved: "bg-emerald-100 text-emerald-700",
  Rejected: "bg-rose-100 text-rose-700",
  Disbursed: "bg-sky-100 text-sky-700",
  Settled: "bg-blue-100 text-blue-700",
};

export default function PettyCash() {
  // Petty cash fund settings
  const [fund, setFund] = useState({
    fundName: "Main Office Petty Cash",
    fundLimit: 50000, // target float balance
    custodian: "Cashier",
  });

  // Requisitions (requests for petty cash)
  const [requisitions, setRequisitions] = useState([
    {
      id: 1,
      reqNo: "PCR-0001",
      date: "2025-11-25",
      requestedBy: "Fahim Faisal",
      department: "Accounts",
      purpose: "Office snacks & water",
      amount: 1500,
      status: "Approved",
    },
  ]);

  // Vouchers (actual petty cash payments made)
  const [vouchers, setVouchers] = useState([
    {
      id: 1,
      voucherNo: "PCV-0001",
      date: "2025-11-25",
      paidTo: "Local shop",
      description: "Snacks for staff",
      amount: 1200,
      requisitionNo: "PCR-0001",
    },
  ]);

  // Replenishments (cash added to petty cash to bring back toward fund limit)
  const [replenishments, setReplenishments] = useState([
    {
      id: 1,
      refNo: "PCRL-0001",
      date: "2025-11-26",
      amount: 3000,
      description: "Top-up petty cash box",
    },
  ]);

  const [activeTab, setActiveTab] = useState("Overview");

  // Form states
  const [fundForm, setFundForm] = useState({
    fundName: fund.fundName,
    fundLimit: fund.fundLimit,
    custodian: fund.custodian,
  });

  const [reqForm, setReqForm] = useState({
    date: "",
    requestedBy: "",
    department: "",
    purpose: "",
    amount: "",
    status: "Pending",
  });

  const [voucherForm, setVoucherForm] = useState({
    date: "",
    paidTo: "",
    description: "",
    amount: "",
    requisitionNo: "",
  });

  const [replForm, setReplForm] = useState({
    date: "",
    amount: "",
    description: "",
  });

  // Calculations
  const totalVoucherSpend = useMemo(
    () => vouchers.reduce((sum, v) => sum + v.amount, 0),
    [vouchers]
  );

  const totalReplenished = useMemo(
    () => replenishments.reduce((sum, r) => sum + r.amount, 0),
    [replenishments]
  );

  // Basic petty cash balance logic:
  // Start from fundLimit as target → plus replenishments → minus vouchers
  const currentBalance = useMemo(
    () => fund.fundLimit + totalReplenished - totalVoucherSpend,
    [fund.fundLimit, totalVoucherSpend, totalReplenished]
  );

  // ===== Handlers =====

  const handleFundChange = (e) => {
    const { name, value } = e.target;
    setFundForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveFund = (e) => {
    e?.preventDefault();
    setFund({
      fundName: fundForm.fundName,
      fundLimit: Number(fundForm.fundLimit || 0),
      custodian: fundForm.custodian,
    });
  };

  const handleReqChange = (e) => {
    const { name, value } = e.target;
    setReqForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleVoucherChange = (e) => {
    const { name, value } = e.target;
    setVoucherForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleReplChange = (e) => {
    const { name, value } = e.target;
    setReplForm((prev) => ({ ...prev, [name]: value }));
  };

  const addRequisition = (e) => {
    e.preventDefault();
    if (
      !reqForm.date ||
      !reqForm.requestedBy ||
      !reqForm.purpose ||
      !reqForm.amount
    )
      return;

    const newNo = `PCR-${String(requisitions.length + 1).padStart(4, "0")}`;

    setRequisitions((prev) => [
      ...prev,
      {
        id: Date.now(),
        reqNo: newNo,
        date: reqForm.date,
        requestedBy: reqForm.requestedBy,
        department: reqForm.department,
        purpose: reqForm.purpose,
        amount: Number(reqForm.amount),
        status: reqForm.status,
      },
    ]);

    setReqForm({
      date: "",
      requestedBy: "",
      department: "",
      purpose: "",
      amount: "",
      status: "Pending",
    });
  };

  const addVoucher = (e) => {
    e.preventDefault();
    if (!voucherForm.date || !voucherForm.paidTo || !voucherForm.amount) return;

    const newNo = `PCV-${String(vouchers.length + 1).padStart(4, "0")}`;

    setVouchers((prev) => [
      ...prev,
      {
        id: Date.now(),
        voucherNo: newNo,
        date: voucherForm.date,
        paidTo: voucherForm.paidTo,
        description: voucherForm.description,
        amount: Number(voucherForm.amount),
        requisitionNo: voucherForm.requisitionNo,
      },
    ]);

    setVoucherForm({
      date: "",
      paidTo: "",
      description: "",
      amount: "",
      requisitionNo: "",
    });
  };

  const addReplenishment = (e) => {
    e.preventDefault();
    if (!replForm.date || !replForm.amount) return;

    const newRef = `PCRL-${String(replenishments.length + 1).padStart(4, "0")}`;

    setReplenishments((prev) => [
      ...prev,
      {
        id: Date.now(),
        refNo: newRef,
        date: replForm.date,
        amount: Number(replForm.amount),
        description: replForm.description,
      },
    ]);

    setReplForm({
      date: "",
      amount: "",
      description: "",
    });
  };

  // ===== UI =====

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-slate-50 px-4 py-4 sm:px-6 sm:py-5 shadow-sm border border-slate-800/60">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-700/80 text-lg">
                💵
              </span>
              <div>
                <h1 className="text-lg sm:text-xl font-semibold tracking-tight">
                  Petty Cash
                </h1>
                <p className="text-xs sm:text-sm text-slate-300">
                  Centralized petty cash fund, requisitions, vouchers & replenishments.
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-700/70 px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Active fund
            </span>
            <span className="inline-flex items-center rounded-full bg-slate-700/70 px-3 py-1">
              Float:{" "}
              <span className="ml-1 font-semibold">
                ৳ {fund.fundLimit.toLocaleString()}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Top summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <SummaryCard
          label="Petty Cash Fund Limit"
          value={`৳ ${fund.fundLimit.toLocaleString()}`}
          subtitle={fund.fundName}
          badge="Fund"
        />
        <SummaryCard
          label="Current Petty Cash Balance"
          value={`৳ ${currentBalance.toLocaleString()}`}
          subtitle={`Custodian: ${fund.custodian || "Not set"}`}
          badge="In Hand"
        />
        <SummaryCard
          label="Total Spent (Vouchers)"
          value={`৳ ${totalVoucherSpend.toLocaleString()}`}
          subtitle="Cumulative petty cash usage"
          badge="Outflow"
        />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80">
        <div className="border-b border-slate-200/80 px-3 pt-3 sm:px-4">
          <div className="flex flex-wrap gap-2 pb-2 overflow-x-auto">
            {TAB_LIST.map((tab) => {
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs sm:text-sm min-w-[120px] transition-all
                    ${
                      active
                        ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                >
                  <span className="text-lg">{tab.emoji}</span>
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-3 sm:p-4">
          {activeTab === "Overview" && (
            <OverviewTab
              fund={fund}
              fundForm={fundForm}
              onFundChange={handleFundChange}
              onSaveFund={saveFund}
              currentBalance={currentBalance}
            />
          )}

          {activeTab === "Requisitions" && (
            <RequisitionsTab
              requisitions={requisitions}
              reqForm={reqForm}
              onReqChange={handleReqChange}
              onAddRequisition={addRequisition}
            />
          )}

          {activeTab === "Vouchers" && (
            <VouchersTab
              vouchers={vouchers}
              voucherForm={voucherForm}
              onVoucherChange={handleVoucherChange}
              onAddVoucher={addVoucher}
              requisitions={requisitions}
            />
          )}

          {activeTab === "Replenishments" && (
            <ReplenishmentsTab
              replenishments={replenishments}
              replForm={replForm}
              onReplChange={handleReplChange}
              onAddReplenishment={addReplenishment}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ========== Small Components ========== */

function SummaryCard({ label, value, subtitle, badge }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
          {label}
        </div>
        {badge && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {badge}
          </span>
        )}
      </div>
      <div className="text-xl font-semibold tracking-tight">{value}</div>
      <div className="text-xs text-slate-500">{subtitle}</div>
    </div>
  );
}

/* ========== Tabs ========== */

function OverviewTab({
  fund,
  fundForm,
  onFundChange,
  onSaveFund,
  currentBalance,
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm">
      {/* Fund settings */}
      <div className="lg:col-span-2 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">
            Petty Cash Fund Settings
          </h2>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            Configure float amount & custodian details
          </span>
        </div>
        <form
          onSubmit={onSaveFund}
          className="grid grid-cols-1 md:grid-cols-2 gap-3"
        >
          <div className="md:col-span-2">
            <label className="block text-xs text-slate-500 mb-1">
              Fund Name
            </label>
            <input
              name="fundName"
              value={fundForm.fundName}
              onChange={onFundChange}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Fund Limit (Float Amount)
            </label>
            <input
              type="number"
              name="fundLimit"
              value={fundForm.fundLimit}
              onChange={onFundChange}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Custodian
            </label>
            <input
              name="custodian"
              value={fundForm.custodian}
              onChange={onFundChange}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
              placeholder="Person responsible for the petty cash box"
            />
          </div>

          <div className="md:col-span-2 flex justify-end mt-1.5">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-900 text-white text-xs font-medium shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/40"
            >
              <span>Save Fund Settings</span>
            </button>
          </div>
        </form>
      </div>

      {/* Snapshot */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-800">
          Today&apos;s Snapshot
        </h2>
        <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-2xl p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-xs">Fund Limit</span>
            <span className="font-semibold text-sm">
              ৳ {fund.fundLimit.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-xs">Current Balance</span>
            <span className="font-semibold text-sm">
              ৳ {currentBalance.toLocaleString()}
            </span>
          </div>
          <div className="rounded-xl bg-white border border-slate-200/70 p-2.5">
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Use petty cash for small day-to-day expenses such as snacks,
              courier, and local transport. Replenish from main cash/bank to
              keep the box close to the defined fund limit.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function RequisitionsTab({
  requisitions,
  reqForm,
  onReqChange,
  onAddRequisition,
}) {
  return (
    <div className="space-y-4">
      {/* Form */}
      <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
          <h2 className="text-sm font-semibold text-slate-800">
            New Petty Cash Requisition
          </h2>
          <span className="text-[11px] text-slate-500">
            Employee → Request → Approve → Disburse
          </span>
        </div>
        <form
          onSubmit={onAddRequisition}
          className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm"
        >
          <div>
            <label className="block text-xs text-slate-500 mb-1">Date *</label>
            <input
              type="date"
              name="date"
              value={reqForm.date}
              onChange={onReqChange}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Requested By *
            </label>
            <input
              name="requestedBy"
              value={reqForm.requestedBy}
              onChange={onReqChange}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Department / Cost Center
            </label>
            <input
              name="department"
              value={reqForm.department}
              onChange={onReqChange}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Amount (৳) *
            </label>
            <input
              type="number"
              name="amount"
              value={reqForm.amount}
              onChange={onReqChange}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 bg-white"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs text-slate-500 mb-1">
              Purpose / Description *
            </label>
            <textarea
              name="purpose"
              value={reqForm.purpose}
              onChange={onReqChange}
              rows={2}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1">Status</label>
            <select
              name="status"
              value={reqForm.status}
              onChange={onReqChange}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 bg-white"
            >
              <option>Pending</option>
              <option>Approved</option>
              <option>Rejected</option>
            </select>
          </div>

          <div className="md:col-span-2 flex justify-end mt-1">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-900 text-white text-xs font-medium shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/40"
            >
              Save Requisition
            </button>
          </div>
        </form>
      </div>

      {/* Table */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-slate-800">
            Requisition List
          </h2>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-left text-slate-500">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Req No</th>
                <th className="py-2.5 px-3">Requested By</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Purpose</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {requisitions.map((r) => (
                <tr
                  key={r.id}
                  className="border-t border-slate-100 hover:bg-slate-50/70 transition-colors"
                >
                  <td className="py-2.5 px-3">{r.date}</td>
                  <td className="py-2.5 px-3 text-xs font-mono">{r.reqNo}</td>
                  <td className="py-2.5 px-3">{r.requestedBy}</td>
                  <td className="py-2.5 px-3 text-xs text-slate-600">
                    {r.department}
                  </td>
                  <td
                    className="py-2.5 px-3 max-w-xs truncate text-xs"
                    title={r.purpose}
                  >
                    {r.purpose}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    ৳ {r.amount.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 text-[11px] rounded-full font-medium ${
                        STATUS_COLORS[r.status] ||
                        "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
              {requisitions.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-5 px-3 text-center text-sm text-slate-500"
                  >
                    No requisitions yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function VouchersTab({
  vouchers,
  voucherForm,
  onVoucherChange,
  onAddVoucher,
  requisitions,
}) {
  return (
    <div className="space-y-4 text-sm">
      {/* Form */}
      <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
          <h2 className="text-sm font-semibold text-slate-800">
            New Petty Cash Voucher
          </h2>
          <span className="text-[11px] text-slate-500">
            Record actual petty cash expenses
          </span>
        </div>
        <form
          onSubmit={onAddVoucher}
          className="grid grid-cols-1 md:grid-cols-2 gap-3"
        >
          <div>
            <label className="block text-xs text-slate-500 mb-1">Date *</label>
            <input
              type="date"
              name="date"
              value={voucherForm.date}
              onChange={onVoucherChange}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Paid To *
            </label>
            <input
              name="paidTo"
              value={voucherForm.paidTo}
              onChange={onVoucherChange}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 bg-white"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs text-slate-500 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={voucherForm.description}
              onChange={onVoucherChange}
              rows={2}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Amount (৳) *
            </label>
            <input
              type="number"
              name="amount"
              value={voucherForm.amount}
              onChange={onVoucherChange}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Requisition (Optional)
            </label>
            <select
              name="requisitionNo"
              value={voucherForm.requisitionNo}
              onChange={onVoucherChange}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 bg-white"
            >
              <option value="">-- None --</option>
              {requisitions.map((r) => (
                <option key={r.id} value={r.reqNo}>
                  {r.reqNo} - {r.purpose.slice(0, 25)}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 flex justify-end mt-1">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-900 text-white text-xs font-medium shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/40"
            >
              Save Voucher
            </button>
          </div>
        </form>
      </div>

      {/* Table */}
      <div>
        <h2 className="text-sm font-semibold text-slate-800 mb-2">
          Voucher List
        </h2>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-left text-slate-500">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Voucher No</th>
                <th className="py-2.5 px-3">Paid To</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3">Requisition</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {vouchers.map((v) => (
                <tr
                  key={v.id}
                  className="border-t border-slate-100 hover:bg-slate-50/70 transition-colors"
                >
                  <td className="py-2.5 px-3">{v.date}</td>
                  <td className="py-2.5 px-3 text-xs font-mono">
                    {v.voucherNo}
                  </td>
                  <td className="py-2.5 px-3">{v.paidTo}</td>
                  <td
                    className="py-2.5 px-3 max-w-xs truncate text-xs"
                    title={v.description}
                  >
                    {v.description}
                  </td>
                  <td className="py-2.5 px-3 text-xs text-slate-600">
                    {v.requisitionNo}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    ৳ {v.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
              {vouchers.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-5 px-3 text-center text-sm text-slate-500"
                  >
                    No vouchers yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ReplenishmentsTab({
  replenishments,
  replForm,
  onReplChange,
  onAddReplenishment,
}) {
  return (
    <div className="space-y-4 text-sm">
      {/* Form */}
      <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
          <h2 className="text-sm font-semibold text-slate-800">
            New Replenishment
          </h2>
          <span className="text-[11px] text-slate-500">
            Bring petty cash back towards the fund limit
          </span>
        </div>
        <form
          onSubmit={onAddReplenishment}
          className="grid grid-cols-1 md:grid-cols-2 gap-3"
        >
          <div>
            <label className="block text-xs text-slate-500 mb-1">Date *</label>
            <input
              type="date"
              name="date"
              value={replForm.date}
              onChange={onReplChange}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Amount (৳) *
            </label>
            <input
              type="number"
              name="amount"
              value={replForm.amount}
              onChange={onReplChange}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 bg-white"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs text-slate-500 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={replForm.description}
              onChange={onReplChange}
              rows={2}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 bg-white"
              placeholder="Example: Reimbursement from main cash/bank."
            />
          </div>

          <div className="md:col-span-2 flex justify-end mt-1">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-900 text-white text-xs font-medium shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/40"
            >
              Save Replenishment
            </button>
          </div>
        </form>
      </div>

      {/* Table */}
      <div>
        <h2 className="text-sm font-semibold text-slate-800 mb-2">
          Replenishment History
        </h2>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-left text-slate-500">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Ref No</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {replenishments.map((r) => (
                <tr
                  key={r.id}
                  className="border-t border-slate-100 hover:bg-slate-50/70 transition-colors"
                >
                  <td className="py-2.5 px-3">{r.date}</td>
                  <td className="py-2.5 px-3 text-xs font-mono">
                    {r.refNo}
                  </td>
                  <td
                    className="py-2.5 px-3 max-w-xs truncate text-xs"
                    title={r.description}
                  >
                    {r.description}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    ৳ {r.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
              {replenishments.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="py-5 px-3 text-center text-sm text-slate-500"
                  >
                    No replenishments yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
