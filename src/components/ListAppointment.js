import React, {Component} from "react";
import {Link} from "react-router-dom";
import axios from "axios";
import format from "date-fns/format";

const Appointment = props => (
    <tr>
        <td>{props.appointment.name}</td>
        <td>{props.appointment.email}</td>
        <td>{format(Date.parse(props.appointment.scheduledDate), "EEEE, d-MMM-yyyy h:mma")}</td>
        <td>
            <Link to={"/change/" + props.appointment._id}>Edit</Link> |
            &nbsp;<a href="#" onClick={() => {
            props.deleteAppointment(props.appointment._id)
        }}>Delete</a>
        </td>
    </tr>
);

export default class ListAppointment extends Component {

    constructor(props) {
        super(props);
        this.deleteAppointment = this.deleteAppointment.bind(this);
        this.state = {appointments: []};
    }

    componentDidMount() {
        axios.get(`http://localhost:5000/appointments`)
            .then(res => {
                this.setState({appointments: res.data})
            })
            .catch((error) => {
                console.error('Unable to get data from server');
            })
    }

    listAppointment() {
        return this.state.appointments.map(currentAppointment => {
            return <Appointment appointment={currentAppointment} deleteAppointment={this.deleteAppointment}
                                key={currentAppointment._id}/>
        })
    }

    deleteAppointment(id) {
        axios.delete(`http://localhost:5000/appointments/${id}`)
            .then(res => {
                console.log(res.data);
            })
            .catch(httpErr => {
                console.error(httpErr);
            });

        this.componentDidMount();
    }

    render() {
        return (
            <div>
                <h3>Appointment List</h3>
                <table className="table">
                    <thead className="thead-light">
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Scheduled Date</th>
                        <th>&nbsp;</th>
                    </tr>
                    </thead>
                    <tbody>
                    {this.listAppointment()}
                    </tbody>
                </table>
            </div>
        );
    }
}