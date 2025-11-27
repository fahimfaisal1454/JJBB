import { useEffect, useState } from "react";
import {
  FaSearch,
  FaPlus,
  FaUser,
  FaPhoneAlt,
  FaTrash,
  FaEdit,
} from "react-icons/fa";
import AxiosInstance from "../../components/AxiosInstance";

const BACKEND_URL = "http://localhost:8000"; // change in production

const EMPTY_FORM = {
  vendor_name: "",
  division: "",
  district: "",
  country: "Bangladesh",
  vendor_type: "", // will store type id
  shop_name: "",
  phone1: "",
  phone2: "",
  email: "",
  address: "",
  date_of_birth: "",
  nid_no: "",
  remarks: "",
  previous_due_amount: "",
};

const API_URL = "vendors/"; // -> /api/vendors/

export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState(null);

  // masters
  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [supplierTypes, setSupplierTypes] = useState([]);

  const [filteredDistricts, setFilteredDistricts] = useState([]);
  const [selectedDivisionId, setSelectedDivisionId] = useState("");
  const [selectedDistrictId, setSelectedDistrictId] = useState("");

  // image
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");

  // ---------- helpers ----------

  const resetFormState = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setSelectedDivisionId("");
    setSelectedDistrictId("");
    setFilteredDistricts([]);
    setPhotoFile(null);
    setPhotoPreview("");
  };

  // ---------- API calls ----------

  const fetchVendors = async (searchValue = "") => {
    try {
      setLoading(true);
      setError("");

      const params = {};
      if (searchValue.trim()) params.search = searchValue.trim();

      const res = await AxiosInstance.get(API_URL, { params });
      const data = res.data;
      const items = Array.isArray(data) ? data : data.results || [];
      setVendors(items);
    } catch (err) {
      console.error(err);
      const detail =
        err.response?.data?.detail ||
        err.message ||
        "Failed to fetch vendors";
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  const loadMasters = async () => {
    try {
      const [divRes, distRes, typeRes] = await Promise.all([
        AxiosInstance.get("divisions/"),
        AxiosInstance.get("districts/"),
        AxiosInstance.get("supplier-types/"), // adjust if your URL is different
      ]);
      setDivisions(divRes.data || []);
      setDistricts(distRes.data || []);
      setSupplierTypes(typeRes.data || []);
    } catch (err) {
      console.error("Failed to load master data", err);
    }
  };

  useEffect(() => {
    fetchVendors();
    loadMasters();
  }, []);

  useEffect(() => {
    if (!selectedDivisionId) {
      setFilteredDistricts([]);
      return;
    }
    const filtered = districts.filter(
      (d) => String(d.division) === String(selectedDivisionId)
    );
    setFilteredDistricts(filtered);
  }, [selectedDivisionId, districts]);

  // ---------- handlers ----------

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    fetchVendors(value);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDivisionSelect = (e) => {
    const id = e.target.value;
    setSelectedDivisionId(id);
    setSelectedDistrictId("");
    const divisionObj = divisions.find((d) => String(d.id) === String(id));
    setForm((prev) => ({
      ...prev,
      division: divisionObj ? divisionObj.name : "",
      district: "",
    }));
  };

  const handleDistrictSelect = (e) => {
    const id = e.target.value;
    setSelectedDistrictId(id);
    const districtObj = districts.find((d) => String(d.id) === String(id));
    setForm((prev) => ({
      ...prev,
      district: districtObj ? districtObj.name : "",
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) {
      setPhotoFile(null);
      setPhotoPreview("");
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      ...form,
      previous_due_amount:
        form.previous_due_amount === "" ? null : form.previous_due_amount,
      date_of_birth: form.date_of_birth || null,
    };

    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== null && value !== "") {
        formData.append(key, value);
      }
    });
    if (photoFile) {
      formData.append("photo", photoFile);
    }

    try {
      if (editingId) {
        await AxiosInstance.patch(`${API_URL}${editingId}/`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await AxiosInstance.post(API_URL, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      resetFormState();
      setShowForm(false);
      fetchVendors(search);
    } catch (err) {
      console.error(err);
      const detail =
        err.response?.data?.detail ||
        err.message ||
        "Failed to save vendor";
      setError(detail);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (vendor) => {
    setEditingId(vendor.id);
    setShowForm(true);

    setForm({
      vendor_name: vendor.vendor_name || "",
      division: vendor.division || "",
      district: vendor.district || "",
      country: vendor.country || "Bangladesh",
      vendor_type: vendor.vendor_type || "", // id
      shop_name: vendor.shop_name || "",
      phone1: vendor.phone1 || "",
      phone2: vendor.phone2 || "",
      email: vendor.email || "",
      address: vendor.address || "",
      date_of_birth: vendor.date_of_birth || "",
      nid_no: vendor.nid_no || "",
      remarks: vendor.remarks || "",
      previous_due_amount: vendor.previous_due_amount || "",
    });

    const divObj = divisions.find((d) => d.name === vendor.division);
    const distObj = districts.find((d) => d.name === vendor.district);
    setSelectedDivisionId(divObj ? String(divObj.id) : "");
    setSelectedDistrictId(distObj ? String(distObj.id) : "");

    if (divObj) {
      const filtered = districts.filter(
        (d) => String(d.division) === String(divObj.id)
      );
      setFilteredDistricts(filtered);
    } else {
      setFilteredDistricts([]);
    }

    setPhotoFile(null);
    setPhotoPreview("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vendor?")) {
      return;
    }
    try {
      await AxiosInstance.delete(`${API_URL}${id}/`);
      setVendors((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      console.error(err);
      const detail =
        err.response?.data?.detail ||
        err.message ||
        "Failed to delete vendor";
      setError(detail);
    }
  };

  // ---------- render ----------

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">
              Purchase – Vendors
            </h1>
            <p className="text-sm text-slate-500">
              Add and manage your vendors in one place.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="relative w-full sm:w-72">
              <FaSearch className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="Search by name, phone, shop..."
                className="w-full pl-9 pr-3 py-2 rounded-full border border-slate-200 text-sm focus:outline-none focus:ring focus:ring-blue-500/30"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                if (!showForm) resetFormState();
                setShowForm((prev) => !prev);
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
            >
              <FaPlus className="w-3 h-3" />
              {showForm ? "Close Form" : "Add New Vendor"}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-xl">
            {error}
          </div>
        )}

        {/* Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-200 pt-4"
          >
            {/* Vendor Name */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Vendor Name *
              </label>
              <input
                name="vendor_name"
                value={form.vendor_name}
                onChange={handleFormChange}
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring focus:ring-blue-500/30 bg-slate-50"
              />
            </div>

            {/* Photo */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Photo (optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="block w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 file:rounded-full hover:file:bg-blue-100"
              />
              {photoPreview && (
                <div className="mt-2">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-16 h-16 rounded-full object-cover border border-slate-200"
                  />
                </div>
              )}
              {editingId && !photoPreview && (
                <p className="mt-1 text-[11px] text-slate-400">
                  Existing photo will stay if you don&apos;t choose a new one.
                </p>
              )}
            </div>

            <div />

            {/* Division */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Division
              </label>
              <select
                value={selectedDivisionId}
                onChange={handleDivisionSelect}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring focus:ring-blue-500/30"
              >
                <option value="">Select division</option>
                {divisions.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* District */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                District
              </label>
              <select
                value={selectedDistrictId}
                onChange={handleDistrictSelect}
                disabled={!selectedDivisionId}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring focus:ring-blue-500/30 disabled:bg-slate-50"
              >
                <option value="">
                  {selectedDivisionId
                    ? "Select district"
                    : "Select division first"}
                </option>
                {filteredDistricts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Country */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Country
              </label>
              <input
                name="country"
                value={form.country}
                onChange={handleFormChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring focus:ring-blue-500/30"
              />
            </div>

            {/* Vendor Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Vendor Type
              </label>
              <select
                name="vendor_type"
                value={form.vendor_type}
                onChange={handleFormChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring focus:ring-blue-500/30"
              >
                <option value="">Select vendor type</option>
                {supplierTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name || t.type_name || `Type #${t.id}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Shop Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Shop Name
              </label>
              <input
                name="shop_name"
                value={form.shop_name}
                onChange={handleFormChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring focus:ring-blue-500/30"
              />
            </div>

            {/* Phone 1 */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone 1 *
              </label>
              <input
                name="phone1"
                value={form.phone1}
                onChange={handleFormChange}
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring focus:ring-blue-500/30 bg-slate-50"
              />
            </div>

            {/* Phone 2 */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone 2
              </label>
              <input
                name="phone2"
                value={form.phone2}
                onChange={handleFormChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring focus:ring-blue-500/30"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleFormChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring focus:ring-blue-500/30"
              />
            </div>

            {/* DOB */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                name="date_of_birth"
                value={form.date_of_birth}
                onChange={handleFormChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring focus:ring-blue-500/30"
              />
            </div>

            {/* NID */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                NID No
              </label>
              <input
                name="nid_no"
                value={form.nid_no}
                onChange={handleFormChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring focus:ring-blue-500/30"
              />
            </div>

            {/* Previous Due */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Previous Due (৳)
              </label>
              <input
                type="number"
                step="0.01"
                name="previous_due_amount"
                value={form.previous_due_amount}
                onChange={handleFormChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring focus:ring-blue-500/30"
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Address
              </label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleFormChange}
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring focus:ring-blue-500/30"
              />
            </div>

            {/* Remarks */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Remarks
              </label>
              <textarea
                name="remarks"
                value={form.remarks}
                onChange={handleFormChange}
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring focus:ring-blue-500/30"
              />
            </div>

            {/* Buttons */}
            <div className="md:col-span-2 flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={resetFormState}
                className="px-4 py-2 rounded-full border border-slate-300 text-sm text-slate-700 hover:bg-slate-50"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-full bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-60"
              >
                {saving
                  ? editingId
                    ? "Updating..."
                    : "Saving..."
                  : editingId
                  ? "Update Vendor"
                  : "Save Vendor"}
              </button>
            </div>
          </form>
        )}

        {/* Vendor List */}
        <div className="border-t border-slate-200 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-slate-800">
              Vendor List
            </h2>
            <span className="text-xs text-slate-500">
              {vendors.length} vendor{vendors.length !== 1 ? "s" : ""}
            </span>
          </div>

          {loading ? (
            <p className="text-sm text-slate-500">Loading vendors...</p>
          ) : vendors.length === 0 ? (
            <p className="text-sm text-slate-500">No vendors found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500">
                    <th className="px-3 py-2 text-left">Vendor</th>
                    <th className="px-3 py-2 text-left">Contact</th>
                    <th className="px-3 py-2 text-left">Shop</th>
                    <th className="px-3 py-2 text-left">Location</th>
                    <th className="px-3 py-2 text-left">Type</th>
                    <th className="px-3 py-2 text-right">Prev. Due</th>
                    <th className="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((v) => {
                    const rawUrl = v.photo || "";
                    const photoUrl = rawUrl
                      ? rawUrl.startsWith("http")
                        ? rawUrl
                        : `${BACKEND_URL}${rawUrl}`
                      : null;

                    const typeObj = supplierTypes.find(
                      (t) => String(t.id) === String(v.vendor_type)
                    );

                    return (
                      <tr key={v.id} className="border-t">
                        {/* Vendor + photo */}
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-blue-700 text-xs overflow-hidden">
                              {photoUrl ? (
                                <img
                                  src={photoUrl}
                                  alt={v.vendor_name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <FaUser />
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-slate-800">
                                {v.vendor_name}
                              </div>
                              {v.email && (
                                <div className="text-[11px] text-slate-500">
                                  {v.email}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2 text-xs text-slate-700">
                            <FaPhoneAlt className="w-3 h-3" />
                            <span>{v.phone1}</span>
                          </div>
                          {v.phone2 && (
                            <div className="pl-5 text-[11px] text-slate-500">
                              Alt: {v.phone2}
                            </div>
                          )}
                        </td>

                        {/* Shop */}
                        <td className="px-3 py-2">
                          {v.shop_name || (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>

                        {/* Location */}
                        <td className="px-3 py-2 text-xs">
                          {v.district || v.division || v.country ? (
                            <>
                              {v.district && <span>{v.district}</span>}
                              {v.district && v.division && ", "}
                              {v.division && <span>{v.division}</span>}
                              {(v.district || v.division) && v.country && ", "}
                              {v.country && <span>{v.country}</span>}
                            </>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>

                        {/* Type */}
                        <td className="px-3 py-2 text-xs">
                          {typeObj ? (
                            typeObj.name || typeObj.type_name
                          ) : v.vendor_type ? (
                            <>Type #{v.vendor_type}</>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>

                        {/* Due */}
                        <td className="px-3 py-2 text-right">
                          {v.previous_due_amount
                            ? `৳ ${Number(
                                v.previous_due_amount
                              ).toLocaleString()}`
                            : "৳ 0.00"}
                        </td>

                        {/* Actions */}
                        <td className="px-3 py-2 text-right space-x-2">
                          <button
                            onClick={() => handleEdit(v)}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-blue-600 text-blue-600 text-xs hover:bg-blue-50"
                          >
                            <FaEdit className="w-3 h-3" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(v.id)}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-red-600 text-red-600 text-xs hover:bg-red-50"
                          >
                            <FaTrash className="w-3 h-3" />
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
