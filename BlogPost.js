import React from 'react';
import ReactMarkdown from 'react-markdown'; // Import ReactMarkdown
import { Link } from 'react-router-dom';

const BlogPost = ({ post }) => {
    return (
        <div className="blog-post">
            <h3><Link to={`/post/${post._id}`}>{post.title}</Link></h3>
            <p className="author">By: {post.author.username}</p>
            <ReactMarkdown>{post.content}</ReactMarkdown>
            <p className="date">Created At: {new Date(post.createdAt).toLocaleDateString()}</p>
            <p className="date">Updated At: {new Date(post.updatedAt).toLocaleDateString()}</p>
        </div>
    );
};

export default BlogPost;