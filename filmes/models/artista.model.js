// models/artista.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/bd');

const Artista = sequelize.define('Artista', {
  nome: { type: DataTypes.STRING, allowNull: false },
  nacionalidade: { type: DataTypes.STRING },
  dataNascimento: { type: DataTypes.DATEONLY },
  // Status exibido como Badge: Ativo | Aposentado | Falecido
  status: { type: DataTypes.STRING, defaultValue: 'Ativo' },
});

module.exports = Artista;
