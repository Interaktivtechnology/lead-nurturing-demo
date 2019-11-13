import 'babel-polyfill';

import {
    Builder, By, Key, until,
} from 'selenium-webdriver';
import faker from 'faker';

const { expect } = require('chai');

describe('DefaultTest', () => {
    const driver = global.driver
        ? global.driver
        : new Builder().forBrowser('chrome').build();

    it('should go to StepAsia Web and check the title', async () => {
        await driver.get('http://localhost:8080/donate');
        const title = await driver.getTitle();
        expect(title).to.equal('Step Asia Website a');
        // return Promise.resolve();
    }).timeout(20000);

    it('Should go to Step Asia web and create donation', async () => {
        await driver.findElement(By.name('name')).sendKeys(`${faker.name.firstName()} ${faker.name.lastName()}`);
        await driver.findElement(By.name('IDno')).sendKeys('S81928391a');
        const error = await driver.findElement(By.name('IDno'));
        // console.info(await error.getAttribute('value'));
        await driver.sleep(5000);
    }).timeout(20000);

    after(async () => driver.quit());
});
