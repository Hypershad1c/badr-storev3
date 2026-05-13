"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Upload, X, Loader2, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface ImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
  folder?: string;
  className?: string;
}

export function ImageUploader({
  value,
  onChange,
  maxFiles = 6,
  folder = "uploads",
  className,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = useCallback(
    async (files: File[]) => {
      if (value.length + files.length > maxFiles) {
        toast.error(`Maximum ${maxFiles} images allowed`);
        return;
      }
      setUploading(true);
      try {
        const fd = new FormData();
        files.forEach((f) => fd.append("files", f));
        fd.append("folder", folder);
        const res = await fetch("/api/uploads", { method: "POST", body: fd });
        const data = await res.json();
        if (data.urls) {
          onChange([...value, ...data.urls]);
          toast.success(`${files.length} image${files.length > 1 ? "s" : ""} uploaded`);
        } else {
          toast.error("Upload failed");
        }
      } catch {
        toast.error("Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [value, onChange, folder, maxFiles]
  );

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length === 0) { toast.error("Please select image files"); return; }
    upload(imageFiles);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeImage = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
          dragging
            ? "border-primary bg-primary/5 scale-[0.99]"
            : "border-border hover:border-primary/50 hover:bg-muted/30"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm font-medium">Uploading…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <ImagePlus className="h-8 w-8" />
            <div>
              <p className="text-sm font-medium">
                {dragging ? "Drop images here" : "Click or drag images to upload"}
              </p>
              <p className="text-xs mt-0.5">
                PNG, JPG, WebP up to 10MB · Max {maxFiles} images
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Preview grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {value.map((url, idx) => (
            <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border bg-muted">
              <Image
                src={url}
                alt={`Image ${idx + 1}`}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="h-7 w-7 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-colors"
                >
                  <X className="h-3.5 w-3.5 text-white" />
                </button>
              </div>
              {idx === 0 && (
                <span className="absolute bottom-1 left-1 text-[9px] font-bold text-white bg-black/60 px-1.5 py-0.5 rounded">
                  Cover
                </span>
              )}
            </div>
          ))}
          {value.length < maxFiles && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="aspect-square rounded-lg border-2 border-dashed flex items-center justify-center text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
            >
              <Upload className="h-5 w-5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
