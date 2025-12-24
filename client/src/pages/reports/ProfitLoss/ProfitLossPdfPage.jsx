import React, { useEffect, useState } from "react";
import { PDFViewer } from "@react-pdf/renderer";
import AxiosInstance from "../../../components/AxiosInstance";
import { useSearchParams } from "react-router-dom";
import ProfitLossPDF from "../../../components/vouchers/ProfitLossPDF";
import { useNavigate } from "react-router-dom";


const ProfitLossPdfPage = () => {
  const [searchParams] = useSearchParams();
  const year = searchParams.get("year") || new Date().getFullYear();
  const [report, setReport] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReport();
  }, [year]);

  const fetchReport = async () => {
    const res = await AxiosInstance.get(
      `profit-loss/?year=${year}`
    );
    setReport(res.data);
  };

  if (!report) return <p>Loading Profit & Loss PDF...</p>;

  return (
    <div className="h-screen flex flex-col">
      {/* HEADER */}
     <div className="bg-gray-600 shadow p-3 flex justify-between items-center">
        <h4 className="text-white">Profit & Loss PDF</h4>
        <button
        onClick={() => navigate("/reports/profit-loss")}
        className="text-sm text-white hover:underline"
        >
        ← Back
        </button>
      </div>

      {/* PDF */}
      <div style={{ height: "calc(100vh - 56px)" }}>
        <PDFViewer style={{ width: "100%", height: "100%" }}>
          <ProfitLossPDF report={report} />
        </PDFViewer>
      </div>
    </div>
  );
};

export default ProfitLossPdfPage;
