import { useDispatch, useSelector } from 'react-redux';
// Type-only dependency on the store composition; no runtime import or cycle.
import type { AppDispatch, RootState } from '@/app/store';
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
