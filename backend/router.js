const appointmentRouter = require('express').Router();
let Appointment = require('./models/Appointment');
const moment = require('moment');

appointmentRouter.route('/').get((req, res) => {

    //check if the username

    Appointment.find()
        .then(appointments => {
            if (appointments.length === 0) {
                sayNotFound(req, res);
            } else {
                res.json(appointments);
            }
        })
        .catch(dbError => {
            sayNotFound(req, res, dbError);
        });
});

appointmentRouter.route('/add').post((req, res) => {
    let name = req.body.name;
    let email = req.body.email;
    let scheduledDate = Date.parse(req.body.scheduledDate);

    let scheduledMoment = moment(req.body.scheduledDate);
    let result = isTimingOk(scheduledMoment);
    if (!result.status) {
        res.status(403).json(result.message);
        return;
    }

    let newAppointment = new Appointment({
        name,
        email,
        scheduledDate
    });

    //check existing entry within 3 weeks from now

    //if none, add new entry
    newAppointment.save()
        .then(() => {
            console.log('Create new entry at database.');
            res.json('New appointment is scheduled.');
        })
        .catch(dbErr => {

            console.error('Failed to create new entry at database.');
            res.status(400).json(`Failed to add schedule, server error: ${dbErr.toString()}`);
        });
});

appointmentRouter.route('/available').post((req, res) => {

    let schedule = moment(req.body.scheduledDate);

    let result = isTimingOk(schedule);
    if (!result.status) {
        res.status(403).json(result.message);
        return;
    }

    Appointment.find({scheduledDate: {$gte: schedule.toISOString(), $lt: schedule.add(30, "minute").toISOString()}})
        .then(appointments => {
            let day = schedule.day();
            switch (true) {
                case (day === 0): //Sunday
                    res.status(403).json(`No available slot on Sunday (${day})`);
                    break;

                case (day === 6): //Saturday
                    if (appointments.length < 4) {
                        res.json(`OK Day ${day} Current slot: ${appointments.length}`);
                    } else {
                        console.error(`No available slot current appointments: ${appointments.length}`);
                        res.status(403).json(`No available slot (${appointments.length})`);
                    }
                    break;
                default:
                    if (appointments.length < 2) {
                        res.json(`OK Day ${day} current slot: ${appointments.length}`);
                    } else {
                        console.error(`No available slot current appointments: ${appointments.length}`);
                        res.status(403).json(`No available slot (${appointments.length})`);
                    }
            }

        })
        .catch(err => {
            console.error(`Database failure ${err}`);
            res.status(400).json(`Database failure ${err}`);
        });
});

appointmentRouter.route('/:id').get((req, res) => {

    Appointment.findById(req.params.id)
        .then(appointment => {
            if (appointment == null) {
                sayNotFound(req, res)
            } else {
                res.json(appointment);
            }
        })
        .catch(dbError => {
            sayNotFound(req, res, dbError);
        });
});

appointmentRouter.route('/:id').delete((req, res) => {

    Appointment.findByIdAndDelete(req.params.id)
        .then(appointment => {
            if (appointment.length === 0) {

                console.error(`No data for appointment ${req.params.id}`);
                res.status(404).json(`No data for appointment ${req.params.id}`);

            } else {
                res.json(`Appointment ${req.params.id} is deleted.`);
            }
        })
        .catch(dbError => {
            sayNotFound(req, res, dbError);
        });
});

appointmentRouter.route('/update/:id').post((req, res) => {
    console.log(`router 131: ${req.params.id}`);

    Appointment.findByIdAndUpdate(req.params.id)
        .then(appointment => {
            if (appointment.length === 0) {
                console.error(`No data for appointment ${req.params.id}`);
                res.status(404).json(`No data for appointment ${req.params.id}`);

            } else {

                appointment.name = req.body.name;
                appointment.email = req.body.email;
                appointment.scheduledDate = Date.parse(req.body.scheduledDate);

                //check scheduledDate
                appointment.save()
                    .then(() => {
                        res.json(`Appointment ${req.params.id} is updated.`);
                    })
                    .catch(dbError => {
                        let message = `Failed to update appointment ${req.params.id}, reason: ${dbError}`;
                        console.error(message);
                        res.status(400).json(message);
                    })
            }
        })
        .catch(dbError => {
            sayNotFound(req, res, dbError);
        });
});

function isTimingOk(schedule) {

    let now = moment();
    let dayDiff = schedule.diff(now, 'days');
    let minuteDiff = schedule.diff(now, 'minutes');

    //console.log(`Day diff ${dayDiff}, and minute diff ${minuteDiff}`);
    if (dayDiff > 21) {
        console.log(`Appointment more than 3 weeks will not be scheduled ${schedule}`);
        //res.status(403).json(`Appointment more than 3 weeks will not be scheduled`);
        return {
            status: false,
            message: `Appointment more than 3 weeks will not be scheduled ${schedule}`
        }
    }

    if (minuteDiff < 61 && schedule.hour() === now.hour()) {
        console.log(`Appointment in the same hour is not allowed ${schedule}`);
        //res.status(403).json(`Appointment in the same hour is not allowed`);
        return {
            status: false,
            message: `Appointment in the same hour is not allowed ${schedule}`
        }
    }

    if (minuteDiff < 0) {
        return {
            status: false,
            message: `Appointment is in the past ${schedule}`
        }
    }

    return {
        status: true
    }
}

function sayNotFound(req, res, dbError) {

    let dbErrorMsg = dbError == null ? '' : dbError.toString();
    let message = `Appointment ${req.params.id} is not found ${dbErrorMsg}`;
    console.error(message);
    res.status(400).json(message);
}


module.exports = appointmentRouter;