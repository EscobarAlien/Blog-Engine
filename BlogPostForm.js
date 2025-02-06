import React, {useState,useMemo} from 'react';
import simpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";

const BlogPostForm = ({ onSubmit, initialTitle = '', initialContent = '' }) => {
    const [title, setTitle] = useState(initialTitle);
    const [content, setContent] = useState(initialContent);

    const handleChange = (value) => {
        setContent(value);
    };

    const options = useMemo(() => {
        return {
            autofocus: true,
            spellChecker: false,
        };
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ title, content });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="title">Title:</label>
                <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                />
            </div>
            <div>
                <label htmlFor="content">Content:</label>
                <simpleMDE
                value={context}
                onChange={handleChange}
                options={options}
                />
            </div>
            <button type="submit">Submit</button>
        </form>
    );
};

export default BlogPostForm;