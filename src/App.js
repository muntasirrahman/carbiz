import React from 'react';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import NavigationMenu from "./components/NavigationMenu";
import ListAppointment from "./components/ListAppointment";
import MakeAppointment from "./components/MakeAppointment";
import ChangeAppointment from "./components/ChangeAppointment";

function App() {
    return (
        <Router>
            <div className="container">
                <NavigationMenu/>
                <br/>
                <Route path="/" exact component={ListAppointment}/>
                <Route path="/make" exact component={MakeAppointment}/>
                <Route path="/change/:id" exact component={ChangeAppointment}/>
            </div>
        </Router>
    );
}

export default App;
