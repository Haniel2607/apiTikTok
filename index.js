const express = require('express');
const app = express();
const crypto = require('crypto');
const mongoose = require('mongoose');
const Usuario = require('./models/usuario');
const Comentario = require('./models/comentarios');
const Video = require('./models/videos');

// Criando função para criptografar senhas
const cipher = {
    algorithm: "aes256",
    secret: "chaves",
    type: "hex"
};

async function getCrypto(password) {
    return new Promise((resolve, reject) => {
        const cipherStream = crypto.createCipher(cipher.algorithm, cipher.secret);
        let encryptedData = '';

        cipherStream.on('readable', () => {
            let chunk;
            while (null !== (chunk = cipherStream.read())) {
                encryptedData += chunk.toString(cipher.type);
            }
        });

        cipherStream.on('end', () => {
            resolve(encryptedData);
        });

        cipherStream.on('error', (error) => {
            reject(error);
        });

        cipherStream.write(password);
        cipherStream.end();
    });
}

// Configurando API para ler JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Conectar ao MongoDB
mongoose.connect('mongodb://localhost:27017/apiTikTok', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Conectado ao MongoDB'))
    .catch(err => console.error('Erro ao conectar ao MongoDB', err));

// Rotas de exemplo
app.post('/usuario', async (req, res) => {
    const { email, senha } = req.body;
    const senhaCriptografada = await getCrypto(senha);
    const usuario = new Usuario({ email, senha: senhaCriptografada });
    await usuario.save();
    res.status(201).send({ message: 'Usuário criado com sucesso', usuario });
});

app.get('/usuario', async (req, res) => {
    const usuarios = await Usuario.find();
    res.status(200).send(usuarios);
});

// Rota para criar um vídeo
app.post('/video', async (req, res) => {
    try {
        const { titulo, descricao, url, usuarioId } = req.body;
        const usuario = await Usuario.findById(usuarioId);
        if (!usuario) {
            return res.status(404).send({ message: 'Usuário não encontrado' });
        }

        const video = new Video({ titulo, descricao, url, usuario: usuarioId });
        await video.save();

        // Adicionar o vídeo ao usuário
        usuario.videos.push(video._id);
        await usuario.save();

        res.status(201).send({ message: 'Vídeo criado com sucesso', video });
    } catch (error) {
        res.status(500).send({ message: 'Erro ao criar vídeo', error });
    }
});

// Rota para obter todos os vídeos
app.get('/video', async (req, res) => {
    try {
        const videos = await Video.find().populate('usuario').populate('comentarios');
        res.status(200).send(videos);
    } catch (error) {
        res.status(500).send({ message: 'Erro ao obter vídeos', error });
    }
});

// Rota para obter um vídeo específico
app.get('/video/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const video = await Video.findById(id).populate('usuario').populate('comentarios');
        if (!video) {
            return res.status(404).send({ message: 'Vídeo não encontrado' });
        }
        res.status(200).send(video);
    } catch (error) {
        res.status(500).send({ message: 'Erro ao obter vídeo', error });
    }
});

// Rota para atualizar um vídeo
app.patch('/video/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, descricao, url } = req.body;
        const video = await Video.findByIdAndUpdate(id, { titulo, descricao, url }, { new: true });
        if (!video) {
            return res.status(404).send({ message: 'Vídeo não encontrado' });
        }
        res.status(200).send({ message: 'Vídeo atualizado com sucesso', video });
    } catch (error) {
        res.status(500).send({ message: 'Erro ao atualizar vídeo', error });
    }
});

// Rota para deletar um vídeo
app.delete('/video/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const video = await Video.findByIdAndDelete(id);
        if (!video) {
            return res.status(404).send({ message: 'Vídeo não encontrado' });
        }
        res.status(200).send({ message: 'Vídeo deletado com sucesso' });
    } catch (error) {
        res.status(500).send({ message: 'Erro ao deletar vídeo', error });
    }
});

// Rota para criar um comentário
app.post('/comentario', async (req, res) => {
    try {
        const { texto, usuarioId, videoId } = req.body;
        const usuario = await Usuario.findById(usuarioId);
        const video = await Video.findById(videoId);

        if (!usuario) {
            return res.status(404).send({ message: 'Usuário não encontrado' });
        }

        if (!video) {
            return res.status(404).send({ message: 'Vídeo não encontrado' });
        }

        const comentario = new Comentario({ texto, usuario: usuarioId, video: videoId });
        await comentario.save();

        // Adicionar o comentário ao vídeo
        video.comentarios.push(comentario._id);
        await video.save();

        res.status(201).send({ message: 'Comentário criado com sucesso', comentario });
    } catch (error) {
        res.status(500).send({ message: 'Erro ao criar comentário', error });
    }
});

// Rota para obter todos os comentários
app.get('/comentario', async (req, res) => {
    try {
        const comentarios = await Comentario.find().populate('usuario').populate('video');
        res.status(200).send(comentarios);
    } catch (error) {
        res.status(500).send({ message: 'Erro ao obter comentários', error });
    }
});

// Rota para obter um comentário específico
app.get('/comentario/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const comentario = await Comentario.findById(id).populate('usuario').populate('video');
        if (!comentario) {
            return res.status(404).send({ message: 'Comentário não encontrado' });
        }
        res.status(200).send(comentario);
    } catch (error) {
        res.status(500).send({ message: 'Erro ao obter comentário', error });
    }
});

// Rota para atualizar um comentário
app.patch('/comentario/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { texto } = req.body;
        const comentario = await Comentario.findByIdAndUpdate(id, { texto }, { new: true });
        if (!comentario) {
            return res.status(404).send({ message: 'Comentário não encontrado' });
        }
        res.status(200).send({ message: 'Comentário atualizado com sucesso', comentario });
    } catch (error) {
        res.status(500).send({ message: 'Erro ao atualizar comentário', error });
    }
});

// Rota para deletar um comentário
app.delete('/comentario/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const comentario = await Comentario.findByIdAndDelete(id);
        if (!comentario) {
            return res.status(404).send({ message: 'Comentário não encontrado' });
        }
        res.status(200).send({ message: 'Comentário deletado com sucesso' });
    } catch (error) {
        res.status(500).send({ message: 'Erro ao deletar comentário', error });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;