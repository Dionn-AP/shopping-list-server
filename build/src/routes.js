"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("./middleware/auth"));
const user_1 = __importDefault(require("./controllers/user"));
const login_1 = __importDefault(require("./controllers/login"));
const items_1 = __importDefault(require("./controllers/items"));
const lists_1 = __importDefault(require("./controllers/lists"));
const router = (0, express_1.Router)();
//user
router.post('/user', user_1.default.createuser);
router.post('/login', login_1.default.authenticate);
//routes authenticated
router.get('/user', auth_1.default, user_1.default.user);
router.put('/user', auth_1.default, user_1.default.updateuser);
router.delete('/user/:id', auth_1.default, user_1.default.deleteuser);
router.patch('/tutorial', auth_1.default, user_1.default.tutorial);
router.get('/items/search', auth_1.default, items_1.default.itemsearch);
router.get('/items', auth_1.default, items_1.default.allitems);
router.delete('/lists/:listId/items/delete', auth_1.default, items_1.default.deleteItems);
router.patch('/lists/:listId/items', auth_1.default, items_1.default.updateItem);
router.post('/create/list', auth_1.default, lists_1.default.createlist);
router.patch('/update/list/:listId', auth_1.default, lists_1.default.updateListStatus);
router.get('/lists', auth_1.default, lists_1.default.lists);
router.get('/lists/search', auth_1.default, lists_1.default.getListByName);
router.post('/lists/:listId/addItem', auth_1.default, lists_1.default.addItemToList);
router.delete('/lists/:listId', auth_1.default, lists_1.default.deleteList);
exports.default = router;
