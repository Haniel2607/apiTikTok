//config inicial
const express = require('express');
const app = express();
const crypto = require('crypto');
const mongoose = require('mongoose');
const usuario = require('./models/usuario');
const comentarios = require('./models/comentarios');
const videos = require('./models/videos');


//Criando função p/ criptografar senhas
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


//Configurando API para ler JSON
app.use(
    express.urlencoded({
        extended: true
    }),
)

app.use(express.json());

//primeira rota
app.get('/', (req, res) => {
    res.json({ message: "rodou" })
})

//Create
app.post('/usuario', async (req, res) => {
    let { email, senha } = req.body;
    try {
        let novaSenha = await getCrypto(senha);
        const usuario = {
            email,
            senha: novaSenha,
        };
        await usuario.create(usuario);
        res.status(201).json({ message: "Usuário criado com sucesso" });
    } catch (error) {
        res.status(500).json({ error: error });
    }
});

//Read
app.get('/usuario', async (req, res) => {
    try {
        const people = await usuario.find();
        res.status(200).json(people)
    } catch (error) {
        res.status(500).json({ error: error })
    }
})

//Read by ID
app.get('/usuario/:id', async (req, res) => {
    const { id } = req.params.id

    try {
        const people = await usuario.findOne({ _id: id });

        if (people) {
            res.status(422).json({ message: "Usuário não encontrado" })
            return
        }
        res.status(200).json(people)
    } catch (error) {
        res.status(500).json({ error: error })
    }
})

//Update
app.patch("/usuario/id", async (req, res) => {
    const id = req.params.id
    const { email, senha } = req.body;

    const usuario = {
        email,
        senha
    }
    try {
        const updateUsuario = await usuario.updateOne({ _id: id }, usuario);

        if (updateUsuario.matchedCount === 0) {
            res.status(422).json({ message: "Usuário não encontrado" })
            return
        }
        res.status(200).json(person)
    } catch (error) {
        res.status(500).json({ error: error })
    }
});

//Delete
app.delete('/usuario/:id', async (req, res) => {
    const id = req.params.id
    const usuario = await usuario.findOne({ _id: id })

    if (!usuario) {
        res.status(422).json({ message: "Usuário não encontrado" })
        return;
    }
    try {
        await usuario.deleteOne({ _id: id })
        res.status(200).json({ message: "Usuário deletado com sucesso" })
    } catch (error) {
        res.status(500).json({ error: error })
    }
});

//Login do usuário
app.post('/login', async (req, res) => {
    let { email, senha } = req.body;
    try {
        let encryptedPass = await getCrypto(senha);
        const usuario = await usuario.findOne({ email, senha: encryptedPass });
        if (!usuario) {
            res.status(422).json({ message: 'Email ou senha incorreta, tente novamente!' });
            return;
        }
        res.status(200).json({ message: 'Login realizado com sucesso!', user: usuario });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

//conexão com o banco de dados
mongoose.connect("mongodb://localhost:27017").then(() => {
    console.log("Conectado com sucesso")
    app.listen(3000)
})
    .catch((err) => {
        console.log(err)
    })



