// config/bd.js
// Conexão com o banco via Sequelize. Usamos SQLite para não exigir servidor de banco.
// Para MySQL/Postgres, troque o "dialect" e informe host, usuário e senha.
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './catalogo.sqlite',
  logging: false,
});

module.exports = sequelize;
