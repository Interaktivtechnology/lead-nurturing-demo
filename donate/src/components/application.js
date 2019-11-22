import React from 'react';
import {
    Col, Button, FormGroup, FormControl, HelpBlock, ControlLabel, Row, Checkbox, Radio,
} from 'react-bootstrap';
import validation, { isValidEmail, validateNRIC } from '../helper/validation';
import '../static/shf.css';
import { submitApplication } from './application_action';

class Application extends React.Component {
    constructor() {
        super();
        this.state = {
            valid: {},
            countryOptions: {},
            dateOptions: {},
            yearOptions: {},
            tabActive: 1,
            name: '',
            mobilePhone: '',
            homePhone: '',
            officePhone: '',
            email: '',
            gender: 'Male',
            language: 'English',
            nationality: 'Singapore',
            race: '',
            dateBirth: 1,
            monthBirth: 10,
            yearBirth: 2010,
            cprAed: false,
            cprAedI: false,
            bclsAed: false,
            bclsAedI: false,
            standardFirstAid: false,
            occupation: '',
            schoolName: '',
            courseOfStudy: '',
            cprAedExperience: '',
            cprAedLanguage: '',
            motivation: '',
            volunteeredExperince: '',
            weekdayMorningAvailability: false,
            weekdayAfternoonAvailability: false,
            weekdayNightAvailability: false,
            weekendMorningAvailability: false,
            weekendAfternoonAvailability: false,
            weekendNightAvailability: false,
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.getCountryList = this.getCountryList.bind(this);
        this.getDateList = this.getDateList.bind(this);
        this.nextTab = this.nextTab.bind(this);
    }

    componentWillMount() {
        this.getCountryList();
        this.getDateList();
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

    getDateList() {
        const dateOptions = [];
        const yearOptions = [];

        for (let i = 1; i <= 31; i++) {
            dateOptions.push(<option value={i}>{i}</option>);
        }
        this.setState({ dateOptions });

        for (let i = 2010; i >= 1950; i--) {
            yearOptions.push(<option value={i}>{i}</option>);
        }
        this.setState({ yearOptions });
    }

    async handleChange(event) {
        if (event.target.type === 'checkbox') {
            this.setState({ [event.target.name]: !this.state[event.target.name] });
        } else {
            this.setState({ [event.target.name]: event.target.value });
        }
    }

    async handleSubmit(event) {
        event.preventDefault();
        if (this.validationCheck()) {
            this.setState({ loading: true });
            const {
                name, mobilePhone, homePhone, officePhone, email, gender, language,
                nationality, race, dateBirth, monthBirth, yearBirth, cprAed, cprAedI, bclsAed, bclsAedI, standardFirstAid,
                occupation, schoolName, courseOfStudy, cprAedExperience, cprAedLanguage, motivation, volunteeredExperince,
                weekdayMorningAvailability, weekdayAfternoonAvailability, weekdayNightAvailability,
                weekendMorningAvailability, weekendAfternoonAvailability, weekendNightAvailability,
            } = this.state;
            const data = {
                name, mobilePhone, homePhone, officePhone, email, gender, language,
                nationality, race, dateBirth, monthBirth, yearBirth, cprAed, cprAedI, bclsAed, bclsAedI, standardFirstAid,
                occupation, schoolName, courseOfStudy, cprAedExperience, cprAedLanguage, motivation, volunteeredExperince,
                weekdayMorningAvailability, weekdayAfternoonAvailability, weekdayNightAvailability,
                weekendMorningAvailability, weekendAfternoonAvailability, weekendNightAvailability,
            };

            await submitApplication(data);
            this.setState({ loading: false });
        }
    }

    validationCheck() {
        return true;
    }

    nextTab() {
        const { tabActive } = this.state;
        this.setState({ tabActive: tabActive + 1 });
    }

    render() {
        const {
            valid, countryOptions, tabActive,
            name, mobilePhone, homePhone, officePhone, email, gender, language, nationality, race, dateOptions, yearOptions,
            dateBirth, monthBirth, yearBirth, cprAed, cprAedI, bclsAed, bclsAedI, occupation, schoolName, courseOfStudy,
            standardFirstAid, cprAedExperience, motivation, volunteeredExperince,
            weekdayMorningAvailability, weekdayAfternoonAvailability, weekdayNightAvailability,
            weekendMorningAvailability, weekendAfternoonAvailability, weekendNightAvailability,
        } = this.state;

        return (
            <Col lg={12} md={12} sm={12} xs={12}>
                <Col lg={12} md={12} sm={12} xs={12} style={{ height: 120 }}>
                    <img className="center-center" src={require('../static/img/logo-shf.png')} style={{ height: 80 }} alt="shf logo" />
                </Col>
                <Col lg={12} md={12} sm={12} xs={12} style={{ backgroundColor: '#888', height: 80 }}>
                    <Col lg={8} md={12} sm={12} xs={12} lgOffset={2}>
                        <Col lg={6} md={6} sm={6} xs={6} style={{ padding: 0 }}>
                            <Button className="center-block" bsStyle={tabActive === 1 ? 'primary' : ''} bsSize="lg" style={{ width: '100%', height: 80, border: '1px solid #888' }} onClick={() => this.setState({ tabActive: 1 })}>
                                PERSONAL INFO
                            </Button>
                        </Col>
                        <Col lg={6} md={6} sm={6} xs={6} style={{ padding: 0 }}>
                            <Button className="center-block" bsStyle={tabActive === 2 ? 'primary' : ''} bsSize="lg" style={{ width: '100%', height: 80, border: '1px solid #888' }} onClick={() => this.setState({ tabActive: 2 })}>
                                EXPERIENCE
                            </Button>
                        </Col>
                    </Col>
                </Col>
                <form onSubmit={this.handleSubmit}>
                    <Col lg={8} md={12} sm={12} xs={12} lgOffset={2} style={{ paddingBottom: 20, paddingTop: 20 }} >
                        <Col lg={12} md={12} sm={12} xs={12} className={tabActive === 1 ? 'show' : 'hide'}>
                            <Col lg={12} md={12} sm={12} xs={12}>
                                <h1 className="text-center">Let's Talk About Your Personal Info</h1>
                                <p className="text-center">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua</p>
                            </Col>
                            <Col lg={6} md={6} sm={6} xs={6}>
                                <FormGroup validationState={'name' in valid ? valid.name.state : null} bsSize="small">
                                    <ControlLabel>Full Name (as per NRIC)</ControlLabel>
                                    <FormControl type="text" placeholder="" name="name" onChange={this.handleChange} value={name} />
                                    <HelpBlock>{'name' in valid ? valid.name.text : null}</HelpBlock>
                                </FormGroup>
                                <FormGroup validationState={'mobilePhone' in valid ? valid.mobilePhone.state : null} bsSize="small">
                                    <ControlLabel>Mobile Number</ControlLabel>
                                    <FormControl type="text" placeholder="" name="mobilePhone" onChange={this.handleChange} value={mobilePhone} />
                                    <HelpBlock>{'mobilePhone' in valid ? valid.mobilePhone.text : null}</HelpBlock>
                                </FormGroup>
                                <FormGroup validationState={'homePhone' in valid ? valid.homePhone.state : null} bsSize="small">
                                    <ControlLabel>Home Tel</ControlLabel>
                                    <FormControl type="text" placeholder="" name="homePhone" onChange={this.handleChange} value={homePhone} />
                                    <HelpBlock>{'homePhone' in valid ? valid.homePhone.text : null}</HelpBlock>
                                </FormGroup>
                                <FormGroup validationState={'officePhone' in valid ? valid.officePhone.state : null} bsSize="small">
                                    <ControlLabel>Office No (if applicable)</ControlLabel>
                                    <FormControl type="text" placeholder="" name="officePhone" onChange={this.handleChange} value={officePhone} />
                                    <HelpBlock>{'officePhone' in valid ? valid.officePhone.text : null}</HelpBlock>
                                </FormGroup>
                                <FormGroup validationState={'email' in valid ? valid.email.state : null} bsSize="small">
                                    <ControlLabel>Email</ControlLabel>
                                    <FormControl type="text" placeholder="" name="email" onChange={this.handleChange} value={email} />
                                    <HelpBlock>{'email' in valid ? valid.email.text : null}</HelpBlock>
                                </FormGroup>
                                <FormGroup validationState={null} bsSize="small">
                                    <ControlLabel>Gender</ControlLabel>
                                    <FormControl componentClass="select" placeholder="" name="gender" onChange={this.handleChange} value={gender}>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </FormControl>
                                </FormGroup>
                                <FormGroup validationState={null} bsSize="small">
                                    <ControlLabel>Language Proficiency</ControlLabel>
                                    <FormControl componentClass="select" placeholder="" name="language" onChange={this.handleChange} value={language}>
                                        <option value="English">English</option>
                                        <option value="Mandarin">Mandarin</option>
                                        <option value="Malay">Malay</option>
                                        <option value="Tamil">Tamil</option>
                                        <option value="Others">Others</option>
                                    </FormControl>
                                </FormGroup>
                            </Col>
                            <Col lg={6} md={6} sm={6} xs={6}>
                                <FormGroup validationState={null} bsSize="small">
                                    <ControlLabel>Nationality</ControlLabel>
                                    <FormControl componentClass="select" placeholder="" name="nationality" onChange={this.handleChange} value={nationality}>
                                        {countryOptions}
                                    </FormControl>
                                </FormGroup>
                                <FormGroup validationState={null} bsSize="small">
                                    <ControlLabel>Race</ControlLabel>
                                    <FormControl componentClass="select" placeholder="" name="race" onChange={this.handleChange} value={race}>
                                        <option value=""></option>
                                        <option value="Chinese">Chinese</option>
                                        <option value="Malay">Malay</option>
                                        <option value="Indian">Indian</option>
                                        <option value="Eurasian">Eurasian</option>
                                        <option value="Other">Other</option>
                                    </FormControl>
                                </FormGroup>
                                <ControlLabel>Birth Date</ControlLabel>
                                <Row>
                                    <Col lg={4} md={4} sm={4} xs={4}>
                                        <FormGroup validationState={null} bsSize="small">
                                            <FormControl componentClass="select" placeholder="" name="dateBirth" onChange={this.handleChange} value={dateBirth}>
                                                {dateOptions}
                                            </FormControl>
                                        </FormGroup>
                                    </Col>
                                    <Col lg={4} md={4} sm={4} xs={4}>
                                        <FormGroup validationState={null} bsSize="small">
                                            <FormControl componentClass="select" placeholder="" name="monthBirth" onChange={this.handleChange} value={monthBirth}>
                                                <option value="1">Jan</option>
                                                <option value="2">Feb</option>
                                                <option value="3">Mar</option>
                                                <option value="4">Apr</option>
                                                <option value="5">May</option>
                                                <option value="6">Jun</option>
                                                <option value="7">Jul</option>
                                                <option value="8">Aug</option>
                                                <option value="9">Sep</option>
                                                <option value="10">Oct</option>
                                                <option value="11">Nov</option>
                                                <option value="12">Dec</option>
                                            </FormControl>
                                        </FormGroup>
                                    </Col>
                                    <Col lg={4} md={4} sm={4} xs={4}>
                                        <FormGroup validationState={null} bsSize="small">
                                            <FormControl componentClass="select" placeholder="" name="yearBirth" onChange={this.handleChange} value={yearBirth}>
                                                {yearOptions}
                                            </FormControl>
                                        </FormGroup>
                                    </Col>
                                </Row>
                                <FormGroup validationState={null} bsSize="small">
                                    <ControlLabel>Certification</ControlLabel>
                                    <Checkbox name="cprAed" validationState={'cprAed' in valid ? valid.cprAed.state : null} onChange={this.handleChange} value={cprAed}>
                                        <span className="checkmark-box" />
                                        <i className="sm-text">
                                        CPR + AED Certification
                                        </i>
                                    </Checkbox>
                                    <Checkbox name="cprAedI" validationState={'cprAedI' in valid ? valid.cprAedI.state : null} onChange={this.handleChange} value={cprAedI}>
                                        <span className="checkmark-box" />
                                        <i className="sm-text">
                                        CPR + AED Instructor Certification
                                        </i>
                                    </Checkbox>
                                    <Checkbox name="bclsAed" validationState={'bclsAed' in valid ? valid.bclsAed.state : null} onChange={this.handleChange} value={bclsAed}>
                                        <span className="checkmark-box" />
                                        <i className="sm-text">
                                        BCLS + AED Certification
                                        </i>
                                    </Checkbox>
                                    <Checkbox name="bclsAedI" validationState={'bclsAedI' in valid ? valid.bclsAedI.state : null} onChange={this.handleChange} value={bclsAedI}>
                                        <span className="checkmark-box" />
                                        <i className="sm-text">
                                        BCLS + AED Instructor Certification
                                        </i>
                                    </Checkbox>
                                    <Checkbox name="standardFirstAid" validationState={'standardFirstAid' in valid ? valid.standardFirstAid.state : null} onChange={this.handleChange} value={standardFirstAid}>
                                        <span className="checkmark-box" />
                                        <i className="sm-text">
                                        Standard First-aid Certification
                                        </i>
                                    </Checkbox>
                                </FormGroup>
                                <FormGroup validationState={null} bsSize="small">
                                    <ControlLabel>Occupation</ControlLabel>
                                    <FormControl componentClass="select" placeholder="" name="occupation" onChange={this.handleChange} value={occupation}>
                                        <option value=""></option>
                                        <option value="Employed">Employed</option>
                                        <option value="Unemployed">Unemployed</option>
                                        <option value="Student">Student</option>
                                        <option value="Homemaker">Homemaker</option>
                                        <option value="Retiree">Retiree</option>
                                    </FormControl>
                                </FormGroup>
                                <FormGroup validationState={null} bsSize="small">
                                    <Radio name="occupationType" value="full-time" inline>
                                        <span className="checkmark" />
                                        Full-time
                                    </Radio>
                                    <Radio name="occupationType" value="part-time" inline>
                                        <span className="checkmark" />
                                        Part-time
                                    </Radio>
                                </FormGroup>
                                <FormGroup validationState={'schoolName' in valid ? valid.schoolName.state : null} bsSize="small">
                                    <ControlLabel>Name of Organisation/School</ControlLabel>
                                    <FormControl type="text" placeholder="" name="schoolName" onChange={this.handleChange} value={schoolName} />
                                    <HelpBlock>{'schoolName' in valid ? valid.schoolName.text : null}</HelpBlock>
                                </FormGroup>
                                <FormGroup validationState={'courseOfStudy' in valid ? valid.courseOfStudy.state : null} bsSize="small">
                                    <ControlLabel>Course Of Study</ControlLabel>
                                    <FormControl type="text" placeholder="" name="courseOfStudy" onChange={this.handleChange} value={courseOfStudy} />
                                    <HelpBlock>{'courseOfStudy' in valid ? valid.courseOfStudy.text : null}</HelpBlock>
                                </FormGroup>
                            </Col>
                        </Col>
                        <Col lg={12} md={12} sm={12} xs={12} className={tabActive === 2 ? 'show' : 'hide'}>
                            <Col lg={12} md={12} sm={12} xs={12}>
                                <h1 className="text-center">So far so good. Let's talk about your experience</h1>
                                <p className="text-center">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua</p>
                            </Col>
                            <Col lg={12} md={12} sm={12} xs={12}>
                                <Col lg={6} md={6} sm={6} xs={6}>
                                    <h5>TEACHING/COACHING EXPERIENCE</h5>
                                    <FormGroup validationState={null} bsSize="small" style={{ borderBottom: '3px dashed', paddingBottom: 10 }}>
                                        <ControlLabel>Do you have any experience in teaching CPR + AED Related training?</ControlLabel>
                                        <div>
                                            <Radio name="cprAedExperience" value="full-time" inline>
                                                <span className="checkmark" />
                                                Yes
                                            </Radio>
                                            <Radio name="cprAedExperience" value="part-time" inline>
                                                <span className="checkmark" />
                                                No
                                            </Radio>
                                        </div>
                                        <p>If yes, briefly describe what you did and how was the experience</p>
                                        <FormControl componentClass="textarea" placeholder="Type something..." name="cprAedExperience" onChange={this.handleChange} value={cprAedExperience} />
                                    </FormGroup>
                                    <FormGroup validationState={null} bsSize="small" style={{ borderBottom: '3px dashed', paddingBottom: 10 }}>
                                        <ControlLabel>Do you have any experience in teaching CPR + AED in other languages e.g Mandarin and Malay?</ControlLabel>
                                        <div>
                                            <Radio name="cprAedLanguage" value="full-time" inline>
                                                <span className="checkmark" />
                                                Yes
                                            </Radio>
                                            <Radio name="cprAedLanguage" value="part-time" inline>
                                                <span className="checkmark" />
                                                No
                                            </Radio>
                                        </div>
                                    </FormGroup>
                                    <FormGroup validationState={null} bsSize="small" style={{ borderBottom: '3px dashed', paddingBottom: 10 }}>
                                        <ControlLabel>Are you comfortable in taking up the role as a lead instructor teach in masses e.g more than 50 pax?</ControlLabel>
                                        <div>
                                            <Radio name="cprAedLanguage" value="full-time" inline>
                                                <span className="checkmark" />
                                                Yes
                                            </Radio>
                                            <Radio name="cprAedLanguage" value="part-time" inline>
                                                <span className="checkmark" />
                                                No
                                            </Radio>
                                        </div>
                                    </FormGroup>
                                    <FormGroup validationState={null} bsSize="small">
                                        <ControlLabel>What motivates or interests you to teach at Singapore Heart Foundation?</ControlLabel>
                                        <FormControl componentClass="textarea" placeholder="Type something..." name="motivation" onChange={this.handleChange} value={motivation} />
                                    </FormGroup>
                                </Col>
                                <Col lg={6} md={6} sm={6} xs={6}>
                                    <h5>VOLUNTEER EXPERIENCE</h5>
                                    <FormGroup validationState={null} bsSize="small" style={{ borderBottom: '3px dashed', paddingBottom: 10 }}>
                                        <ControlLabel>Have you volunteered in any organisation before?</ControlLabel>
                                        <div>
                                            <Radio name="volunteeredExperince" value="full-time" inline>
                                                <span className="checkmark" />
                                                Yes
                                            </Radio>
                                            <Radio name="volunteeredExperince" value="part-time" inline>
                                                <span className="checkmark" />
                                                No
                                            </Radio>
                                        </div>
                                        <p>If yes, briefly describe what you did and how was the experience</p>
                                        <FormControl componentClass="textarea" placeholder="Type something..." name="volunteeredExperince" onChange={this.handleChange} value={volunteeredExperince} />
                                    </FormGroup>
                                    <h5>AVAILABILITY</h5>
                                    <Col lg={12} md={12} sm={12} xs={12} style={{ borderBottom: '3px dashed', paddingBottom: 10 }}>
                                        <Col lg={6} md={6} sm={6} xs={6}>
                                            <FormGroup validationState={null} bsSize="small">
                                                <ControlLabel>Weekday</ControlLabel>
                                                <Checkbox name="weekdayMorningAvailabilty" validationState={'weekdayMorningAvailabilty' in valid ? valid.weekdayMorningAvailabilty.state : null} onChange={this.handleChange} value={weekdayMorningAvailability}>
                                                    <span className="checkmark-box" />
                                                    <i className="sm-text">
                                                    Morning
                                                    </i>
                                                </Checkbox>
                                                <Checkbox name="weekdayAfternoonAvailabilty" validationState={'weekdayAfternoonAvailabilty' in valid ? valid.weekdayAfternoonAvailabilty.state : null} onChange={this.handleChange} value={weekdayAfternoonAvailability}>
                                                    <span className="checkmark-box" />
                                                    <i className="sm-text">
                                                    Afternoon
                                                    </i>
                                                </Checkbox>
                                                <Checkbox name="weekdayNightAvailabilty" validationState={'weekdayNightAvailabilty' in valid ? valid.weekdayNightAvailabilty.state : null} onChange={this.handleChange} value={weekdayNightAvailability}>
                                                    <span className="checkmark-box" />
                                                    <i className="sm-text">
                                                    Night
                                                    </i>
                                                </Checkbox>
                                            </FormGroup>
                                        </Col>
                                        <Col lg={6} md={6} sm={6} xs={6}>
                                            <FormGroup validationState={null} bsSize="small">
                                                <ControlLabel>Weekend</ControlLabel>
                                                <Checkbox name="weekendMorningAvailability" validationState={'weekendMorningAvailability' in valid ? valid.weekendMorningAvailability.state : null} onChange={this.handleChange} value={weekendMorningAvailability}>
                                                    <span className="checkmark-box" />
                                                    <i className="sm-text">
                                                    Morning
                                                    </i>
                                                </Checkbox>
                                                <Checkbox name="weekdayAfternoonAvailabilty" validationState={'weekdayAfternoonAvailabilty' in valid ? valid.weekendAfternoonAvailabilty.state : null} onChange={this.handleChange} value={weekendAfternoonAvailability}>
                                                    <span className="checkmark-box" />
                                                    <i className="sm-text">
                                                    Afternoon
                                                    </i>
                                                </Checkbox>
                                                <Checkbox name="weekendNightAvailabilty" validationState={'weekendNightAvailabilty' in valid ? valid.weekendNightAvailabilty.state : null} onChange={this.handleChange} value={weekendNightAvailability}>
                                                    <span className="checkmark-box" />
                                                    <i className="sm-text">
                                                    Night
                                                    </i>
                                                </Checkbox>
                                            </FormGroup>
                                        </Col>
                                    </Col>
                                </Col>
                            </Col>
                            <Button className="center-block" bsStyle="primary" bsSize="lg" type="submit">
                                Submit
                            </Button>
                        </Col>
                        { tabActive < 2 ? (
                            <Button className="center-block" bsStyle="primary" bsSize="lg" onClick={this.nextTab}>
                                Save &amp; Next
                            </Button>
                        ) : null
                        }
                    </Col>
                </form>
            </Col>
        );
    }
}

export default Application;
