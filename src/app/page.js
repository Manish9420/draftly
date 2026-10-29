"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

/* ------------------------------------------------------------------ */
/* Starter content                                                     */
/* ------------------------------------------------------------------ */

const initialDocs = [
  {
    id: "welcome",
    title: "Welcome to Draftly",
    updatedAt: Date.now(),
    content:
      "<h1>Your thoughts, beautifully organized.</h1><p>Welcome to Draftly — your cozy space to think, write, and create.</p><h2>Make yourself at home ✨</h2><p>Use this document to explore your workspace.</p><ul><li>Write your ideas freely</li><li>Organize thoughts with headings and lists</li><li>Share your work with others</li></ul><blockquote><p>Every great idea starts with a first draft.</p></blockquote>",
  },
  {
    id: "project",
    title: "Project brainstorm",
    updatedAt: Date.now() - 3600000,
    content:
      "<h1>Project brainstorm</h1><p>Collect your next big ideas here...</p>",
  },
  {
    id: "meeting",
    title: "Meeting notes",
    updatedAt: Date.now() - 86400000,
    content:
      "<h1>Meeting notes</h1><p><strong>Date:</strong> Today</p><h2>Discussion</h2><p>Add your notes here.</p><h2>Action items</h2><ul><li>Follow up with the team</li></ul>",
  },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function normalizeDoc(doc) {
  return {
    ...doc,
    content:
      typeof doc.content === "string" ? doc.content : "<p>Start writing...</p>",
    updatedAt: new Date(doc.updatedAt).getTime(),
  };
}

async function persistNewDocument({ title, content }) {
  const response = await fetch("/api/documents", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, content }),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || "Could not create document.");
  }
  return normalizeDoc(result.document);
}

