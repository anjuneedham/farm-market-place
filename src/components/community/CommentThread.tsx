import { Avatar } from '@/components/ui/Avatar';
import { timeAgo } from '@/lib/utils';
import type { CommentView } from '@/lib/types';

export function CommentThread({ comments, depth = 0 }: { comments: CommentView[]; depth?: number }) {
  return (
    <div className={depth > 0 ? 'ml-8 mt-3 space-y-3 border-l border-line pl-4' : 'space-y-4'}>
      {comments.map((comment) => (
        <div key={comment.id}>
          <div className="flex gap-3">
            <Avatar name={comment.authorLabel} size={32} />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-ink-900">{comment.authorLabel}</p>
                <span className="text-xs text-ink-400">{timeAgo(comment.createdAt)}</span>
              </div>
              <p className="mt-1 whitespace-pre-wrap text-sm text-ink-700">{comment.body}</p>
            </div>
          </div>
          {comment.replies.length > 0 ? <CommentThread comments={comment.replies} depth={depth + 1} /> : null}
        </div>
      ))}
    </div>
  );
}
