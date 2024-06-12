import type { NextApiResponse } from "next";
import type { RespostaPadraoMsg } from "../../types/RespostaPadraoMsg";
import { NextApiRequest } from "next/types";
import { validarTokenJWT } from "@/middlewares/validarTokenJWT";
import { conectarMongoDB } from "@/middlewares/conectarMongoDB";
import { UsuarioModel } from "@/models/UsuarioModel";
import { SeguidorModel } from "@/models/SeguidorModel";
import { politicaCORS } from "@/middlewares/politicaCORS";

const endpointSeguir =
     async (req : NextApiRequest, res : NextApiResponse<RespostaPadraoMsg>) => {
    try{
        if(req.method === 'PUT'){

            const {userId, id} = req?.query;

            const usuarioLogado = await UsuarioModel.findById(userId);
            if(!usuarioLogado){
                return res.status(400).json({erro : 'usuario logado nao encontrado'})
            }

            const usuarioASerSeguido = await UsuarioModel.findById(id);

            if(!usuarioASerSeguido){
                return res.status(400).json({erro : 'usuario a ser seguido nao encontrado'})

            }

            const euJaSigoEsseUsuario = await SeguidorModel
            .find({usuarioId: usuarioLogado._id, usuarioSeguidoId : usuarioASerSeguido._id});
            if(euJaSigoEsseUsuario && euJaSigoEsseUsuario.length > 0){
                euJaSigoEsseUsuario.forEach(async(e : any) => await SeguidorModel.findByIdAndDelete({_id : e._id}));
                usuarioLogado.seguindo--;
                await UsuarioModel.findByIdAndUpdate({_id : usuarioLogado._id}, usuarioLogado);
                usuarioASerSeguido.seguidores--;
                await UsuarioModel.findByIdAndUpdate({_id : usuarioASerSeguido._id}, usuarioASerSeguido);

                return res.status(200).json({msg : 'deixou de seguir o usuario com sucesso'});


            }else{

                const seguidor = {
                    usuarioid : usuarioLogado._id,
                    usuarioASerSeguidoId : usuarioASerSeguido._id
                };
                await SeguidorModel.create(seguidor);

                usuarioLogado.seguindo++;
                await UsuarioModel.findByIdAndUpdate({_id : usuarioLogado._id}, usuarioLogado);

                usuarioASerSeguido.seguidores++;
                await UsuarioModel.findByIdAndUpdate({_id : usuarioASerSeguido._id}, usuarioASerSeguido);


                return res.status(200).json({msg : 'usuario seguido com sucesso'});

            }
        }

        return res.status(405).json({erro : 'metodo informado nao existe'});
    }catch(e){
        console.log(e);
        return res.status(500).json({erro : 'nao foi possivel seguir/deseguir o usuario informado'});
    }

}

export default politicaCORS(validarTokenJWT(conectarMongoDB(endpointSeguir)));
