import * as service from '../services/utilisateur.service.js';

export async function list(req, res, next) {
  try {
    res.json(await service.findAll());
  } catch (error) {
    next(error);
  }
}

export async function get(req, res, next) {
  try {
    const item = await service.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'utilisateur introuvable.' });
    }
    res.json(item);
  } catch (error) {
    next(error);
  }
}

export async function create(req, res, next) {
  try {
    res.status(201).json(await service.create(req.body));
  } catch (error) {
    next(error);
  }
}

export async function update(req, res, next) {
  try {
    const item = await service.update(req.params.id, req.body);
    if (!item) {
      return res.status(404).json({ message: 'utilisateur introuvable.' });
    }
    res.json(item);
  } catch (error) {
    next(error);
  }
}

export async function remove(req, res, next) {
  try {
    res.json(await service.remove(req.params.id));
  } catch (error) {
    next(error);
  }
}
