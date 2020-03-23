import Vue from 'vue'
import App from './App'

Vue.config.productionTip = false
Vue.prototype.toast = (title) => {
	uni.showToast({
		icon: 'none',
		title: title,
		position: 'bottom',
		duration: 1500,
		mask: true
	});
}
Vue.prototype.isEmail = (string) => {
	let pattern= /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{1,4}$/;
	return pattern.test(string);
}
Vue.prototype.token = '';
App.mpType = 'app'

const app = new Vue({
	...App
})
app.$mount()
