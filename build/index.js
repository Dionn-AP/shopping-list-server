"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const express_1 = __importDefault(require("express"));
const routes_1 = __importDefault(require("./routes"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use(express_1.default.urlencoded({
    extended: true,
}));
const PORT = process.env.PORT || 8000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(routes_1.default);
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
