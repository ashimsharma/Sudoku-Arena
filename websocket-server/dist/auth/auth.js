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
exports.authenticate = void 0;
const url_1 = require("url");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const index_1 = __importDefault(require("../db/index"));
const authenticate = (request) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = (0, url_1.parse)(request.url, true).query;
    if (!token) {
        return { authenticated: false, message: "Token is missing" };
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = yield index_1.default.user.findFirst({
            where: {
                id: decoded.id,
            },
        });
        if (!user) {
            return { authenticated: false, message: "Invalid or expired token" };
        }
        return { authenticated: true, id: decoded.id };
    }
    catch (error) {
        return { authenticated: false, message: "Invalid or expired token" };
    }
});
exports.authenticate = authenticate;
