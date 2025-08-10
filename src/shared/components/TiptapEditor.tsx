/**
 * File: TiptapEditor.tsx
 * Criação:  10/08/2025
 * Alterações: 10/08/2025
 * Componente genérico para editores rich text
 */

import { useEffect, useMemo } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import {
  Box,
  Stack,
  Tooltip,
  IconButton,
  useTheme,
  Paper,
  Typography,
} from "@mui/material";
import {
  FormatBold,
  FormatItalic,
  FormatListBulleted,
  FormatListNumbered,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignJustify,
  Undo,
  Redo,
} from "@mui/icons-material";

type TiptapEditorProps = {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  label?: string;
  height?: number | string;
};

// Escapa caracteres HTML básicos
function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Converte texto simples em HTML com <p> para cada parágrafo
function textToHtml(text: string): string {
  if (!text) return "<p></p>";
  return text
    .split(/\n+/)
    .map((p) => `<p>${escapeHtml(p)}</p>`)
    .join("");
}

export function TiptapEditor({
  value,
  onChange,
  disabled = false,
  label,
  height = "100%",
}: TiptapEditorProps) {
  const theme = useTheme();

  const extensions = useMemo(
    () => [
      StarterKit.configure({
        // Mantém comportamento básico (parágrafos, history etc.)
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    []
  );

  const editor = useEditor({
    extensions,
    content: textToHtml(value),
    editable: !disabled,
    editorProps: {
      attributes: {
        // permite seleção completa e acessibilidade
        "aria-label": label ?? "editor",
        style: "outline: none;",
      },
    },
    onUpdate: ({ editor }) => {
      // Armazena como TEXTO SIMPLES (sem HTML), preservando compat com backend
      onChange(editor.getText());
    },
  });

  // Sincroniza quando value (externo) mudar
  useEffect(() => {
    if (!editor) return;
    const current = editor.getText();
    if (current !== value) {
      //editor.commands.setContent(textToHtml(value), false);
      // Apenas evita disparar onUpdate
      //editor.commands.setContent(textToHtml(value), { emitUpdate: false });
      editor.commands.setContent(textToHtml(value), {
        emitUpdate: false,
        parseOptions: { preserveWhitespace: "full" as const },
      });
    }
  }, [value, editor]);

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [disabled, editor]);

  if (!editor) return null;

  return (
    <Paper
      variant="outlined"
      sx={{
        display: "flex",
        flexDirection: "column",
        height,
        overflow: "hidden",
      }}
    >
      {/* Toolbar */}
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{
          p: 1,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        {label && (
          <Typography variant="subtitle2" sx={{ mr: 1 }}>
            {label}
          </Typography>
        )}

        <Tooltip title="Negrito">
          <span>
            <IconButton
              size="small"
              disabled={disabled}
              onClick={() => editor.chain().focus().toggleBold().run()}
              color={editor.isActive("bold") ? "primary" : "default"}
            >
              <FormatBold fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Itálico">
          <span>
            <IconButton
              size="small"
              disabled={disabled}
              onClick={() => editor.chain().focus().toggleItalic().run()}
              color={editor.isActive("italic") ? "primary" : "default"}
            >
              <FormatItalic fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Lista com marcadores">
          <span>
            <IconButton
              size="small"
              disabled={disabled}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              color={editor.isActive("bulletList") ? "primary" : "default"}
            >
              <FormatListBulleted fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Lista numerada">
          <span>
            <IconButton
              size="small"
              disabled={disabled}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              color={editor.isActive("orderedList") ? "primary" : "default"}
            >
              <FormatListNumbered fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>

        <Box flex={1} />

        <Tooltip title="Alinhar à esquerda">
          <span>
            <IconButton
              size="small"
              disabled={disabled}
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              color={
                editor.isActive({ textAlign: "left" }) ? "primary" : "default"
              }
            >
              <FormatAlignLeft fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Centralizar">
          <span>
            <IconButton
              size="small"
              disabled={disabled}
              onClick={() =>
                editor.chain().focus().setTextAlign("center").run()
              }
              color={
                editor.isActive({ textAlign: "center" }) ? "primary" : "default"
              }
            >
              <FormatAlignCenter fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Justificar">
          <span>
            <IconButton
              size="small"
              disabled={disabled}
              onClick={() =>
                editor.chain().focus().setTextAlign("justify").run()
              }
              color={
                editor.isActive({ textAlign: "justify" })
                  ? "primary"
                  : "default"
              }
            >
              <FormatAlignJustify fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Desfazer">
          <span>
            <IconButton
              size="small"
              disabled={disabled || !editor.can().undo()}
              onClick={() => editor.chain().focus().undo().run()}
            >
              <Undo fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Refazer">
          <span>
            <IconButton
              size="small"
              disabled={disabled || !editor.can().redo()}
              onClick={() => editor.chain().focus().redo().run()}
            >
              <Redo fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>

      {/* Área de edição */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: "auto",
          p: 2,
          "& .ProseMirror": {
            outline: "none",
            // aparência do texto enquanto digita:
            whiteSpace: "pre-wrap",
            textAlign: "justify",
            lineHeight: 1.6,
            wordBreak: "break-word",
            // Recuo na 1ª linha de CADA parágrafo:
            "& p": {
              textIndent: "2em",
              margin: 0,
            },
            // Espaço entre parágrafos subsequentes:
            "& p + p": {
              marginTop: "0.75em",
            },
            // Garantir seleção adequada em MUI
            "& *::selection": {
              background:
                theme.palette.mode === "dark" ? "#ffffff33" : "#00000022",
            },
          },
        }}
      >
        <EditorContent editor={editor} />
      </Box>
    </Paper>
  );
}
