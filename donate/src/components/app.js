import React from 'react';
import {
    BrowserRouter as Router,
    Route,
    Switch,
} from 'react-router-dom';
import Donate from './donate';
import ThankYou from './thankyou';

const AllRoutes = () => (
    <Router basename="/">
        <div>
            <Switch>
                <Route exact path="/" component={Donate} />
                <Route exact path="/thank-you" component={ThankYou} />
                <Route
                    render={(props) => {
                        window.location = `/404.html?from=${props.location.pathname}`;
                    }}
                />
            </Switch>
        </div>
    </Router>
);

export default AllRoutes;
