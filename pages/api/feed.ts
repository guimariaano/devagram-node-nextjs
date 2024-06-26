import type { NextApiRequest, NextApiResponse } from "next";
import type { RespostaPadraoMsg } from '../../types/RespostaPadraoMsg';
import { validarTokenJWT } from '../../middlewares/validarTokenJWT';
import { conectarMongoDB } from '../../middlewares/conectarMongoDB';
import { UsuarioModel } from "@/models/UsuarioModel";
import { PublicacaoModel } from "@/models/publicacaomodel";
import { SeguidorModel } from "@/models/SeguidorModel";
import { politicaCORS } from "@/middlewares/politicaCORS";

const feedEndpoint = async (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg | any>) => {
    try {
        if (req.method === 'GET') {
            if (req.query.id) {
                // Obter publicações de um usuário específico pelo ID
                const usuario = await UsuarioModel.findById(req.query.id);
                if (!usuario) {
                    return res.status(400).json({ erro: 'Usuário não encontrado' });
                }

                const publicacoes = await PublicacaoModel
                    .find({ idUsuario: usuario._id })
                    .sort({ data: -1 });

                return res.status(200).json(publicacoes);
            } else {
                // Obter feed para o usuário logado e seus seguidores
                const { userid } = req.query;
                const usuarioLogado = await UsuarioModel.findById(userid);
                if (!usuarioLogado) {
                    return res.status(400).json({ erro: 'Usuário não encontrado' });
                }

                const seguidores = await SeguidorModel.find({ usuarioId: usuarioLogado._id });
                const seguidoresIds = seguidores.map(s => s.usuarioSeguidoId);

                const publicacoes = await PublicacaoModel.find({
                    $or: [
                        { idUsuario: usuarioLogado._id },
                        { idUsuario: { $in: seguidoresIds } }
                    ]
                }).sort({ data: -1 });

                const result = [];
                for (const pub of publicacoes) {
                    const usuarioDaPublicacao = await UsuarioModel.findById(pub.idUsuario);
                    if (usuarioDaPublicacao) {
                        const final = {
                            ...pub._doc,
                            usuario: {
                                nome: usuarioDaPublicacao.nome,
                                avatar: usuarioDaPublicacao.avatar
                            }
                        };
                        result.push(final);
                    }
                }

                return res.status(200).json(result);
            }
        } else {
            return res.status(405).json({ erro: 'Método informado não é válido' });
        }
    } catch (e) {
        console.log(e);
        return res.status(500).json({ erro: 'Não foi possível obter o feed' });
    }
};

export default politicaCORS(validarTokenJWT(conectarMongoDB(feedEndpoint)));