const express = require('express');
const routerSeg = express.Router();
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');

const knexConfig = require('../knexfile');
//const { token } = require('morgan');
const knex = require('knex')(knexConfig.development);

// processa o corpo da requisição e insere os dados recebidos 
// como atributos de req.body
routerSeg.use(express.json());
routerSeg.use(express.urlencoded({ extended: true }))

routerSeg.post ('/register', (req, res) => { 



  knex ('usuarios') 
  .insert({
  nome: req.body.nome, 
  login: req.body.login, 
  senha: bcrypt.hashSync(req.body.senha, 8), 
  email: req.body.email,
  roles: req.body.roles
  }, ['id'])
  .then((result) => { 
  let usuarios = result[0] 
  res.status(200).json({"id": usuarios.id }) 
  return
  })
  .catch(err => { 
  res.status(500).json({ 
  message: 'Erro ao registrar usuario - ' + err.message })
  }) 
  
 })


routerSeg.post('/login', (req, res) => {
  const { login, senha } = req.body;
  knex('usuarios').where({ 'login': login })
    .then((dados) => {
      if (dados.length > 0) {
        if (dados[0].senha != senha) {
          res.status(401).json({ message: 'Usuario ou senha inválido!' })
        }
        else {
          jwt.sign({ id: dados[0].id, roles: dados[0].roles },
            process.env.SECRET_KEY,
            { algorithm: 'HS256' },
            (err, token) => {
              if (err)
                res.status(500).json(` { message: 'Erro ao criar o token: ${err.message} '}`)
              else res.status(200).json(`{
                  message: "Autenticação realizada com sucesso", 
                  token: ${token}
              }`)
            })
        }
      }
      else {
        res.status(401).json({ message: 'Usuario ou senha inválido!' })
      }
    })
    .catch((err) => {
      res.status(500).json({ message: `Erro ao obter os usuários: ${err.message}` });
    })
})

module.exports = routerSeg;