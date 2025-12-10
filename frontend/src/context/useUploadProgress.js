import { useContext } from 'react';
import { UploadProgressContext } from './UploadProgressContextDef';

export const useUploadProgress = () => {
  const context = useContext(UploadProgressContext);
  if (!context) {
    throw new Error('useUploadProgress must be used within UploadProgressProvider');
  }
  return context;
};
