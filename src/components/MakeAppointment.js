import React, {Component} from "react";
import axios from 'axios';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"
import setHours from "date-fns/setHours";
import setMinutes from "date-fns/setMinutes";
import addWeeks from "date-fns/addWeeks";
import getProperDateTime from "./Utils";


export default class MakeAppointment extends Component {

    constructor(props) {
        super(props);

        this.onChangeName = this.onChangeName.bind(this);
        this.onChangeEmail = this.onChangeEmail.bind(this);
        this.onChangeScheduledDate = this.onChangeScheduledDate.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.handleDateTimeChange = this.handleDateTimeChange.bind(this);

        this.state = {
            name: '',
            email: '',
            scheduledDate: getProperDateTime(),
            slotAvailable: false,
            preventSubmit: true,
            message: ''
        }
    }

    onChangeName(e) {

        this.setState({
            name: e.target.value,
            preventSubmit: this.state.name !== '' || this.state.email !== '' || !this.state.slotAvailable
        });

    }

    onChangeEmail(e) {

        this.setState({
            email: e.target.value,
            preventSubmit: this.state.name !== '' || this.state.email !== '' || !this.state.slotAvailable
        });
    }

    onChangeScheduledDate(event) {
        console.log(`MakeAppointment: ${this.state.scheduledDate.toISOString()}`)

        const newAppointment = {
            scheduledDate: this.state.scheduledDate
        }

        axios.post(`http://localhost:5000/appointments/available`, newAppointment)
            .then(res => {

                this.setState({
                    slotAvailable: true,
                    message: '',
                    preventSubmit: !(this.state.name && this.state.email)
                });

            })
            .catch(error => {
                console.log('CheckSlotAvailability: ' + error);
                this.setState({
                    slotAvailable: false,
                    preventSubmit: true,
                    message: `Slot is not available at ${this.state.scheduledDate.toISOString()}`
                })

            });
    }

    onSubmit(e) {
        e.preventDefault();
        if (this.state.preventSubmit) return;

        const appointment = {
            name: this.state.name,
            email: this.state.email,
            scheduledDate: this.state.scheduledDate
        };

        console.log(appointment);

        axios.post(`http://localhost:5000/appointments/add`, appointment)
            .then(res => {
                console.log(res.data);
                this.setState({
                    name: '',
                    email: '',
                    scheduledDate: getProperDateTime(),
                    preventSubmit: true
                });

                window.location = '/';

            })
            .catch(error => {
                console.log(error);
            })
    }

    handleDateTimeChange(date) {
        this.setState({
            scheduledDate: date
        });
    }

    render() {

        return (
            <div>
                <h3>Change Appointment</h3>
                <form onSubmit={this.onSubmit}>
                    <div className="form-group">
                        <label>Name</label>
                        <input type="text" required className="form-control" value={this.state.name}
                               onChange={this.onChangeName}/>
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="text" required className="form-control" value={this.state.email}
                               onChange={this.onChangeEmail}/>
                    </div>
                    <div className="form-group">
                        <label>Scheduled Date </label>
                        &nbsp;
                        <DatePicker selected={this.state.scheduledDate}
                                    showTimeSelect
                                    timeFormat="HH:mm"
                                    timeInterval={30}
                                    timeCaption="time"
                                    dateFormat="E, d-M-yyyy h:mm aa"
                                    minTime={setHours(setMinutes(new Date(), 0), 9)}
                                    maxTime={setHours(setMinutes(new Date(), 30), 17)}
                                    minDate={new Date()}
                                    maxDate={addWeeks(new Date(), 3)}
                                    showDisabledMonthNavigation
                                    onCalendarClose={this.onChangeScheduledDate}
                                    onChange={this.handleDateTimeChange}
                        />
                        &nbsp;
                        {this.state.message}
                    </div>
                    <div className="form-group">
                        <input type="submit" disabled={this.state.preventSubmit} value="Make Appointment"
                               className="btn btn-primary"/>
                    </div>
                </form>
            </div>
        );
    }
}