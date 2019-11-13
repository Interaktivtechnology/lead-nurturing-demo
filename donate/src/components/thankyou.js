import React from 'react';
import {
    Col, Button,
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import background from '../static/img/aerial-singapore.jpg';
import { CMS_URL } from '../static/variable';

class ThankYou extends React.Component {
    constructor() {
        super();
        this.state = {
            banner: '',
        };
        this.getPage = this.getPage.bind(this);
    }

    componentWillMount() {
        this.getPage();
    }

    async getPage() {
        const banner = await fetch(`${CMS_URL}banners?slug=donation`)
            .then(response => response.json());
        this.setState({ banner: banner[0] || {} });
    }

    render() {
        return (
            <Col style={{ padding: 0, height: window.innerHeight, backgroundImage: `url(${background})`, display: window.innerWidth < 992 ? 'flex' : null, backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center top' }}>
                <Col lg={10} md={12} sm={12} xs={12} className={`white-background ${window.innerWidth > 1200 ? 'center-center' : null}`} style={{ padding: 0, maxWidth: 1200, borderRadius: 5 }}>
                    <Col lg={6} md={6} sm={10} xs={10} className="white-background center-block text-center" style={{ padding: 40 }}>
                        <img className="center-block" src={require('../static/img/interaktiv-logo.png')} style={{ width: 100, marginBottom: 30 }} alt="step logo" />
                        <img src={require('../static/img/thankyou-people.jpg')} alt="step logo" style={{ width: '100%' }} />
                        <h1><b>Thank You for Your Donation!</b></h1>
                        <p className="grey-text">
                            Your donation is now completed. You’ll get an Email with all the information about 
                            “Lorem Ipsum”. Thank you again, you’re good person.
                        </p>
                        <Link to="/">
                            <Button className="center-block" bsStyle="primary" bsSize="lg">Back to Home</Button>
                        </Link>
                    </Col>
                </Col>
            </Col>
        );
    }
}

export default ThankYou;
