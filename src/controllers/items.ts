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
        const userId = parseInt(req.userId);

        try {
            const userLists = await prisma.lists.findMany({
                where: {
                    userId: userId,
                }
            });

            if (!userLists || userLists.length === 0) {
                return res.status(404).json({ message: 'Nenhuma lista encontrada para o usuário logado.' });
            }

            const items = await prisma.itemSearch.findMany({
                where: {
                    itemName: {
                        // Realiza a busca insensível a maiúsculas/minúsculas
                        contains: [query as string].toString().toLowerCase(),
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
    }

}

export default new Item();

