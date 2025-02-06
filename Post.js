const mongoose = require('mongoose')

const postSchema = new postSchema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    aurthor: { type: mongoose.Schema.Types.objectId, ref: 'User', required: true },
    createdAt: { type: Date, required: Date.now },
    UpdatedAt: { type: Date, required: Date.now }
});

module.exports = mongoose.model('Post', postSchema);