import { Router } from "express";

import authMiddleware from "./middleware/auth";
import User from "./controllers/user";
import Login from './controllers/login';
import Item from './controllers/items';
import Lists from './controllers/lists';

const router = Router();

//user
router.post('/user', User.createuser);
router.post('/login', Login.authenticate);


//routes authenticated
router.get('/user', authMiddleware, User.user);
router.put('/user', authMiddleware, User.updateuser);
router.delete('/user/:id', authMiddleware, User.deleteuser);
router.patch('/tutorial', authMiddleware, User.tutorial);

router.get('/items/search', authMiddleware, Item.itemsearch);
router.get('/items', authMiddleware, Item.allitems);
router.put('/lists/:listId/items/:itemId/update', authMiddleware, Item.updateItem);

router.post('/create/list', authMiddleware, Lists.createlist);
router.patch('/update/list/:listId', authMiddleware, Lists.updateListStatus);
router.get('/lists', authMiddleware, Lists.lists);
router.get('/lists/search', authMiddleware, Lists.getListByName);
router.post('/lists/:listId/addItem', authMiddleware, Lists.addItemToList);


export default router;