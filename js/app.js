import Tabs from './components/tabs.js';
import Map from './components/map.js';
import Pickup from './components/pickup.js';
import Delivery from './components/delivery.js';
import Payment from './components/payment.js';
import Form from './components/form.js';

export default class App {
  init() {
    const tabs = new Tabs(`.js_tabs-block`, `.js_tab`);
    tabs.init();

    const map = new Map();
    map.init();

    const pickup = new Pickup(map);
    pickup.init();

    const delivery = new Delivery(`10:00`, `19:00`, `00:20`);
    delivery.init();

    const payment = new Payment();
    payment.init();

    const form = new Form(tabs, delivery, payment);
    form.init();
  }
}
