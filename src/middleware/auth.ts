import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface TokenPayload {
    userId: string;
    iat: number;
    exp: number;
}

export default function authMiddleware(
    req: Request, res: Response, next: NextFunction,
) {
    const { authorization } = req.headers;

    if (!authorization) {
        return res.status(401).json({ message: "Usuário não autenticado." });
    }

    const token = authorization.replace('Bearer', '').trim();

    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('Chave secreta JWT não encontrada');
        }

        const data = jwt.verify(token, secret) as TokenPayload;
        if (!data.userId) {
            throw new Error('ID do usuário não encontrado no token');
        }

        req.userId = data.userId; // Definindo o ID do usuário como um número inteiro em req.userId

        return next();
    } catch (error) {
        console.error('Erro de autenticação:', error);
        return res.status(500).json({ error: 'Erro de autenticação' });
    }
}
