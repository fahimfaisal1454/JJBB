// src/components/DamageModal.jsx
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import AxiosInstance from "../../../components/AxiosInstance";


export default function DamageModal({ stock, onClose, onUpdated }) {
    const [damageQty, setDamageQty] = useState("");


    // Reset damage quantity when modal opens
    useEffect(() => {
        if (stock) setDamageQty("");
    }, [stock]);

    if (!stock) return null;

    const handleSave = async () => {
        if (damageQty === "") {
            toast.error("Enter damage quantity");
            return;
        }

        try {
            const response = await AxiosInstance.patch(
                `/stocks/${stock.id}/set-damage-quantity/`,
                { damage_quantity: damageQty }
            );

            toast.success("Damage quantity updated!");
            onUpdated(response.data.data); // send updated stock back
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Failed to update damage quantity");
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
            <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-6 relative">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition"
                >
                    ✕
                </button>

                {/* Title */}
                <h3 className="text-xl font-semibold text-center mb-6 text-slate-800">
                    Add Damage Product
                </h3>

                {/* Inputs */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Stock */}
                    <div>
                        <label className="text-sm font-medium text-slate-600 mb-1 block">
                            Current Stock
                        </label>
                        <input
                            type="text"
                            disabled
                            value={stock.current_stock_quantity}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-100 text-slate-700"
                        />
                    </div>

                    {/* Damage Qty */}
                    <div>
                        <label className="text-sm font-medium text-slate-600 mb-1 block">
                            Damage Qty <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            value={damageQty}
                            onChange={(e) => setDamageQty(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={() => setDamageQty("")}
                        className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 transition"
                    >
                        Reset
                    </button>

                    <button
                        onClick={handleSave}
                        className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition"
                    >
                        Save
                    </button>
                </div>

            </div>
        </div>
    );
}
