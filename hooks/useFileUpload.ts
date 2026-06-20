"use client";

import { useCallback, useState } from "react";
import { uploadFileWithProgress } from "@/lib/upload-client";

export type UploadProgressState = {
  progress: number;
  fileName: string;
};

export function useFileUpload() {
  const [uploads, setUploads] = useState<Record<string, UploadProgressState>>({});

  const upload = useCallback(async (key: string, file: File): Promise<string> => {
    setUploads((prev) => ({
      ...prev,
      [key]: { progress: 0, fileName: file.name },
    }));

    try {
      const url = await uploadFileWithProgress(file, (percent) => {
        setUploads((prev) => ({
          ...prev,
          [key]: { progress: percent, fileName: file.name },
        }));
      });
      setUploads((prev) => ({
        ...prev,
        [key]: { progress: 100, fileName: file.name },
      }));
      return url;
    } finally {
      await new Promise((resolve) => setTimeout(resolve, 350));
      setUploads((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }, []);

  const getUpload = useCallback(
    (key: string): UploadProgressState | null => uploads[key] ?? null,
    [uploads]
  );

  const isUploading = useCallback((key: string) => key in uploads, [uploads]);

  const isAnyUploading = Object.keys(uploads).length > 0;

  return { upload, getUpload, isUploading, isAnyUploading };
}
