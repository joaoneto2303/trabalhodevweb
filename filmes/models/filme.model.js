// models/filme.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/bd');

const Filme = sequelize.define('Filme', {
  titulo: { type: DataTypes.STRING, allowNull: false },
  genero: { type: DataTypes.STRING },
  ano: { type: DataTypes.INTEGER },
  duracao: { type: DataTypes.INTEGER }, // em minutos
  sinopse: { type: DataTypes.TEXT },
});

module.exports = Filme;
