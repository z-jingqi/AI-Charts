import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from "lucide-react"

export interface MetricCardProps {
  label: string
  value: string | number
  unit?: string
  trend?: "up" | "down" | "neutral"
  description?: string
}

export function MetricCard({ label, value, unit, trend, description }: MetricCardProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        {trend === "up" && <ArrowUpIcon className="h-4 w-4 text-destructive" />}
        {trend === "down" && <ArrowDownIcon className="h-4 w-4 text-green-500" />}
        {trend === "neutral" && <MinusIcon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {value}
          {unit && <span className="ml-1 text-sm font-normal text-muted-foreground">{unit}</span>}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
