import React from 'react';
import {
    Col, FormGroup, FormControl, Checkbox, Radio, Button, HelpBlock,
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { submitDonation } from './donate_action';
import validation, { isValidEmail } from '../helper/validation';
import background from '../static/img/aerial-singapore.jpg';
import donateImage from '../static/img/bg-contactus.jpg';
import { API_URL, CMS_URL } from '../static/variable';

class Donate extends React.Component {
    constructor() {
        super();
        this.state = {
            banner: '',
            IDno: '',
            salutation: '',
            firstName: '',
            lastName: '',
            email: '',
            companyName: '',
            address: '',
            city: '',
            country: 'Singapore',
            stateProvince: '',
            postalCode: '',
            phoneNumber: '',
            notes: '',
            anonymous: false,
            receiveUpdate: false,
            currency: 'SGD',
            amountDefault: true,
            amount: 10,
            recurring: false,
            recurringType: 'yearly',
            recurringAmount: '',
            valid: {},
            contactId: '',
            loading: false,
            countryOptions: {},
            share: true,
            programmeEvent: '',
            programmeEventList: [],
            pdpa: false,
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleChangeAmountPaymentRadio = this.handleChangeAmountPaymentRadio.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.validationCheck = this.validationCheck.bind(this);
        this.getPage = this.getPage.bind(this);
        this.getCountryList = this.getCountryList.bind(this);
    }

    componentWillMount() {
        this.getPage();
        this.getCountryList();
    }

    async getPage() {
        const programmeEvent = await fetch(`${API_URL}donation/active-programmes`)
            .then(res => res.json());
        this.setState({ programmeEventList: programmeEvent.records });

        if (this.props.location.state) {
            const { obj } = this.props.location.state;
            for (let i = 0; i < programmeEvent.records.length; i++) {
                const data = programmeEvent.records[i];
                if (obj.programme === data.Ttile__c) {
                    this.setState({ programmeEvent: data.Id });
                }
            }
        }
    }

    getCountryList() {
        const countries = require('../static/countries.js');
        const options = [];
        const ordered = {};

        Object.keys(countries.default).sort().forEach((key) => {
            ordered[key] = countries.default[key];
        });
        Object.keys(ordered).forEach((key) => {
            options.push(<option value={countries.default[key]}>{countries.default[key]}</option>);
        });

        this.setState({ countryOptions: options });
    }

    async handleChange(event) {
        if (event.target.name === 'recurring') {
            if (event.target.value) {
                this.setState({
                    recurringAmount: '',
                });
            }
        }
        
        if (event.target.type === 'checkbox') {
            this.setState({ [event.target.name]: !this.state[event.target.name] });
        } else {
            this.setState({ [event.target.name]: event.target.value });
        }

        /*
        if (event.target.name === 'email') {
            // const { email } = this.state;
            if (isValidEmail(event.target.value)) {
                this.setState({ loading: true });
                try {
                    const response = await fetch(`${API_URL}donation/getContactId?email=${encodeURI(event.target.value)}`, {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }).then(res => res.json());
                    this.setState({ loading: false });
                    if (response.info === null) return;
                    const {
                        BillingCity, BillingCountry, BillingPostalCode, BillingStreet, BillingState, Phone,
                    } = response.info.Account;
                    const nameSplitted = response.info.Name.split(' ');
                    this.setState({
                        contactId: response.contactId,
                        accountId: response.accountId,
                        loading: false,
                        address: BillingStreet,
                        city: BillingCity,
                        country: BillingCountry,
                        stateProvince: BillingState,
                        postalCode: BillingPostalCode,
                        phoneNumber: Phone,
                        firstName: nameSplitted[0] || '',
                        lastName: nameSplitted[1] || '',
                    }, () => console.info(this.state));
                } catch (error) {
                    this.setState({ loading: false });
                }
            }
        }
        */
    }

    handleChangeAmountPaymentRadio(event) {
        this.setState({
            amount: event.target.value,
            amountDefault: null,
        });
    }

    async handleSubmit(event) {
        event.preventDefault();
        if (this.validationCheck()) {
            this.setState({ loading: true });
            const {
                IDno, salutation, firstName, lastName, email, companyName, address, city, country, stateProvince, postalCode, phoneNumber, notes, anonymous, receiveUpdate, currency, amount, recurring, recurringType, recurringAmount, remarks, accountId, contactId, programmeEvent, pdpa,
            } = this.state;
            const data = {
                IDno, salutation, firstName, lastName, email, companyName, address, city, country, stateProvince, postalCode, phoneNumber, notes, anonymous, receiveUpdate, currency, amount, recurring, recurringType, recurringAmount, remarks, accountId, contactId, programmeEvent, pdpa,
            };
            
            await submitDonation(data);
            this.setState({ loading: false });
        }
    }

    validationCheck() {
        const {
            firstName, lastName, email, amount, IDno, pdpa,
        } = this.state;

        const valid = {};
        valid.IDno = validation(IDno, ['required']);
        valid.firstName = validation(firstName, ['required']);
        valid.lastName = validation(lastName, ['required']);
        valid.email = validation(email, ['required', 'email']);
        valid.amount = validation(amount.toString(), ['required', 'number']);
        valid.pdpa = validation(pdpa, ['true']);
        this.setState({ valid });

        for (const key of Object.keys(valid)) {
            if (!valid[key].success) return false;
        }
        return true;
    }

    render() {
        const {
            IDno, firstName, lastName, email, companyName, address, city, country, stateProvince, postalCode, phoneNumber, anonymous, receiveUpdate, currency, amount, recurring, recurringType, recurringAmount, valid, countryOptions, loading, amountDefault, remarks, programmeEvent,
            programmeEventList, pdpa,
        } = this.state;
        
        return (
            <Col style={{ padding: 0, height: window.innerHeight, backgroundImage: `url(${background})`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center center' }}>
                <form onSubmit={this.handleSubmit}>
                    <Col lg={10} md={12} sm={12} xs={12} className={window.innerWidth > 1200 ? 'center-center' : null} style={{ float: 'none', display: window.innerWidth > 992 ? 'flex' : null, padding: 0, maxWidth: 1200 }}>
                        <Col sm={12} xs={12} style={{ backgroundColor: '#fff', padding: 0, backgroundImage: `url(${donateImage})`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center top', height: window.innerWidth > 992 ? 'auto' : 70 }}>
                            <div style={{ position: 'absolute', width: 130, height: 70, backgroundColor: '#fff', borderBottomRightRadius: 7 }}>
                                <img className="center-center" src={require('../static/img/interaktiv-logo.png')} style={{ width: 100 }} alt="step logo" />
                            </div>
                            <Col lg={12} smHidden xsHidden style={{ position: 'absolute', bottom: 0, background: 'rgba(0,0,0,0.5)', height: '20%' }}>
                                <h4 style={{ color: 'white' }}>InterAktiv Foundation</h4>
                                <span className="white-text" style={{ lineHeight: '20px' }}>
                                Our goal is to alleviate the poor and focus on global warming issues
                                </span>
                            </Col>
                        </Col>
                        <Col sm={12} xs={12} style={{ flexGrow: 1, backgroundColor: '#fff', padding: 20 }}>
                            <h3>Donor Information</h3>
                            <FormGroup validationState={'email' in valid ? valid.email.state : null} bsSize="small">
                                <FormControl type="text" placeholder="Email Address" name="email" onChange={this.handleChange} value={email} />
                                <HelpBlock>{'email' in valid ? valid.email.text : null}</HelpBlock>
                            </FormGroup>
                            <FormGroup bsSize="small" validationState={'IDno' in valid ? valid.IDno.state : null}>
                                <FormControl type="text" placeholder="ID No" name="IDno" onChange={this.handleChange} value={IDno} />
                                <HelpBlock>{'IDno' in valid ? valid.IDno.text : null}</HelpBlock>
                            </FormGroup>
                            <FormGroup bsSize="small" validationState={'firstName' in valid ? valid.firstName.state : null}>
                                <FormControl type="text" placeholder="Given Name" name="firstName" onChange={this.handleChange} value={firstName} />
                                <HelpBlock>{'firstName' in valid ? valid.firstName.text : null}</HelpBlock>
                            </FormGroup>
                            <FormGroup bsSize="small" validationState={'lastName' in valid ? valid.lastName.state : null}>
                                <FormControl type="text" placeholder="Surname" name="lastName" onChange={this.handleChange} value={lastName} />
                                <HelpBlock>{'lastName' in valid ? valid.lastName.text : null}</HelpBlock>
                            </FormGroup>
                            <FormGroup validationState={'phoneNumber' in valid ? valid.phoneNumber.state : null} bsSize="small">
                                <FormControl type="text" placeholder="Phone Number" name="phoneNumber" onChange={this.handleChange} value={phoneNumber} />
                                <HelpBlock>{'phoneNumber' in valid ? valid.phoneNumber.text : null}</HelpBlock>
                            </FormGroup>
                            <FormGroup validationState={'companyName' in valid ? valid.companyName.state : null} bsSize="small">
                                <FormControl type="text" placeholder="Company Name" name="companyName" onChange={this.handleChange} value={companyName} />
                                <HelpBlock>{'companyName' in valid ? valid.companyName.text : null}</HelpBlock>
                            </FormGroup>
                            <FormGroup validationState={'address' in valid ? valid.address.state : null} bsSize="small">
                                <FormControl componentClass="textarea" placeholder="Address" name="address" onChange={this.handleChange} value={address} />
                                <HelpBlock>{'address' in valid ? valid.address.text : null}</HelpBlock>
                            </FormGroup>
                            <FormGroup validationState={'city' in valid ? valid.city.state : null} bsSize="small">
                                <FormControl type="text" placeholder="City" name="city" onChange={this.handleChange} value={city} />
                                <HelpBlock>{'city' in valid ? valid.city.text : null}</HelpBlock>
                            </FormGroup>
                            <FormGroup validationState={null} bsSize="small">
                                <FormControl type="text" placeholder="State / Province" name="stateProvince" onChange={this.handleChange} value={stateProvince} />
                                <HelpBlock>{'stateProvince' in valid ? valid.stateProvince.text : null}</HelpBlock>
                            </FormGroup>
                            <FormGroup validationState={null} bsSize="small">
                                <FormControl componentClass="select" placeholder="Country" name="country" onChange={this.handleChange} value={country}>
                                    {countryOptions}
                                </FormControl>
                            </FormGroup>
                            <FormGroup validationState={'postalCode' in valid ? valid.postalCode.state : null} bsSize="small">
                                <FormControl type="text" placeholder="Postal Code" name="postalCode" onChange={this.handleChange} value={postalCode} />
                                <HelpBlock>{'postalCode' in valid ? valid.postalCode.text : null}</HelpBlock>
                            </FormGroup>
                            <h3>More Info</h3>
                            <FormGroup validationState={'notes' in valid ? valid.notes.state : null} bsSize="small">
                                <FormControl componentClass="textarea" placeholder="Remarks" name="remarks" onChange={this.handleChange} value={remarks} />
                                <HelpBlock>{'notes' in valid ? valid.notes.text : null}</HelpBlock>
                            </FormGroup>
                            <Col>
                                <Checkbox name="anonymous" validationState={'anonymous' in valid ? valid.anonymous.state : null} onChange={this.handleChange} value={anonymous}>
                                    <span className="checkmark-box" />
                                    <i className="sm-text">
                                    I would like my donation to be anonymous.
                                    </i>
                                </Checkbox>
                            </Col>
                            <Col>
                                <Checkbox name="receiveUpdate" validationState={'receiveUpdate' in valid ? valid.receiveUpdate.state : null} onChange={this.handleChange} value={receiveUpdate}>
                                    <span className="checkmark-box" />
                                    <i className="sm-text">
                                    Yes, I would like to receive updates about Charitable projects in Asia Pacific.
                                    </i>
                                </Checkbox>
                            </Col>
                        </Col>
                        <Col sm={12} xs={12} style={{ flexGrow: 1, backgroundColor: '#fff', padding: 20, borderLeft: 1, borderColor: '#000' }}>
                            <h3>Programme/Event</h3>
                            <FormGroup validationState={null} bsSize="small">
                                <FormControl
                                    componentClass="select"
                                    placeholder="Programme/Event"
                                    name="programmeEvent"
                                    onChange={this.handleChange}
                                    value={programmeEvent}
                                >
                                    <option value="" />
                                    {programmeEventList.map(programme => (
                                        <option value={programme.Id}>{programme.Ttile__c}</option>
                                    ))}
                                </FormControl>
                            </FormGroup>
                            <div className="clearfix" />
                            <h3>Donation Amount</h3>
                            <FormGroup className="clearfix" bsSize="small">
                                <Col>
                                    <Radio name="amountRadio" value={5} onChange={this.handleChangeAmountPaymentRadio} inline>
                                        <span className="checkmark" />
                                        $5
                                    </Radio>
                                    <Radio name="amountRadio" checked={amountDefault} value={10} onChange={this.handleChangeAmountPaymentRadio} inline>
                                        <span className="checkmark" />
                                        $10
                                    </Radio>
                                    <Radio name="amountRadio" value={25} onChange={this.handleChangeAmountPaymentRadio} inline>
                                        <span className="checkmark" />
                                        $25
                                    </Radio>
                                    <Radio name="amountRadio" value={50} onChange={this.handleChangeAmountPaymentRadio} inline>
                                        <span className="checkmark" />
                                        $50
                                    </Radio>
                                    <Radio name="amountRadio" value={100} onChange={this.handleChangeAmountPaymentRadio} inline>
                                        <span className="checkmark" />
                                        $100
                                    </Radio>
                                </Col>
                                <Col style={{ marginTop: 10 }}>
                                    <Radio name="amountRadio" value={null} onChange={this.handleChangeAmountPaymentRadio} inline>
                                        <span className="checkmark" />
                                        Other
                                    </Radio>
                                </Col>
                            </FormGroup>
                            <Col className="clearfix">
                                <Col lg={4} md={4} sm={4} xs={4} style={{ padding: 0 }}>
                                    <FormGroup validationState={null} bsSize="small">
                                        <FormControl componentClass="select" placeholder="" name="currency" onChange={this.handleChange} value={currency}>
                                            <option value="SGD">SGD</option>
                                            <option value="USD">USD</option>
                                        </FormControl>
                                    </FormGroup>
                                </Col>
                                <Col lg={8} md={8} sm={8} xs={8}>
                                    <FormGroup validationState={'amount' in valid ? valid.amount.state : null} bsSize="small">
                                        <FormControl type="number" name="amount" onChange={this.handleChange} value={amount} />
                                        <HelpBlock>{'amount' in valid ? valid.amount.text : null}</HelpBlock>
                                    </FormGroup>
                                </Col>
                            </Col>
                            <Col className="clearfix">
                                <Col lg={7} md={7} sm={7} xs={7} style={{ paddingTop: 5, paddingLeft: 0, paddingRight: 0 }}>
                                    <Checkbox name="recurring" validationState={'recurring' in valid ? valid.recurring.state : null} onChange={this.handleChange} value={recurring}>
                                        <span className="checkmark-box" />
                                        <i className="sm-text">
                                        Make this a recurring donation
                                        </i>
                                    </Checkbox>
                                </Col>
                                <Col lg={5} md={5} sm={5} xs={5}>
                                    <FormGroup validationState={null} bsSize="small">
                                        <FormControl disabled={!recurring} componentClass="select" placeholder="" name="recurringType" onChange={this.handleChange} value={recurringType}>
                                            <option value="yearly">Annualy</option>
                                            <option value="monthly">Monthly</option>
                                        </FormControl>
                                    </FormGroup>
                                </Col>
                            </Col>
                            <Col className="clearfix">
                                <Col lg={6} md={6} sm={6} xs={6} style={{ paddingTop: 10, paddingLeft: 0, paddingRight: 0 }}>
                                    <i className="sm-text grey-text">
                                        Number of recurring donations (optional):
                                    </i>
                                </Col>
                                <Col lg={6} md={6} sm={6} xs={6}>
                                    <FormGroup validationState={'recurringAmount' in valid ? valid.amount.state : null} bsSize="small">
                                        <FormControl disabled={!recurring} type="number" name="recurringAmount" onChange={this.handleChange} value={recurringAmount} />
                                        <HelpBlock>{'recurringAmount' in valid ? valid.recurringAmount.text : null}</HelpBlock>
                                    </FormGroup>
                                </Col>
                            </Col>
                            <p className="sm-text grey-text">
                            Please note that credit card companies typically assess a fee of approximately 2.5 percent per transaction for donations made online.
                            To make your donation by check, wire transfer, bitcoin, or securities transfer,&nbsp;
                                <Link to="/" className="blue-text" >click here to learn how</Link>
                            </p>
                            <Col className="clearfix">
                                <Checkbox name="pdpa" validationState={'pdpa' in valid ? valid.pdpa.state : null} onChange={this.handleChange} value={pdpa}>
                                    <span className="checkmark-box" />
                                    <i className="sm-text">
                                    By checking this box, I agree for Boys’ Town to use my personal information for purposes related to tax exemption, fundraising, database management and communications, security screening and statistical analysis. I accept that Boys’ Town will keep the personal data confidential and restrict accessibility to only authorised and need-to-know personnel.
                                        <br />
                                        <br />
                                    Donations are entitled to 2.3 times tax deduction (if applicable). Please ensure you provide your NRIC/FIN No.
                                    </i>
                                </Checkbox>
                            </Col>
                            <Button className="center-block" bsStyle="primary" bsSize="lg" type="submit" disabled={loading}>
                                Submit
                            </Button>
                        </Col>
                    </Col>
                </form>
            </Col>
        );
    }
}

export default Donate;
