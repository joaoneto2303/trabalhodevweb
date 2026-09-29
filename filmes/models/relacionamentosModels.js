// models/relacionamentosModels.js
// Centraliza os relacionamentos entre os modelos e exporta todos eles.
const Artista = require('./artista.model');
const Diretor = require('./diretor.model');
const Filme = require('./filme.model');
const FichaTecnica = require('./fichatecnica.model');

// 1:N -> um Diretor dirige vários Filmes
Diretor.hasMany(Filme, { foreignKey: 'diretorId' });
Filme.belongsTo(Diretor, { foreignKey: 'diretorId' });

// 1:1 -> um Filme possui uma Ficha Técnica
Filme.hasOne(FichaTecnica, { foreignKey: 'filmeId' });
FichaTecnica.belongsTo(Filme, { foreignKey: 'filmeId' });

// N:N -> Filmes têm vários Artistas (elenco) e vice-versa
Filme.belongsToMany(Artista, { through: 'Elenco', foreignKey: 'filmeId' });
Artista.belongsToMany(Filme, { through: 'Elenco', foreignKey: 'artistaId' });

module.exports = { Artista, Diretor, Filme, FichaTecnica };
