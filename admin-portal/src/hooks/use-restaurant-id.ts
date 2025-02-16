import { useRestaurant } from "@/providers/restaurant-provider";

export function useRestaurantId() {
  const { restaurant } = useRestaurant();
  return restaurant?.id;
} 