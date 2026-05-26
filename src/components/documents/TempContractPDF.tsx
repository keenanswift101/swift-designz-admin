import { Document, Page, View, Text, Image, StyleSheet, Font } from "@react-pdf/renderer";
import { DEFAULT_TEMP_CONTRACT, type TempContractContent } from "@/types/employee-contract";

Font.register({
  family: "Inter",
  fonts: [
    { src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf", fontWeight: 400 },
    { src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fMZhrib2Bg-4.ttf", fontWeight: 600 },
    { src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYMZhrib2Bg-4.ttf", fontWeight: 700 },
  ],
});

const teal = "#30B0B0";
const bg = "#ffffff";
const surface = "#f5f5f5";
const border = "#e0e0e0";

const s = StyleSheet.create({
  page: { backgroundColor: bg, paddingTop: 36, paddingBottom: 50, paddingHorizontal: 40, fontFamily: "Inter", fontSize: 9, color: "#333" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20, paddingBottom: 14, borderBottomWidth: 2, borderColor: teal },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  logo: { width: 34, height: 34 },
  brandName: { fontSize: 14, fontWeight: 700, letterSpacing: 3, color: teal, textTransform: "uppercase" as const },
  brandSub: { fontSize: 7, color: "#208080", letterSpacing: 2, marginTop: 2, textTransform: "uppercase" as const },
  docTitle: { textAlign: "right" as const },
  docLabel: { fontSize: 15, fontWeight: 700, color: "#111", letterSpacing: 0.5, textTransform: "uppercase" as const },
  docSubtitle: { fontSize: 7.5, color: "#777", marginTop: 2 },
  docMeta: { fontSize: 7.5, color: "#777", marginTop: 1.5 },
  docMetaVal: { color: "#333", fontWeight: 600 },
  parties: { flexDirection: "row", justifyContent: "space-between", marginBottom: 14, backgroundColor: surface, padding: 10, borderRadius: 4 },
  party: { width: "48%" },
  partyLabel: { fontSize: 7, fontWeight: 700, letterSpacing: 3, color: teal, textTransform: "uppercase" as const, marginBottom: 4 },
  partyName: { fontSize: 9.5, fontWeight: 700, color: "#111", marginBottom: 1.5 },
  partyLine: { fontSize: 7.5, color: "#555", marginBottom: 1 },
  partySub: { fontSize: 7, color: "#888", marginBottom: 1 },
  infoBox: { backgroundColor: "#e8f7f7", borderLeftWidth: 3, borderColor: teal, padding: 8, marginBottom: 12, borderRadius: 2 },
  infoText: { fontSize: 7.5, color: "#1a5f5f", lineHeight: 1.5 },
  section: { marginBottom: 10 },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 5, gap: 6 },
  sectionNum: { fontSize: 7, fontWeight: 700, color: teal, letterSpacing: 2, width: 18 },
  sectionTitle: { fontSize: 8.5, fontWeight: 700, color: "#111", letterSpacing: 0.5, textTransform: "uppercase" as const, flex: 1, borderBottomWidth: 1, borderColor: border, paddingBottom: 2 },
  sectionBody: { fontSize: 7.5, color: "#444", lineHeight: 1.5, marginBottom: 4, marginLeft: 24 },
  twoCol: { flexDirection: "row", gap: 12, marginLeft: 24, marginBottom: 6 },
  colItem: { flex: 1 },
  colLabel: { fontSize: 6.5, fontWeight: 700, color: teal, letterSpacing: 1, textTransform: "uppercase" as const, marginBottom: 2 },
  colValue: { fontSize: 8, color: "#222", fontWeight: 600 },
  bullet: { flexDirection: "row", marginBottom: 3, marginLeft: 24 },
  bulletDot: { fontSize: 7.5, color: teal, marginRight: 5, marginTop: 0.5 },
  bulletText: { fontSize: 7.5, color: "#444", lineHeight: 1.5, flex: 1 },
  divider: { borderBottomWidth: 1, borderColor: border, marginVertical: 10 },
  sigRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  sigBlock: { width: "45%" },
  sigLine: { borderBottomWidth: 1, borderColor: "#333", marginBottom: 4, height: 28 },
  sigLabel: { fontSize: 6.5, color: "#777", letterSpacing: 1, textTransform: "uppercase" as const },
  sigName: { fontSize: 7.5, fontWeight: 600, color: "#111", marginTop: 2 },
  sigDate: { fontSize: 7, color: "#999", marginTop: 2 },
  footer: { position: "absolute", bottom: 22, left: 40, right: 40, borderTopWidth: 1, borderColor: border, paddingTop: 7, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 6.5, color: "#999" },
  footerTeal: { fontSize: 6.5, color: teal },
  badge: { alignSelf: "flex-start", backgroundColor: "#e8f7f7", borderWidth: 1, borderColor: teal, borderRadius: 10, paddingVertical: 2, paddingHorizontal: 7, marginBottom: 10 },
  badgeText: { fontSize: 6.5, fontWeight: 700, color: teal, letterSpacing: 1.5, textTransform: "uppercase" as const },
});

function SectionHeader({ num, title }: { num: string; title: string }) {
  return (
    <View style={s.sectionHeader}>
      <Text style={s.sectionNum}>{num}</Text>
      <Text style={s.sectionTitle}>{title}</Text>
    </View>
  );
}

function Bullet({ text }: { text: string }) {
  return (
    <View style={s.bullet}>
      <Text style={s.bulletDot}>›</Text>
      <Text style={s.bulletText}>{text}</Text>
    </View>
  );
}

function ColField({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.colItem}>
      <Text style={s.colLabel}>{label}</Text>
      <Text style={s.colValue}>{value || "—"}</Text>
    </View>
  );
}

function PageFooter({ c }: { c: TempContractContent }) {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footerText}>{c.ref} · Temporary Employment Contract</Text>
      <Text style={s.footerTeal}>Swift Designz · swiftdesignz.co.za</Text>
    </View>
  );
}

