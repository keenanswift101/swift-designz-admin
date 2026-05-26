import { Document, Page, View, Text, Image, StyleSheet, Font } from "@react-pdf/renderer";
import { DEFAULT_ESTORE_RETAINER, type RetainerContent } from "@/types/estore-retainer";
type EstoreRetainerContent = RetainerContent;

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
  docLabel: { fontSize: 16, fontWeight: 700, color: "#111", letterSpacing: 1, textTransform: "uppercase" as const },
  docSubtitle: { fontSize: 7.5, color: "#777", marginTop: 2 },
  docMeta: { fontSize: 7.5, color: "#777", marginTop: 1.5 },
  docMetaVal: { color: "#333", fontWeight: 600 },
  parties: { flexDirection: "row", justifyContent: "space-between", marginBottom: 14, backgroundColor: surface, padding: 10, borderRadius: 4 },
  party: { width: "48%" },
  partyLabel: { fontSize: 7, fontWeight: 700, letterSpacing: 3, color: teal, textTransform: "uppercase" as const, marginBottom: 4 },
  partyName: { fontSize: 9.5, fontWeight: 700, color: "#111", marginBottom: 1.5 },
  partyLine: { fontSize: 7.5, color: "#555", marginBottom: 1 },
  infoBox: { backgroundColor: "#e8f7f7", borderLeftWidth: 3, borderColor: teal, padding: 8, marginBottom: 12, borderRadius: 2 },
  infoText: { fontSize: 7.5, color: "#1a5f5f", lineHeight: 1.5 },
  section: { marginBottom: 10 },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 5, gap: 6 },
  sectionNum: { fontSize: 7, fontWeight: 700, color: teal, letterSpacing: 2, width: 18 },
  sectionTitle: { fontSize: 8.5, fontWeight: 700, color: "#111", letterSpacing: 0.5, textTransform: "uppercase" as const, flex: 1, borderBottomWidth: 1, borderColor: border, paddingBottom: 2 },
  sectionBody: { fontSize: 7.5, color: "#444", lineHeight: 1.5, marginBottom: 4, marginLeft: 24 },
  bullet: { flexDirection: "row", marginBottom: 3, marginLeft: 24 },
  bulletDot: { fontSize: 7.5, color: teal, marginRight: 5, marginTop: 0.5 },
  bulletText: { fontSize: 7.5, color: "#444", lineHeight: 1.5, flex: 1 },
  bulletBold: { fontWeight: 700, color: "#222" },
  tableBox: { marginLeft: 24, marginBottom: 6, borderWidth: 1, borderColor: border, borderRadius: 3 },
  tableHead: { flexDirection: "row", backgroundColor: "#e8f7f7", paddingVertical: 4, paddingHorizontal: 7 },
  tableRow: { flexDirection: "row", borderTopWidth: 1, borderColor: border, paddingVertical: 4, paddingHorizontal: 7 },
  tableRowAlt: { flexDirection: "row", borderTopWidth: 1, borderColor: border, paddingVertical: 4, paddingHorizontal: 7, backgroundColor: "#fafafa" },
  thText: { fontSize: 6.5, fontWeight: 700, color: teal, letterSpacing: 1, textTransform: "uppercase" as const },
  tdText: { fontSize: 7.5, color: "#333" },
  tdBold: { fontSize: 7.5, color: "#111", fontWeight: 600 },
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
});

export interface EstoreRetainerPDFProps {
  clientName?: string;
  clientEmail?: string;
  clientCompany?: string | null;
  clientPhone?: string | null;
  logoSrc?: string | null;
  content?: EstoreRetainerContent;
}

function SectionHeader({ num, title }: { num: string; title: string }) {
  return (
    <View style={s.sectionHeader}>
      <Text style={s.sectionNum}>{num}</Text>
      <Text style={s.sectionTitle}>{title}</Text>
    </View>
  );
}

