import usuario from '@/pages/usuario';
import mongoose, {Schema} from 'mongoose';

const SeguidorSchema = new Schema({
    usuariId : {type : String, required : true},
    usuarioSeguidoId : {type : String, requires : true},

});

export const SeguidorModel = (mongoose.models.seguidores ||
    mongoose.model('seguidores' , SeguidorSchema));
