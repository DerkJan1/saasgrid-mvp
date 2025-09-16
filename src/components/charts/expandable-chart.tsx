'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Expand, X } from 'lucide-react'

interface ExpandableChartProps {
  title: string
  description?: string
  children: React.ReactNode
  expandedChildren?: React.ReactNode
  className?: string
}

export function ExpandableChart({ 
  title, 
  description, 
  children, 
  expandedChildren,
  className = ""
}: ExpandableChartProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (isExpanded) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
              {description && (
                <p className="text-gray-600 mt-1">{description}</p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
            <div className="h-96">
              {expandedChildren || children}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className={`transition-shadow hover:shadow-md cursor-pointer group ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          {description && (
            <CardDescription className="mt-1">{description}</CardDescription>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            setIsExpanded(true)
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
        >
          <Expand className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent onClick={() => setIsExpanded(true)}>
        {children}
      </CardContent>
    </Card>
  )
}
