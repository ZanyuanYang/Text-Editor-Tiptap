import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type Props = {
  error: string;
};

export default function AlertDestructive(props: Props) {
  const { error } = props;
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
