import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

// const customStyle = {
//   lineHeight: "1.5",
//   fontSize: "1rem",
//   borderRadius: "5px",
//   backgroundColor: "#f7f7f7",
//   padding: "20px",
// };
interface HighlighterProps {
  language: string;
  theme: {
    [key: string]: React.CSSProperties;
  };
  children: string | string[];
}
export const HighlighterCustomizado = ({
  language,
  theme,
  children,
}: HighlighterProps) => {
  return (
    <SyntaxHighlighter language={language} style={theme}>
      {children}
    </SyntaxHighlighter>
  );
};
