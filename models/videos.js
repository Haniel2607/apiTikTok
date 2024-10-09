const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    titulo: String,
    descricao: String,
    url: String,
    usuario: mongoose.Schema.Types.ObjectId,
    comentarios: [mongoose.Schema.Types.ObjectId]
});

const Video = mongoose.model('Video', videoSchema);

module.exports = Video;