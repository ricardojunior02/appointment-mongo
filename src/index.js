require('dotenv').config();
require('express-async-errors');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const AppError = require('../AppError');
const AppointmentService = require('./services/AppointmentService');

mongoose.connect('mongodb://localhost:27017/agendamento', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.set('useFindAndModify', false);

const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.get('/', (req, res) => {
  return res.render('index.ejs');
});

app.get('/cadastro', (req, res) => {
  return res.render('create.ejs');
});

app.post('/create', async (req, res) => {
  const data = req.body;

  await AppointmentService.Create({
    name: data.name,
    email: data.email,
    description: data.description,
    cpf: data.cpf,
    time: data.time,
    finished: false,
    date: data.date,
    notified: false,
  });

  return res.redirect('/')
});

app.get('/getappointments', async (req, res) => {
  const appointments = await AppointmentService.GetAll(false);

  return res.json(appointments);
});

app.get('/event/:id', async (req, res) => {
  const id = req.params.id;

  const appointment = await AppointmentService.GetOne(id);

  return res.render('event.ejs', { appointment })
});

app.post('/finish', async (req, res) => {
  const id = req.body.id;

  const status = await AppointmentService.Finish(id);

  if(status){
    return res.redirect('/');
  }
});

app.get('/listappointments', async (req, res) => {
  const appointments = await AppointmentService.GetAll(true);
  return res.render('list.ejs', { appointments })
});

app.get('/search', async (req, res) => {
  const appointments = await AppointmentService.Search(req.query.search);
  return res.render('list.ejs', { appointments });
});

const pullTime = 1000 * 60 * 5;

setInterval( async () => {
  await AppointmentService.SendNotification();
}, pullTime);

app.use((err, req, res, next) => {
  if(err instanceof AppError){
    return res.status(err.status).json({
      status: err.status,
      message: err.message
    });
  }

  return res.status(500).json({ message: 'Erro interno no servidor'});
});

app.listen(3333, () => console.log('Server Running...'));