function formatRelative(timestamp) {
  const diff = Date.now() - timestamp;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  if (diff < minute) return "Just now";
  if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
  if (diff < 24 * hour) return `${Math.floor(diff / hour)}h ago`;
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

const DOC_TINTS = [
  "bg-brand-light text-brand-dark",
  "bg-emerald-50 text-emerald-600",
  "bg-sky-50 text-sky-600",
];
const DOC_ICONS = ["file", "pencil", "list"];
const AVATAR_TINTS = [
  "bg-sky-100 text-sky-700",
  "bg-emerald-100 text-emerald-700",
  "bg-rose-100 text-rose-700",
  "bg-amber-100 text-amber-700",
];

/* ------------------------------------------------------------------ */
/* Icons (inline SVG, no extra dependency)                             */
/* ------------------------------------------------------------------ */

const ICONS = {
  plus: <path d="M12 5v14M5 12h14" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
  share: (
    <>
      <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" />
      <path d="m16 6-4-4-4 4" />
      <path d="M12 2v13" />
    </>
  ),
  file: (
    <>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6M9 17h4" />
    </>
  ),
  download: (
    <>
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
    </>
  ),
  upload: (
    <>
      <path d="M12 15V3" />
      <path d="m7 8 5-5 5 5" />
      <path d="M5 21h14" />
    </>
  ),
  trash: (
    <>
      <path d="M3 6h18" />
      <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
      <path d="m19 6-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
    </>
  ),
  pencil: (
    <>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  bold: <path d="M7 5h6a3.5 3.5 0 0 1 0 7H7zM7 12h7a3.5 3.5 0 0 1 0 7H7z" />,
  italic: <path d="M19 4h-9M14 20H5M15 4 9 20" />,
  underline: (
    <>
      <path d="M6 4v7a6 6 0 0 0 12 0V4" />
      <path d="M4 21h16" />
    </>
  ),
  strike: (
    <>
      <path d="M16 4H9a3 3 0 0 0-2.8 4" />
      <path d="M14 12a4 4 0 0 1 0 8H6" />
      <path d="M4 12h16" />
    </>
  ),
  list: (
    <>
      <path d="M9 6h11M9 12h11M9 18h11" />
      <path d="M4 6h.01M4 12h.01M4 18h.01" />
    </>
  ),
  listOrdered: (
    <>
      <path d="M10 6h11M10 12h11M10 18h11" />
      <path d="M4 6h1v4M4 10h2" />
      <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
    </>
  ),
  quote: <path d="M9 7H5v6h4a3 3 0 0 1-3 4M19 7h-4v6h4a3 3 0 0 1-3 4" />,
  undo: (
    <>
      <path d="M9 14 4 9l5-5" />
      <path d="M4 9h10a6 6 0 0 1 0 12h-3" />
    </>
  ),
  redo: (
    <>
      <path d="m15 14 5-5-5-5" />
      <path d="M20 9H10a6 6 0 0 0 0 12h3" />
    </>
  ),
  sparkle: (
    <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 17l.7 1.8 1.8.7-1.8.7L19 22l-.7-1.8-1.8-.7 1.8-.7z" />
  ),
  chevron: <path d="m6 9 6 6 6-6" />,
  check: <path d="m5 12 5 5 9-9" />,
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8h.01M11 12h1v5h1" />
    </>
  ),
  dots: (
    <>
      <circle cx="5" cy="12" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </>
  ),
};

function Icon({ name, className = "size-4" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      {ICONS[name]}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Small UI pieces                                                     */
/* ------------------------------------------------------------------ */

function ToolButton({ icon, label, active, disabled, onClick }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      // keep focus inside the editor while clicking formatting buttons
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`grid size-8 place-items-center rounded-lg transition ${
        active
          ? "bg-brand text-white shadow-sm shadow-brand/40"
          : "text-ink-soft hover:bg-brand-light hover:text-brand-dark"
      } disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink-soft`}
    >
      <Icon name={icon} />
    </button>
  );
}

function IconButton({ icon, label, onClick, danger = false }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`grid size-9 place-items-center rounded-xl border border-transparent text-muted transition ${
        danger
          ? "hover:border-rose-100 hover:bg-rose-50 hover:text-rose-600"
          : "hover:border-brand-soft hover:bg-brand-light hover:text-brand-dark"
      }`}
    >
      <Icon name={icon} />
    </button>
  );
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-line" />;
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Home() {
  const [docs, setDocs] = useState(initialDocs);
  const [selectedId, setSelectedId] = useState(null);
  const [creatingDocument, setCreatingDocument] = useState(false);
  const [query, setQuery] = useState("");
  const [shareOpen, setShareOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [shareRole, setShareRole] = useState("VIEWER");
  const [shares, setShares] = useState({});
  const [mobileMenu, setMobileMenu] = useState(false);
  const [saved, setSaved] = useState(true);
  const [importMessage, setImportMessage] = useState("");
  const [dbReady, setDbReady] = useState(false);
  const fileInput = useRef(null);
  const searchInput = useRef(null);
  const titleInput = useRef(null);
  const selectedIdRef = useRef(selectedId);

  const selectedDoc = docs.find((doc) => doc.id === selectedId) || docs[0];

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  /* ---------- Load documents ---------- */
  useEffect(() => {
    let active = true;

    async function loadDocuments() {
      try {
        const response = await fetch("/api/documents");
        if (!response.ok) throw new Error("Could not load documents.");

        const result = await response.json();
        let documents = result.documents;

        // Create starter documents if the database is empty.
        if (documents.length === 0) {
          documents = await Promise.all(
            initialDocs.map(async (doc) => {
              const created = await fetch("/api/documents", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: doc.title, content: doc.content }),
              });
              if (!created.ok) {
                throw new Error("Could not create starter documents.");
              }
              return (await created.json()).document;
            })
          );
        }

        if (active) {
          setDocs(documents.map(normalizeDoc));
          setSelectedId(documents[0]?.id ?? null);
          setDbReady(true);
        }
      } catch (error) {
        console.error("Document loading failed:", error);
        if (active) {
          setImportMessage("Could not connect to the database. Refresh to retry.");
        }
      }
    }

    loadDocuments();
    return () => {
      active = false;
    };
  }, []);

  /* ---------- Autosave ---------- */
  useEffect(() => {
    if (!dbReady || !selectedId) return;
    if (selectedId.startsWith("temp-")) return;

    const doc = docs.find((item) => item.id === selectedId);
    if (!doc) return;

    const timer = setTimeout(async () => {
      try {
        setSaved(false);

        const response = await fetch(`/api/documents/${doc.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: doc.title, content: doc.content }),
        });

        if (!response.ok) throw new Error(`Save failed: ${response.status}`);
        setSaved(true);
      } catch (error) {
        console.error("Document save failed:", error);
        setSaved(false);
        setImportMessage("Could not save changes. Please try again.");
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [docs, selectedId, dbReady]);

  /* ---------- Local demo sharing (kept as-is) ---------- */
  useEffect(() => {
    try {
      const storedShares = localStorage.getItem("draftly-shares");
      if (storedShares) setShares(JSON.parse(storedShares));
    } catch {
      // Ignore invalid local browser data.
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("draftly-shares", JSON.stringify(shares));
    } catch {
      // Browser storage may be unavailable or full.
    }
  }, [shares]);

  /* ---------- Toast auto-dismiss ---------- */
  useEffect(() => {
    if (!importMessage) return;
    const timer = setTimeout(() => setImportMessage(""), 5000);
    return () => clearTimeout(timer);
  }, [importMessage]);

  /* ---------- Keyboard shortcuts ---------- */
  useEffect(() => {
    function onKey(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setMobileMenu(true);
        searchInput.current?.focus();
      }
      if (event.key === "Escape") setShareOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* ---------- Editor ---------- */
  const updateContent = useCallback((content) => {
    setSaved(false);
    setDocs((current) =>
      current.map((doc) =>
        doc.id === selectedIdRef.current
          ? { ...doc, content, updatedAt: Date.now() }
          : doc
      )
    );
  }, []);

  const editor = useEditor({
    extensions: [StarterKit],
    content: selectedDoc?.content || "",
    immediatelyRender: false,
    // keeps toolbar active-states in sync with the cursor
    shouldRerenderOnTransaction: true,
    onUpdate: ({ editor: currentEditor }) => {
      updateContent(currentEditor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "editor-content",
        "aria-label": "Document editor",
      },
    },
  });

  useEffect(() => {
    if (!editor || !selectedDoc) return;
    editor.commands.setContent(selectedDoc.content || "", { emitUpdate: false });
    setSaved(true);
  }, [editor, selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---------- Actions ---------- */
  async function createDocument() {
    setCreatingDocument(true);

    const tempId = `temp-${Date.now()}`;
    const optimisticDoc = {
      id: tempId,
      title: "Untitled document",
      content: "<h1>Untitled document</h1><p>Start writing your thoughts...</p>",
      updatedAt: Date.now(),
    };

    // Show the document immediately.
    setDocs((current) => [optimisticDoc, ...current]);
    setSelectedId(tempId);
    setMobileMenu(false);
    setSaved(false);
    setImportMessage("");

    try {
      const newDoc = await persistNewDocument({
        title: optimisticDoc.title,
        content: optimisticDoc.content,
      });

      // Replace the temporary document with the database document.
      setDocs((current) =>
        current.map((doc) => (doc.id === tempId ? newDoc : doc))
      );
      setSelectedId((current) => (current === tempId ? newDoc.id : current));
      setSaved(true);
    } catch (error) {
      console.error("Document creation failed:", error);
      setDocs((current) => current.filter((doc) => doc.id !== tempId));
      setSelectedId((current) => (current === tempId ? null : current));
      setImportMessage("Could not create document. Please try again.");
    } finally {
      setCreatingDocument(false);
    }
  }

  function focusTitle() {
    titleInput.current?.focus();
    titleInput.current?.select();
  }

  async function deleteDocument(value = selectedId) {
    const id =
      typeof value === "string"
        ? value
        : typeof value?.id === "string"
          ? value.id
          : selectedId;

    if (!id || typeof id !== "string" || id.startsWith("temp-")) {
      setImportMessage("Please select a saved document.");
      return;
    }

    const docToDelete = docs.find((doc) => doc.id === id);
    if (!docToDelete) {
      setImportMessage("Document not found.");
      return;
    }

    if (!window.confirm(`Delete "${docToDelete.title}"?`)) return;

    try {
      const response = await fetch(`/api/documents/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not delete document.");
      }

      const remainingDocs = docs.filter((doc) => doc.id !== id);
      setDocs(remainingDocs);
      setSelectedId((current) =>
        current === id ? (remainingDocs[0]?.id ?? null) : current
      );
      setImportMessage("Document deleted successfully.");
    } catch (error) {
      console.error("Delete failed:", error);
      setImportMessage(error.message || "Could not delete document.");
    }
  }

  function importFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      setImportMessage("Please choose a file smaller than 1 MB.");
      event.target.value = "";
      return;
    }

    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!["txt", "md"].includes(extension)) {
      setImportMessage("For now, import a .txt or .md file.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const text = String(reader.result || "");
      const escaped = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      const html = escaped
        .split(/\r?\n/)
        .map((line) => (line.trim() ? `<p>${line}</p>` : "<p></p>"))
        .join("");

      try {
        // Save to the database so autosave works for imported files too.
        const doc = await persistNewDocument({
          title: file.name.replace(/\.(txt|md)$/i, "") || "Imported document",
          content: html,
        });
        setDocs((current) => [doc, ...current]);
        setSelectedId(doc.id);
        setImportMessage(`Imported ${file.name}`);
      } catch (error) {
        console.error("Import failed:", error);
        setImportMessage(error.message || "Could not import this file.");
      }
    };
    reader.onerror = () => setImportMessage("Could not read this file.");
    reader.readAsText(file);
    event.target.value = "";
  }

  async function shareDocument(event) {
    event.preventDefault();

    if (!selectedId || selectedId.startsWith("temp-")) {
      setImportMessage("Save the document before sharing.");
      return;
    }

    const email = shareEmail.trim().toLowerCase();

    try {
      const response = await fetch(`/api/documents/${selectedId}/shares`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role: shareRole }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not share document.");
      }

      setShares((current) => ({
        ...current,
        [selectedId]: [
          ...(current[selectedId] || []).filter((item) => item.email !== email),
          { email: result.share.user.email, role: result.share.role },
        ],
      }));

      setShareEmail("");
      setImportMessage("Collaborator saved successfully.");
      setShareOpen(false);
    } catch (error) {
      console.error("Sharing failed:", error);
      setImportMessage(error.message || "Could not share document.");
    }
  }

  function exportDocument() {
    if (!selectedDoc) return;
    const html = editor?.getHTML() || selectedDoc.content;
    const plain = html
      .replace(/<\/(p|h1|h2|h3|li|blockquote)>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">");
    const blob = new Blob([plain], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedDoc.title || "document"}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  /* ---------- Derived values ---------- */
  const activeId = selectedDoc?.id;
  const filteredDocs = docs.filter((doc) =>
    doc.title.toLowerCase().includes(query.toLowerCase())
  );
  const activeShares = shares[selectedId] || [];
  const wordCount = (editor?.getText() || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  const readingMinutes = Math.max(1, Math.round(wordCount / 200));
  const hasUnderline = typeof editor?.commands?.toggleUnderline === "function";

  const blockType = editor?.isActive("heading", { level: 1 })
    ? "h1"
    : editor?.isActive("heading", { level: 2 })
      ? "h2"
      : editor?.isActive("heading", { level: 3 })
        ? "h3"
        : "p";

  const toastIsError = /could not|please|save the document|for now|not found/i.test(
    importMessage
  );

  function setBlockType(value) {
    if (!editor) return;
    const chain = editor.chain().focus();
    if (value === "p") chain.setParagraph().run();
    else chain.setHeading({ level: Number(value.slice(1)) }).run();
  }

  /* ---------- Render ---------- */
  return (
    <main className="flex h-dvh overflow-hidden bg-canvas text-ink">
      {/* ================= Sidebar ================= */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-line bg-white p-4 transition-transform duration-300 md:static md:translate-x-0 ${
          mobileMenu ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-1">
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="flex items-center gap-2.5 font-display text-2xl font-extrabold tracking-tight"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-brand-gradient text-white shadow-lg shadow-brand/30">
              <Icon name="sparkle" className="size-5" />
            </span>
            <span>
              draftly<span className="text-brand">.</span>
            </span>
          </a>
          <button
            className="grid size-8 place-items-center rounded-lg text-muted hover:bg-canvas md:hidden"
            onClick={() => setMobileMenu(false)}
            aria-label="Close menu"
          >
            <Icon name="x" />
          </button>
        </div>

        <button
          type="button"
          className="mt-6 flex items-center gap-3 rounded-xl border border-line bg-white p-2.5 text-left transition hover:border-brand-ring hover:shadow-md hover:shadow-brand/10"
        >
          <span className="grid size-9 place-items-center rounded-lg bg-brand-light font-bold text-brand-dark">
            M
          </span>
          <span className="flex-1 leading-tight">
            <span className="block text-[13px] font-bold">My workspace</span>
            <span className="text-xs text-muted">Personal space</span>
          </span>
          <Icon name="chevron" className="size-4 text-muted" />
        </button>

        <button
          type="button"
          onClick={createDocument}
          disabled={creatingDocument}
          className="mt-3 flex items-center gap-2.5 rounded-xl bg-brand-gradient px-3.5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0 disabled:opacity-60"
        >
          <Icon name="plus" className="size-[18px]" />
          New document
        </button>

        <label className="mt-5 flex h-10 items-center gap-2 rounded-xl border border-line bg-canvas/60 px-3 text-muted transition focus-within:border-brand-ring focus-within:bg-white focus-within:ring-4 focus-within:ring-brand/10">
          <Icon name="search" />
          <input
            ref={searchInput}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documents"
            aria-label="Search documents"
            className="min-w-0 flex-1 bg-transparent text-[13px] text-ink outline-none placeholder:text-muted"
          />
          <kbd className="rounded-md border border-line bg-white px-1.5 py-0.5 text-[10px] font-semibold text-muted">
            ⌘K
          </kbd>
        </label>

        <div className="mt-5 flex items-center justify-between px-1 text-xs font-semibold text-muted">
          <span>Documents</span>
          <span className="rounded-md bg-brand-light px-1.5 py-0.5 text-brand-dark">
            {docs.length}
          </span>
        </div>

        <div className="-mx-1 mt-2 flex-1 space-y-1 overflow-y-auto px-1">
          {!dbReady && !importMessage
            ? [0, 1, 2].map((n) => (
                <div key={n} className="flex animate-pulse items-center gap-3 p-2.5">
                  <span className="size-9 rounded-lg bg-canvas" />
                  <span className="flex-1 space-y-2">
                    <span className="block h-3 w-3/4 rounded bg-canvas" />
                    <span className="block h-2.5 w-1/3 rounded bg-canvas" />
                  </span>
                </div>
              ))
            : filteredDocs.map((doc, index) => {
                const active = doc.id === activeId;
                return (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(doc.id);
                      setMobileMenu(false);
                    }}
                    className={`relative flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition ${
                      active ? "bg-brand-light" : "hover:bg-canvas"
                    }`}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand" />
                    )}
                    <span
                      className={`grid size-9 shrink-0 place-items-center rounded-lg ${DOC_TINTS[index % 3]}`}
                    >
                      <Icon name={DOC_ICONS[index % 3]} />
                    </span>
                    <span className="min-w-0 flex-1 leading-tight">
                      <span className="block truncate text-[13px] font-semibold">
                        {doc.title || "Untitled document"}
                      </span>
                      <span className="mt-1 block text-xs text-muted">
                        {formatRelative(doc.updatedAt)}
                      </span>
                    </span>
                  </button>
                );
              })}
          {dbReady && filteredDocs.length === 0 && (
            <p className="px-2 py-6 text-center text-[13px] text-muted">
              {query ? `No documents match “${query}”.` : "No documents yet."}
            </p>
          )}
        </div>

        <div className="mt-3 flex items-center gap-3 border-t border-line px-1 pt-4">
          <span className="grid size-9 place-items-center rounded-full bg-brand-soft font-bold text-brand-deep">
            M
          </span>
          <span className="flex-1 leading-tight">
            <span className="block text-[13px] font-bold">Manish</span>
            <span className="text-xs text-muted">Free workspace</span>
          </span>
          <button
            type="button"
            className="grid size-8 place-items-center rounded-lg text-muted transition hover:bg-brand-light hover:text-brand-dark"
            aria-label="Account menu"
          >
            <Icon name="dots" />
          </button>
        </div>
      </aside>

      {mobileMenu && (
        <button
          className="fixed inset-0 z-30 bg-ink/40 backdrop-blur-sm md:hidden"
          aria-label="Close menu"
          onClick={() => setMobileMenu(false)}
        />
      )}

      {/* ================= Main ================= */}
      <section className="relative flex min-w-0 flex-1 flex-col">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(60%_100%_at_75%_0%,#ff7a1a1c,transparent)]"
        />

        <header className="relative z-10 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-line bg-white/80 px-4 backdrop-blur-md sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="grid size-9 place-items-center rounded-lg text-ink-soft hover:bg-canvas md:hidden"
              onClick={() => setMobileMenu(true)}
              aria-label="Open menu"
            >
              <Icon name="menu" className="size-5" />
            </button>
            <nav className="flex min-w-0 items-center gap-2 text-[13px]">
              <span className="hidden text-muted sm:inline">My workspace</span>
              <span className="hidden text-line sm:inline">/</span>
              <span className="truncate font-semibold">
                {selectedDoc?.title || "No document selected"}
              </span>
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <span
              className={`hidden items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium sm:inline-flex ${
                saved
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-amber-200 bg-amber-50 text-amber-700"
              }`}
              role="status"
            >
              <span
                className={`size-1.5 rounded-full ${
                  saved ? "bg-emerald-500" : "animate-pulse bg-amber-500"
                }`}
              />
              {saved ? "All changes saved" : "Saving…"}
            </span>

            <div className="hidden -space-x-2 sm:flex">
              <span
                title="You"
                className="grid size-8 place-items-center rounded-full border-2 border-white bg-brand-soft text-xs font-bold text-brand-deep"
              >
                M
              </span>
              {activeShares.slice(0, 3).map((share, i) => (
                <span
                  key={share.email}
                  title={share.email}
                  className={`grid size-8 place-items-center rounded-full border-2 border-white text-xs font-bold ${AVATAR_TINTS[i % 4]}`}
                >
                  {share.email[0].toUpperCase()}
                </span>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShareOpen(true)}
              disabled={!selectedDoc}
              className="flex items-center gap-2 rounded-xl bg-brand-gradient px-4 py-2.5 text-[13px] font-semibold text-white shadow-lg shadow-brand/30 transition hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0 disabled:opacity-50"
            >
              <Icon name="share" />
              Share
            </button>
          </div>
        </header>

        <div className="relative flex-1 overflow-y-auto px-4 pb-28 pt-8 sm:px-8">
          {!selectedDoc ? (
            <div className="mx-auto mt-24 flex max-w-sm animate-rise flex-col items-center text-center">
              <span className="grid size-16 place-items-center rounded-2xl bg-brand-light text-brand">
                <Icon name="file" className="size-8" />
              </span>
              <h2 className="mt-5 font-display text-2xl font-extrabold tracking-tight">
                Nothing here yet
              </h2>
              <p className="mt-2 text-muted">
                Create your first document and start writing. Your work saves
                automatically.
              </p>
              <button
                type="button"
                onClick={createDocument}
                className="mt-6 flex items-center gap-2 rounded-xl bg-brand-gradient px-5 py-3 font-semibold text-white shadow-lg shadow-brand/30 transition hover:-translate-y-0.5"
              >
                <Icon name="plus" /> New document
              </button>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl animate-rise">
              {/* Meta chips */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 shadow-sm ring-1 ring-line">
                  <Icon name="sparkle" className="size-3.5 text-brand" />
                  Your canvas
                </span>
                <span>Edited {formatRelative(selectedDoc.updatedAt)}</span>
                <span className="text-line">•</span>
                <span>
                  {wordCount} {wordCount === 1 ? "word" : "words"}
                </span>
                <span className="text-line">•</span>
                <span>{readingMinutes} min read</span>
              </div>

              {/* Title + actions */}
              <div className="mt-4 flex items-start gap-3">
                <input
                  ref={titleInput}
                  className="min-w-0 flex-1 bg-transparent font-display text-3xl font-extrabold tracking-tight outline-none placeholder:text-ink/20 sm:text-5xl sm:leading-[1.15]"
                  aria-label="Document title"
                  value={selectedDoc.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    setDocs((current) =>
                      current.map((doc) =>
                        doc.id === selectedId
                          ? { ...doc, title, updatedAt: Date.now() }
                          : doc
                      )
                    );
                  }}
                  onBlur={() => {
                    setDocs((current) =>
                      current.map((doc) =>
                        doc.id === selectedId && !doc.title.trim()
                          ? { ...doc, title: "Untitled document" }
                          : doc
                      )
                    );
                  }}
                  placeholder="Untitled document"
                />
                <div className="flex shrink-0 items-center gap-1 pt-1 sm:pt-3">
                  <IconButton icon="pencil" label="Rename document" onClick={focusTitle} />
                  <IconButton icon="download" label="Export as text" onClick={exportDocument} />
                  <IconButton
                    icon="trash"
                    label="Delete document"
                    danger
                    onClick={() => deleteDocument()}
                  />
                </div>
              </div>

              {/* Editor card */}
              <div className="mt-6 rounded-2xl border border-line bg-white shadow-[0_1px_2px_#2b24200a,0_20px_50px_-24px_#2b242040] transition focus-within:border-brand-ring focus-within:shadow-[0_1px_2px_#2b24200a,0_24px_60px_-24px_#ff7a1a66]">
                <div className="sticky top-2 z-10 mx-2 mt-2 flex flex-wrap items-center gap-0.5 rounded-xl border border-line bg-white/85 px-2 py-1.5 backdrop-blur-md">
                  <div className="relative">
                    <select
                      value={blockType}
                      onChange={(e) => setBlockType(e.target.value)}
                      aria-label="Text style"
                      className="h-8 cursor-pointer appearance-none rounded-lg bg-transparent py-0 pl-2.5 pr-7 text-xs font-semibold text-ink-soft outline-none transition hover:bg-brand-light hover:text-brand-dark"
                    >
                      <option value="p">Paragraph</option>
                      <option value="h1">Heading 1</option>
                      <option value="h2">Heading 2</option>
                      <option value="h3">Heading 3</option>
                    </select>
                    <Icon
                      name="chevron"
                      className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-muted"
                    />
                  </div>

                  <Divider />

                  <ToolButton
                    icon="bold"
                    label="Bold"
                    active={editor?.isActive("bold")}
                    onClick={() => editor?.chain().focus().toggleBold().run()}
                  />
                  <ToolButton
                    icon="italic"
                    label="Italic"
                    active={editor?.isActive("italic")}
                    onClick={() => editor?.chain().focus().toggleItalic().run()}
                  />
                  {hasUnderline && (
                    <ToolButton
                      icon="underline"
                      label="Underline"
                      active={editor?.isActive("underline")}
                      onClick={() => editor?.chain().focus().toggleUnderline().run()}
                    />
                  )}
                  <ToolButton
                    icon="strike"
                    label="Strikethrough"
                    active={editor?.isActive("strike")}
                    onClick={() => editor?.chain().focus().toggleStrike().run()}
                  />

                  <Divider />

                  <ToolButton
                    icon="list"
                    label="Bullet list"
                    active={editor?.isActive("bulletList")}
                    onClick={() => editor?.chain().focus().toggleBulletList().run()}
                  />
                  <ToolButton
                    icon="listOrdered"
                    label="Numbered list"
                    active={editor?.isActive("orderedList")}
                    onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                  />
                  <ToolButton
                    icon="quote"
                    label="Quote"
                    active={editor?.isActive("blockquote")}
                    onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                  />

                  <span className="flex-1" />

                  <ToolButton
                    icon="undo"
                    label="Undo"
                    disabled={!editor?.can().undo()}
                    onClick={() => editor?.chain().focus().undo().run()}
                  />
                  <ToolButton
                    icon="redo"
                    label="Redo"
                    disabled={!editor?.can().redo()}
                    onClick={() => editor?.chain().focus().redo().run()}
                  />
                </div>

                <div className="px-6 pb-4 pt-8 sm:px-14 sm:pt-10">
                  {creatingDocument ? (
                    <div className="flex min-h-[380px] flex-col items-center justify-center gap-4">
                      <div className="relative flex size-14 items-center justify-center">
                        <div className="absolute inset-0 animate-spin rounded-full border-4 border-brand-soft border-t-brand" />
                        <div className="size-3 animate-pulse rounded-full bg-brand" />
                      </div>
                      <div className="text-center">
                        <p className="font-semibold">Preparing your document</p>
                        <p className="mt-1 text-sm text-muted">
                          Saving your new document...
                        </p>
                      </div>
                    </div>
                  ) : (
                    <EditorContent editor={editor} />
                  )}

                  <div className="mt-8 flex items-center justify-between border-t border-line pt-4 text-xs text-muted">
                    <span>
                      Made with a little focus <span className="text-brand">♥</span>
                    </span>
                    <span>
                      {wordCount} {wordCount === 1 ? "word" : "words"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Below editor */}
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-stretch">
                <div className="flex flex-1 items-center gap-3 rounded-xl border border-brand-soft bg-linear-to-r from-brand-light to-white p-3.5">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand-dark">
                    <Icon name="sparkle" />
                  </span>
                  <span className="leading-tight">
                    <strong className="block text-[13px] text-brand-deep">
                      A tiny tip
                    </strong>
                    <small className="mt-1 block text-xs text-ink-soft">
                      Try headings to give your thoughts a little structure.
                    </small>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-brand-ring bg-white px-5 py-3.5 text-[13px] font-semibold text-ink-soft transition hover:border-brand hover:bg-brand-light hover:text-brand-dark"
                >
                  <Icon name="upload" />
                  Import a file
                </button>
                <input
                  ref={fileInput}
                  type="file"
                  accept=".txt,.md,text/plain,text/markdown"
                  hidden
                  onChange={importFile}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ================= Toast ================= */}
      {importMessage && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 animate-pop items-center gap-3 rounded-2xl border border-line bg-white py-3 pl-4 pr-3 shadow-2xl shadow-ink/15"
        >
          <span
            className={`grid size-8 shrink-0 place-items-center rounded-full ${
              toastIsError ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
            }`}
          >
            <Icon name={toastIsError ? "info" : "check"} />
          </span>
          <p className="flex-1 text-[13px] font-medium">{importMessage}</p>
          <button
            type="button"
            onClick={() => setImportMessage("")}
            className="grid size-8 place-items-center rounded-lg text-muted hover:bg-canvas"
            aria-label="Dismiss message"
          >
            <Icon name="x" />
          </button>
        </div>
      )}

      {/* ================= Share modal ================= */}
      {shareOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShareOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-title"
            className="relative w-full max-w-md animate-pop overflow-hidden rounded-3xl bg-white p-7 shadow-2xl shadow-ink/30"
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-brand-gradient" />
            <button
              type="button"
              onClick={() => setShareOpen(false)}
              aria-label="Close dialog"
              className="absolute right-4 top-4 grid size-8 place-items-center rounded-lg bg-canvas text-muted transition hover:bg-brand-light hover:text-brand-dark"
            >
              <Icon name="x" />
            </button>

            <span className="grid size-12 place-items-center rounded-2xl bg-brand-light text-brand">
              <Icon name="share" className="size-6" />
            </span>
            <h2
              id="share-title"
              className="mt-4 font-display text-2xl font-extrabold tracking-tight"
            >
              Share your thoughts
            </h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
              Invite someone into this document. You can change their access
              anytime.
            </p>

            <form onSubmit={shareDocument} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="share-email"
                  className="mb-1.5 block text-xs font-bold text-ink-soft"
                >
                  Email address
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-line px-3 transition focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/10">
                  <Icon name="mail" className="size-4 text-muted" />
                  <input
                    id="share-email"
                    type="email"
                    required
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    placeholder="teammate@example.com"
                    className="h-11 min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-muted"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="share-role"
                  className="mb-1.5 block text-xs font-bold text-ink-soft"
                >
                  Permission
                </label>
                <div className="grid grid-cols-2 gap-2" id="share-role" role="radiogroup">
                  {[
                    { value: "VIEWER", label: "Can view", hint: "Read only" },
                    { value: "EDITOR", label: "Can edit", hint: "Make changes" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={shareRole === option.value}
                      onClick={() => setShareRole(option.value)}
                      className={`rounded-xl border p-3 text-left transition ${
                        shareRole === option.value
                          ? "border-brand bg-brand-light ring-4 ring-brand/10"
                          : "border-line hover:border-brand-ring"
                      }`}
                    >
                      <span className="block text-[13px] font-bold">{option.label}</span>
                      <span className="text-xs text-muted">{option.hint}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient py-3 text-[13px] font-bold text-white shadow-lg shadow-brand/30 transition hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0"
              >
                Add collaborator
              </button>
            </form>

            <div className="mt-6 border-t border-line pt-5">
              <div className="mb-2 flex items-center justify-between text-xs font-bold text-muted">
                <span>People with access</span>
                <span className="rounded-md bg-brand-light px-1.5 py-0.5 text-brand-dark">
                  {activeShares.length + 1}
                </span>
              </div>

              <div className="max-h-48 space-y-1 overflow-y-auto">
                <div className="flex items-center gap-3 py-1.5">
                  <span className="grid size-9 place-items-center rounded-full bg-brand-soft text-xs font-bold text-brand-deep">
                    M
                  </span>
                  <span className="flex-1 leading-tight">
                    <strong className="block text-[13px]">Manish (you)</strong>
                    <small className="text-xs text-muted">Owner</small>
                  </span>
                  <span className="rounded-full bg-canvas px-2.5 py-1 text-[11px] font-semibold text-muted">
                    Owner
                  </span>
                </div>

                {activeShares.map((share, i) => (
                  <div key={share.email} className="flex items-center gap-3 py-1.5">
                    <span
                      className={`grid size-9 place-items-center rounded-full text-xs font-bold ${AVATAR_TINTS[i % 4]}`}
                    >
                      {share.email[0].toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1 leading-tight">
                      <strong className="block truncate text-[13px]">{share.email}</strong>
                      <small className="text-xs text-muted">
                        {share.role === "EDITOR" ? "Can edit" : "Can view"}
                      </small>
                    </span>
                    <button
                      type="button"
                      className="rounded-lg px-2 py-1 text-xs font-semibold text-rose-500 transition hover:bg-rose-50"
                      onClick={() =>
                        setShares((current) => ({
                          ...current,
                          [selectedId]: (current[selectedId] || []).filter(
                            (item) => item.email !== share.email
                          ),
                        }))
                      }
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-5 text-center text-xs text-muted">
              Collaborator permissions are saved to the database.
            </p>
          </section>
        </div>
      )}
    </main>
  );
}