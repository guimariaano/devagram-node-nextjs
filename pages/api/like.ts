import type { NextApiRequest, NextApiResponse } from "next";
import type { RespostaPadraoMsg } from '../../types/RespostaPadraoMsg';
import { validarTokenJWT } from "@/middlewares/validarTokenJWT";
import { conectarMongoDB } from "@/middlewares/conectarMongoDB";
import { PublicacaoModel } from "@/models/publicacaomodel";
import { UsuarioModel } from "@/models/UsuarioModel";

const likeEndpoint = async (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg>) => {
    try {
        if (req.method === 'PUT') {
            const { id } = req.query;
            const publicacao = await PublicacaoModel.findById(id);
            if (!publicacao) {
                return res.status(400).json({ erro: 'publicacao nao encontrada' });
            }

            const { userId } = req.query;
            const usuario = await UsuarioModel.findById(userId);
            if (!usuario) {
                return res.status(400).json({ erro: 'usuario nao encontrado' });
            }

            const indexDoUsuarioNoLike = publicacao.likes.findIndex((e: any) => e.toString() === usuario._id.toString());
            if (indexDoUsuarioNoLike !== -1) {
                publicacao.likes.splice(indexDoUsuarioNoLike, 1);
                await PublicacaoModel.findByIdAndUpdate({ _id: publicacao._id }, publicacao);
                return res.status(200).json({ msg: 'publicacao descurtida com sucesso' });
            } else {
                publicacao.likes.push(usuario._id);
                await PublicacaoModel.findByIdAndUpdate({ _id: publicacao._id }, publicacao);
                return res.status(200).json({ msg: 'publicacao curtida com sucesso' });
            }
        }

        return res.status(405).json({ erro: 'metodo informado nao e valido' });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ erro: 'Ocorreu erro ao curtir/descurtir publicacao' });
    }
};

export default validarTokenJWT(conectarMongoDB(likeEndpoint));