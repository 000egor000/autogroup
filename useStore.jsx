import { useContext } from 'react';
import { ContextApp } from '@/core/context';

export const useStore = () => {
  const store = useContext(ContextApp);

  if (!store) {
    throw new Error('Use App store within provider!');
  }
  return store;
};
