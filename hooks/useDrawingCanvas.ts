"use client";

import { useCallback, useState } from "react";
import type { DrawPath, Tool } from "@/lib/tryout/types";

export function useDrawingCanvas() {
  const [tool, setTool] = useState<Tool>("rectangle");
  const [brushSize, setBrushSize] = useState(28);
  const [paths, setPaths] = useState<DrawPath[]>([]);
  const [redoStack, setRedoStack] = useState<DrawPath[]>([]);

  const push = useCallback((path: DrawPath) => {
    setPaths((prev) => [...prev, path]);
    setRedoStack([]);
  }, []);

  const undo = useCallback(() => {
    setPaths((prev) => {
      if (!prev.length) return prev;
      const next = prev.slice(0, -1);
      setRedoStack((r) => [...r, prev[prev.length - 1]]);
      return next;
    });
  }, []);

  const redo = useCallback(() => {
    setRedoStack((prev) => {
      if (!prev.length) return prev;
      const path = prev[prev.length - 1];
      setPaths((p) => [...p, path]);
      return prev.slice(0, -1);
    });
  }, []);

  const replaceLast = useCallback((path: DrawPath) => {
    setPaths((prev) => (prev.length ? [...prev.slice(0, -1), path] : [path]));
  }, []);

  const setMark = useCallback((path: DrawPath | null) => {
    setPaths(path ? [path] : []);
    setRedoStack([]);
  }, []);

  const clear = useCallback(() => {
    setPaths([]);
    setRedoStack([]);
  }, []);

  return { tool, setTool, brushSize, setBrushSize, paths, push, replaceLast, setMark, undo, redo, clear, canUndo: paths.length > 0, canRedo: redoStack.length > 0 };
}
