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
class Lists {
    createlist(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, items } = req.body;
            const userId = parseInt(req.userId); // Obtém o ID do usuário do token JWT
            try {
                // Cria a lista no banco de dados associada ao usuário logado
                const newList = yield prisma.lists.create({
                    data: {
                        name,
                        user: {
                            connect: { id: userId } // Conecta a lista ao usuário logado
                        },
                        items: {
                            createMany: {
                                data: items // Cria vários itens associados à lista
                            }
                        }
                    },
                    include: {
                        items: true // Inclui os itens criados na resposta
                    }
                });
                res.json(newList);
            }
            catch (error) {
                console.error('Erro ao criar lista:', error);
                res.status(500).json({ error: 'Erro ao criar lista' });
            }
        });
    }
}
exports.default = new Lists();
