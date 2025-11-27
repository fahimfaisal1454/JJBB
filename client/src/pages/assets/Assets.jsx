import React, { useEffect, useState } from "react";
import AxiosInstance from "../../components/AxiosInstance";

const todayStr = new Date().toISOString().slice(0, 10);

const emptyForm = {
  name: "",
  code: "",
  purchase_date: todayStr,
  total_qty: "",
  damaged_qty: "0",
};

export default function AssetsPage() {
  const [assets, setAssets] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedAssetId, setSelectedAssetId] = useState(""); // dropdown

  // =============================
  // Load Assets
  // =============================
  const loadAssets = async () => {
    try {
      const res = await AxiosInstance.get("assets/");
      setAssets(res.data);
    } catch (e) {
      console.error("Failed to load assets", e);
    }
  };

  useEffect(() => {
    loadAssets();
  }, []);

  // =============================
  // Handle Input
  // =============================
  const onChange = (e) => {
    const { name, value } = e.target;

    if (name === "total_qty" || name === "damaged_qty") {
      if (value === "") {
        setForm((p) => ({ ...p, [name]: "" }));
      } else if (/^\d+$/.test(value)) {
        setForm((p) => ({ ...p, [name]: value }));
      }
      return;
    }

    setForm((p) => ({ ...p, [name]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setSelectedAssetId("");
  };

  // =============================
  // Existing asset dropdown
  // =============================
  const onSelectExisting = (e) => {
    const id = e.target.value;
    setSelectedAssetId(id);

    if (!id) {
      // new asset mode
      setForm(emptyForm);
      setEditingId(null);
      return;
    }

    const asset = assets.find((a) => String(a.id) === id);
    if (!asset) return;

    // Fill form with existing asset details, qty fields blank for new entry
    setForm({
      name: asset.name,
      code: asset.code,
      purchase_date: asset.purchase_date || todayStr,
      total_qty: "",
      damaged_qty: "0",
    });

    // we POST for “add more” behaviour, so NOT editing existing row
    setEditingId(null);
  };

  // =============================
  // Submit Create / Update
  // =============================
  const onSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.code) {
      alert("Name and Code are required.");
      return;
    }

    const total = Number(form.total_qty || 0);
    const damaged = Number(form.damaged_qty || 0);

    if (total <= 0) {
      alert("Total quantity must be greater than 0.");
      return;
    }

    if (damaged > total) {
      alert("Damaged quantity cannot be more than total quantity.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        total_qty: total,
        damaged_qty: damaged,
      };

      if (editingId) {
        await AxiosInstance.put(`assets/${editingId}/`, payload);
        alert("Asset updated.");
      } else {
        // add new OR add more to existing (backend merges by code)
        await AxiosInstance.post("assets/", payload);
        alert("Asset saved.");
      }

      resetForm();
      await loadAssets();
    } catch (e) {
      console.error("Save asset failed", e);
      alert("Save failed. Check console.");
    } finally {
      setSaving(false);
    }
  };

  // =============================
  // Edit
  // =============================
  const onEdit = (asset) => {
    setForm({
      name: asset.name,
      code: asset.code,
      purchase_date: asset.purchase_date || todayStr,
      total_qty: String(asset.total_qty),
      damaged_qty: String(asset.damaged_qty),
    });
    setEditingId(asset.id);
    setSelectedAssetId(String(asset.id)); // highlight in dropdown
  };

  // =============================
  // Delete
  // =============================
  const onDelete = async (id) => {
    if (!window.confirm("Delete this asset?")) return;
    try {
      await AxiosInstance.delete(`assets/${id}/`);
      await loadAssets();
      // if we were editing this one, reset
      if (editingId === id) resetForm();
    } catch (e) {
      console.error("Delete failed", e);
    }
  };

  // hint: if code exists & not editing, show info
  const existingByCode =
    !editingId && form.code
      ? assets.find((a) => a.code === form.code)
      : null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Assets</h1>
          <p className="text-sm text-slate-500">
            Manage assets and stock quantities in one place.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex gap-4 text-sm">
          <div className="bg-white rounded-xl shadow p-3 min-w-[140px]">
            <div className="text-slate-500">Total Assets</div>
            <div className="text-lg font-semibold">{assets.length}</div>
          </div>

          <div className="bg-white rounded-xl shadow p-3 min-w-[140px]">
            <div className="text-slate-500">Total Qty</div>
            <div className="text-lg font-semibold">
              {assets.reduce((s, a) => s + Number(a.total_qty), 0)}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-3 min-w-[140px]">
            <div className="text-slate-500">Damaged Qty</div>
            <div className="text-lg font-semibold text-red-600">
              {assets.reduce((s, a) => s + Number(a.damaged_qty), 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={onSubmit}
        className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-4"
      >
        {/* Existing asset selector */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Select Existing Asset
            </label>
            <select
              value={selectedAssetId}
              onChange={onSelectExisting}
              className="border border-gray-300 rounded px-3 py-1 w-full"
            >
              <option value="">New asset / custom</option>
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.code})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              Choose an existing asset to add more quantity, or keep
              &quot;New asset&quot; to create a new one.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 pt-2">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Asset Name <span className="text-red-600">*</span>
            </label>
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              type="text"
              placeholder="Laptop"
              className="border border-gray-300 rounded px-3 py-1 w-full"
              required
            />
          </div>

          {/* Code */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Code <span className="text-red-600">*</span>
            </label>
            <input
              name="code"
              value={form.code}
              onChange={onChange}
              type="text"
              placeholder="FA-001"
              className="border border-gray-300 rounded px-3 py-1 w-full"
              required
            />
            {existingByCode && !selectedAssetId && (
              <p className="text-[11px] text-amber-600 mt-1">
                An asset with this code already exists. Saving will add to it:
                total {existingByCode.total_qty}, damaged{" "}
                {existingByCode.damaged_qty}.
              </p>
            )}
          </div>

          {/* Purchase Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Purchase Date
            </label>
            <input
              name="purchase_date"
              value={form.purchase_date}
              onChange={onChange}
              type="date"
              className="border border-gray-300 rounded px-3 py-1 w-full"
            />
          </div>

          {/* Total Qty */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Total Qty <span className="text-red-600">*</span>
            </label>
            <input
              name="total_qty"
              value={form.total_qty}
              onChange={onChange}
              type="text"
              inputMode="numeric"
              placeholder="10"
              required
              className="border border-gray-300 rounded px-3 py-1 w-full"
            />
          </div>

          {/* Damaged Qty */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Damaged Qty
            </label>
            <input
              name="damaged_qty"
              value={form.damaged_qty}
              onChange={onChange}
              type="text"
              inputMode="numeric"
              placeholder="2"
              className="border border-gray-300 rounded px-3 py-1 w-full"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-900 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm disabled:opacity-60"
          >
            {saving ? "Saving..." : editingId ? "Update Asset" : "Save Asset"}
          </button>

          <button
            type="button"
            onClick={resetForm}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
          >
            Reset
          </button>
        </div>
      </form>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <table className="w-full text-sm">
          <thead className="border-b bg-slate-50">
            <tr className="text-left text-slate-500">
              <th className="py-2 px-2">SL</th>
              <th className="py-2 px-2">Name</th>
              <th className="py-2 px-2">Code</th>
              <th className="py-2 px-2">Purchase Date</th>
              <th className="py-2 px-2 text-right">Total Qty</th>
              <th className="py-2 px-2 text-right text-red-600">Damaged</th>
              <th className="py-2 px-2 text-right">Usable</th>
              <th className="py-2 px-2 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {assets.map((a, idx) => (
              <tr key={a.id} className="border-b last:border-0">
                <td className="py-2 px-2">{idx + 1}</td>
                <td className="py-2 px-2">{a.name}</td>
                <td className="py-2 px-2 text-xs font-mono">{a.code}</td>
                <td className="py-2 px-2">{a.purchase_date}</td>
                <td className="py-2 px-2 text-right">{a.total_qty}</td>
                <td className="py-2 px-2 text-right text-red-600">
                  {a.damaged_qty}
                </td>
                <td className="py-2 px-2 text-right">{a.usable_qty}</td>
                <td className="py-2 px-2 text-right space-x-2">
                  <button
                    onClick={() => onEdit(a)}
                    className="px-2 py-1 rounded border border-slate-200 hover:border-blue-500"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => onDelete(a.id)}
                    className="px-2 py-1 rounded border border-slate-200 hover:border-red-500 text-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {assets.length === 0 && (
              <tr>
                <td colSpan={8} className="py-4 px-2 text-center text-slate-400">
                  No assets yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
