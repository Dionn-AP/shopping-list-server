"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function authMiddleware(req, res, next) {
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
        const data = jsonwebtoken_1.default.verify(token, secret);
        if (!data.userId) {
            throw new Error('ID do usuário não encontrado no token');
        }
        req.userId = data.userId; // Definindo o ID do usuário como um número inteiro em req.userId
        return next();
    }
    catch (error) {
        console.error('Erro de autenticação:', error);
        return res.status(500).json({ error: 'Erro de autenticação' });
    }
}
exports.default = authMiddleware;
