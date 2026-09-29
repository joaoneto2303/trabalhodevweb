// models/fichatecnica.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/bd');

const FichaTecnica = sequelize.define('FichaTecnica', {
  roteiro: { type: DataTypes.STRING },
  produtora: { type: DataTypes.STRING },
  idioma: { type: DataTypes.STRING },
  paisOrigem: { type: DataTypes.STRING },
  classificacao: { type: DataTypes.STRING }, // ex.: Livre, 12, 14, 16, 18
  orcamento: { type: DataTypes.FLOAT },      // em milhões de dólares
});

module.exports = FichaTecnica;
