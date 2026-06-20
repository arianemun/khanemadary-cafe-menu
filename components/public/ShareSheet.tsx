"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Copy, Share2, QrCode, Contact, Smartphone } from "lucide-react";
import QRCode from "qrcode";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { copyToClipboard, shareViaNavigator } from "@/lib/clipboard";
import { useMenuStore } from "@/lib/store";
import type { SiteSettings } from "@/lib/types";
import {
  PublicMenuDrawerSheet,
  PublicSheetHeader,
} from "@/components/public/PublicMenuDrawer";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface ShareSheetProps {
  settings: SiteSettings;
}

function Divider() {
  return <div className="mx-4 border-t border-border" />;
}

interface ShareRowProps {
  label: string;
  subtitle?: string;
  subtitleLtr?: boolean;
  icon: ReactNode;
  onClick?: () => void;
}

function ShareRow({ label, subtitle, subtitleLtr, icon, onClick }: ShareRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 px-4 py-3.5 text-start transition-colors hover:bg-muted/60"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center text-accent">
        {icon}
      </span>
      <span className="min-w-0 flex-1 flex flex-col gap-0.5">
        <span className="font-semibold">{label}</span>
        {subtitle && (
          <span
            className={`truncate text-sm text-secondary-text${subtitleLtr ? " w-full text-end" : ""}`}
            dir={subtitleLtr ? "ltr" : undefined}
          >
            {subtitle}
          </span>
        )}
      </span>
    </button>
  );
}

const QR_RENDER_OPTIONS = {
  margin: 4,
  errorCorrectionLevel: "H" as const,
  color: { dark: "#212121", light: "#ffffff" },
};

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.min(radius, width / 2, height / 2);
  if (typeof ctx.roundRect === "function") {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, r);
    return;
  }
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function loadImageFromElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = src;
  });
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  const trimmed = src.trim();
  if (!trimmed) throw new Error("Empty image source");

  try {
    const res = await fetch(trimmed);
    if (!res.ok) throw new Error("Fetch failed");
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    try {
      return await loadImageFromElement(objectUrl);
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  } catch {
    return loadImageFromElement(trimmed);
  }
}

async function renderQrCanvas(
  url: string,
  size: number,
  logoUrl?: string
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  await QRCode.toCanvas(canvas, url, {
    ...QR_RENDER_OPTIONS,
    width: size,
  });

  if (!logoUrl?.trim()) return canvas;

  try {
    const logo = await loadImage(logoUrl);
    const ctx = canvas.getContext("2d");
    if (!ctx) return canvas;

    const logoSize = Math.round(size * 0.18);
    const pad = Math.round(size * 0.025);
    const bgSize = logoSize + pad * 2;
    const bgX = (size - bgSize) / 2;
    const bgY = (size - bgSize) / 2;
    const logoX = (size - logoSize) / 2;
    const logoY = (size - logoSize) / 2;

    ctx.fillStyle = "#ffffff";
    drawRoundedRect(ctx, bgX, bgY, bgSize, bgSize, bgSize * 0.12);
    ctx.fill();
    ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
  } catch {
    // Keep scannable QR without logo overlay
  }

  return canvas;
}

async function generateQrWithLogo(
  url: string,
  logoUrl: string | undefined,
  size = 220
): Promise<string> {
  try {
    const canvas = await renderQrCanvas(url, size, logoUrl);
    return canvas.toDataURL("image/png");
  } catch {
    const canvas = await renderQrCanvas(url, size);
    return canvas.toDataURL("image/png");
  }
}

export function ShareSheet({ settings }: ShareSheetProps) {
  const t = useTranslations("share");
  const open = useMenuStore((s) => s.shareOpen);
  const setShareOpen = useMenuStore((s) => s.setShareOpen);
  const [menuUrl, setMenuUrl] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    const url = window.location.href;
    setMenuUrl(url);
    setQrDataUrl(null);

    void generateQrWithLogo(url, settings.logo)
      .then((dataUrl) => {
        if (!cancelled) setQrDataUrl(dataUrl);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl(null);
      });

    return () => {
      cancelled = true;
    };
  }, [open, settings.logo]);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const getShareUrl = useCallback(
    () => menuUrl || (typeof window !== "undefined" ? window.location.href : ""),
    [menuUrl]
  );

  const copyLink = useCallback(() => {
    const url = getShareUrl();
    if (!url) return;

    void copyToClipboard(url).then((ok) => {
      if (ok) toast.success(t("copySuccess"));
      else toast.error(t("copyFailed"));
    });
  }, [getShareUrl, t]);

  const nativeShare = useCallback(() => {
    const url = getShareUrl();
    if (!url) return;

    void shareViaNavigator({
      url,
      title: settings.cafeName,
      text: settings.tagline || settings.cafeName,
    }).then((result) => {
      if (result === "shared" || result === "aborted") return;

      if (result !== "unavailable") return;

      void copyToClipboard(url).then((ok) => {
        if (ok) toast.success(t("copySuccess"));
        else toast.error(t("copyFailed"));
      });
    });
  }, [getShareUrl, settings.cafeName, settings.tagline, t]);

  const downloadVCard = useCallback(() => {
    const phone = settings.phone?.trim();
    if (!phone) {
      toast.error(t("noPhone"));
      return;
    }
    const vcard = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${settings.cafeName}`,
      `TEL;TYPE=CELL:${phone}`,
      "END:VCARD",
    ].join("\r\n");
    const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${settings.cafeName.replace(/\s+/g, "-")}.vcf`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success(t("contactSaved"));
  }, [settings.cafeName, settings.phone, t]);

  const handleInstall = useCallback(async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      toast.success(t("installSuccess"));
    }
    setInstallPrompt(null);
  }, [installPrompt, t]);

  if (!settings.shareEnabled) return null;

  return (
    <PublicMenuDrawerSheet open={open} onOpenChange={setShareOpen}>
      <PublicSheetHeader title={t("title")} />

      <ShareRow
        label={t("copy")}
        subtitle={menuUrl || undefined}
        subtitleLtr
        icon={<Copy className="h-5 w-5" />}
        onClick={copyLink}
      />
      <ShareRow
        label={t("nativeShare")}
        subtitle={settings.tagline || settings.cafeName || menuUrl || undefined}
        subtitleLtr={!settings.tagline && !settings.cafeName}
        icon={<Share2 className="h-5 w-5" />}
        onClick={nativeShare}
      />

      <div className="flex w-full items-center gap-3 px-4 py-3.5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center text-accent">
          <QrCode className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold">{t("qrCode")}</div>
        </div>
      </div>
      <div className="flex justify-center px-4 pb-4">
        {qrDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={qrDataUrl}
            alt={t("qrCode")}
            width={220}
            height={220}
          />
        ) : (
          <div className="flex h-[220px] w-[220px] items-center justify-center bg-muted text-xs text-secondary-text">
            …
          </div>
        )}
      </div>

      <Divider />
      <ShareRow
        label={t("saveContact")}
        subtitle={t("saveContactEn")}
        subtitleLtr
        icon={<Contact className="h-5 w-5" />}
        onClick={downloadVCard}
      />

      {installPrompt && (
        <>
          <Divider />
          <ShareRow
            label={t("install")}
            subtitle={t("installHint")}
            icon={<Smartphone className="h-5 w-5" />}
            onClick={handleInstall}
          />
        </>
      )}
    </PublicMenuDrawerSheet>
  );
}
