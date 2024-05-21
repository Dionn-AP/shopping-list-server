import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class Item {
    async allitems(req: Request, res: Response) {
        try {
            const items = await prisma.itemSearch.findMany();
            res.json(items);
        } catch (error) {
            console.error('Erro ao buscar itens:', error);
            throw new Error('Erro ao buscar itens');
        }
    }

    async itemsearch(req: Request, res: Response) {
        const { query } = req.query;
        //const userId = parseInt(req.userId);

        try {
            const items = await prisma.itemSearch.findMany({
                where: {
                    itemName: {
                        // Realiza a busca insensível a maiúsculas/minúsculas
                        contains: query as string, mode: 'insensitive'
                    },
                },
            });

            res.json(items);
        } catch (error) {
            console.error('Erro ao buscar itens:', error);
            res.status(500).json({ error: 'Erro ao buscar itens' });
        }
    };

    async updateItem(req: Request, res: Response) {
        const { listId } = req.params;
        const itemsToUpdate = req.body; // Espera-se que req.body seja um array de objetos
        const userId = parseInt(req.userId); // Obtém o ID do usuário do token JWT

        try {
            // Verifica se todos os itens pertencem à lista associada ao usuário logado
            const itemIds = itemsToUpdate.map((item: any) => parseInt(item.itemId));
            const existingItems = await prisma.item.findMany({
                where: {
                    id: { in: itemIds },
                    listId: parseInt(listId),
                    list: {
                        userId: userId,
                    },
                },
            });

            if (existingItems.length !== itemsToUpdate.length) {
                return res.status(404).json({ error: 'Um ou mais itens não foram encontrados ou não pertencem à lista do usuário.' });
            }

            const updatedItems = await Promise.all(
                itemsToUpdate.map(async (item: any) => {
                    const existingItem = existingItems.find((ei) => ei.id === parseInt(item.itemId));
                    return await prisma.item.update({
                        where: {
                            id: parseInt(item.itemId),
                        },
                        data: {
                            name: item.name || existingItem?.name,
                            quantity: item.quantity || existingItem?.quantity,
                            unit: item.unit || existingItem?.unit,
                            price: item.price || existingItem?.price,
                            status: item.status || existingItem?.status,
                        },
                    });
                })
            );

            res.json(updatedItems);
        } catch (error) {
            console.error('Erro ao atualizar itens:', error);
            res.status(500).json({ error: 'Erro ao atualizar itens' });
        }
    };

    async deleteItems(req: Request, res: Response) {
        const { listId } = req.params;
        const { itemIds } = req.body; // Lista de IDs dos itens a serem excluídos
        const userId = parseInt(req.userId); // Obtém o ID do usuário do token JWT

        try {
            // Verifica se os itens pertencem à lista associada ao usuário logado
            const existingItems = await prisma.item.findMany({
                where: {
                    id: { in: itemIds.map((id: string) => parseInt(id)) },
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
            const deletedItems = await prisma.item.deleteMany({
                where: {
                    id: { in: itemIds.map((id: string) => parseInt(id)) },
                },
            });

            res.json({ message: `${deletedItems.count} itens foram excluídos.` });
        } catch (error) {
            console.error('Erro ao excluir itens:', error);
            res.status(500).json({ error: 'Erro ao excluir itens' });
        }
    }
}

export default new Item();

