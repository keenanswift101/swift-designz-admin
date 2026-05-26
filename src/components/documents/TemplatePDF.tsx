import { Document, Page, View, Text, Image } from "@react-pdf/renderer";
import { ds, C } from "./pdf-styles";
import type { TemplateDocument, ContentBlock } from "./pdf-styles";

interface Props {
  doc: TemplateDocument;
  logoSrc?: string | null;
}

/* ── Banking Details (shared across all docs) ─ */
function BankingSection() {
  return (
    <View style={ds.bankingBox}>
      <Text style={ds.bankingLabel}>Banking Details (EFT)</Text>
      {/* Namibia / International */}
      <Text style={{ fontSize: 7, fontWeight: 700, letterSpacing: 2, color: "#444", marginBottom: 6, textTransform: "uppercase" as const }}>Namibia / International — Bank Windhoek</Text>
      <View style={ds.bankingGrid}>
        <View style={ds.bankingItem}>
          <Text style={ds.bankingKey}>Account Holder</Text>
          <Text style={ds.bankingVal}>Keenan Husselmann</Text>
        </View>
        <View style={ds.bankingItem}>
          <Text style={ds.bankingKey}>Bank</Text>
          <Text style={ds.bankingVal}>Bank Windhoek</Text>
        </View>
        <View style={ds.bankingItem}>
          <Text style={ds.bankingKey}>Account Number</Text>
          <Text style={ds.bankingVal}>8025331126</Text>
        </View>
        <View style={ds.bankingItem}>
          <Text style={ds.bankingKey}>Branch Code</Text>
          <Text style={ds.bankingVal}>481-972</Text>
        </View>
        <View style={ds.bankingItem}>
          <Text style={ds.bankingKey}>Account Type</Text>
          <Text style={ds.bankingVal}>Cheque (CHK)</Text>
        </View>
        <View style={ds.bankingItem}>
          <Text style={ds.bankingKey}>Swift Code</Text>
          <Text style={ds.bankingVal}>BWLINANX</Text>
        </View>
      </View>
      {/* Divider */}
      <View style={{ borderBottomWidth: 1, borderColor: C.border, marginVertical: 8 }} />
      {/* South Africa — ABSA */}
      <Text style={{ fontSize: 7, fontWeight: 700, letterSpacing: 2, color: "#444", marginBottom: 6, textTransform: "uppercase" as const }}>South African Clients — ABSA</Text>
      <View style={ds.bankingGrid}>
        <View style={ds.bankingItem}>
          <Text style={ds.bankingKey}>Account Name</Text>
          <Text style={ds.bankingVal}>Leon Lourens Husselmann</Text>
        </View>
        <View style={ds.bankingItem}>
          <Text style={ds.bankingKey}>Bank</Text>
          <Text style={ds.bankingVal}>ABSA Bank</Text>
        </View>
        <View style={ds.bankingItem}>
          <Text style={ds.bankingKey}>Account Number</Text>
          <Text style={ds.bankingVal}>9325564310</Text>
        </View>
        <View style={ds.bankingItem}>
          <Text style={ds.bankingKey}>Branch Code</Text>
          <Text style={ds.bankingVal}>632005</Text>
        </View>
        <View style={ds.bankingItem}>
          <Text style={ds.bankingKey}>Account Type</Text>
          <Text style={ds.bankingVal}>Current / Cheque</Text>
        </View>
      </View>
    </View>
  );
}

/* ── Parties Block ─────────────────────────── */
function PartiesSection() {
  return (
    <View style={ds.parties}>
      <View style={ds.party}>
        <Text style={ds.partyLabel}>Client</Text>
        <Text style={ds.partyName}>_______________________</Text>
        <Text style={ds.partyLine}>Company: _______________________</Text>
        <Text style={ds.partyLine}>Email: _______________________</Text>
        <Text style={ds.partyLine}>Phone: _______________________</Text>
      </View>
      <View style={ds.party}>
        <Text style={ds.partyLabel}>Service Provider</Text>
        <Text style={ds.partyName}>Keenan Husselmann</Text>
        <Text style={ds.partyLine}>Trading as Swift Designz</Text>
        <Text style={ds.partyLine}>keenan@swiftdesignz.co.za</Text>
        <Text style={ds.partyLine}>+264 81 853 6789</Text>
        <Text style={ds.partyLine}>swiftdesignz.co.za</Text>
      </View>
    </View>
  );
}

