import React, { useState } from 'react';

interface Post {
  id: number;
  author: string;
  content: string;
  comments: string[];
}

const initialPosts: Post[] = [
  { id: 1, author: 'Admin', content: 'Welcome to the Kisan Community!', comments: ['Thank you!', 'Glad to be here!'] }
];

const Community: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [newPost, setNewPost] = useState('');
  const [comment, setComment] = useState('');
  const [activePost, setActivePost] = useState<number | null>(null);

  const handleAddPost = () => {
    if (!newPost.trim()) return;
    setPosts([
      { id: Date.now(), author: 'User', content: newPost, comments: [] },
      ...posts
    ]);
    setNewPost('');
  };

  const handleAddComment = (postId: number) => {
    if (!comment.trim()) return;
    setPosts(posts.map(post =>
      post.id === postId
        ? { ...post, comments: [...post.comments, comment] }
        : post
    ));
    setComment('');
    setActivePost(null);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Kisan Community Forum</h2>
      <div className="mb-4 flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2"
          placeholder="Share something..."
          value={newPost}
          onChange={e => setNewPost(e.target.value)}
        />
        <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={handleAddPost}>Post</button>
      </div>
      <div className="space-y-6">
        {posts.map(post => (
          <div key={post.id} className="bg-white rounded shadow p-4">
            <div className="font-semibold text-green-700">{post.author}</div>
            <div className="my-2 text-gray-800">{post.content}</div>
            <div className="mt-2">
              <button
                className="text-sm text-blue-600 hover:underline"
                onClick={() => setActivePost(post.id)}
              >Comment</button>
              {activePost === post.id && (
                <div className="flex gap-2 mt-2">
                  <input
                    className="flex-1 border rounded px-2 py-1"
                    placeholder="Write a comment..."
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                  />
                  <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={() => handleAddComment(post.id)}>Add</button>
                </div>
              )}
              <div className="mt-2 space-y-1">
                {post.comments.map((c, i) => (
                  <div key={i} className="text-gray-600 text-sm pl-2 border-l-2 border-green-200">{c}</div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Community;