function Bullet({ bold, text }: { bold?: string; text: string }) {
  return (
    <View style={s.bullet}>
      <Text style={s.bulletDot}>›</Text>
      <Text style={s.bulletText}>
        {bold ? <Text style={s.bulletBold}>{bold} </Text> : null}{text}
      </Text>
    </View>
  );
}

function PageHeader({ logoSrc, c }: { logoSrc?: string | null; c: EstoreRetainerContent }) {
  const date = new Date().toLocaleDateString("en-ZA", { day: "2-digit", month: "long", year: "numeric" });
  return (
    <>
      <View style={s.header}>
        <View style={s.brandRow}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          {logoSrc && <Image src={logoSrc} style={s.logo} />}
          <View>
            <Text style={s.brandName}>Swift Designz</Text>
            <Text style={s.brandSub}>{c.providerWebsite}</Text>
          </View>
        </View>
        <View style={s.docTitle}>
          <Text style={s.docLabel}>{c.documentTitle || "Retainer Agreement"}</Text>
          <Text style={s.docSubtitle}>{c.documentSubtitle || "Monthly Service Contract"}</Text>
          <Text style={s.docMeta}>Ref: <Text style={s.docMetaVal}>{c.ref}</Text>   Date: <Text style={s.docMetaVal}>{date}</Text></Text>
        </View>
      </View>
      <View style={s.parties}>
        <View style={s.party}>
          <Text style={s.partyLabel}>Client</Text>
          <Text style={s.partyName}>{c.clientName || "Client Name"}</Text>
          {c.clientCompany ? <Text style={s.partyLine}>{c.clientCompany}</Text> : null}
          <Text style={s.partyLine}>{c.clientEmail || "client@email.com"}</Text>
          {c.clientPhone ? <Text style={s.partyLine}>{c.clientPhone}</Text> : null}
        </View>
        <View style={s.party}>
          <Text style={s.partyLabel}>Service Provider</Text>
          <Text style={s.partyName}>{c.providerName}</Text>
          <Text style={s.partyLine}>{c.providerTitle}</Text>
          <Text style={s.partyLine}>{c.providerEmail}</Text>
          <Text style={s.partyLine}>{c.providerPhone}</Text>
        </View>
      </View>
    </>
  );
}

function PageFooter({ c }: { c: EstoreRetainerContent }) {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footerText}>{c.ref} · Version 1.0 · Effective {c.effectiveDate}</Text>
      <Text style={s.footerTeal}>Swift Designz · {c.providerWebsite}</Text>
    </View>
  );
}

