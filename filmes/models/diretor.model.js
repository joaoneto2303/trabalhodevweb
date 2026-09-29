// models/diretor.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/bd');

const Diretor = sequelize.define('Diretor', {
  nome: { type: DataTypes.STRING, allowNull: false },
  nacionalidade: { type: DataTypes.STRING },
  dataNascimento: { type: DataTypes.DATEONLY },
});

module.exports = Diretor;
