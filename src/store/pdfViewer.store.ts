import { create } from "zustand";

interface PdfViewerState {
  isOpen: boolean;
  documentId: string | null;
  searchText: string | null;
  citationTitle: string | null;

  open: (documentId: string, searchText: string | null, citationTitle: string | null) => void;
  close: () => void;
}

export const usePdfViewerStore = create<PdfViewerState>()((set) => ({
  isOpen: false,
  documentId: null,
  searchText: null,
  citationTitle: null,

  open: (documentId, searchText, citationTitle) =>
    set({ isOpen: true, documentId, searchText, citationTitle }),

  close: () =>
    set({ isOpen: false, documentId: null, searchText: null, citationTitle: null }),
}));
