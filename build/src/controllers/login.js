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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class Login {
    authenticate(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password } = req.body;
            try {
                // Verifica se o usuário com o email fornecido existe
                const user = yield prisma.user.findUnique({
                    where: {
                        email: email,
                    },
                });
                if (!user) {
                    return res.status(404).json({ error: 'Usuário não encontrado' });
                }
                // Verifica se a senha fornecida está correta
                const passwordMatch = yield bcrypt_1.default.compare(password, user.password);
                if (!passwordMatch) {
                    return res.status(401).json({ error: 'Credenciais inválidas' });
                }
                // Gera um token JWT
                const token = jsonwebtoken_1.default.sign({
                    userId: user.id,
                    username: user.username,
                    email: user.email,
                    phone: user.phone
                }, process.env.JWT_SECRET || '', // Chave secreta para assinar o token
                {
                    expiresIn: '10h', // Tempo de expiração do token (opcional)
                });
                // Retorna o token e outras informações do usuário
                res.json({
                    token: token,
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        phone: user.phone,
                        tutorial: user.tutorial
                    }
                });
            }
            catch (error) {
                console.error('Erro ao fazer login:', error);
                res.status(500).json({ error: 'Erro ao fazer login' });
            }
        });
    }
    ;
}
exports.default = new Login();
