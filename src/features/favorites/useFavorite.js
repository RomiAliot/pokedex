import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  addFavorite,
  removeFavorite,
  selectFavoriteIds,
  MAX_TEAM_SIZE,
} from './favoritesSlice';

// Encapsula el "agregar/quitar de Mi Equipo" en un solo lugar
function useFavorite({ id, name, sprite }) {
  const dispatch = useAppDispatch();

  // selectFavoriteIds está memorizado, así que es estable si no cambian.
  const favoriteIds = useAppSelector(selectFavoriteIds);
  const isFavorite = favoriteIds.includes(id);
  const isFull = favoriteIds.length >= MAX_TEAM_SIZE;
  const canAdd = !isFavorite && !isFull;

  const toggle = useCallback(() => {
    if (isFavorite) {
      dispatch(removeFavorite(id));
      return;
    }
    
    if (isFull) return;
    dispatch(addFavorite({ id, name, sprite }));
  }, [dispatch, isFavorite, isFull, id, name, sprite]);

  return { isFavorite, isFull, canAdd, toggle };
}

export default useFavorite;
