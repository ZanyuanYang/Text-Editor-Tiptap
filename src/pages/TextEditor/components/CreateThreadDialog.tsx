import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useContext, useState } from 'react';
import { GlobalContext } from '@/contexts/global_context';

type CreateThreadDialogProps = {
  selectionInfo: {
    text: string;
    range: Range | undefined;
  };
  createThread: (description: string) => void;
};

function CreateThreadDialog(props: CreateThreadDialogProps) {
  const { setAlertOpen, setError } = useContext(GlobalContext);
  const { selectionInfo, createThread } = props;
  const [open, setOpen] = useState<boolean>(false);
  const [description, setDescription] = useState<string>('');
  const onChangeTextarea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  };
  const handleError = () => {
    setError('Must select text to create a thread.');
    setAlertOpen(true);
    setTimeout(() => {
      setAlertOpen(false);
    }, 3000);
  };
  const onClickOpen = () => {
    if (selectionInfo.text && selectionInfo.text.length > 0) {
      setOpen(true);
    } else {
      handleError();
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => onClickOpen()}>Create Thread</Button>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Thread</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Textarea
            placeholder="Type your thread message here."
            onChange={(e) => onChangeTextarea(e)}
          />
        </div>
        <DialogFooter>
          <Button
            type="button"
            onClick={() => {
              createThread(description);
              setOpen(false);
            }}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CreateThreadDialog;
