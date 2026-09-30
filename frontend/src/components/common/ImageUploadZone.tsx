"use client";

import React, { useState, useRef } from "react";
import { toast } from "sonner";
import {
  UploadCloud,
  Image as ImageIcon,
  Check,
  X,
  RefreshCw,
  Link as LinkIcon,
  Sparkles,
  Eye,
} from "lucide-react";
import { api } from "@/lib/api";

interface PresetOption {
  name: string;
  url: string;
}

interface ImageUploadZoneProps {
  label: string;
  sublabel?: string;
  value: string;
  onChange: (url: string) => void;
  presets?: PresetOption[];
  folder?: string;
  aspectRatio?: "video" | "square" | "wide";
  placeholderText?: string;
}

export function ImageUploadZone({
  label,
  sublabel,
  value,
  onChange,
  presets = [],
  folder = "rawasin/developments",
  aspectRatio = "video",
  placeholderText = "Upload image file or select a preset",
}: ImageUploadZoneProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "presets" | "url">("upload");
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [customUrl, setCustomUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File size limiter (max 10MB)
  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  const handleFileProcess = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (PNG, JPG, WebP, etc.)");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("Image file exceeds the 10MB limit. Please choose a smaller file.");
      return;
    }

    setIsUploading(true);

    try {
      // 1. Convert to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
      });
      reader.readAsDataURL(file);
      const base64Data = await base64Promise;

      // 2. Try uploading to backend /api/v1/upload (Cloudinary)
      try {
        const res = await api.post<{ url: string }>("/upload", {
          image: base64Data,
          folder,
        });

        if (res.data?.url) {
          onChange(res.data.url);
          toast.success("Image uploaded to cloud storage successfully");
          return;
        }
      } catch (uploadErr: any) {
        console.warn("Cloud upload encountered an issue, using local optimized image:", uploadErr);
        // Fallback to base64 so user is never blocked
        onChange(base64Data);
        toast.info("Image loaded locally (fallback storage active)");
      }
    } catch (err: any) {
      console.error("File processing failed:", err);
      toast.error("Failed to read image file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleUrlApply = () => {
    if (!customUrl.trim()) return;
    onChange(customUrl.trim());
    toast.success("Image URL applied");
  };

  const ratioClass =
    aspectRatio === "square"
      ? "aspect-square max-h-48"
      : aspectRatio === "wide"
      ? "aspect-21/9 max-h-48"
      : "aspect-video max-h-48";

  return (
    <div className="space-y-2.5">
      {/* Label & Tabs Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
        <div>
          <label className="font-mono text-[0.68rem] uppercase tracking-wider text-stone-800 font-bold block">
            {label}
          </label>
          {sublabel && (
            <span className="text-[0.65rem] text-stone-500 font-mono block">
              {sublabel}
            </span>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-stone-100 p-0.5 border border-stone-200 text-xs font-mono">
          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={`px-2.5 py-1 text-[0.65rem] uppercase transition-colors cursor-pointer flex items-center gap-1 ${
              activeTab === "upload"
                ? "bg-white text-stone-900 font-bold shadow-xs"
                : "text-stone-500 hover:text-stone-800"
            }`}
          >
            <UploadCloud className="h-3 w-3" />
            <span>Upload File</span>
          </button>

          {presets.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab("presets")}
              className={`px-2.5 py-1 text-[0.65rem] uppercase transition-colors cursor-pointer flex items-center gap-1 ${
                activeTab === "presets"
                  ? "bg-white text-stone-900 font-bold shadow-xs"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              <Sparkles className="h-3 w-3" />
              <span>Presets ({presets.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab("url")}
            className={`px-2.5 py-1 text-[0.65rem] uppercase transition-colors cursor-pointer flex items-center gap-1 ${
              activeTab === "url"
                ? "bg-white text-stone-900 font-bold shadow-xs"
                : "text-stone-500 hover:text-stone-800"
            }`}
          >
            <LinkIcon className="h-3 w-3" />
            <span>Link URL</span>
          </button>
        </div>
      </div>

      {/* Main Content Area based on Tab */}
      {activeTab === "upload" && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed p-4 sm:p-6 transition-all cursor-pointer text-center relative overflow-hidden flex flex-col items-center justify-center ${
            isDragging
              ? "border-[#9b7c52] bg-[#fbf9f6] scale-[0.99]"
              : "border-stone-300 hover:border-stone-400 bg-stone-50/50 hover:bg-stone-50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleInputChange}
          />

          {isUploading ? (
            <div className="py-4 space-y-2 flex flex-col items-center">
              <RefreshCw className="h-6 w-6 text-[#9b7c52] animate-spin" />
              <span className="font-mono text-xs text-stone-700 font-medium">
                Uploading to cloud storage...
              </span>
              <span className="font-mono text-[0.65rem] text-stone-400">
                Optimizing high-resolution architectural asset
              </span>
            </div>
          ) : (
            <div className="space-y-1.5 flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 mb-1 group-hover:scale-105 transition-transform">
                <UploadCloud className="h-5 w-5 text-[#9b7c52]" />
              </div>
              <div className="text-xs font-mono text-stone-800 font-semibold">
                Click to browse or drag & drop image
              </div>
              <p className="font-mono text-[0.62rem] text-stone-500">
                Supports PNG, JPG, WebP, AVIF up to 10MB
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === "presets" && presets.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {presets.map((preset, idx) => (
            <div
              key={idx}
              onClick={() => onChange(preset.url)}
              className={`h-18 relative border cursor-pointer overflow-hidden transition-all group ${
                value === preset.url
                  ? "border-[#9b7c52] ring-2 ring-[#9b7c52]/60"
                  : "border-stone-200 opacity-75 hover:opacity-100"
              }`}
            >
              <img
                src={preset.url}
                alt={preset.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-x-0 bottom-0 bg-black/60 px-1 py-0.5 text-[0.55rem] font-mono text-white truncate text-center">
                {preset.name}
              </div>
              {value === preset.url && (
                <div className="absolute inset-0 bg-[#9b7c52]/25 flex items-center justify-center">
                  <Check className="h-4 w-4 text-white drop-shadow" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === "url" && (
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="https://example.com/photo.jpg"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            className="flex-1 bg-stone-50 border border-stone-300 px-3 py-2 text-xs font-mono text-stone-900 focus:outline-none focus:border-[#9b7c52] focus:bg-white"
          />
          <button
            type="button"
            onClick={handleUrlApply}
            className="px-4 py-2 bg-[#182220] hover:bg-[#9b7c52] text-white font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            Apply
          </button>
        </div>
      )}

      {/* Live Active Preview */}
      {value && (
        <div className="mt-2.5 p-2 bg-[#fbf9f6] border border-stone-200 flex items-center gap-3">
          <div className="w-16 h-12 bg-stone-100 border border-stone-300 relative overflow-hidden shrink-0">
            <img
              src={value}
              alt="Active asset preview"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[0.62rem] uppercase font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 border border-emerald-200">
                Active Asset Loaded
              </span>
            </div>
            <p className="font-mono text-[0.65rem] text-stone-500 truncate mt-0.5">
              {value.startsWith("data:") ? "Local image asset" : value}
            </p>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <a
              href={value}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-200 transition-colors"
              title="Preview full size"
            >
              <Eye className="h-3.5 w-3.5" />
            </a>

            <button
              type="button"
              onClick={() => onChange("")}
              className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              title="Clear image"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
