const Appointment = require("../models/Appointment");
const AppError = require('../../AppError');
const AppointmentFactory = require('../../factories/AppointamentFactory');
const nodemailer = require('nodemailer');

class AppointmentService {
  async Create(data){

    try {
      await Appointment.create(data);
    } catch (error) {
      throw new AppError(error.message)
    }
  }

  async GetAll(showFinished){
    if(showFinished){
      return await Appointment.find({});
    }else{
      const appointments = await Appointment.find({'finished': false});
      const appointmentsArray = [];

      appointments.forEach(appointment => {
        appointmentsArray.push(AppointmentFactory.Build(appointment));
      });

      return appointmentsArray;
    }
  }

  async GetOne(id){
    try {
      const appointment = await Appointment.findById(id);

      return appointment;
    } catch (error) {
      throw new AppError(error.message)
    }
  }

  async Finish(id){
    try {
      await Appointment.findByIdAndUpdate(id, { finished: true });
      return true;
    } catch (error) {
      throw new AppError(error.message);
    }
  }

  async Search(query){
   
    try {
      const appointments = await Appointment.find().or([
        {
          email: query
        },
        {
          cpf: query
        }
      ]);
      return appointments;
    } catch (error) {
      console.log(error.message)
      return [];
    }

    console.log(appointments)
  }

  async SendNotification(){
    const appointments = await this.GetAll(false);

    const transporter = nodemailer.createTransport({
      host: "smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,

      }
    });

    appointments.forEach(async appo => {
      const date = appo.start.getTime();
      const hour = 1000 * 60 * 60;

      const gap = date-Date.now();

      if(gap <= hour){
        if(!appo.notified){

          await Appointment.findByIdAndUpdate(appo.id, { notified: true });

          transporter.sendMail({
            from: 'A equipe appointment <appointmentsd@appo.com>',
            to: appo.email,
            subject: 'Appointment',
            text: 'Sua consulta esta prestes a acontecer'
          }).then().catch()
        }
      }
    });
  }
}

module.exports = new AppointmentService();