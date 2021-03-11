import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import { resolve } from "path";
import { SurveysRepository } from "../repositories/SurveysRepository";
import { SurveysUsersRepository } from "../repositories/SurveysUsersRepository";
import { UsersRepository } from "../repositories/UsersRepository";
import SendMailService from "../services/SendMailService";
import { AppError } from "../errors/AppError";

class SendMailController {
  
  async execute(request: Request, response: Response) {

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";   //Comando para evitar erro: UnhandledPromiseRejectionWarning

    const { email, survey_id } = request.body;

    const usersRepository = getCustomRepository(UsersRepository);
    const surveysRepository = getCustomRepository(SurveysRepository);
    const surveysUsersRepository = getCustomRepository(SurveysUsersRepository);

    const user = await usersRepository.findOne({ email });

    if (!user) {
      throw new AppError("User does not exists")
    }

    const survey = await surveysRepository.findOne({ id: survey_id });

    if (!survey) {
      throw new AppError("Survey does not exists!")
    }

  
    const npsPath = resolve(__dirname, "..", "views", "emails", "npsMail.hbs");

    const surveyUserAlreadyExists = await surveysUsersRepository.findOne({
      where: { user_id: user.id , value: null },    // Condicao and &&
      // where: [{ user_id: user.id }, { value: null }],   ---- Condicao de Our |
      relations: ["user", "survey"],
    });

    const variables = {
      name: user.name,
      title: survey.title,
      description: survey.description,
      id: "",
      link: process.env.URL_MAIL,
    };


    if (surveyUserAlreadyExists) {
      variables.id = surveyUserAlreadyExists.id;
      await SendMailService.execute(email, survey.title, variables, npsPath);
      return response.json(surveyUserAlreadyExists);
    }
    //Salvar as informacoes na tabela surveyUser
    const surveyUser = surveysUsersRepository.create({
      user_id: user.id,
      survey_id,
    });

    await surveysUsersRepository.save(surveyUser);

    //Enviar e-mail para o usuarios
    variables.id = surveyUser.id;
    
    await SendMailService.execute(email, survey.title, variables, npsPath);

    return response.json(surveyUser);
  }
}

export { SendMailController };
