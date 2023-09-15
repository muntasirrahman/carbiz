# Trivial Web Application

[![Watch the demo here](https://img.youtube.com/vi/xmO-qMJuyB0/0.jpg)](https://youtu.be/xmO-qMJuyB0)

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).


## Components

This project comprises of 2 group of code:
* Frontend code using React
* Backend code using Node.js

The data storage is Mongodb.

### Backend

To launch the backend app, type:

```shell
cd backend
nodemon server
```

The backend server listens at port 5000 for incoming RESTful API request.

To simplify the data mapping to/from Mongodb, the backend uses Mongoose framework.

The backend provides following API:


| *Action* | *HTTP Method* | *URL* |
|---|---|---|
| List of Booking | GET | / |
| Booking details | GET | /:id |
| Delete booking | DELETE | /:id |
| Update booking | POST | /update |
| Add new booking | POST | /add |
| Inspection slot availability | POST | /available |

### Frontend

To launch the frontend application.
```shell
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Features

* User Can't Book inspection in the same hour
* User can only book for the next 3 weeks
* Frontend handle response from Backend API


#### User Can't Book inspection in the same hour
Frontend

* [MakeAppointment.js](./src/components/MakeAppointment.js)
* [ChangeAppointment.js](./src/components/ChangeAppointment.js)


```jsx
<DatePicker selected={this.state.scheduledDate}
            minTime={setHours(setMinutes(new Date(), 0), 9)}
            maxTime={setHours(setMinutes(new Date(), 30), 17)}

            minDate={new Date()}
            maxDate={addWeeks(new Date(), 3)}
```

*Backend*

[router.js](./backend/router.js)

```javascript

    if (minuteDiff < 61 && schedule.hour() === now.hour()) {
        console.log(`Appointment in the same hour is not allowed ${schedule}`);
        //res.status(403).json(`Appointment in the same hour is not allowed`);
        return {
            status: false,
            message: `Appointment in the same hour is not allowed ${schedule}`
        }
    }
```


#### User can only book for the next 3 weeks
This feature is implemented in frontend and backend.

*Frontend*

```jsx

<DatePicker selected={this.state.scheduledDate}
    //between 9am to 6pm    
    minTime={setHours(setMinutes(new Date(), 0), 9)}
    maxTime={setHours(setMinutes(new Date(), 30), 17)}

    //for the next 3 weeks only
    minDate={new Date()}
    maxDate={addWeeks(new Date(), 3)}
```

User also can only book from 9am to 6pm


*Backend*

```javascript
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
```
#### Frontend handle response from Backend API

### Bonus: Slot Availability is updated in realtime

The frontend send RESTful request
```javascript
axios.post(`http://localhost:5000/appointments/available`, newAppointment)
    .then(res => {

        this.setState({
            slotAvailable: true,
            message: '',
            preventSubmit: !(this.state.name && this.state.email)
        });

```

This request is handled by backend at
[router.js](./backend/router.js)

```javascript
appointmentRouter.route('/available').post((req, res) => {

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
```