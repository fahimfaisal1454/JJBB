import { useState, useEffect } from "react";
import Select from "react-select";
import AxiosInstance from "../../components/AxiosInstance";
import { toast } from "react-hot-toast";

export default function ProductPurchase() {
  // ---------- Custom Select Styles ----------
  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: "30px",
      height: "30px",
      fontSize: "0.875rem",
      border: "1px solid #000000",
      borderRadius: "0.275rem",
      borderColor: state.isFocused ? "#000000" : "#d1d5db",
      boxShadow: state.isFocused ? "0 0 0 1px #000000" : "none",
      display: "flex",
      alignItems: "center",
      paddingTop: "0px",
      paddingBottom: "0px",
    }),
    valueContainer: (base) => ({
      ...base,
      height: "30px",
      padding: "0 6px",
      display: "flex",
      alignItems: "center",
      flexWrap: "nowrap",
    }),
    placeholder: (base) => ({
      ...base,
      fontSize: "0.875rem",
      color: "#9ca3af",
      top: "50%",
      position: "absolute",
      transform: "translateY(-50%)",
    }),
    singleValue: (base) => ({
      ...base,
      fontSize: "0.875rem",
      top: "50%",
      position: "absolute",
      transform: "translateY(-50%)",
    }),
    input: (base) => ({
      ...base,
      fontSize: "0.875rem",
      padding: "0",
      top: "50%",
      position: "absolute",
      transform: "translateY(-50%)",
    }),
    indicatorsContainer: (base) => ({
      ...base,
      height: "30px",
      display: "flex",
      alignItems: "center",
    }),
    option: (base, state) => ({
      ...base,
      fontSize: "0.875rem",
      backgroundColor: state.isSelected
        ? "#000"
        : state.isFocused
        ? "#f3f4f6"
        : "white",
      color: state.isSelected ? "white" : "#000",
    }),
  };

  // ---------- Supplier ----------
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [supplierData, setSupplierData] = useState({
    supplierName: "",
    district: "",
    country: "",
    supplierType: "",
    shopName: "",
    phone1: "",
    phone2: "",
    email: "",
    address: "",
    dob: "",
    nidNo: "",
  });

  // ---------- Products (company removed) ----------
  const [productList, setProductList] = useState([]);
  const [stockList, setStockList] = useState([]);
  const [selectedProductName, setSelectedProductName] = useState(null);
  
  const productNameOptions = productList.map((p) => ({
    label: p.product_name,
    value: p.id,
  }));

 

  // ---------- Product Stock ----------
  const [currentStock, setCurrentStock] = useState(0);
  const [purchaseQuantity, setPurchaseQuantity] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [percentage, setPercentage] = useState("");
  const [purchasePriceWithPercentage, setPurchasePriceWithPercentage] =
    useState("0.00");
  const [totalPrice, setTotalPrice] = useState("0.00");

  const [purchaseDate] = useState(new Date().toISOString().split("T")[0]);
  const [addedProducts, setAddedProducts] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState("");
  const [totalPayableAmount, setTotalPayableAmount] = useState(0);

  // ---------- Load Data ----------
  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        const res = await AxiosInstance.get("/suppliers/");
        setSuppliers(res.data);
      } catch {
        toast.error("Failed to load suppliers");
      }
    };

    const loadProducts = async () => {
      try {
        const res = await AxiosInstance.get("/products/");
        setProductList(res.data);
      } catch {
        toast.error("Failed to load products");
      }
    };

    loadSuppliers();
    loadProducts();
  }, []);

  useEffect(() => {
    const loadStocks = async () => {
      try {
        const res = await AxiosInstance.get("/stocks/");
        setStockList(res.data);
      } catch {
        toast.error("Failed to load stock data");
      }
    };

    loadStocks();
  }, []);

  // ---------- Supplier Select ----------
  const supplierOptions = suppliers.map((sup) => ({
    label: sup.supplier_name,
    value: sup.id,
  }));

  const handleSupplierSelect = (selected) => {
    setSelectedSupplier(selected);

    if (!selected) {
      setSupplierData({
        supplierName: "",
        district: "",
        country: "",
        supplierType: "",
        shopName: "",
        phone1: "",
        phone2: "",
        email: "",
        address: "",
        dob: "",
        nidNo: "",
      });
      return;
    }

    const sup = suppliers.find((s) => s.id === selected.value);

    setSupplierData({
      supplierName: sup.supplier_name,
      district: sup.district_detail?.name || "",
      country: sup.country || "",
      supplierType: sup.supplier_type_detail?.name || "",
      shopName: sup.shop_name || "",
      phone1: sup.phone1 || "",
      phone2: sup.phone2 || "",
      email: sup.email || "",
      address: sup.address || "",
      dob: sup.date_of_birth || "",
      nidNo: sup.nid_no || "",
    });
  };

  // Supplier input change handler
  const handleSupplierChange = (e) => {
    const { name, value } = e.target;
    setSupplierData((prev) => ({ ...prev, [name]: value }));
  };


  // ---------- Product Name Change ----------
  const handleProductNameChange = (item) => {
    setSelectedProductName(item);

    if (!item) {
      setSelectedPartNumber(null);
      setCurrentStock(0);
      return;
    }

    const prod = productList.find((p) => p.id === item.value);
    const stock = stockList.find((s) => s.product?.id === prod.id);
    setCurrentStock(stock ? stock.current_stock_quantity : 0);
  };

  

  // ---------- Calculations ----------
  useEffect(() => {
    const base = parseFloat(purchasePrice) || 0;
    const qty = parseInt(purchaseQuantity) || 0;

    setTotalPrice((base * qty).toFixed(2));
  }, [purchasePrice, percentage, purchaseQuantity]);

  // ---------- Add Product ----------
  const addProduct = () => {
    if (!selectedProductName || !purchaseQuantity || !purchasePrice) {
      toast.error("Missing product info");
      return;
    }

    setAddedProducts((prev) => [
      ...prev,
      {
        id: selectedProductName.value,
        productName: selectedProductName.label,
        currentStock,
        purchaseQuantity,
        purchasePrice,
        totalPrice,
      },
    ]);

    setSelectedProductName(null);
    setPurchaseQuantity("");
    setPurchasePrice("");
    setTotalPrice("0.00");
    setCurrentStock(0);
  };

  // ---------- Remove Product ----------
  const removeProduct = (index) => {
    setAddedProducts((prev) => prev.filter((_, i) => i !== index));
  };

  // ---------- Totals ----------
  useEffect(() => {
    const total = addedProducts.reduce(
      (sum, p) => sum + parseFloat(p.totalPrice),
      0
    );
    setTotalAmount(total);

    const discount = parseFloat(discountAmount) || 0;
    setTotalPayableAmount(total - discount);
  }, [addedProducts, discountAmount]);

  // ---------- Payments ----------
  const [paymentModes, setPaymentModes] = useState([]);
  const [banks, setBanks] = useState([]);
  const [payments, setPayments] = useState([]);

  const [paymentData, setPaymentData] = useState({
    paymentMode: "",
    bankName: "",
    accountNo: "",
    chequeNo: "",
    paidAmount: "",
  });

  useEffect(() => {
    const loadPaymentData = async () => {
      try {
        const [pmRes, bankRes] = await Promise.all([
          AxiosInstance.get("/payment-mode/"),
          AxiosInstance.get("/banks/"),
        ]);

        setPaymentModes(
          pmRes.data.map((pm) => ({ value: pm.id, label: pm.name }))
        );

        setBanks(
          bankRes.data.map((b) => ({ value: b.id, label: b.name }))
        );
      } catch {
        toast.error("Failed to load payment data");
      }
    };

    loadPaymentData();
  }, []);


  const handlePaymentChange = (name, value) => {
    setPaymentData((prev) => ({ ...prev, [name]: value }));
  };


  const handleAddPayment = () => {
    if (!paymentData.paymentMode || !paymentData.paidAmount) {
      toast.error("Payment Mode and Paid Amount are required");
      return;
    }

    setPayments((prev) => [...prev, paymentData]);

    // reset paymentData
    setPaymentData({
      paymentMode: "",
      bankName: "",
      accountNo: "",
      chequeNo: "",
      paidAmount: "",
    });
  };

  const selectedPaymentModeLabel = paymentModes.find(
    (pm) => pm.value === paymentData.paymentMode
  )?.label;

  const isCheque = selectedPaymentModeLabel === "Cheque";
  const isBank = selectedPaymentModeLabel === "Bank";

  const removePayment = (index) => {
    setPayments((prev) => prev.filter((_, i) => i !== index));
  };

  const totalPaidAmount = payments.reduce(
    (sum, p) => sum + parseFloat(p.paidAmount || 0),
    0
  );

  // ---------- Submit ----------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedSupplier) return toast.error("Select supplier");
    if (!addedProducts.length) return toast.error("Add products");
    if (!payments.length) return toast.error("Add payments");

    const payload = {
      invoice_no: "",
      supplier_id: selectedSupplier.value,
      purchase_date: purchaseDate,
      total_amount: totalAmount,
      discount_amount: parseFloat(discountAmount) || 0,
      total_payable_amount: totalPayableAmount,
      total_paid_amount: totalPaidAmount,
      products: addedProducts.map((p) => ({
        product_id: p.id,
        purchase_quantity: parseInt(p.purchaseQuantity),
        purchase_price: parseFloat(p.purchasePrice),
        total_price: parseFloat(p.totalPrice),
      })),
      payments: payments.map((p) => ({
        payment_mode: p.paymentMode,
        bank_name: p.bankName || null,
        account_no: p.accountNo || null,
        cheque_no: p.chequeNo || null,
        paid_amount: parseFloat(p.paidAmount),
      })),
    };

    try {
      await AxiosInstance.post("/supplier-purchases/", payload);
      toast.success("Purchase saved successfully!");
    } catch {
      toast.error("Failed to submit");
    }
  };


 const handleKeyDown = (e) => {
    if (e.key !== "Enter") return;

    // Skip if react-select menu is open
    const selectMenuOpen = document.querySelector(".react-select__menu");
    if (selectMenuOpen) return;

    e.preventDefault();

    // Select all focusable elements
    const allFocusable = Array.from(
      document.querySelectorAll(
        `input:not([type="hidden"]),
       select,
       textarea,
       button,
       [tabindex]:not([tabindex="-1"])`
      )
    ).filter(
      (el) =>
        el.offsetParent !== null && // visible
        !el.disabled && // not disabled
        !(el.readOnly === true || el.getAttribute("readonly") !== null) // not readonly
    );

    const currentIndex = allFocusable.indexOf(e.target);

    if (currentIndex !== -1) {
      for (let i = currentIndex + 1; i < allFocusable.length; i++) {
        const nextEl = allFocusable[i];
        nextEl.focus();
        break;
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 ">
      {/* Supplier Section */}
      <section>
        <h2 className="font-semibold text-lg my-2">Supplier Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          <div>
            <label className="block mb-1 font-medium text-sm">
              Select Supplier
            </label>
            <Select
              options={supplierOptions}
              value={selectedSupplier}
              onChange={handleSupplierSelect}
              isClearable
              placeholder="Select..."
              className="text-sm"
              styles={customSelectStyles}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm">District</label>
            <input
              type="text"
              name="district"
              value={supplierData.district}
              onChange={handleSupplierChange}
              className="w-full border rounded px-2 py-1 text-sm placeholder-gray-400"
              placeholder="District..."
              readOnly
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm">Country</label>
            <input
              type="text"
              name="country"
              value={supplierData.country}
              onChange={handleSupplierChange}
              className="w-full border rounded px-2 py-1 text-sm placeholder-gray-400"
              placeholder="Country..."
              readOnly
            />
          </div>


          <div>
            <label className="block mb-1 font-medium text-sm">Address</label>
            <input
              type="text"
              name="address"
              value={supplierData.address}
              onChange={handleSupplierChange}
              className="w-full border rounded px-2 py-1 text-sm placeholder-gray-400"
              placeholder="Address..."
              readOnly
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm">
              Supplier Type
            </label>
            <input
              type="text"
              name="supplierType"
              value={supplierData.supplierType}
              onChange={handleSupplierChange}
              className="w-full border rounded px-2 py-1 text-sm placeholder-gray-400"
              placeholder="Type..."
              readOnly
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm">Shop Name</label>
            <input
              type="text"
              name="shopName"
              value={supplierData.shopName}
              onChange={handleSupplierChange}
              className="w-full border rounded px-2 py-1 text-sm placeholder-gray-400"
              placeholder="Shop..."
              readOnly
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm">Phone 1</label>
            <input
              type="text"
              name="phone1"
              value={supplierData.phone1}
              onChange={handleSupplierChange}
              className="w-full border rounded px-2 py-1 text-sm placeholder-gray-400"
              placeholder="Phone..."
              readOnly
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm">Phone 2</label>
            <input
              type="text"
              name="phone2"
              value={supplierData.phone2}
              onChange={handleSupplierChange}
              className="w-full border rounded px-2 py-1 text-sm placeholder-gray-400"
              placeholder="Alt phone..."
              readOnly
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm">E-mail</label>
            <input
              type="email"
              name="email"
              value={supplierData.email}
              onChange={handleSupplierChange}
              className="w-full border rounded px-2 py-1 text-sm placeholder-gray-400"
              placeholder="Email..."
              readOnly
            />
          </div>

          

          <div>
            <label className="block mb-1 font-medium text-sm">
              Date of Birth
            </label>
            <input
              type="date"
              name="dob"
              value={supplierData.dob}
              onChange={handleSupplierChange}
              className="w-full border rounded px-2 py-1 text-sm"
              readOnly
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm">NID No.</label>
            <input
              type="text"
              name="nidNo"
              value={supplierData.nidNo}
              onChange={handleSupplierChange}
              className="w-full border rounded px-2 py-1 text-sm placeholder-gray-400"
              placeholder="NID number..."
              readOnly
            />
          </div>
        </div>
      </section>

      {/* Product Purchase Section */}
      <section>
        <h2 className="font-semibold text-lg my-2">Product Purchase</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
          <div>
            <label className="block text-sm mb-1 font-medium">
              Purchase Date *
            </label>
            <input
              type="date"
              name="purchaseDate"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="w-full text-sm border px-2 py-1 rounded"
              required
              onKeyDown={handleKeyDown}
            />
          </div>

         
          <div>
            <label className="block mb-1 font-medium text-sm">
              Product Name *
            </label>
            <Select
              options={productNameOptions}
              value={selectedProductName}
              onChange={handleProductNameChange}
              isClearable
              placeholder="Select product name"
              className="text-sm"
              styles={customSelectStyles}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm">
              Current Stock Quantity
            </label>
            <input
              type="number"
              value={currentStock}
              disabled
              placeholder="Current stock will appear here"
              className="w-full border rounded px-2 py-1 text-sm placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm">
              Purchase Quantity *
            </label>
            <input
              type="number"
              value={purchaseQuantity}
              onChange={(e) => setPurchaseQuantity(e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm placeholder-gray-400"
              placeholder="Enter purchase quantity"
              onKeyDown={handleKeyDown}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm">
              Purchase Price *
            </label>
            <input
              type="number"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm placeholder-gray-400"
              placeholder="Enter purchase price"
              onKeyDown={handleKeyDown}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm">
              Total Price
            </label>
            <input
              type="text"
              value={totalPrice}
              readOnly
              className="w-full border rounded px-2 py-1 text-sm placeholder-gray-400"
            />
          </div>

          <div className="flex items-center mt-5">
            <button
              className="px-4 py-1 bg-sky-800 text-sm text-white rounded hover:bg-sky-700"
              onClick={(e) => {
                e.preventDefault();
                addProduct();
              }}
              onKeyDown={handleKeyDown}
            >
              Add Product
            </button>
          </div>
        </div>

        {addedProducts.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border px-2 py-1">Product Name</th>
                  <th className="border px-2 py-1">Current Stock</th>
                  <th className="border px-2 py-1">Purchase Qty</th>
                  <th className="border px-2 py-1">Purchase Price</th>
                  <th className="border px-2 py-1">Total Price</th>
                  <th className="border px-2 py-1">Remove</th>
                </tr>
              </thead>
              <tbody>
                {addedProducts.map((prod, idx) => (
                  <tr key={idx}>
                    <td className="border px-2 py-1">{prod.productName}</td>
                    <td className="border px-2 py-1">{prod.currentStock}</td>
                    <td className="border px-2 py-1">
                      {prod.purchaseQuantity}
                    </td>
                    <td className="border px-2 py-1">{prod.purchasePrice}</td>
                    <td className="border px-2 py-1">{prod.totalPrice}</td>
                    <td className="border px-2 py-1 text-center">
                      <button
                        onClick={() => removeProduct(idx)}
                        className="px-2 py-1 text-white bg-red-600 hover:bg-red-700 rounded text-xs"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-2 max-w-7xl mx-auto">
          <div className="grid grid-cols-3 gap-2">
            {/* Total Amount */}
            <div className="flex items-center flex-1">
              <label className="block mb-1 font-medium text-sm">
                Total Amount:
              </label>
              <input
                type="text"
                value={
                  isNaN(Number(totalAmount))
                    ? "0.00"
                    : Number(totalAmount).toFixed(2)
                }
                readOnly
                className="w-full border rounded px-2 py-1 text-sm placeholder-gray-400"
              />
            </div>

            {/* Discount Amount */}
            <div className="flex items-center flex-1">
              <label
                htmlFor="discount"
                className="block mb-1 font-medium text-sm"
              >
                Discount Amount:
              </label>
              <input
                id="discount"
                type="number"
                min={0}
                value={discountAmount}
                onChange={(e) => setDiscountAmount(e.target.value)}
                className="w-full border rounded px-2 py-1 text-sm placeholder-gray-400"
                placeholder="0.00"
                onKeyDown={handleKeyDown}
              />
            </div>

            {/* Total Payable Amount */}
            <div className="flex items-center flex-1">
              <label className="block mb-1 font-medium text-sm">
                Total Payable Amount:
              </label>
              <input
                type="text"
                value={
                  isNaN(Number(totalPayableAmount))
                    ? "0.00"
                    : Number(totalPayableAmount).toFixed(2)
                }
                readOnly
                className="w-full border rounded px-2 py-1 text-sm placeholder-gray-400"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="">
        <h3 className="font-semibold text-lg my-2">Payment</h3>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
          {/* Payment Mode */}
          <div>
            <label className="block text-sm mb-1 font-medium">
              Payment Mode*
            </label>
            <Select
              options={paymentModes}
              value={
                paymentModes.find(
                  (opt) => opt.value === paymentData.paymentMode
                ) || null
              }
              onChange={(selected) =>
                handlePaymentChange(
                  "paymentMode",
                  selected ? selected.value : ""
                )
              }
              placeholder="Select"
              className="text-sm"
              styles={customSelectStyles}
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* Bank Name */}
          <div>
            <label className="block text-sm mb-1 font-medium">Bank Name</label>
            <Select
              options={banks}
              value={
                banks.find((opt) => opt.value === paymentData.bankName) || null
              }
              onChange={(selected) =>
                handlePaymentChange("bankName", selected ? selected.value : "")
              }
              placeholder="Select"
              isClearable
              isDisabled={!isBank}
              className="text-sm"
              styles={customSelectStyles}
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* Account No */}
          <div>
            <label className="block text-sm mb-1 font-medium">Account No</label>
            <input
              type="text"
              value={paymentData.accountNo}
              onChange={(e) => handlePaymentChange("accountNo", e.target.value)}
              disabled={!isBank}
              className={`w-full border text-sm px-2 py-1 rounded ${
                !isBank ? "bg-gray-100 text-gray-500" : ""
              }`}
              onKeyDown={handleKeyDown}
              placeholder="Account No"
            />
          </div>

          {/* Cheque No */}
          <div>
            <label className="block text-sm mb-1 font-medium">Cheque No</label>
            <input
              type="text"
              value={paymentData.chequeNo}
              onChange={(e) => handlePaymentChange("chequeNo", e.target.value)}
              disabled={!isCheque}
              className={`w-full border px-2 py-1 rounded ${
                !isCheque ? "bg-gray-100 text-sm text-gray-400" : ""
              }`}
              placeholder="Cheque No"
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* Paid Amount */}
          <div>
            <label className="block text-sm mb-1 font-medium">
              Paid Amount*
            </label>
            <input
              type="number"
              value={paymentData.paidAmount}
              onChange={(e) =>
                handlePaymentChange("paidAmount", e.target.value)
              }
              className="w-full border rounded px-2 py-1 text-sm placeholder-gray-400"
              placeholder="0.00"
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* Add Button */}
          <div className="flex items-end justify-end">
            <button
              type="button"
              onClick={handleAddPayment}
              className="px-4 py-2 bg-sky-800 text-sm text-white rounded hover:bg-sky-700"
              onKeyDown={handleKeyDown}
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {payments.length > 0 && (
        <div className="mt-2 overflow-x-auto">
          <table className="min-w-full border text-center text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1">#</th>
                <th className="border px-2 py-1">Payment Mode</th>
                <th className="border px-2 py-1">Bank Name</th>
                <th className="border px-2 py-1">Account No</th>
                <th className="border px-2 py-1">Cheque No</th>
                <th className="border px-2 py-1">Paid Amount</th>
                <th className="border px-2 py-1">Action</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((pay, idx) => (
                <tr key={idx}>
                  <td className="border px-2 py-1">{idx + 1}</td>
                  <td className="border px-2 py-1">
                    {paymentModes.find((mode) => mode.value === pay.paymentMode)
                      ?.label || "N/A"}
                  </td>
                  <td className="border px-2 py-1">
                    {banks.find((bank) => bank.value === pay.bankName)?.label ||
                      "N/A"}
                  </td>
                  <td className="border px-2 py-1">{pay.accountNo}</td>
                  <td className="border px-2 py-1">{pay.chequeNo}</td>
                  <td className="border px-2 py-1">
                    {parseFloat(pay.paidAmount).toFixed(2)}
                  </td>
                  <td className="border px-2 py-1">
                    <button
                      type="button"
                      onClick={() => handleRemovePayment(idx)}
                      className="px-2 py-1 text-white bg-red-600 hover:bg-red-700 rounded text-xs"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center gap-2 mt-4">
        <label className="block text-sm mb-1 font-medium">
          Total Paid Amount:
        </label>
        <input
          type="number"
          value={
            isNaN(Number(totalPaidAmount))
              ? "0.00"
              : Number(totalPaidAmount).toFixed(2)
          }
          readOnly
          className="border rounded px-2 py-1 text-sm placeholder-gray-400"
        />
      </div>

      <div className=" flex justify-center">
        <button
          onClick={handleSubmit}
          className="px-6 py-2 text-sm bg-sky-800 text-white rounded hover:bg-sky-700"
          onKeyDown={handleKeyDown}
        >
          Submit
        </button>
      </div>
    </div>
  );
}