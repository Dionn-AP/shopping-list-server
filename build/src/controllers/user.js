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
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class User {
    createuser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { username, email, password, phone } = req.body;
            try {
                const existingUserByEmail = yield prisma.user.findUnique({
                    where: {
                        email: email,
                    },
                });
                if (existingUserByEmail) {
                    // Se o usuário já existe, retorna uma mensagem de erro
                    return res.status(400).json({ error: 'Esse e-mail já está em uso' });
                }
                if (phone) {
                    // Verifica se já existe algum usuário com o phone fornecido
                    const existingUserByPhone = yield prisma.user.findFirst({
                        where: {
                            phone: {
                                equals: phone,
                            },
                        },
                    });
                    if (existingUserByPhone) {
                        // Se o phone já está em uso, retorna uma mensagem de erro
                        return res.status(400).json({ error: 'Esse número de telefone já está em uso' });
                    }
                }
                // Função para criar hash de senha
                function hashPassword(password) {
                    return __awaiter(this, void 0, void 0, function* () {
                        const saltRounds = 10; // Número de rounds de salt (recomendado: 10)
                        const hashedPassword = yield bcrypt_1.default.hash(password, saltRounds);
                        return hashedPassword;
                    });
                }
                // Criptografa a senha antes de salvar no banco de dados
                const hashedPassword = yield hashPassword(password);
                // Cria um novo usuário no banco de dados
                const newUser = yield prisma.user.create({
                    data: {
                        username,
                        email,
                        password: hashedPassword,
                        phone: phone ? phone : ""
                    },
                    // Seleciona apenas os campos que você quer retornar na resposta
                    select: {
                        username: true,
                        email: true,
                        phone: true
                    }
                });
                res.json(newUser);
            }
            catch (error) {
                console.error('Erro ao cadastrar usuário:', error);
                res.status(500).json({ message: 'Erro ao cadastrar usuário' });
            }
        });
    }
    ;
    user(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = parseInt(req.userId); // Obtém o ID do usuário do token JWT
            try {
                // Busca os dados do usuário pelo ID, excluindo a senha
                const user = yield prisma.user.findUnique({
                    where: {
                        id: userId,
                    },
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        phone: true,
                        tutorial: true
                    },
                });
                if (!user) {
                    return res.status(404).json({ error: 'Usuário não encontrado' });
                }
                // Retorna os dados do usuário
                res.json(user);
            }
            catch (error) {
                console.error('Erro ao buscar usuário:', error);
                res.status(500).json({ error: 'Erro ao buscar usuário' });
            }
        });
    }
    ;
    updateuser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = parseInt(req.userId);
            const { username, email, phone } = req.body;
            try {
                // Verifica se o usuário com o ID fornecido existe
                const existingUser = yield prisma.user.findUnique({
                    where: {
                        id: userId,
                    },
                });
                if (!existingUser) {
                    // Se o usuário não existir, retorna um erro 404
                    return res.status(404).json({ error: 'Usuário não encontrado' });
                }
                // Verifica quais campos devem ser atualizados
                const updatedFields = {};
                if (username && username !== existingUser.username) {
                    updatedFields.username = username;
                }
                if (email && email !== existingUser.email) {
                    updatedFields.email = email;
                }
                if (phone && phone !== existingUser.phone) {
                    updatedFields.phone = phone;
                }
                // Se não houver nada para atualizar, retorna um erro 400
                if (Object.keys(updatedFields).length === 0) {
                    return res.status(400).json({ error: 'Nenhum dado novo foi fornecido para atualização' });
                }
                // Atualiza o usuário no banco de dados
                const updatedUser = yield prisma.user.update({
                    where: {
                        id: userId,
                    },
                    data: updatedFields,
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        phone: true,
                    },
                });
                res.json({ message: "Dados do usuário atualizados com sucesso.", user: updatedUser });
            }
            catch (error) {
                console.error('Erro ao atualizar usuário:', error);
                res.status(500).json({ error: 'Erro ao atualizar usuário' });
            }
        });
    }
    ;
    deleteuser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = parseInt(req.params.id);
            if (userId !== parseInt(req.userId)) {
                return res.send({ message: "Você não pode apagar os dados de outros usuários" });
            }
            try {
                const existingUser = yield prisma.user.findUnique({
                    where: {
                        id: userId,
                    },
                });
                if (!existingUser) {
                    res.status(422).json({ message: 'O usuário não foi encontrado!' });
                    return;
                }
                // Deleta o usuário do banco de dados
                yield prisma.user.delete({
                    where: {
                        id: userId,
                    },
                });
                res.status(200).json({ message: "Usuário removido com sucesso." });
            }
            catch (error) {
                return res.status(500).json(error);
            }
        });
    }
    tutorial(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = parseInt(req.userId);
            const { tutorial } = req.body;
            try {
                // Atualiza apenas o campo 'tutorial' do usuário
                const updatedUser = yield prisma.user.update({
                    where: { id: userId },
                    data: { tutorial }
                });
                !updatedUser.tutorial ?
                    res.json({ message: "Você optou por não ver mais o tutorial no próximo login." }) :
                    res.json({ message: "Você optou por ver o tutorial no próximo login." });
            }
            catch (error) {
                console.error('Erro ao atualizar tutorial do usuário:', error);
                res.status(500).json({ error: 'Erro ao atualizar tutorial do usuário' });
            }
        });
    }
}
exports.default = new User();
