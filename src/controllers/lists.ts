import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class Lists {
    async createlist(req: Request, res: Response) {
        const { name, items } = req.body;
        const userId = parseInt(req.userId); // Obtém o ID do usuário do token JWT

        try {
            // Cria a lista no banco de dados associada ao usuário logado
            const newList = await prisma.lists.create({
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
        } catch (error) {
            console.error('Erro ao criar lista:', error);
            res.status(500).json({ error: 'Erro ao criar lista' });
        }
    }
}

export default new Lists();