import { useDispatch, useSelector } from 'react-redux';

// Wrappers de los hooks de Redux: centralizan el store y dejan el día de mañana
// migrar a TypeScript sin tocar cada componente.
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;
