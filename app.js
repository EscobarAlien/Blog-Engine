const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB conneted'))
.catch(err => console.log(err));

const postsRouter = require('./routes/posts');
const usersRouter = require('./routes/users');

app.use('/api/posts', postsRouter);
app.use('/api/users', usersRouter);

app.listen(port, () => {
    console.log('Server is running on port: ${port}');
});