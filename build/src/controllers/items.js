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
            try {
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
}
exports.default = new Item();
