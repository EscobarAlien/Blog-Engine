import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import BlogPost from './components/BlogPost';
import BlogPostForm from './components/BlogPostForm';
import ReactMarkdown from 'react-markdown';
import './App.css';
import post from '../../backend/models/post';
import post from '../../backend/models/post';

function App() {
    const [posts, setPosts] = useState([]);
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetchPosts();
        if(token) {
            fetchCurrentUser();
        }
        if(user && user.role === 'admin') {
            fetchAllUsers();
        }
    }, [token, user]);

    const fetchPosts = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/posts');
            setPosts(response.data);
        }
        catch(error) {
            console.error('Error fetching posts:', error);
        }
    };

    const fetchCurrentUser = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/users/current', {
                headers: { 'x-auth-token': token }
            });
            setUser(response.data);
        }
        catch(error) {
            console.error('Error fetching current user:', error);
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
        }
    };

    const fetchAllUsers = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/users', {
                headers: { 'x-auth-token': token }
            });
            setUsers(response.data);
        }
        catch(error) {
            console.error('Error fetching all users:', error);
        }
    };

    const handleCreatePost = async (postData) => {
        try {
            const response = await axios.post('http://localhost:5000/api/posts', postData, {
                headers: { 'x-auth-token': token }
            });
            setPosts([...posts, response.data]);
        }
        catch(error) {
            console.error('Error creating post:', error);
        }
    };

    const handleUpdatePost = async (id, postData) => {
        try {
            await axios.patch('http://localhost:5000/api/posts/${id}', postData, {
                headers: { 'x-auth-token': token }
            });
            fetchPosts();
        }
        catch(error) {
            console.error('Error updating post:', error);
        }
    };

    const handleDeletePost = async(id) => {
        try {
            await axios.delete('http://localhost:5000/api/posts/${id}', {
                headers: { 'x-auth-token': token }
            });
            setPosts(posts.filter(post => post._id === id));
        }
        catch(error) {
            console.error('Error deleting posts:', error);
        }
    };

    const handleRegister = async(userData) => {
        try {
            await axios.post('http://localhost:5000/api/users/register', userData);
            alert('Registration successful! Please login.');
        }
        catch(error) {
            console.error('Error registering user:', error);
            alert('Registration failed.');
        }
    };

    const handleLogin = async(userData) => {
        try {
            const response = await axios.post('http://localhost:5000/api/users/login', userData);
            localStorage.setItem('token', response.data.token);
            setToken(response.data.token);
            fetchCurrentUser();
        }
        catch(error) {
            console.error('Error logging in:', error);
            alert('login failed');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    return (
        <Router>
            <div className="App">
                <nav>
                    <ul>
                        <li><Link to="/">Home</Link></li>
                        {user ? (
                            <>
                            <li><Link to="/create">Create Post</Link></li>
                            <li><button onClick={handleLogout}>Logout</button></li>
                            {user.role === 'admin' && (
                                <li><Link to="/users">Users</Link></li>
                            )}
                            </>
                        ) : (
                            <>
                            <li><Link to="/register">Register</Link></li>
                            <li><Link to="/login">Login</Link></li>
                            </>
                        )}
                    </ul>
                </nav>

                <Routes>
                    <Route path="/" element={<Home posts={posts} />} />
                    <Route path="post/:id" element={<PostDetail posts={posts} handleDeletePost={handleDeletePost} token={token} user={user} />} />
                    <Route path="/create" element={<ProtectedRoute><CreatePost handleCreatePost={handleCreatePost} /></ProtectedRoute>} />
                    <Route path="/edit/:id" element={<ProtectedRoute><EditPost posts={posts} handleUpdatePost={handleUpdatePost} /></ProtectedRoute>} />
                    <Route path="/register" element={<Register handleRegister={handleRegister} />} />
                    <Route path="/login" element={<Login handleLogin={handleLogin} />} />
                    <Route path="/users" element={<ProtectedRoute><Users users={users} /></ProtectedRoute>} />
                </Routes>
            </div>
        </Router>
    );

    function Home({ posts }) {
        return (
            <div className="home">
                <h2>Recent Posts</h2>
                {posts.map(post => (
                    <BlogPost key={post._id} post={post} />
                ))}
            </div>
        );
    }

    function PostDetail({ posts, handleDeletePost, token, user }) {
        const { id } = useParams();
        const navigate = useNavigate();
        const post = posts.find(post => post._id === id);

        if(!post) {
            return <div>Post not found</div>;
        }

        const handleDelete = async () => {
            if(window.confirm('Are you sure you want to delete this post?')) {
                await handleDeletePost(id);
                navigate('/');
            }
        };

        return (
            <div className="post-detail">
                <h2>{post.title}</h2>
                <p className="author">By: {post.author.username}</p>
                <ReactMarkdown>{post.content}</ReactMarkdown>
                <p className="date">Created At: {new Date(post.createdAt).toLocaleDateString()}</p>
                <p className="date">Updated At: {new Date(post.UpdatedAt).toLocaleDateString()}</p>
                {token && user && (post.author._id || user._id || user.role === 'admin') && (
                    <>
                    <Link to={'/edit/${post._id}'}>Edit</Link>
                    <button onClick={handleDelete}>Delete</button>
                    </>
                )}
            </div>
        );
    }

    function CreatePost({ handleCreatePost }) {
        const navigate = useNavigate();

        const handleSubmit = async(postData) => {
            await handleCreatePost(postData);
            navigate('/');
        };

        return (
            <div>
                <h2>Create New Post</h2>
                <BlogPostForm onSubmit={handleSubmit} />
            </div>
        );
    }

    function EditPost({ posts, handleUpdatePost }) {
        const {id} = useParams();
        const navigate = useNavigate();
        const post = posts.find(post => post._id === id);

        if(!post) {
            return <div>Post not found</div>;
        }

        const handleSubmit = async(postData) => {
            await handleUpdatePost(id, postData);
            navigate('/');
        };

        return (
            <div>
                <h2>Edit Post</h2>
                <BlogPostForm onSubmit={handleSubmit} initialTitle={post.title} initialContent={post.content} />
            </div>
        );
    }

    function Register({ handleRegister }) {
        const [username, setUsername] = useState('');
        const [password, setPassword] = useState('');

        const handleSubmit = async(e) => {
            e.preventDefault();
            await handleRegister({ username, password, role: 'reader' });
        };

        return (
            <div>
                <h2>Register</h2>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>Username:</label>
                        <input type="text" value={username} onChange={e => setUsername(e.target.value)} />
                    </div>
                    <div>
                        <label>Password:</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
                    </div>
                    <button type="submit">Register</button>
                </form>
            </div>
        );
    }

    function Login({ handleLogin }) {
        const [username, setUsername] = useState('');
        const [password, setPassword] = useState('');

        const handleSubmit = async(e) => {
            e.preventDefault();
            await handleLogin({ username, password });
        };

        return (
            <div>
                <h2>Login</h2>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>Username:</label>
                        <input type="text" value={username} onChange={e => setUsername(e.target.value)} />
                    </div>
                    <div>
                        <label>Password:</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
                    </div>
                    <button type="submit">Login</button>
                </form>
            </div>
        );
    }

    function Users({ users }) {
        return (
            <div>
                <h2>Users</h2>
                <ul>
                    {users.map(user => (
                        <li key={user._id}>{user.username}({user.role})</li>
                    ))}
                </ul>
            </div>
        );
    }

    function ProtectedRoute({ children }) {
        const token = localStorage.getItem('token');
        const navigate = useNavigate();

        useEffect(() => {
            if(!token) {
                navigate('/login');
            }
        }, [token, navigate]);

        return token ? children: null;
    }
}

export default App;