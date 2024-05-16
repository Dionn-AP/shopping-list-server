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
            //const userId = parseInt(req.userId);
            try {
                const items = yield prisma.itemSearch.findMany({
                    where: {
                        itemName: {
                            // Realiza a busca insensível a maiúsculas/minúsculas
                            contains: query, mode: 'insensitive'
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
    ;
    deleteItems(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { listId } = req.params;
            const { itemIds } = req.body; // Lista de IDs dos itens a serem excluídos
            const userId = parseInt(req.userId); // Obtém o ID do usuário do token JWT
            try {
                // Verifica se os itens pertencem à lista associada ao usuário logado
                const existingItems = yield prisma.item.findMany({
                    where: {
                        id: { in: itemIds.map((id) => parseInt(id)) },
                        listId: parseInt(listId),
                        list: {
                            userId: userId,
                        },
                    },
                });
                if (existingItems.length !== itemIds.length) {
                    return res.status(404).json({ error: 'Um ou mais itens não foram encontrados ou não pertencem à lista do usuário.' });
                }
                // Exclui os itens
                const deletedItems = yield prisma.item.deleteMany({
                    where: {
                        id: { in: itemIds.map((id) => parseInt(id)) },
                    },
                });
                res.json({ message: `${deletedItems.count} itens foram excluídos.` });
            }
            catch (error) {
                console.error('Erro ao excluir itens:', error);
                res.status(500).json({ error: 'Erro ao excluir itens' });
            }
        });
    }
}
exports.default = new Item();
