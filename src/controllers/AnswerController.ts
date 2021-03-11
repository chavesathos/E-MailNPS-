import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import { AppError } from "../errors/AppError";
import { SurveysUsersRepository } from "../repositories/SurveysUsersRepository";


class AnswerController {

    /**
     * Route Params => Parametros que compoe a rota
     * routes-get("/answer/:value")
     * 
     * Query Params => Busca, Paginacao, nao obrigados
     * depois do ?
     * chave = valor
     */
    async execute(request: Request, response: Response){
       const { value } = request.params;
       const {u} = request.query;

       const surveysUsersRepository = getCustomRepository(SurveysUsersRepository);

       const surveyUser = await surveysUsersRepository.findOne({
           id: String(u)
       });

       if(!surveyUser) {
           throw new AppError("Survey User does not exist!")

       }

       surveyUser.value = Number(value);

       await surveysUsersRepository.save(surveyUser);

       return response.json(surveyUser);
    }
}

export { AnswerController } 