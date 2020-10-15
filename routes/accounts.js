import express from 'express';
import { promises as fs } from 'fs';

const { readFile, writeFile } = fs;

const router = express.Router();


//metodo POST para cadastrar um conteudo
router.post('/', async (req, res, next) => {
  try {
    let account = req.body;
    const data = JSON.parse(await readFile(global.fileName));
    
    account = { id: data.nextId++, ...account};
    data.accounts.push(account);

    await writeFile(global.fileName, JSON.stringify(data, null, 2));

    res.send(account);
  } catch (err) {
    next(err);
  }
  
});

//metodo GET para listar todos os conteudos
router.get('/', async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(global.fileName));
    delete data.nextId;
    res.send(data);
  } catch (err) {
    next(err);
  }
});

//metodo GET com parametro para listar apenas um conteudo  de id especifico
router.get('/:id', async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(global.fileName));
    const account = data.accounts.find(
      account => account.id ===  parseInt(req.params.id))
    res.send(account);
  } catch (err) {
    next(err);
  }
});

//metodo DELETE para deletar um conteudo recebendo id como parametro
router.delete('/:id', async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(global.fileName));
    data.accounts = data.accounts.filter(
      account => account.id !== parseInt(req.params.id));
    
    await writeFile(global.fileName, JSON.stringify(data, null, 2));

    res.end();
  } catch (err) {
    next(err);
  }
});

//o metodo PUT utilizamos quando queremos atualizar todo um conteudo
router.put('/', async (req, res, next) => {
  try {
    const account = req.body;

    const data = JSON.parse(await readFile(global.fileName));
    const index = data.accounts.findIndex(a => a.id === account.id);

    data.accounts[index] = account;

    await writeFile(global.fileName, JSON.stringify(data));
    
    res.send(account);
  } catch (err) {
    next(err);
  }
});

//o metodo PATH utilizamos quando queremos apenas atualizar um valor parcial
router.patch('/updateBalance', async (req, res, next) => {
  try {
    const account = req.body;

    const data = JSON.parse(await readFile(global.fileName));
    const index = data.accounts.findIndex(a => a.id === account.id);

    data.accounts[index].balance = account.balance;

    await writeFile(global.fileName, JSON.stringify(data));
    
    res.send(data.accounts[index]);
  } catch (err) {
    next(err);
  }
});


//tratamento de erros generico para todos os endpoints  
router.use((err, req, res, next) => {
  console.log(err);
  res.status(400).send({ error: err.message });
});

export default router;