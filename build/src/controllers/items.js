"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class Item {
    allitems(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const items = yield prisma.itemSearch.findMany();
                res.json(items);
            }
            catch (error) {
                console.error('Erro ao buscar itens:', error);
                throw new Error('Erro ao buscar itens');
            }
        });
    }
    itemsearch(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { query } = req.query;
            const userId = parseInt(req.userId);
            try {
                const userLists = yield prisma.lists.findMany({
                    where: {
                        userId: userId,
                    }
                });
                if (!userLists || userLists.length === 0) {
                    return res.status(404).json({ message: 'Nenhuma lista encontrada para o usuário logado.' });
                }
                const items = yield prisma.itemSearch.findMany({
                    where: {
                        itemName: {
                            // Realiza a busca insensível a maiúsculas/minúsculas
                            contains: [query].toString().toLowerCase(),
                        },
                    },
                });
                res.json(items);
            }
            catch (error) {
                console.error('Erro ao buscar itens:', error);
                res.status(500).json({ error: 'Erro ao buscar itens' });
            }
        });
    }
    ;
    updateItem(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { listId, itemId } = req.params;
            const { name, quantity, unit, price, status } = req.body;
            const userId = parseInt(req.userId); // Obtém o ID do usuário do token JWT
            try {
                // Verifica se o item pertence à lista associada ao usuário logado
                const existingItem = yield prisma.item.findFirst({
                    where: {
                        id: parseInt(itemId),
                        listId: parseInt(listId),
                        list: {
                            userId: userId,
                        },
                    },
                });
                if (!existingItem) {
                    return res.status(404).json({ error: 'Item não encontrado ou não pertence à lista do usuário.' });
                }
                // Atualiza os campos do item
                const updatedItem = yield prisma.item.update({
                    where: {
                        id: parseInt(itemId),
                    },
                    data: {
                        name: name || existingItem.name,
                        quantity: quantity || existingItem.quantity,
                        unit: unit || existingItem.unit,
                        price: price || existingItem.price,
                        status: status || existingItem.status,
                    },
                });
                res.json(updatedItem);
            }
            catch (error) {
                console.error('Erro ao atualizar item:', error);
                res.status(500).json({ error: 'Erro ao atualizar item' });
            }
        });
    }
}
exports.default = new Item();
