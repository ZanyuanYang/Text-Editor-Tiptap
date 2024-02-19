import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

type ThreadType = {
  id: number;
  username: string;
  description: string;
  expanded: boolean;
  resolved: boolean;
};

type ThreadProps = {
  threads: ThreadType[];
  setThreads: (threads: ThreadType[]) => void;
};

function Thread(props: ThreadProps) {
  const { threads, setThreads } = props;
  const onClickThread = (id: number) => {
    const newThreads = threads.map((thread) => {
      // If the current thread is the one being clicked and it's not already expanded, expand it.
      if (thread.id === id && !thread.expanded) {
        return { ...thread, expanded: true };
      }
      // Collapse all other threads.
      else if (thread.id !== id) {
        return { ...thread, expanded: false };
      }
      // If the thread is already expanded, return it as is (do nothing).
      return thread;
    });
    setThreads(newThreads);
  };

  const onclickResolve = (e: any, id: number) => {
    e.stopPropagation();
    const newThreads = threads.map((thread) => {
      if (thread.id === id) {
        return { ...thread, resolved: true };
      }
      return thread;
    });
    setThreads(newThreads);
  };

  const onclickUnresolve = (e: any, id: number) => {
    e.stopPropagation();
    const newThreads = threads.map((thread) => {
      if (thread.id === id) {
        return { ...thread, resolved: false };
      }
      return thread;
    });
    setThreads(newThreads);
  };

  const onClickDelete = (e: any, id: number) => {
    e.stopPropagation();
    const newThreads = threads.filter((thread) => thread.id !== id);
    setThreads(newThreads);
  };

  return (
    <div className="bg-muted w-full rounded-r-2xl p-2">
      <div>
        <h2 className="text-muted-foreground text-sm px-2">Open threads</h2>
        {threads.map((thread) => (
          <>
            {!thread.resolved && (
              <div key={thread.id} className="flex flex-col p-2">
                <Card
                  className={`p-2 border-2 ${
                    thread.expanded
                      ? ''
                      : 'hover:border-black transition duration-300 cursor-pointer'
                  } `}
                  onClick={() => onClickThread(thread.id)}
                >
                  <div className="flex space-x-2">
                    <Avatar>
                      <AvatarImage src="https://github.com/vercel.png" />
                      <AvatarFallback>VC</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <div className="flex items-baseline gap-2">
                        <h4 className="text-sm font-semibold">
                          {thread.username}
                        </h4>
                        <span className="text-xs text-muted-foreground">
                          December 2021
                        </span>
                      </div>

                      <p className="text-sm">{thread.description}</p>
                    </div>
                  </div>
                  {thread.expanded && (
                    <div className="flex justify-between mt-2">
                      <Button
                        className="text-sm p-2 h-7 font-normal bg-red-100 hover:bg-red-200 text-red-500"
                        variant="destructive"
                        onClick={(e) => onClickDelete(e, thread.id)}
                      >
                        Delete thread
                      </Button>
                      <Button
                        className="text-sm p-2 h-7 bg-emerald-100 hover:bg-emerald-200  text-emerald-600"
                        onClick={(e) => onclickResolve(e, thread.id)}
                      >
                        Resolve thread
                      </Button>
                    </div>
                  )}
                </Card>
              </div>
            )}
          </>
        ))}
      </div>
      <div>
        <h2 className="text-muted-foreground text-sm px-2 mt-4">
          Resolved threads
        </h2>
        {threads.map((thread) => (
          <>
            {thread.resolved && (
              <div key={thread.id} className="flex flex-col p-2">
                <Card
                  className={`p-2 border-2 ${
                    thread.expanded
                      ? ''
                      : 'hover:border-black transition duration-300 cursor-pointer'
                  } `}
                  onClick={() => onClickThread(thread.id)}
                >
                  <div className="flex space-x-2">
                    <Avatar>
                      <AvatarImage src="https://github.com/vercel.png" />
                      <AvatarFallback>VC</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <div className="flex items-baseline gap-2">
                        <h4 className="text-sm font-semibold">
                          {thread.username}
                        </h4>
                        <span className="text-xs text-muted-foreground">
                          December 2021
                        </span>
                      </div>
                      <p className="text-sm">{thread.description}</p>
                    </div>
                  </div>
                  {thread.expanded && (
                    <div className="flex justify-between mt-2">
                      <Button
                        className="text-sm p-2 h-7 font-normal bg-red-100 hover:bg-red-200 text-red-500"
                        variant="destructive"
                        onClick={(e) => onClickDelete(e, thread.id)}
                      >
                        Delete thread
                      </Button>
                      <Button
                        className="text-sm p-2 h-7 bg-amber-100 hover:bg-amber-200 text-amber-600"
                        onClick={(e) => onclickUnresolve(e, thread.id)}
                      >
                        Unresolve thread
                      </Button>
                    </div>
                  )}
                </Card>
              </div>
            )}
          </>
        ))}
      </div>
    </div>
  );
}

export default Thread;
