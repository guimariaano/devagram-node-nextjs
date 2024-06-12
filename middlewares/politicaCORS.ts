import type {NextApiRequest, NextApiResponse, NextApiHandler} from 'next';
import type {} from '../types/RespostaPadraoMsg';
import NextCors from 'nextjs-cors' ;

export const politicaCORS = (handler : NextApiHandler) =>
    async (req : NextApiRequest, res : NextApiResponse) => {
        try{


            await NextCors(req, res, {
                origin : '*',
                methods : ['GET', 'POST', 'PUT'],
                optionsSuccessStatus : 200,

            });

            return handler(req, res);

        }catch(e){
            console.log('Erro ao tratar a politica de CORS' , e);
            res.status(500).json({erro : 'Ocorreu erro ao tratar politica de CORS'});
        }

    }
