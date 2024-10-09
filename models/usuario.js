const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
    email: String,
    senha: String,
    videos: [mongoose.Schema.Types.ObjectId]
});

const Usuario = mongoose.model('Usuario', usuarioSchema);

module.exports = Usuario;