const mongoose = require('mongoose');

const comentarioSchema = new mongoose.Schema({
    texto: String,
    usuario: mongoose.Schema.Types.ObjectId,
    video: mongoose.Schema.Types.ObjectId
});

const Comentario = mongoose.model('Comentario', comentarioSchema);

module.exports = Comentario;