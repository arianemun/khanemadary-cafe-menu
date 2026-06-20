"use client";

import type { ReactNode, Ref } from "react";
import { Phone, MapPin } from "lucide-react";
import { FaInstagram, FaTelegram } from "react-icons/fa";
import { MapLinks } from "./MapLinks";
import type { SiteSettings } from "@/lib/types";
import { useLocale, useTranslations } from "next-intl";
import { formatAdminDigits } from "@/lib/utils";

function ContactIcon({ children }: { children: ReactNode }) {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-white">
      {children}
    </span>
  );
}

interface ContactSectionProps {
  settings: SiteSettings;
  sectionRef?: Ref<HTMLElement>;
}

export function ContactSection({ settings, sectionRef }: ContactSectionProps) {
  const t = useTranslations("common");
  const locale = useLocale();
  const displayPhone = formatAdminDigits(
    settings.phone,
    locale === "fa" ? "fa" : "en"
  );

  return (
    <section
      id="contacts"
      ref={sectionRef}
      data-category-id="contacts"
      className="scroll-mt-sticky-nav"
    >
      <div className="bg-card px-4 py-6 text-center">
        <h2 className="text-2xl font-bold">{t("contacts")}</h2>
        <p className="text-secondary-text">{t("contactsEn")}</p>
      </div>
      <div className="bg-card px-4 pb-section">
        <div className="mx-auto max-w-web">
          <div className="space-y-3">
          <a
            href={`https://instagram.com/${settings.instagram}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-card bg-muted px-4 py-4"
          >
            <ContactIcon>
              <FaInstagram className="h-4 w-4" />
            </ContactIcon>
            <span className="min-w-0 flex-1">
              <div className="font-semibold">{t("instagram")}</div>
              <div className="text-sm text-secondary-text">{settings.instagram}</div>
            </span>
          </a>
          <a
            href={`tel:${settings.phone}`}
            className="flex items-center gap-3 rounded-card bg-muted px-4 py-4"
          >
            <ContactIcon>
              <Phone className="h-4 w-4" />
            </ContactIcon>
            <span className="min-w-0 flex-1 flex flex-col">
              <div className="font-semibold">{t("phone")}</div>
              <div dir="ltr" className="w-full text-end text-sm text-secondary-text">
                {displayPhone}
              </div>
            </span>
          </a>
          {settings.telegram && (
            <a
              href={`https://t.me/${settings.telegram.replace(/^@/, "")}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-card bg-muted px-4 py-4"
            >
              <ContactIcon>
                <FaTelegram className="h-4 w-4" />
              </ContactIcon>
              <span className="min-w-0 flex-1">
                <div className="font-semibold">{t("telegram")}</div>
                <div className="text-sm text-secondary-text">{settings.telegram}</div>
              </span>
            </a>
          )}
          {settings.places.map((place, index) => (
            <div key={`${place.address}-${index}`} className="rounded-card bg-muted px-4 py-4">
              <div className="mb-3 flex items-center gap-3">
                <ContactIcon>
                  <MapPin className="h-4 w-4" />
                </ContactIcon>
                <span className="min-w-0 flex-1">
                  <div className="font-semibold">{t("address")}</div>
                  <div className="text-sm text-secondary-text">{place.address}</div>
                </span>
              </div>
              <MapLinks coordinates={place.coordinates} maps={settings.maps} />
            </div>
          ))}
          </div>
        </div>
      </div>
    </section>
  );
}
