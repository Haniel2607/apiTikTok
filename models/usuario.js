const mongoose = require('mongoose');

const usuario = mongoose.model('usuario', {
    email: String,
    senha: String
});

module.exports = usuario;