/* ── Signatures Block ──────────────────────── */
function SignaturesSection({ leftLabel = "Client", rightLabel = "Swift Designz" }: { leftLabel?: string; rightLabel?: string }) {
  return (
    <View style={ds.sigRow} wrap={false}>
      <View style={ds.sigBlock}>
        <Text style={ds.sigLabel}>{leftLabel}</Text>
        <View style={ds.sigLine} />
        <Text style={ds.sigName}>Full Name: _______________________</Text>
        <Text style={ds.sigName}>Date: _______________________</Text>
      </View>
      <View style={ds.sigBlock}>
        <Text style={ds.sigLabel}>{rightLabel}</Text>
        <View style={ds.sigLine} />
        <Text style={ds.sigName}>Keenan Husselmann</Text>
        <Text style={ds.sigName}>Date: _______________________</Text>
      </View>
    </View>
  );
}

/* ── Block Renderer ────────────────────────── */
function renderBlock(block: ContentBlock, idx: number) {
  switch (block.type) {
    case "info":
      return (
        <View key={idx} style={ds.infoBox} wrap={false}>
          <Text style={ds.infoText}>{block.text}</Text>
        </View>
      );
    case "warn":
      return (
        <View key={idx} style={ds.warnBox} wrap={false}>
          <Text style={ds.warnText}>{block.text}</Text>
        </View>
      );
    case "section":
      return (
        <View key={idx} style={ds.sectionWrap} wrap={false}>
          <Text style={ds.sectionNum}>{block.number}</Text>
          <Text style={ds.sectionTitle}>{block.title}</Text>
          {block.body && <Text style={ds.sectionBody}>{block.body}</Text>}
          {block.bullets?.map((b, i) => (
            <View key={i} style={ds.bulletRow}>
              <Text style={ds.bulletDot}>{"\u2022"}</Text>
              <Text style={ds.bulletText}>{b}</Text>
            </View>
          ))}
        </View>
      );
    case "table": {
      const widths = block.colWidths ?? block.headers.map(() => 100 / block.headers.length);
      return (
        <View key={idx} style={ds.table}>
          <View style={ds.tableHead}>
            {block.headers.map((h, i) => (
              <View key={i} style={{ width: `${widths[i]}%` }}>
                <Text style={ds.thText}>{h}</Text>
              </View>
            ))}
          </View>
          {block.rows.map((row, ri) => (
            <View key={ri} style={ri % 2 === 1 ? ds.tableRowAlt : ds.tableRow} wrap={false}>
              {row.map((cell, ci) => (
                <View key={ci} style={{ width: `${widths[ci]}%` }}>
                  <Text style={ci === 0 ? ds.tdBold : ds.tdText}>{cell}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      );
    }
    case "parties":
      return <PartiesSection key={idx} />;
    case "signatures":
      return <SignaturesSection key={idx} leftLabel={block.leftLabel} rightLabel={block.rightLabel} />;
    case "checklist":
      return (
        <View key={idx} style={{ marginBottom: 14 }}>
          {block.title && <Text style={{ ...ds.sectionTitle, marginBottom: 8 }}>{block.title}</Text>}
          {block.items.map((item, i) => (
            <View key={i} style={ds.checkRow} wrap={false}>
              <View style={ds.checkBox} />
              <Text style={ds.checkText}>{item}</Text>
            </View>
          ))}
        </View>
      );
    case "banking":
      return <BankingSection key={idx} />;
    case "divider":
      return <View key={idx} style={ds.divider} />;
    default:
      return null;
  }
}

/* ── Main Template PDF Component ───────────── */
export default function TemplatePDF({ doc, logoSrc }: Props) {
  return (
    <Document>
      <Page size="A4" style={ds.page} wrap>
        {/* Header */}
        <View style={ds.header} fixed>
          <View style={ds.brandRow}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            {logoSrc && <Image src={logoSrc} style={ds.logo} />}
            <View>
              <Text style={ds.brandName}>Swift Designz</Text>
              <Text style={ds.brandSub}>swiftdesignz.co.za</Text>
            </View>
          </View>
          <View style={ds.docTitle}>
            <Text style={ds.docLabel}>{doc.title}</Text>
            {doc.subtitle && <Text style={{ ...ds.docMetaLine, marginTop: 2 }}>{doc.subtitle}</Text>}
            <Text style={ds.docMetaLine}>
              Ref: <Text style={ds.docMetaVal}>{doc.ref}</Text>
            </Text>
            <Text style={ds.docMetaLine}>
              Version {doc.version} · Effective {doc.effective}
            </Text>
          </View>
        </View>

        {/* Content Blocks */}
        {doc.blocks.map(renderBlock)}

        {/* Footer */}
        <View style={ds.footer} fixed>
          <Text style={ds.footerText}>
            {doc.ref} · Version {doc.version}
          </Text>
          <Text style={ds.footerTeal}>Swift Designz · swiftdesignz.co.za</Text>
        </View>
      </Page>
    </Document>
  );
}
