import { Document, PDFViewer } from "@react-pdf/renderer";
import { useEffect, useState } from "react";
import AxiosInstance from "../../../components/AxiosInstance";
import AssetsReportPDF from "../../../components/vouchers/AssetsReportPDF";
import useBusinessBanner from "../../../hooks/useBusinessBanner";

const AssetsReportPdfPage = () => {
  const [assets, setAssets] = useState([]);
  const banner = useBusinessBanner();

  const selectedCategory =
    JSON.parse(localStorage.getItem("business_category")) || null;

  useEffect(() => {
    if (!selectedCategory?.id) return;

    AxiosInstance.get("/reports/assets-report/", {
      params: {
        business_category: selectedCategory.id,
      },
    })
      .then((res) => {
        setAssets(res.data.assets || []);
      })
      .catch(console.error);
  }, [selectedCategory?.id]);

  return (
    <PDFViewer style={{ width: "100%", height: "100vh" }}>
      <Document>
        <AssetsReportPDF data={assets} banner={banner} />
      </Document>
    </PDFViewer>
  );
};

export default AssetsReportPdfPage;