export interface TempContractPDFProps {
  logoSrc?: string | null;
  content?: TempContractContent;
}

export default function TempContractPDF({ logoSrc, content }: TempContractPDFProps) {
  const c = content ?? DEFAULT_TEMP_CONTRACT;
  const date = new Date().toLocaleDateString("en-ZA", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <Document>
      {/* ── PAGE 1 ── */}
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <View style={s.brandRow}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            {logoSrc && <Image src={logoSrc} style={s.logo} />}
            <View>
              <Text style={s.brandName}>Swift Designz</Text>
              <Text style={s.brandSub}>swiftdesignz.co.za</Text>
            </View>
          </View>
          <View style={s.docTitle}>
            <Text style={s.docLabel}>{c.documentTitle || "Temporary Employment Contract"}</Text>
            <Text style={s.docSubtitle}>Fixed Duration · Subject to BCEA & LRA</Text>
            <Text style={s.docMeta}>Ref: <Text style={s.docMetaVal}>{c.ref}</Text>   Date: <Text style={s.docMetaVal}>{date}</Text></Text>
          </View>
        </View>

        {/* Contract type badge */}
        <View style={s.badge}>
          <Text style={s.badgeText}>Temporary Employment</Text>
        </View>

        {/* Parties */}
        <View style={s.parties}>
          <View style={s.party}>
            <Text style={s.partyLabel}>Employer</Text>
            <Text style={s.partyName}>{c.employerName}</Text>
            <Text style={s.partySub}>t/a {c.employerTradingAs}</Text>
            <Text style={s.partyLine}>{c.employerAddress}</Text>
            <Text style={s.partyLine}>{c.employerEmail}</Text>
            <Text style={s.partyLine}>{c.employerPhone}</Text>
          </View>
          <View style={s.party}>
            <Text style={s.partyLabel}>Employee</Text>
            <Text style={s.partyName}>{c.employeeName || "Employee Name"}</Text>
            {c.employeeIdNumber ? <Text style={s.partySub}>ID: {c.employeeIdNumber}</Text> : null}
            {c.employeeAddress ? <Text style={s.partyLine}>{c.employeeAddress}</Text> : null}
            <Text style={s.partyLine}>{c.employeeEmail || "employee@email.com"}</Text>
            {c.employeePhone ? <Text style={s.partyLine}>{c.employeePhone}</Text> : null}
          </View>
        </View>

        {/* Section 01 — Nature of Employment */}
        <View style={s.section}>
          <SectionHeader num="01" title="Nature of Temporary Employment" />
          <Text style={s.sectionBody}>{c.reasonForTemp}</Text>
          <View style={s.twoCol}>
            <ColField label="Start Date" value={c.startDate} />
            <ColField label="End Date" value={c.endDate} />
          </View>
          <Text style={[s.sectionBody, { marginTop: 2 }]}>
            This contract is of a temporary nature and will terminate automatically on the end date specified above, unless extended by written agreement. Temporary employment does not constitute permanent employment.
          </Text>
        </View>

        {/* Section 02 — Position Details */}
        <View style={s.section}>
          <SectionHeader num="02" title="Position Details" />
          <View style={s.twoCol}>
            <ColField label="Job Title" value={c.jobTitle} />
            <ColField label="Department" value={c.department} />
          </View>
          <View style={[s.twoCol, { marginTop: 6 }]}>
            <ColField label="Reporting To" value={c.reportingTo} />
            <ColField label="Work Location" value={c.workLocation} />
          </View>
        </View>

        {/* Section 03 — Remuneration */}
        <View style={s.section}>
          <SectionHeader num="03" title="Remuneration" />
          <View style={s.twoCol}>
            <ColField label="Rate" value={`${c.rateAmount} ${c.ratePeriod}`} />
            <ColField label="Payment Method" value={c.paymentMethod} />
          </View>
          <View style={[s.twoCol, { marginTop: 6 }]}>
            <ColField label="Payment Schedule" value={c.paymentSchedule} />
            <ColField label="UIF" value="Employer & Employee each contribute 1% of gross" />
          </View>
        </View>

        {/* Section 04 — Working Hours */}
        <View style={s.section}>
          <SectionHeader num="04" title="Working Hours & Schedule" />
          <View style={s.twoCol}>
            <ColField label="Working Hours" value={c.workingHours} />
            <ColField label="Hours Per Week" value={`${c.hoursPerWeek} hours`} />
          </View>
          <Text style={[s.sectionBody, { marginTop: 6 }]}>{c.overtimeRate}</Text>
        </View>

        <PageFooter c={c} />
      </Page>

      {/* ── PAGE 2 ── */}
      <Page size="A4" style={s.page}>
        {/* Section 05 — Duties */}
        <View style={s.section}>
          <SectionHeader num="05" title="Duties & Responsibilities" />
          {c.duties.map((d, i) => <Bullet key={i} text={d} />)}
        </View>

        {/* Section 06 — Leave */}
        <View style={s.section}>
          <SectionHeader num="06" title="Leave Entitlement" />
          {c.leaveTerms.map((t, i) => <Bullet key={i} text={t} />)}
        </View>

        {/* Section 07 — Termination */}
        <View style={s.section}>
          <SectionHeader num="07" title="Termination of Employment" />
          {c.terminationTerms.map((t, i) => <Bullet key={i} text={t} />)}
        </View>

        {/* Section 08 — Confidentiality */}
        <View style={s.section}>
          <SectionHeader num="08" title="Confidentiality" />
          {c.confidentialityTerms.map((t, i) => <Bullet key={i} text={t} />)}
        </View>

        {/* Section 09 — General Terms */}
        <View style={s.section}>
          <SectionHeader num="09" title="General Terms" />
          {c.generalTerms.map((t, i) => <Bullet key={i} text={t} />)}
        </View>

        {/* Signature block */}
        <View wrap={false}>
          <View style={s.divider} />
          <View style={s.infoBox}>
            <Text style={s.infoText}>{c.closingStatement}</Text>
          </View>
          <View style={s.sigRow}>
            <View style={s.sigBlock}>
              <View style={s.sigLine} />
              <Text style={s.sigLabel}>Employee Signature</Text>
              <Text style={s.sigName}>{c.employeeName || "Employee Name"}</Text>
              <Text style={s.sigDate}>Date: ___________________________</Text>
            </View>
            <View style={s.sigBlock}>
              <View style={s.sigLine} />
              <Text style={s.sigLabel}>Employer — Swift Designz</Text>
              <Text style={s.sigName}>{c.employerRepName}</Text>
              <Text style={s.sigDate}>Date: ___________________________</Text>
            </View>
          </View>
        </View>

        <PageFooter c={c} />
      </Page>
    </Document>
  );
}
