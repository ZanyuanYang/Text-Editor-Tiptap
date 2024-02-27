import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useContext } from 'react';
import { GlobalContext } from '@/contexts/global_context';

export default function AlertDestructive() {
  const { error } = useContext(GlobalContext);
  return (
    <Alert
      variant="destructive"
      className="fixed top-2 right-8 w-96 animate__animated animate__bounceInRight"
    >
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
}
