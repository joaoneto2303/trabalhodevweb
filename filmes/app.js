// app.js
// Servidor Express + Handlebars. Rotas e "controllers" ficam aqui para manter a árvore enxuta.
const express = require('express');
const { engine } = require('express-handlebars');
const sequelize = require('./config/bd');
const { Artista, Diretor, Filme, FichaTecnica } = require('./models/relacionamentosModels');

const app = express();
app.use(express.urlencoded({ extended: true }));

// ---------- Handlebars ----------
app.engine('handlebars', engine({
  helpers: {
    // Formata AAAA-MM-DD como DD/MM/AAAA
    data: (d) => (d ? d.split('-').reverse().join('/') : '-'),
    // Cor do Badge de status do artista
    corStatus: (s) => ({ Ativo: 'success', Aposentado: 'secondary', Falecido: 'dark' }[s] || 'secondary'),
  },
}));
app.set('view engine', 'handlebars');
app.set('views', './views');

// ---------- Alert: mensagem via query string (?msg=...&tipo=success) ----------
app.use((req, res, next) => {
  const tiposValidos = ['success', 'danger', 'warning', 'info'];
  if (req.query.msg) {
    res.locals.aviso = {
      texto: req.query.msg,
      tipo: tiposValidos.includes(req.query.tipo) ? req.query.tipo : 'info',
    };
  }
  next();
});

// Converte instâncias Sequelize em objetos simples (exigido pelo Handlebars)
const plano = (lista) => lista.map((i) => i.get({ plain: true }));
const redirecionar = (res, rota, msg, tipo = 'success') =>
  res.redirect(`${rota}?msg=${encodeURIComponent(msg)}&tipo=${tipo}`);

// ---------- HOME ----------
app.get('/', async (req, res) => {
  const [filmes, artistas, diretores, fichas] = await Promise.all([
    Filme.count(), Artista.count(), Diretor.count(), FichaTecnica.count(),
  ]);
  const destaques = plano(await Filme.findAll({ include: Diretor, order: [['createdAt', 'DESC']], limit: 3 }));
  res.render('home', { contadores: { filmes, artistas, diretores, fichas }, destaques });
});

// ---------- FILMES ----------
app.get('/filmes', async (req, res) => {
  const filmes = plano(await Filme.findAll({ include: Diretor, order: [['titulo', 'ASC']] }));
  res.render('filmes', { filmes });
});

app.get('/filmes/cadastrar', async (req, res) => {
  res.render('cadastrarFilme', {
    diretores: plano(await Diretor.findAll({ order: [['nome', 'ASC']] })),
    artistas: plano(await Artista.findAll({ order: [['nome', 'ASC']] })),
  });
});

app.post('/filmes/cadastrar', async (req, res) => {
  try {
    const { titulo, genero, ano, duracao, sinopse, diretorId, artistas } = req.body;
    const filme = await Filme.create({ titulo, genero, ano, duracao, sinopse, diretorId: diretorId || null });
    if (artistas) await filme.setArtistas([].concat(artistas)); // aceita 1 ou vários valores
    redirecionar(res, '/filmes', 'Filme cadastrado com sucesso!');
  } catch (e) {
    redirecionar(res, '/filmes/cadastrar', 'Erro ao cadastrar o filme.', 'danger');
  }
});

app.get('/filmes/:id', async (req, res) => {
  const filme = await Filme.findByPk(req.params.id, { include: [Diretor, FichaTecnica, Artista] });
  if (!filme) return redirecionar(res, '/filmes', 'Filme não encontrado.', 'warning');
  res.render('detalharFilme', { filme: filme.get({ plain: true }) });
});

// ---------- ARTISTAS ----------
app.get('/artistas', async (req, res) => {
  res.render('artistas', { artistas: plano(await Artista.findAll({ order: [['nome', 'ASC']] })) });
});

app.get('/artistas/cadastrar', (req, res) => res.render('cadastrarArtista'));

app.post('/artistas/cadastrar', async (req, res) => {
  try {
    await Artista.create(req.body);
    redirecionar(res, '/artistas', 'Artista cadastrado com sucesso!');
  } catch (e) {
    redirecionar(res, '/artistas/cadastrar', 'Erro ao cadastrar o artista.', 'danger');
  }
});

app.get('/artistas/:id', async (req, res) => {
  const artista = await Artista.findByPk(req.params.id, { include: Filme });
  if (!artista) return redirecionar(res, '/artistas', 'Artista não encontrado.', 'warning');
  res.render('detalharArtista', { artista: artista.get({ plain: true }) });
});

// ---------- DIRETORES ----------
app.get('/diretores', async (req, res) => {
  const diretores = plano(await Diretor.findAll({ include: Filme, order: [['nome', 'ASC']] }));
  res.render('diretores', { diretores });
});

app.get('/diretores/cadastrar', (req, res) => res.render('cadastrarDiretor'));

app.post('/diretores/cadastrar', async (req, res) => {
  try {
    await Diretor.create(req.body);
    redirecionar(res, '/diretores', 'Diretor cadastrado com sucesso!');
  } catch (e) {
    redirecionar(res, '/diretores/cadastrar', 'Erro ao cadastrar o diretor.', 'danger');
  }
});

app.get('/diretores/:id', async (req, res) => {
  const diretor = await Diretor.findByPk(req.params.id, { include: Filme });
  if (!diretor) return redirecionar(res, '/diretores', 'Diretor não encontrado.', 'warning');
  res.render('detalharDiretor', { diretor: diretor.get({ plain: true }) });
});

// ---------- FICHAS TÉCNICAS ----------
app.get('/fichas', async (req, res) => {
  const fichas = plano(await FichaTecnica.findAll({ include: Filme }));
  res.render('fichasTecnicas', { fichas });
});

app.get('/fichas/cadastrar', async (req, res) => {
  res.render('cadastrarFichaTecnica', { filmes: plano(await Filme.findAll({ order: [['titulo', 'ASC']] })) });
});

app.post('/fichas/cadastrar', async (req, res) => {
  try {
    const existente = await FichaTecnica.findOne({ where: { filmeId: req.body.filmeId } });
    if (existente) return redirecionar(res, '/fichas/cadastrar', 'Esse filme já possui ficha técnica.', 'warning');
    await FichaTecnica.create(req.body);
    redirecionar(res, '/fichas', 'Ficha técnica cadastrada com sucesso!');
  } catch (e) {
    redirecionar(res, '/fichas/cadastrar', 'Erro ao cadastrar a ficha técnica.', 'danger');
  }
});

app.get('/fichas/:id', async (req, res) => {
  const ficha = await FichaTecnica.findByPk(req.params.id, { include: Filme });
  if (!ficha) return redirecionar(res, '/fichas', 'Ficha técnica não encontrada.', 'warning');
  res.render('detalharFichaTecnica', { ficha: ficha.get({ plain: true }) });
});

// ---------- Inicialização ----------
sequelize.sync().then(() => {
  app.listen(3000, () => console.log('Catálogo rodando em http://localhost:3000'));
});
