import React from 'react';
import {
    Col, Button,
} from 'react-bootstrap';
import sweetalert from 'sweetalert2';
import { Link } from 'react-router-dom';
import background from '../static/img/aerial-singapore.jpg';
import { API_URL, CMS_URL } from '../static/variable';

class Confirm extends React.Component {
    constructor() {
        super();
        this.state = {
            programmeEventName: '',
            participantName: '',
            participantId: '',
        };
        this.getPage = this.getPage.bind(this);
        this.confirm = this.confirm.bind(this);
    }

    componentWillMount() {
        this.getPage();
    }

    async getPage() {
        const { params } = this.props.match;
        
        const programmeEvent = await fetch(`${API_URL}donation/active-programmes`)
            .then(res => res.json());

        programmeEvent.records.forEach((element) => {
            if (element.Id === params.programmeId) {
                this.setState({ programmeEventName: element.Ttile__c });
            }
        });

        const participant = await fetch(`${API_URL}application/getParticipant?participantId=${params.participantId}`)
            .then(res => res.json());
        console.log(participant.result);
        this.setState({ participantName: participant.result.records[0].Contact__r.Name });
        this.setState({ participantId: participant.result.records[0].Id });
    }

    async confirm(confirmation) {
        const { participantId } = this.state;
        const participantData = {
            participantId,
            confirmation,
        };

        const response = await fetch(`${API_URL}application/confirmParticipant`, {
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(participantData),
            method: 'POST',
        }).then(res => res.json());

        sweetalert.fire({
            text: 'Thank You',
            type: 'success',
            title: 'Your confirmation has been sent',
            imageUrl: require('../static/img/interaktiv-logo.png'),
            animation: true,
        }).then(() => {
            location.reload();
        });
    }

    render() {
        const { programmeEventName, participantName } = this.state;

        return (
            <Col style={{ padding: 0, height: window.innerHeight, backgroundImage: `url(${background})`, display: window.innerWidth < 992 ? 'flex' : null, backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center top' }}>
                <Col lg={10} md={12} sm={12} xs={12} className={`white-background ${window.innerWidth > 1200 ? 'center-center' : null}`} style={{ padding: 0, maxWidth: 1200, borderRadius: 5 }}>
                    <Col lg={6} md={6} sm={10} xs={10} className="white-background center-block text-center" style={{ padding: 50 }}>
                        <img className="center-block" src={require('../static/img/interaktiv-logo.png')} style={{ width: 100, marginBottom: 30 }} alt="step logo" />
                        <img src={require('../static/img/kids.png')} alt="step logo" style={{ width: '50%' }} />
                        <h1><b>{programmeEventName}</b></h1>
                        <p className="grey-text">
                            {participantName}
                        </p>
                        <Col lg={6} md={6} sm={6} xs={6}>
                            <Button className="center-block" bsStyle="primary" bsSize="lg" onClick={() => this.confirm('Accepted')}>Accept</Button>
                        </Col>
                        <Col lg={6} md={6} sm={6} xs={6}>
                            <Button className="center-block" bsSize="lg" onClick={() => this.confirm('Rejected')}>Reject</Button>
                        </Col>
                    </Col>
                </Col>
            </Col>
        );
    }
}

export default Confirm;
