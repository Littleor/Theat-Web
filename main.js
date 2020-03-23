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
Vue.prototype.requests = ({url,data,success,fail,complete}) => {
	if(fail == null){
		fail = (res) => {};
	}
	if(complete == null){
		complete = (res) => {};
	}
	if(success == null){
		success = (res) => {};
	}
	uni.request({
		url: 'http://localhost:3000/' + url,
		method: 'POST',
		data: data,
		header: {
			'token': Vue.prototype.token
		},
		success: (res) => {
			console.log(res);
			if(res.statusCode == 200 || res.statusCode == 201){
				success(res);
			}
			else{
				Vue.prototype.toast(res.data.error);
			}
		},
		fail: (res) => {
			fail(res)
			console.log(res);
		},
		complete: (res) => {
			complete(res);
		}
	});
}
App.mpType = 'app'

const app = new Vue({
	...App
})
app.$mount()
