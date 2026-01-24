import { useState } from "react";

export default function Comment({ comment }) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replies, setReplies] = useState(comment.replies || []);

  const handleAddReply = () => {
    if (!replyText) return;
    const reply = { id: Date.now(), user: "CurrentUser", text: replyText };
    setReplies([...replies, reply]);
    setReplyText("");
    setShowReply(false);
  };

  return (
    <div className="comment-card">
      <p><strong>{comment.user}:</strong> {comment.text}</p>
      <button className="btn-reply" onClick={() => setShowReply(!showReply)}>
        Reply
      </button>

      {showReply && (
        <div className="reply-form">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          />
          <button className="btn-primary" onClick={handleAddReply}>Submit</button>
        </div>
      )}

      <div className="replies">
        {replies.map((r) => (
          <p key={r.id} className="reply">
            <strong>{r.user}:</strong> {r.text}
          </p>
        ))}
      </div>
    </div>
  );
}
