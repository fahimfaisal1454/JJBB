import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

/* -------- Helpers -------- */
const money = (value) => {
  const num = Number(value);
  return isNaN(num) ? "0.00" : num.toFixed(2);
};

const numberToWords = (num) => {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];

  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  if (num === 0) return "Zero";

  const convertBelowHundred = (n) => {
    if (n < 20) return ones[n];
    return `${tens[Math.floor(n / 10)]} ${ones[n % 10]}`.trim();
  };

  const convertBelowThousand = (n) => {
    if (n < 100) return convertBelowHundred(n);
    return `${ones[Math.floor(n / 100)]} Hundred ${convertBelowHundred(
      n % 100
    )}`.trim();
  };

  let words = "";

  if (num >= 10000000) {
    words += `${convertBelowThousand(
      Math.floor(num / 10000000)
    )} Crore `;
    num %= 10000000;
  }

  if (num >= 100000) {
    words += `${convertBelowThousand(
      Math.floor(num / 100000)
    )} Lakh `;
    num %= 100000;
  }

  if (num >= 1000) {
    words += `${convertBelowThousand(
      Math.floor(num / 1000)
    )} Thousand `;
    num %= 1000;
  }

  if (num > 0) {
    words += convertBelowThousand(num);
  }

  return words.trim();
};

const amountInWords = (amount) => {
  const taka = Math.round(Number(amount));
  return `${numberToWords(taka)} Taka Only`;
};


const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};



/* -------- Styles -------- */
const styles = StyleSheet.create({
  page: {
    padding: 35,
    fontSize: 9,
    fontFamily: "Helvetica",
  },

  center: {
    textAlign: "center",
  },

  bold: {
    fontWeight: "bold",
  },

  headerTitle: {
    fontSize: 14,
    fontWeight: "bold",
  },

  subHeader: {
    fontSize: 9,
    marginTop: 2,
  },

  voucherTitle: {
    marginTop: 10,
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "center",
    textDecoration: "underline",
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  table: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#000",
  },

  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
  },

  cell: {
    padding: 4,
    borderRightWidth: 1,
  },

  footerText: {
    marginTop: 8,
  },

  signatureRow: {
    marginTop: 35,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 9,
  },
  signatureItem: {
    alignItems: "center",
    width: "13%",
  },
  signatureLine: {
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    marginBottom: 4,
  },
  signatureText: {
    fontSize: 9,
  },
});

export default function JournalVoucherPDF({ journal }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ================= HEADER ================= */}
        <View style={styles.center}>
          <Text style={styles.headerTitle}>
            Justice and Care, Bangladesh
          </Text>
          <Text style={styles.subHeader}>
            House 14, Road 32, Gulshan 1, Dhaka 1212
          </Text>
          <Text style={styles.subHeader}>
            Email: arif.hossain@justiceandcarebd.org | Mobile: 1755698185
          </Text>
        </View>

        <Text style={styles.voucherTitle}>
          Adjustment Journal Voucher
        </Text>

        {/* ================= META ================= */}
        <View style={styles.rowBetween}>
          <Text>
            <Text style={styles.bold}>Office :</Text> MSIF
          </Text>
          <Text>
            <Text style={styles.bold}>Voucher Date :</Text>{" "}
            {formatDate(journal.date)}
            </Text>
        </View>

        <View style={styles.rowBetween}>
          <Text>
            <Text style={styles.bold}>Voucher No :</Text>{" "}
            JV-{journal.id.toString().padStart(6, "0")}
          </Text>
        </View>

        {/* ================= TABLE ================= */}
        <View style={styles.table}>
          {/* Header Row */}
          <View style={styles.tableRow}>
            <Text style={[styles.cell, { width: "6%" }]}>SL</Text>
            <Text style={[styles.cell, { width: "14%" }]}>
              Account No
            </Text>
            <Text style={[styles.cell, { width: "40%" }]}>
              Account Name
            </Text>
            <Text style={[styles.cell, { width: "20%", textAlign: "right" }]}>
              Debit
            </Text>
            <Text
              style={[
                styles.cell,
                { width: "20%", textAlign: "right", borderRightWidth: 0 },
              ]}
            >
              Credit
            </Text>
          </View>

          {/* Data Rows */}
          {journal.lines.map((line, index) => (
            <View style={styles.tableRow} key={index}>
              <Text style={[styles.cell, { width: "6%" }]}>
                {index + 1}
              </Text>
              <Text style={[styles.cell, { width: "14%" }]}>
                {line.account_code || ""}
              </Text>
              <Text style={[styles.cell, { width: "40%" }]}>
                {line.account_name}
              </Text>
              <Text style={[styles.cell, { width: "20%", textAlign: "right" }]}>
                {Number(line.debit) > 0 ? money(line.debit) : "0.00"}
              </Text>
              <Text
                style={[
                  styles.cell,
                  { width: "20%", textAlign: "right", borderRightWidth: 0 },
                ]}
              >
                {Number(line.credit) > 0 ? money(line.credit) : "0.00"}
              </Text>
            </View>
          ))}

          {/* Total Row */}
          <View style={styles.tableRow}>
            <Text
              style={[
                styles.cell,
                styles.bold,
                { width: "60%", textAlign: "right" },
              ]}
            >
              Total
            </Text>
            <Text
              style={[
                styles.cell,
                styles.bold,
                { width: "20%", textAlign: "right" },
              ]}
            >
              {money(journal.total_debit)}
            </Text>
            <Text
              style={[
                styles.cell,
                styles.bold,
                {
                  width: "20%",
                  textAlign: "right",
                  borderRightWidth: 0,
                },
              ]}
            >
              {money(journal.total_credit)}
            </Text>
          </View>
        </View>

        {/* ================= FOOTER ================= */}
        <Text style={styles.footerText}>
          <Text style={styles.bold}>Sum Of Taka :</Text>{" "}
          {amountInWords(journal.total_debit)}
        </Text>

        <Text style={styles.footerText}>
          <Text style={styles.bold}>Description :</Text>{" "}
          {journal.description || "-"}
        </Text>

        {/* ================= SIGNATURES ================= */}
       <View style={styles.signatureRow}>
        {[
            "Prepared By",
            "Received By",
            "HOD",
            "AM",
            "HOD AF",
            "Approved By",
            "Authorized By",
        ].map((label) => {
            const lineWidth = Math.max(label.length * 4.5, 40); // dynamic

            return (
            <View key={label} style={styles.signatureItem}>
                <View style={[styles.signatureLine, { width: lineWidth }]} />
                <Text style={styles.signatureText}>{label}</Text>
            </View>
            );
        })}
        </View>


      </Page>
    </Document>
  );
}
