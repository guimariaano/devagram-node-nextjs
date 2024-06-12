import type { NextApiRequest, NextApiResponse } from "next";
import type {RespostaPadraoMsg} from '../../types/RespostaPadraoMsg';
import { conectarMongoDB } from "@/middlewares/conectarMongoDB";
import { validarTokenJWT } from "@/middlewares/validarTokenJWT";
import { UsuarioModel } from "@/models/UsuarioModel";
import { politicaCORS } from "@/middlewares/politicaCORS";

const pesquisaEndpoint 
      = async (req : NextApiRequest, res : NextApiResponse<RespostaPadraoMsg | any[]>) =>{

        try{
             if(req.method === 'GET'){
                if(req?.query?.id){
                    const usuariosEncontrado = await UsuarioModel.findById(req?.query?.id);
                    if(!usuariosEncontrado){
                        return res.status(400).json({erro : 'usuario nao encontrado'});
                    }
                    usuariosEncontrado.senha = null;
                    return res.status(200).json(usuariosEncontrado);

                }else{
                    const {filtro} = req.query;
                if(!filtro || filtro.length < 2){
                    return res.status(400).json({erro : 'favor informar pelo menos 2 caracteres para busca'});

                }

                const usuariosEncontrados = await UsuarioModel.find({
                    $or: [{ nome : {$regex : filtro, $options: 'i'}},
                         { email : {$regex : filtro, $options: 'i'}}]
                
                });

                return res.status(200).json(usuariosEncontrados);

             }
             return res.status(405).json({erro : 'metodo informado nao e valido'});
                    
                }

        }catch(e){
            console.log(e)
            return res.status(500).json({erro : 'nao foi possivel localizar usuario' +e})
        }
      }

      export default politicaCORS(validarTokenJWT(conectarMongoDB(pesquisaEndpoint)));


