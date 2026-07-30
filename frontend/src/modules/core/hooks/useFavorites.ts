import { useCallback } from 'react';
import { dashboardStore, Favorite } from '../stores/dashboardStore';

export function useFavorites() {
  const favorites = dashboardStore((state) => state.favorites);
  const addFavorite = dashboardStore((state) => state.addFavorite);
  const removeFavorite = dashboardStore((state) => state.removeFavorite);

  const toggleFavorite = useCallback(
    (favorite: Favorite) => {
      const exists = favorites.some((f) => f.id === favorite.id);
      if (exists) {
        removeFavorite(favorite.id);
      } else {
        addFavorite({ ...favorite, timestamp: Date.now() });
      }
    },
    [favorites, addFavorite, removeFavorite]
  );

  const isFavorited = useCallback(
    (id: string) => favorites.some((f) => f.id === id),
    [favorites]
  );

  return {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorited,
  };
}
