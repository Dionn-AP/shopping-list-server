import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class Lists {
    async createlist(req: Request, res: Response) {
        const { name, items, statusList } = req.body;
        const userId = parseInt(req.userId); // Obtém o ID do usuário do token JWT

        try {
            // Cria a lista no banco de dados associada ao usuário logado
            const newList = await prisma.lists.create({
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
        } catch (error) {
            console.error('Erro ao criar lista:', error);
            res.status(500).json({ error: 'Erro ao criar lista' });
        }
    };

    async updateListStatus(req: Request, res: Response) {
        const { statusList } = req.body;
        const { listId } = req.params;
        const userId = parseInt(req.userId); // Obtém o ID do usuário do token JWT

        try {
            // Verificar se a lista pertence ao usuário logado
            const existingList = await prisma.lists.findUnique({
                where: {
                    id: parseInt(listId),
                },
            });

            if (!existingList || existingList.userId !== userId) {
                return res.status(404).json({ error: 'Lista não encontrada ou não pertence ao usuário.' });
            }

            // Atualizar o statusList da lista no banco de dados
            await prisma.lists.update({
                where: {
                    id: parseInt(listId),
                },
                data: {
                    statusList: statusList,
                },
            });

            res.status(200).json({ message: 'Status da lista atualizado com sucesso.' });
        } catch (error) {
            console.error('Erro ao atualizar status da lista:', error);
            res.status(500).json({ error: 'Erro ao atualizar status da lista' });
        }
    };

    async lists(req: Request, res: Response) {
        const userId = parseInt(req.userId); // Obtém o ID do usuário do token JWT

        try {
            // Busca as listas do usuário e os itens associados a cada lista
            const userLists = await prisma.user.findUnique({
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
        } catch (error) {
            console.error('Erro ao buscar listas do usuário:', error);
            res.status(500).json({ error: 'Erro ao buscar listas do usuário' });
        }
    };

    async getListByName(req: Request, res: Response) {
        const { name } = req.query;
        const userId = parseInt(req.userId); // Obtém o ID do usuário do token JWT

        try {
            // Verifica se existem listas associadas ao usuário logado
            const userLists = await prisma.lists.findMany({
                where: {
                    userId: userId,
                }
            });

            if (!userLists || userLists.length === 0) {
                return res.status(404).json({ message: 'Nenhuma lista encontrada para o usuário logado.' });
            }

            // Busca as listas do usuário com base no nome fornecido
            const filteredLists = await prisma.lists.findMany({
                where: {
                    name: {
                        contains: name as string, mode: 'insensitive'
                    } // Filtra pelo nome fornecido
                }
            });

            // Retorna as listas encontradas
            res.json(filteredLists);
        } catch (error) {
            console.error('Erro ao buscar listas pelo nome:', error);
            res.status(500).json({ error: 'Erro ao buscar listas pelo nome' });
        }
    };

    async addItemToList(req: Request, res: Response) {
        const { listId } = req.params;
        const { items } = req.body;
        const userId = parseInt(req.userId); // Obtém o ID do usuário do token JWT

        try {
            // Verifica se a lista pertence ao usuário logado
            const existingList = await prisma.lists.findFirst({
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

            const createdItems = await Promise.all(
                items.map(async (item: any) => {
                    return prisma.item.create({
                        data: {
                            ...item,
                            list: {
                                connect: {
                                    id: existingList.id,
                                },
                            },
                        }
                    });
                })
            );

            res.json(createdItems);
        } catch (error) {
            console.error('Erro ao adicionar item à lista:', error);
            res.status(500).json({ error: 'Erro ao adicionar item à lista' });
        }
    };

    async deleteList(req: Request, res: Response) {
        const { listId } = req.params;
        const userId = parseInt(req.userId); // Obtém o ID do usuário do token JWT

        try {
            // Verifica se a lista pertence ao usuário logado
            const existingList = await prisma.lists.findUnique({
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
            await prisma.item.deleteMany({
                where: {
                    listId: parseInt(listId),
                },
            });

            // Exclui a lista
            await prisma.lists.delete({
                where: {
                    id: parseInt(listId),
                },
            });

            res.status(200).json({ message: 'Lista e itens associados excluídos com sucesso.' });
        } catch (error) {
            console.error('Erro ao excluir lista:', error);
            res.status(500).json({ error: 'Erro ao excluir lista' });
        }
    }
};

export default new Lists();