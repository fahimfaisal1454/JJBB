import React, { useEffect, useState } from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import AxiosInstance from "../AxiosInstance";
import joyjatraLogo from "../../assets/joyjatra_logo.jpeg";

const styles = StyleSheet.create({
  page: { padding: 24, fontSize: 9 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  logo: { width: 60, height: 60, marginRight: 10 },
  title: { fontSize: 14, fontWeight: "bold" },
  table: { width: "100%", borderWidth: 1 },
  row: { flexDirection: "row" },
  cell: { borderWidth: 1, padding: 4 },
  bold: { fontWeight: "bold" },
});

export default function AssetsReportPDF({ data = [] }) {
  const [banner, setBanner] = useState(null);

  const selectedCategory =
    JSON.parse(localStorage.getItem("business_category"));

  useEffect(() => {
    if (!selectedCategory?.id) return;

    AxiosInstance.get(
      `/business-categories/${selectedCategory.id}/`
    ).then((res) => setBanner(res.data));
  }, [selectedCategory?.id]);

  const total = data.reduce((s, a) => s + Number(a.value || 0), 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Image
            src={banner?.banner_logo || joyjatraLogo}
            style={styles.logo}
          />
          <Text style={styles.title}>
            {banner?.banner_title || "Business"} Assets Report
          </Text>
        </View>

        <View style={styles.table}>
          <View style={[styles.row, styles.bold]}>
            <Text style={[styles.cell, { width: "40%" }]}>Asset</Text>
            <Text style={[styles.cell, { width: "25%" }]}>Category</Text>
            <Text style={[styles.cell, { width: "15%" }]}>Qty</Text>
            <Text style={[styles.cell, { width: "20%" }]}>Value</Text>
          </View>

          {data.map((a, i) => (
            <View style={styles.row} key={i}>
              <Text style={[styles.cell, { width: "40%" }]}>{a.asset_name}</Text>
              <Text style={[styles.cell, { width: "25%" }]}>{a.category}</Text>
              <Text style={[styles.cell, { width: "15%" }]}>{a.quantity}</Text>
              <Text style={[styles.cell, { width: "20%" }]}>
                {Number(a.value).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        <Text style={{ marginTop: 10, fontWeight: "bold" }}>
          Total Asset Value: {total.toFixed(2)}
        </Text>
      </Page>
    </Document>
  );
}
