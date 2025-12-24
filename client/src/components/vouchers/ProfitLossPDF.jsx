import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { useState } from "react";

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  header: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 12,
    fontWeight: "bold",
    color: "#ffffff",
    backgroundColor: "#3a6791",
    padding: 8,
  },
  companyYearRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  companyName: {
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  currentYear: {
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#c8dafc",
    borderBottomWidth: 1,
    borderBottomColor: "#9cb4d8",
    borderBottomStyle: "solid",
  },
  itemHeader: {
    flex: 1.6,
    paddingVertical: 6,
    paddingLeft: 8,
    fontWeight: "bold",
    color: "#4a6fa5",
  },
  amountHeaderGroup: {
    flex: 2,
    flexDirection: "row",
  },
  amountHeader: {
    flex: 1,
    paddingVertical: 6,
    borderLeftWidth: 1,
    borderLeftColor: "#9cb4d8",
    borderLeftStyle: "solid",
    fontWeight: "bold",
    color: "#4a6fa5",
    textAlign: "center",
  },
  percentHeader: {
    flex: 1,
    paddingVertical: 6,
    fontWeight: "bold",
    color: "#4a6fa5",
    textAlign: "right",
    paddingRight: 8,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#a5bedb",
    borderBottomWidth: 1,
    borderBottomColor: "#6c88af",
    borderBottomStyle: "solid",
    marginTop: 10,
    marginBottom: 4,
  },
  sectionHeaderText: {
    flex: 1,
    padding: 6,
    fontWeight: "bold",
    color: "#252525",
  },
  sectionHeaderSpacer: {
    flex: 3,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    borderBottomStyle: "solid",
  },
  rowIncomeLight: {
    backgroundColor: "#f0f7ff",
  },
  rowExpensesLight: {
    backgroundColor: "#fffbe6",
  },
  cellItem: {
    flex: 1.6,
    paddingVertical: 6,
    paddingLeft: 8,
    color: "#252525",
  },
  cellAmount: {
    flex: 1,
    paddingVertical: 6,
    borderLeftWidth: 1,
    borderLeftColor: "#ddd",
    borderLeftStyle: "solid",
    textAlign: "right",
    color: "#252525",
  },
  cellPercent: {
    flex: 1,
    paddingVertical: 6,
    paddingRight: 8,
    textAlign: "right",
    color: "#252525",
  },
  boldText: {
    fontWeight: "bold",
  },
  positivePercent: {
    color: "#333",
    fontWeight: "bold",
  },
  negativePercent: {
    color: "#cc0000",
    fontWeight: "bold",
  },
  greenText: {
    color: "#008000",
    fontWeight: "bold",
  },
});

const ProfitLossPDF = ({ report }) => {
  const year = report.year;
  const [selectedCategory, setSelectedCategory] = useState(
        JSON.parse(localStorage.getItem("business_category")) || null
    );

console.log("SelectedCategory", selectedCategory)
  

  const renderRow = (
    label,
    prev,
    curr,
    percent,
    bold = false,
    rowStyle = {},
    isPercentNegative = false,
    isAmountNegative = false
  ) => (
    <View style={[styles.row, rowStyle]}>
      <Text style={[styles.cellItem, bold && styles.boldText]}>{label}</Text>
      <Text
        style={[
          styles.cellAmount,
          bold && styles.boldText,
          // Using blue text for amounts
          !bold && styles.positivePercent,
          isAmountNegative && styles.greenText,
        ]}
      >
        {prev.toLocaleString()}
      </Text>
      <Text
        style={[
          styles.cellAmount,
          bold && styles.boldText,
          // Blue text for amounts
          !bold && styles.positivePercent,
          isAmountNegative && styles.greenText,
        ]}
      >
        {curr.toLocaleString()}
      </Text>
      <Text
        style={[
          styles.cellPercent,
          bold && styles.boldText,
          isPercentNegative ? styles.negativePercent : styles.positivePercent,
        ]}
      >
        {percent}%
      </Text>
    </View>
  );

  const renderIncomeRows = () =>
    report.income.map((row, idx) =>
      renderRow(
        row.item,
        row.previous_year,
        row.current_year,
        row.percent_change,
        false,
        idx % 2 === 0 ? styles.rowIncomeLight : {}
      )
    );

  const renderExpenseRows = () =>
    report.expenses.map((row, idx) =>
      renderRow(
        row.item,
        row.previous_year,
        row.current_year,
        row.percent_change,
        false,
        idx % 2 === 0 ? styles.rowExpensesLight : {}
      )
    );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <Text style={styles.header}>YEARLY PROFIT & LOSS STATEMENT TEMPLATE</Text>

        {/* Company and Year */}
        <View style={styles.companyYearRow}>
          <Text style={styles.companyName}>{selectedCategory.banner_title}</Text>
          <Text style={styles.currentYear}>Year:{year}</Text>
        </View>

        {/* Table Header */}
        <View style={styles.tableHeaderRow}>
          <Text style={styles.itemHeader}>Item</Text>
          <View style={styles.amountHeaderGroup}>
            <Text style={styles.amountHeader}>{year - 1}</Text>
            <Text style={styles.amountHeader}>{year}</Text>
          </View>
          <Text style={styles.percentHeader}>% Compared to Previous Year</Text>
        </View>

        {/* Income Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderText}>INCOME</Text>
          <Text style={styles.sectionHeaderSpacer}></Text>
        </View>

        {renderIncomeRows()}

        {renderRow(
          "Gross Profit",
          report.gross_profit.previous_year,
          report.gross_profit.current_year,
          report.gross_profit.percent_change,
          true,
          styles.rowIncomeLight
        )}

        {/* Expenses Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderText}>EXPENSES</Text>
          <Text style={styles.sectionHeaderSpacer}></Text>
        </View>

        {renderExpenseRows()}

        {renderRow(
          "Total I Expenses",
          report.total_expenses.previous_year,
          report.total_expenses.current_year,
          report.total_expenses.percent_change,
          true,
          styles.rowExpensesLight
        )}

        {renderRow(
          "Profit / Loss",
          report.net_profit.previous_year,
          report.net_profit.current_year,
          report.net_profit.percent_change,
          true,
          {},
          report.net_profit.percent_change < 0,
          report.net_profit.current_year < 0
        )}

        {/* Note section empty */}
        <View style={{ marginTop: 20 }}>
          <Text>Note</Text>
        </View>
      </Page>
    </Document>
  );
};

export default ProfitLossPDF;
