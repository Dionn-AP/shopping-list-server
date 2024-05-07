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

        try {
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
    }
}

export default new Item();

