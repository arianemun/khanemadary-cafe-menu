"use client";

import { Phone, MapPin } from "lucide-react";
import { FaInstagram } from "react-icons/fa";
import { MapLinks } from "./MapLinks";
import type { SiteSettings } from "@/lib/types";
import { useTranslations } from "next-intl";

interface ContactSectionProps {
  settings: SiteSettings;
}

export function ContactSection({ settings }: ContactSectionProps) {
  const t = useTranslations("common");

  return (
    <section id="contacts" className="bg-card px-4 py-section">
      <div className="mx-auto max-w-web">
        <h2 className="text-center text-2xl font-bold">{t("contacts")}</h2>
        <p className="mb-6 text-center text-secondary-text">{t("contactsEn")}</p>
        <div className="space-y-3">
          <a
            href={`https://instagram.com/${settings.instagram}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between rounded-card bg-muted px-4 py-4"
          >
            <span>
              <div className="font-semibold">{t("instagram")}</div>
              <div className="text-sm text-secondary-text">{settings.instagram}</div>
            </span>
            <FaInstagram className="h-5 w-5 text-accent" />
          </a>
          <a
            href={`tel:${settings.phone}`}
            className="flex items-center justify-between rounded-card bg-muted px-4 py-4"
          >
            <span>
              <div className="font-semibold">{t("phone")}</div>
              <div className="text-sm text-secondary-text" dir="ltr">
                {settings.phone}
              </div>
            </span>
            <Phone className="h-5 w-5 text-accent" />
          </a>
          {settings.places.map((place) => (
            <div key={place.title} className="rounded-card bg-muted px-4 py-4">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{place.title}</div>
                  <div className="text-sm text-secondary-text">{place.address}</div>
                </div>
                <MapPin className="h-5 w-5 shrink-0 text-accent" />
              </div>
              <MapLinks coordinates={place.coordinates} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
