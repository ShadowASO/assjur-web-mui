/**
 * Utils: exportPDFEnriquecido.tsx
 * Versão: 3.0
 * Finalidade: Geração de PDF vetorial preservando formatação, indentação e recuos
 */

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";

/**
 * Exporta HTML para PDF mantendo formatação, indentação e espaçamentos.
 * @param html HTML completo do conteúdo renderizado
 * @param titulo Cabeçalho do documento
 */
export async function exportPDFEnriquecido(
  html: string,
  titulo = "Minuta de Sentença"
) {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;

  // ======================================================
  // 🔹 Estilos gerais
  // ======================================================
  const styles = StyleSheet.create({
    page: {
      fontFamily: "Times-Roman",
      fontSize: 12,
      paddingTop: 25 * 2.8346,
      paddingBottom: 20 * 2.8346,
      paddingHorizontal: 15 * 2.8346,
      textAlign: "justify",
      lineHeight: 1.6,
    },
    paragraph: {
      marginBottom: 8,
      textIndent: 90, // indentação padrão (1cm aprox)
    },
    indented: {
      marginBottom: 8,
      marginLeft: 30,
    },
    bold: { fontFamily: "Times-Bold" },
    italic: { fontStyle: "italic" },
    h6: {
      fontSize: 14,
      fontFamily: "Times-Bold",
      marginTop: 14,
      marginBottom: 8,
      textAlign: "center",
    },
    h5: {
      fontSize: 15,
      fontFamily: "Times-Bold",
      marginTop: 18,
      marginBottom: 10,
      textAlign: "center",
    },
    h4: {
      fontSize: 16,
      fontFamily: "Times-Bold",
      marginTop: 20,
      marginBottom: 12,
      textAlign: "center",
    },
    blockquote: {
      marginTop: 10,
      marginBottom: 10,
      marginLeft: 40,
      marginRight: 40,
      fontStyle: "italic",
      color: "#333",
    },

    listItem: {
      marginLeft: 25,
      marginBottom: 4,
      flexDirection: "row",
    },
    bullet: { width: 10 },
    footer: {
      position: "absolute",
      bottom: 30,
      left: 0,
      right: 0,
      textAlign: "center",
      fontSize: 10,
      color: "gray",
    },
    block: {
      marginBottom: 10,
      paddingLeft: 5,
    },
    blockIndented: {
      marginBottom: 10,
      marginLeft: 25,
      paddingLeft: 5,
      borderLeftWidth: 1,
      borderLeftColor: "#ccc",
      borderLeftStyle: "solid",
    },
  });

  // ======================================================
  // 🔹 Funções utilitárias
  // ======================================================

  // Preserva múltiplos espaços e quebras de linha
  const normalizeText = (text: string) => {
    return text
      .replace(/\t/g, "    ") // converte tab em 4 espaços
      .replace(/\u00a0/g, " ") // converte &nbsp; em espaço comum
      .replace(/ {2,}/g, (m) => "\u00A0".repeat(m.length)) // preserva múltiplos espaços
      .replace(/\n+/g, "\n"); // preserva quebras
  };

  // Detecta se um parágrafo tem indentação explícita (ex: via style ou espaços no início)
  const detectIndent = (el: HTMLElement): boolean => {
    const inlineStyle = el.getAttribute("style") || "";
    const hasTextIndent = /text-indent\s*:\s*\d/.test(inlineStyle);
    const startsIndented = /^\s{3,}/.test(el.textContent || "");
    return hasTextIndent || startsIndented;
  };

  // ======================================================
  // 🔹 Função recursiva principal
  // ======================================================
  const renderNode = (node: ChildNode, key: number): React.ReactNode => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = normalizeText(node.textContent ?? "");
      if (!text.trim()) return null;
      return <Text key={key}>{text}</Text>;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      const tag = el.tagName.toLowerCase();
      const children = Array.from(el.childNodes)
        .map((child, i) => renderNode(child, i))
        .filter(Boolean);

      switch (tag) {
        case "strong":
        case "b":
          return (
            <Text key={key} style={styles.bold}>
              {children}
            </Text>
          );
        case "em":
        case "i":
          return (
            <Text key={key} style={styles.italic}>
              {children}
            </Text>
          );
        case "h6":
        case "p": {
          const isIndented = detectIndent(el);
          const paragraphStyle = isIndented
            ? styles.indented
            : styles.paragraph;

          //   ✅ Opção com recuo visual invisível (mais simples)

          return (
            <Text key={key} style={paragraphStyle}>
              <Text style={{ color: "transparent" }}>
                {"\u00A0".repeat(8)} {/* controla o recuo da primeira linha */}
              </Text>
              {children}
            </Text>
          );
        }
        case "blockquote":
          return (
            <Text key={key} style={styles.blockquote}>
              “{children}”
            </Text>
          );
        case "ul":
        case "ol":
          return (
            <View key={key} style={{ marginBottom: 6 }}>
              {Array.from(el.children).map((li, i) => (
                <View key={i} style={styles.listItem}>
                  <Text style={styles.bullet}>
                    {tag === "ul" ? "• " : `${i + 1}. `}
                  </Text>
                  <Text>{normalizeText(li.textContent || "")}</Text>
                </View>
              ))}
            </View>
          );
        // case "h6":
        //   return (
        //     <Text key={key} style={styles.h6}>
        //       {children}
        //     </Text>
        //   );
        case "h5":
          return (
            <Text key={key} style={styles.h5}>
              {children}
            </Text>
          );
        case "h4":
          return (
            <Text key={key} style={styles.h4}>
              {children}
            </Text>
          );
        case "div":
        case "section":
        case "article":
          return (
            <View key={key} style={{ marginBottom: 8 }}>
              {children}
            </View>
          );
        case "br":
          return <Text key={key}>{"\n"}</Text>;
        default:
          return <Text key={key}>{children}</Text>;
      }
    }

    return null;
  };

  // ======================================================
  // 🔹 Renderização do HTML parseado
  // ======================================================
  const parsedContent = Array.from(tempDiv.childNodes).map((node, i) =>
    renderNode(node, i)
  );

  // ======================================================
  // 🔹 Documento final
  // ======================================================
  const MyDocument = (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text
          style={{
            fontSize: 14,
            textAlign: "center",
            fontFamily: "Times-Bold",
            marginBottom: 10,
          }}
        >
          {titulo}
        </Text>
        <View>{parsedContent}</View>
        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `Página ${pageNumber} de ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );

  const blob = await pdf(MyDocument).toBlob();
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
}
