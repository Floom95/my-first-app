"use client";

import Link from "next/link";
import { Building2, Globe, Briefcase } from "lucide-react";
import type { Company } from "@/lib/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CompanyCardProps {
  company: Company;
}

export function CompanyCard({ company }: CompanyCardProps) {
  return (
    <Link href={`/companies/${company.id}`}>
      <Card className="h-full transition-colors hover:border-primary/50 hover:shadow-md cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10">
                <Building2 className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-base truncate">
                {company.name}
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 pt-0">
          {company.industry && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Briefcase className="h-3.5 w-3.5 shrink-0" />
              <Badge variant="secondary" className="font-normal">
                {company.industry}
              </Badge>
            </div>
          )}
          {company.website && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Globe className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{company.website}</span>
            </div>
          )}
          {!company.industry && !company.website && (
            <p className="text-sm text-muted-foreground italic">
              Keine weiteren Details
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
