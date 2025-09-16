// Portions adapted from MekuHQ/saasboard (MIT): https://github.com/MekuHQ/saasboard
"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

type ExpandableChartProps = {
  title: string;
  description?: string;
  heightClass?: string; // defaults to h-[420px]
  children: React.ReactNode;
};

export function ExpandableChart({
  title,
  description,
  heightClass = "h-[420px]",
  children,
}: ExpandableChartProps) {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl text-gray-900">{title}</CardTitle>
        {description ? (
          <CardDescription className="text-gray-600">{description}</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="pt-0">
        <div className={`w-full ${heightClass}`}>
          {children}
        </div>
      </CardContent>
    </Card>
  );
}