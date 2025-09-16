// Premium Chart Container - Lovable-inspired design
'use client'

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Download, Maximize2, Calendar } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PremiumChartContainerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "premium";
  actions?: boolean;
  timeSelector?: boolean;
  onExport?: (format: 'png' | 'csv') => void;
  onExpand?: () => void;
}

export function PremiumChartContainer({ 
  title, 
  subtitle, 
  children, 
  className = "",
  variant = "default",
  actions = true,
  timeSelector = true,
  onExport,
  onExpand
}: PremiumChartContainerProps) {
  const containerClass = variant === "premium" 
    ? "border-primary/20 bg-gradient-to-br from-primary/5 to-white shadow-card hover:shadow-card-hover"
    : "border-border bg-card shadow-card hover:shadow-card-hover";

  return (
    <Card className={`relative overflow-hidden transition-all duration-300 hover:-translate-y-1 ${containerClass} ${className}`}>
      {/* Header */}
      <div className="p-6 pb-0">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-xl text-gray-900 tracking-tight">
              {title}
            </h3>
            {subtitle && (
              <p className="text-gray-600">
                {subtitle}
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {timeSelector && (
              <Button variant="outline" size="sm" className="h-8 px-3 text-xs">
                <Calendar className="h-3 w-3 mr-1" />
                Last 12 months
              </Button>
            )}
            
            {actions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={onExpand}>
                    <Maximize2 className="h-4 w-4 mr-2" />
                    Expand
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onExport?.('png')}>
                    <Download className="h-4 w-4 mr-2" />
                    Export PNG
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onExport?.('csv')}>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
      
      {/* Chart Content */}
      <div className="p-6 pt-4">
        <div className="w-full h-[420px]">
          {children}
        </div>
      </div>
    </Card>
  );
}
