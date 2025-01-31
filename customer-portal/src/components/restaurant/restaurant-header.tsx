import Image from 'next/image'

interface RestaurantHeaderProps {
  name: string
  logoUrl: string | null
  tableNumber: string
}

export function RestaurantHeader({ name, logoUrl, tableNumber }: RestaurantHeaderProps) {
  return (
    <div className="flex items-center space-x-4">
      {logoUrl && (
        <div className="relative h-16 w-16 overflow-hidden rounded-lg">
          <Image
            src={logoUrl}
            alt={`${name} logo`}
            fill
            className="object-cover"
          />
        </div>
      )}
      <div>
        <h1 className="text-2xl font-bold">{name}</h1>
        <p className="text-muted-foreground">Table {tableNumber}</p>
      </div>
    </div>
  )
} 