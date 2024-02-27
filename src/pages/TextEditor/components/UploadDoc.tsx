import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import mammoth from 'mammoth';
import { useContext } from 'react';
import { TiptapContext } from '@/contexts/tiptap_context';
import { GlobalContext } from '@/contexts/global_context';

function UploadDoc() {
  const { setContent, setHtmlContent } = useContext(TiptapContext);
  const { setAlertOpen, setError } = useContext(GlobalContext);

  const displayResult = (result: any) => {
    setHtmlContent(result.value);
    setContent(result.value);
  };

  const handleError = (error: any) => {
    setError('.docx only, Error converting docx to HTML');
    setAlertOpen(true);
    setTimeout(() => {
      setAlertOpen(false);
    }, 3000);
  };

  const handleFileChange = (event: any) => {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = function (e: any) {
        mammoth
          .convertToHtml({ arrayBuffer: e.target.result })
          .then(displayResult)
          .catch(handleError);
      };

      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <div className="flex w-full max-w-sm items-center p-4">
      <Label htmlFor="picture" className="w-48">
        Upload .docx
      </Label>
      <Input id="docx" type="file" onChange={handleFileChange} />
    </div>
  );
}

export default UploadDoc;
