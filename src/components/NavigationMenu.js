import React from "react";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";

export default function NavigationMenu() {
    return (
        <Navbar bg="light" expand="lg">
            <Navbar.Brand href="/">Carsome Inspection Booking</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav"/>
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="mr-auto">
                    <Nav.Link href="/">Appointment List</Nav.Link>
                    <Nav.Link href="/make">Make Appointment</Nav.Link>
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );
};

