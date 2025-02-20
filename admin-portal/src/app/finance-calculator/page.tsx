'use client'

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calculator, Save, FileSpreadsheet, RefreshCcw } from "lucide-react"
import { cn } from "@/lib/utils"

interface FinancialData {
  revenue: {
    foodSales: number
    beverageSales: number
    deliverySales: number
    otherIncome: number
  }
  expenses: {
    foodCost: number
    beverageCost: number
    labor: number
    rent: number
    utilities: number
    marketing: number
    maintenance: number
    other: number
  }
}

export default function FinanceCalculatorPage() {
  const [data, setData] = useState<FinancialData>({
    revenue: {
      foodSales: 0,
      beverageSales: 0,
      deliverySales: 0,
      otherIncome: 0
    },
    expenses: {
      foodCost: 0,
      beverageCost: 0,
      labor: 0,
      rent: 0,
      utilities: 0,
      marketing: 0,
      maintenance: 0,
      other: 0
    }
  })

  const handleInputChange = (category: 'revenue' | 'expenses', field: string, value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value)
    setData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: numValue
      }
    }))
  }

  const calculateTotalRevenue = () => {
    return Object.values(data.revenue).reduce((acc, curr) => acc + curr, 0)
  }

  const calculateTotalExpenses = () => {
    return Object.values(data.expenses).reduce((acc, curr) => acc + curr, 0)
  }

  const calculateNetProfit = () => {
    return calculateTotalRevenue() - calculateTotalExpenses()
  }

  const calculateProfitMargin = () => {
    const revenue = calculateTotalRevenue()
    return revenue === 0 ? 0 : (calculateNetProfit() / revenue) * 100
  }

  const resetCalculator = () => {
    setData({
      revenue: {
        foodSales: 0,
        beverageSales: 0,
        deliverySales: 0,
        otherIncome: 0
      },
      expenses: {
        foodCost: 0,
        beverageCost: 0,
        labor: 0,
        rent: 0,
        utilities: 0,
        marketing: 0,
        maintenance: 0,
        other: 0
      }
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Finance Calculator</h1>
          <p className="text-muted-foreground">Calculate your restaurant's financial performance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetCalculator}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button variant="outline">
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
          <Button variant="outline">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Section */}
        <div className="flex flex-col gap-6">
          <Tabs defaultValue="revenue" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
            </TabsList>
            <TabsContent value="revenue">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Sources</CardTitle>
                  <CardDescription>Enter your revenue from different sources</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="foodSales">Food Sales</Label>
                    <Input
                      id="foodSales"
                      type="number"
                      value={data.revenue.foodSales || ''}
                      onChange={(e) => handleInputChange('revenue', 'foodSales', e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="beverageSales">Beverage Sales</Label>
                    <Input
                      id="beverageSales"
                      type="number"
                      value={data.revenue.beverageSales || ''}
                      onChange={(e) => handleInputChange('revenue', 'beverageSales', e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deliverySales">Delivery Sales</Label>
                    <Input
                      id="deliverySales"
                      type="number"
                      value={data.revenue.deliverySales || ''}
                      onChange={(e) => handleInputChange('revenue', 'deliverySales', e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="otherIncome">Other Income</Label>
                    <Input
                      id="otherIncome"
                      type="number"
                      value={data.revenue.otherIncome || ''}
                      onChange={(e) => handleInputChange('revenue', 'otherIncome', e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="expenses">
              <Card>
                <CardHeader>
                  <CardTitle>Expenses</CardTitle>
                  <CardDescription>Enter your operating expenses</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="foodCost">Food Cost</Label>
                    <Input
                      id="foodCost"
                      type="number"
                      value={data.expenses.foodCost || ''}
                      onChange={(e) => handleInputChange('expenses', 'foodCost', e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="beverageCost">Beverage Cost</Label>
                    <Input
                      id="beverageCost"
                      type="number"
                      value={data.expenses.beverageCost || ''}
                      onChange={(e) => handleInputChange('expenses', 'beverageCost', e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="labor">Labor</Label>
                    <Input
                      id="labor"
                      type="number"
                      value={data.expenses.labor || ''}
                      onChange={(e) => handleInputChange('expenses', 'labor', e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rent">Rent</Label>
                    <Input
                      id="rent"
                      type="number"
                      value={data.expenses.rent || ''}
                      onChange={(e) => handleInputChange('expenses', 'rent', e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="utilities">Utilities</Label>
                    <Input
                      id="utilities"
                      type="number"
                      value={data.expenses.utilities || ''}
                      onChange={(e) => handleInputChange('expenses', 'utilities', e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="marketing">Marketing</Label>
                    <Input
                      id="marketing"
                      type="number"
                      value={data.expenses.marketing || ''}
                      onChange={(e) => handleInputChange('expenses', 'marketing', e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maintenance">Maintenance</Label>
                    <Input
                      id="maintenance"
                      type="number"
                      value={data.expenses.maintenance || ''}
                      onChange={(e) => handleInputChange('expenses', 'maintenance', e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="other">Other Expenses</Label>
                    <Input
                      id="other"
                      type="number"
                      value={data.expenses.other || ''}
                      onChange={(e) => handleInputChange('expenses', 'other', e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Results Section */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Financial Summary</CardTitle>
              <CardDescription>Overview of your financial performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Revenue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ₺{calculateTotalRevenue().toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Expenses
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-500">
                      ₺{calculateTotalExpenses().toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Net Profit
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={cn(
                    "text-2xl font-bold",
                    calculateNetProfit() >= 0 ? "text-green-500" : "text-red-500"
                  )}>
                    ₺{calculateNetProfit().toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Profit Margin
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={cn(
                    "text-2xl font-bold",
                    calculateProfitMargin() >= 0 ? "text-green-500" : "text-red-500"
                  )}>
                    {calculateProfitMargin().toFixed(2)}%
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Expense Breakdown</CardTitle>
              <CardDescription>Percentage of total expenses by category</CardDescription>
            </CardHeader>
            <CardContent>
              {Object.entries(data.expenses).map(([key, value]) => {
                const percentage = calculateTotalExpenses() === 0 
                  ? 0 
                  : (value / calculateTotalExpenses()) * 100
                return (
                  <div key={key} className="mb-4 last:mb-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 