export default function EstoreRetainerPDF(props: EstoreRetainerPDFProps) {
  const { logoSrc } = props;
  const c: EstoreRetainerContent = props.content ?? DEFAULT_ESTORE_RETAINER;

  return (
    <Document>
      {/* ── PAGE 1 ── */}
      <Page size="A4" style={s.page}>
        <PageHeader logoSrc={logoSrc} c={c} />

        <View style={s.infoBox}>
          <Text style={s.infoText}>{c.introText}</Text>
        </View>

        <View style={s.section}>
          <SectionHeader num="01" title="Retainer Rate & Included Services" />
          <Text style={s.sectionBody}>{c.monthlyRate}/month covers the following services:</Text>
          {c.includedServices.map((svc, i) => (
            <Bullet key={i} bold={`${svc.title} —`} text={svc.description} />
          ))}
        </View>

        <View style={s.section}>
          <SectionHeader num="02" title="Services Not Included" />
          <Text style={s.sectionBody}>The following fall outside this retainer and may be quoted separately or accessed via an upgraded plan:</Text>
          {c.excludedServices.map((svc, i) => (
            <Bullet key={i} bold={`${svc.title} —`} text={svc.description} />
          ))}
        </View>

        <View style={s.section}>
          <SectionHeader num="03" title="Payment Gateway Integration" />
          {c.gatewayTerms.map((t, i) => <Bullet key={i} text={t} />)}
        </View>

        <View style={s.section}>
          <SectionHeader num="04" title="Service Level & Response Times" />
          <View style={s.tableBox}>
            <View style={s.tableHead}>
              <Text style={[s.thText, { width: "15%" }]}>Priority</Text>
              <Text style={[s.thText, { flex: 1 }]}>Issue Type</Text>
              <Text style={[s.thText, { width: "22%" }]}>Response</Text>
              <Text style={[s.thText, { width: "22%" }]}>Resolution</Text>
            </View>
            {c.serviceLevels.map((row, i) => (
              <View key={i} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
                <Text style={[s.tdBold, { width: "15%" }]}>{row.priority}</Text>
                <Text style={[s.tdText, { flex: 1 }]}>{row.issueType}</Text>
                <Text style={[s.tdText, { width: "22%" }]}>{row.response}</Text>
                <Text style={[s.tdText, { width: "22%" }]}>{row.resolution}</Text>
              </View>
            ))}
          </View>
        </View>

        <PageFooter c={c} />
      </Page>

      {/* ── PAGE 2 ── */}
      <Page size="A4" style={s.page}>
        <View style={s.section}>
          <SectionHeader num="05" title="Payment Terms" />
          <View style={s.tableBox}>
            <View style={s.tableHead}>
              <Text style={[s.thText, { width: "32%" }]}>Item</Text>
              <Text style={[s.thText, { flex: 1 }]}>Detail</Text>
            </View>
            {c.paymentTerms.map((row, i) => (
              <View key={i} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
                <Text style={[s.tdBold, { width: "32%" }]}>{row.item}</Text>
                <Text style={[s.tdText, { flex: 1 }]}>{row.detail}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={s.section}>
          <SectionHeader num="06" title="Contract Duration & Renewal" />
          {c.durationTerms.map((t, i) => <Bullet key={i} text={t} />)}
        </View>

        <View style={s.section}>
          <SectionHeader num="07" title="Cancellation & Early Exit" />
          {c.cancellationTerms.map((t, i) => <Bullet key={i} text={t} />)}
        </View>

        <View style={s.section}>
          <SectionHeader num="08" title="Retainer Upgrades & Scope Changes" />
          {c.upgradeTerms.map((t, i) => <Bullet key={i} text={t} />)}
        </View>

        <View style={s.section}>
          <SectionHeader num="09" title="Client Responsibilities" />
          {c.clientResponsibilities.map((t, i) => <Bullet key={i} text={t} />)}
        </View>

        <View style={s.section}>
          <SectionHeader num="10" title="Intellectual Property" />
          {c.ipTerms.map((t, i) => <Bullet key={i} text={t} />)}
        </View>

        <View style={s.section}>
          <SectionHeader num="11" title="Limitation of Liability" />
          {c.liabilityTerms.map((t, i) => <Bullet key={i} text={t} />)}
        </View>

        <View break>
          <View style={s.section}>
            <SectionHeader num="12" title="General Terms" />
            {c.generalTerms.map((t, i) => <Bullet key={i} text={t} />)}
          </View>
        </View>

        <View wrap={false}>
          <View style={s.divider} />
          <View style={s.infoBox}>
            <Text style={s.infoText}>{c.closingStatement}</Text>
          </View>
          <View style={s.sigRow}>
            <View style={s.sigBlock}>
              <View style={s.sigLine} />
              <Text style={s.sigLabel}>Client Signature</Text>
              <Text style={s.sigName}>{c.clientName || "Client Name"}</Text>
              <Text style={s.sigDate}>Date: ___________________________</Text>
            </View>
            <View style={s.sigBlock}>
              <View style={s.sigLine} />
              <Text style={s.sigLabel}>Swift Designz — Service Provider</Text>
              <Text style={s.sigName}>{c.providerName}</Text>
              <Text style={s.sigDate}>Date: ___________________________</Text>
            </View>
          </View>
        </View>

        <PageFooter c={c} />
      </Page>
    </Document>
  );
}
