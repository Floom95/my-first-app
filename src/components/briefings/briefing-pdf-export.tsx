"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import { jsPDF } from "jspdf";

import type { Briefing, CollaborationWithRelations } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface BriefingPdfExportProps {
  briefing: Briefing;
  collaboration: CollaborationWithRelations;
}

export function BriefingPdfExport({
  briefing,
  collaboration,
}: BriefingPdfExportProps) {
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;
      let y = margin;

      // Helper: add text with word wrap and page break handling
      function addText(
        text: string,
        x: number,
        startY: number,
        options?: {
          fontSize?: number;
          fontStyle?: string;
          maxWidth?: number;
          color?: [number, number, number];
        }
      ): number {
        const fontSize = options?.fontSize || 10;
        const fontStyle = options?.fontStyle || "normal";
        const maxWidth = options?.maxWidth || contentWidth;
        const color = options?.color || [0, 0, 0];

        doc.setFontSize(fontSize);
        doc.setFont("helvetica", fontStyle);
        doc.setTextColor(...color);

        const lines = doc.splitTextToSize(text, maxWidth);
        const lineHeight = fontSize * 0.5;

        for (let i = 0; i < lines.length; i++) {
          if (startY > doc.internal.pageSize.getHeight() - 20) {
            doc.addPage();
            startY = margin;
          }
          doc.text(lines[i], x, startY);
          startY += lineHeight;
        }

        return startY;
      }

      // Helper: add a section
      function addSection(
        label: string,
        value: string | null | undefined,
        currentY: number
      ): number {
        if (!value) return currentY;

        // Check page break before section
        if (currentY > doc.internal.pageSize.getHeight() - 40) {
          doc.addPage();
          currentY = margin;
        }

        currentY = addText(label, margin, currentY, {
          fontSize: 10,
          fontStyle: "bold",
          color: [100, 100, 100],
        });
        currentY += 2;
        currentY = addText(value, margin, currentY, {
          fontSize: 10,
          fontStyle: "normal",
        });
        currentY += 6;

        return currentY;
      }

      // --- Header ---
      doc.setFillColor(59, 130, 246); // Blue header bar
      doc.rect(0, 0, pageWidth, 12, "F");

      y = 24;
      y = addText("BRIEFING", margin, y, {
        fontSize: 22,
        fontStyle: "bold",
      });
      y += 4;

      // Collaboration title
      y = addText(collaboration.title, margin, y, {
        fontSize: 14,
        fontStyle: "normal",
        color: [80, 80, 80],
      });
      y += 2;

      // Company name
      if (collaboration.company?.name) {
        y = addText(collaboration.company.name, margin, y, {
          fontSize: 11,
          fontStyle: "normal",
          color: [120, 120, 120],
        });
        y += 2;
      }

      // Influencer
      if (collaboration.assigned_influencer?.full_name) {
        y = addText(
          `Influencer: ${collaboration.assigned_influencer.full_name}`,
          margin,
          y,
          {
            fontSize: 10,
            fontStyle: "normal",
            color: [120, 120, 120],
          }
        );
        y += 2;
      }

      // Deadline
      if (collaboration.deadline) {
        y = addText(
          `Deadline: ${format(
            parseISO(collaboration.deadline),
            "dd. MMMM yyyy",
            { locale: de }
          )}`,
          margin,
          y,
          {
            fontSize: 10,
            fontStyle: "normal",
            color: [120, 120, 120],
          }
        );
      }

      y += 8;

      // Divider line
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y, pageWidth - margin, y);
      y += 8;

      // --- Section: Ziele & Zielgruppe ---
      y = addText("ZIELE & ZIELGRUPPE", margin, y, {
        fontSize: 12,
        fontStyle: "bold",
        color: [59, 130, 246],
      });
      y += 4;

      y = addSection("Kampagnenziel", briefing.campaign_goal, y);
      y = addSection("Zielgruppe", briefing.target_audience, y);

      // --- Section: Content ---
      if (
        briefing.deliverables ||
        briefing.hashtags ||
        briefing.dos_donts ||
        briefing.content_guidelines
      ) {
        y += 2;
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, y, pageWidth - margin, y);
        y += 6;

        y = addText("CONTENT", margin, y, {
          fontSize: 12,
          fontStyle: "bold",
          color: [59, 130, 246],
        });
        y += 4;

        y = addSection("Deliverables", briefing.deliverables, y);
        y = addSection("Hashtags & Mentions", briefing.hashtags, y);
        y = addSection("Do's & Don'ts", briefing.dos_donts, y);
        y = addSection("Content-Richtlinien", briefing.content_guidelines, y);
      }

      // --- Section: Timeline & Verguetung ---
      const postingPeriod =
        briefing.posting_period_start || briefing.posting_period_end
          ? [
              briefing.posting_period_start
                ? format(
                    parseISO(briefing.posting_period_start),
                    "dd. MMMM yyyy",
                    { locale: de }
                  )
                : null,
              briefing.posting_period_end
                ? format(
                    parseISO(briefing.posting_period_end),
                    "dd. MMMM yyyy",
                    { locale: de }
                  )
                : null,
            ]
              .filter(Boolean)
              .join(" - ")
          : null;

      if (postingPeriod || briefing.compensation || briefing.notes) {
        y += 2;
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, y, pageWidth - margin, y);
        y += 6;

        y = addText("TIMELINE & VERGUETUNG", margin, y, {
          fontSize: 12,
          fontStyle: "bold",
          color: [59, 130, 246],
        });
        y += 4;

        y = addSection("Posting-Zeitraum", postingPeriod, y);
        y = addSection("Verguetung", briefing.compensation, y);
        y = addSection("Zusaetzliche Notizen", briefing.notes, y);
      }

      // --- Footer ---
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        const pageHeight = doc.internal.pageSize.getHeight();

        doc.setDrawColor(200, 200, 200);
        doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);

        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Erstellt am ${format(new Date(), "dd.MM.yyyy, HH:mm", {
            locale: de,
          })} Uhr`,
          margin,
          pageHeight - 10
        );
        doc.text(
          `Seite ${i} von ${pageCount}`,
          pageWidth - margin,
          pageHeight - 10,
          { align: "right" }
        );
      }

      // Save the PDF
      const fileName = `Briefing_${collaboration.title.replace(
        /[^a-zA-Z0-9]/g,
        "_"
      )}_${format(new Date(), "yyyy-MM-dd")}.pdf`;
      doc.save(fileName);
    } catch (err) {
      console.error("PDF export error:", err);
      toast({
        title: "PDF-Export fehlgeschlagen",
        description: "Bitte versuchen Sie es erneut.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={exporting}
    >
      {exporting ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Download className="mr-2 h-4 w-4" />
      )}
      Als PDF herunterladen
    </Button>
  );
}
