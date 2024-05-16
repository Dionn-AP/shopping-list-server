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
            const { name, items, statusList } = req.body;
            const userId = parseInt(req.userId); // Obtém o ID do usuário do token JWT
            try {
                // Cria a lista no banco de dados associada ao usuário logado
                const newList = yield prisma.lists.create({
                    data: {
                        name,
                        statusList,
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
    ;
    updateListStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { statusList } = req.body;
            const { listId } = req.params;
            const userId = parseInt(req.userId); // Obtém o ID do usuário do token JWT
            try {
                // Verificar se a lista pertence ao usuário logado
                const existingList = yield prisma.lists.findUnique({
                    where: {
                        id: parseInt(listId),
                    },
                });
                if (!existingList || existingList.userId !== userId) {
                    return res.status(404).json({ error: 'Lista não encontrada ou não pertence ao usuário.' });
                }
                // Atualizar o statusList da lista no banco de dados
                yield prisma.lists.update({
                    where: {
                        id: parseInt(listId),
                    },
                    data: {
                        statusList: statusList,
                    },
                });
                res.status(200).json({ message: 'Status da lista atualizado com sucesso.' });
            }
            catch (error) {
                console.error('Erro ao atualizar status da lista:', error);
                res.status(500).json({ error: 'Erro ao atualizar status da lista' });
            }
        });
    }
    ;
    lists(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = parseInt(req.userId); // Obtém o ID do usuário do token JWT
            try {
                // Busca as listas do usuário e os itens associados a cada lista
                const userLists = yield prisma.user.findUnique({
                    where: {
                        id: userId,
                    },
                    select: {
                        lists: {
                            include: {
                                items: true,
                            },
                        },
                    },
                });
                if (!userLists) {
                    return res.status(404).json({ error: 'Usuário não encontrado' });
                }
                // Retorna as listas e os itens associados a cada lista
                res.json(userLists.lists);
            }
            catch (error) {
                console.error('Erro ao buscar listas do usuário:', error);
                res.status(500).json({ error: 'Erro ao buscar listas do usuário' });
            }
        });
    }
    ;
    getListByName(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name } = req.query;
            const userId = parseInt(req.userId); // Obtém o ID do usuário do token JWT
            try {
                // Verifica se existem listas associadas ao usuário logado
                const userLists = yield prisma.lists.findMany({
                    where: {
                        userId: userId,
                    }
                });
                if (!userLists || userLists.length === 0) {
                    return res.status(404).json({ message: 'Nenhuma lista encontrada para o usuário logado.' });
                }
                // Busca as listas do usuário com base no nome fornecido
                const filteredLists = yield prisma.lists.findMany({
                    where: {
                        name: {
                            contains: name, mode: 'insensitive'
                        } // Filtra pelo nome fornecido
                    }
                });
                // Retorna as listas encontradas
                res.json(filteredLists);
            }
            catch (error) {
                console.error('Erro ao buscar listas pelo nome:', error);
                res.status(500).json({ error: 'Erro ao buscar listas pelo nome' });
            }
        });
    }
    ;
    addItemToList(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { listId } = req.params;
            const { items } = req.body;
            const userId = parseInt(req.userId); // Obtém o ID do usuário do token JWT
            try {
                // Verifica se a lista pertence ao usuário logado
                const existingList = yield prisma.lists.findFirst({
                    where: {
                        id: parseInt(listId),
                        userId: userId,
                    },
                    include: {
                        items: true,
                    },
                });
                if (!existingList) {
                    return res.status(404).json({ error: 'Lista não encontrada ou não pertence ao usuário.' });
                }
                const createdItems = yield Promise.all(items.map((item) => __awaiter(this, void 0, void 0, function* () {
                    return prisma.item.create({
                        data: Object.assign(Object.assign({}, item), { list: {
                                connect: {
                                    id: existingList.id,
                                },
                            } })
                    });
                })));
                res.json(createdItems);
            }
            catch (error) {
                console.error('Erro ao adicionar item à lista:', error);
                res.status(500).json({ error: 'Erro ao adicionar item à lista' });
            }
        });
    }
    ;
    deleteList(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { listId } = req.params;
            const userId = parseInt(req.userId); // Obtém o ID do usuário do token JWT
            try {
                // Verifica se a lista pertence ao usuário logado
                const existingList = yield prisma.lists.findUnique({
                    where: {
                        id: parseInt(listId),
                    },
                    include: {
                        items: true,
                    },
                });
                if (!existingList || existingList.userId !== userId) {
                    return res.status(404).json({ error: 'Lista não encontrada ou não pertence ao usuário.' });
                }
                // Exclui os itens associados à lista
                yield prisma.item.deleteMany({
                    where: {
                        listId: parseInt(listId),
                    },
                });
                // Exclui a lista
                yield prisma.lists.delete({
                    where: {
                        id: parseInt(listId),
                    },
                });
                res.status(200).json({ message: 'Lista e itens associados excluídos com sucesso.' });
            }
            catch (error) {
                console.error('Erro ao excluir lista:', error);
                res.status(500).json({ error: 'Erro ao excluir lista' });
            }
        });
    }
}
;
exports.default = new Lists();
