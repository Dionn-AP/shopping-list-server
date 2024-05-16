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
        const { listId, itemId } = req.params;
        const { name, quantity, unit, price, status } = req.body;
        const userId = parseInt(req.userId); // Obtém o ID do usuário do token JWT

        try {
            // Verifica se o item pertence à lista associada ao usuário logado
            const existingItem = await prisma.item.findFirst({
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
            const updatedItem = await prisma.item.update({
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
        } catch (error) {
            console.error('Erro ao atualizar item:', error);
            res.status(500).json({ error: 'Erro ao atualizar item' });
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

