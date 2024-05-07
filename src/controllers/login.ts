import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class Login {

    async authenticate(req: Request, res: Response) {
        const { email, password } = req.body;
      
        try {
          // Verifica se o usuário com o email fornecido existe
          const user = await prisma.user.findUnique({
            where: {
              email: email,
            },
          });
      
          if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
          }
      
          // Verifica se a senha fornecida está correta
          const passwordMatch = await bcrypt.compare(password, user.password);
      
          if (!passwordMatch) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
          }
      
          // Gera um token JWT
          const token = jwt.sign(
            {
              userId: user.id,
              username: user.username,
              email: user.email,
              phone: user.phone
            },
            process.env.JWT_SECRET || '', // Chave secreta para assinar o token
            {
              expiresIn: '10h', // Tempo de expiração do token (opcional)
            }
          );
      
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
        } catch (error) {
          console.error('Erro ao fazer login:', error);
          res.status(500).json({ error: 'Erro ao fazer login' });
        }
      };
}

export default new Login();
  