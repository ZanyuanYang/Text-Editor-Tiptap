import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useContext } from 'react';
import { GlobalContext } from '@/contexts/global_context';

export default function AlertDestructive() {
  const { error } = useContext(GlobalContext);
  return (
    <Alert
      variant="destructive"
      className="fixed top-4 right-4 w-96 z-50 shadow-lg animate-in slide-in-from-right-8 fade-in duration-300"
    >
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
}
