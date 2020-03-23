<template>
	<view class="contain">
		<view class="form-contain">
			<view class="form-input-item">
				<view>{{this.isLogin? "账号" :"邮箱"}}</view>
				<input class="form-input" name="name" v-model="username" :placeholder="this.isLogin? '邮箱号/昵称' : '邮箱'" />
			</view>
			<view class="form-input-item">
				<view>密码</view>
				<input v-model="password" @confirm="submit" password maxlength="15" class="form-input" name="password" :placeholder="this.isLogin?'账户密码' : '6-15位密码' " />
			</view>
			<view v-if="!this.isLogin" class="form-input-item">
				<view>确认</view>
				<input v-model="passwordConfirm" @confirm="submit" password maxlength="16" class="form-input" name="passwordConfirm"
				 placeholder="再次输入密码验证" />
			</view>
			<view v-if="!this.isLogin" class="form-input-item">
				<view>验证</view>
				<input v-model="code" @confirm="submit" maxlength="6" class="form-input" name="code" placeholder="请输入邮件中的验证码" />
				<view @click="sendEmail" :style="{color: (this.isWait ? '#c0c0c0' : '#007AFF'),'font-weight': 'bold','font-size':'medium'}">{{this.isWait ? this.waitSecond + '秒' : '获取验证码'}}</view>
			</view>
			<button @click="submit" class="form-button" type="primary">{{this.isLogin? "登录" :"注册"}}</button>
			<button class="form-button" @click="isLogin = !isLogin" type="default">{{this.isLogin? "注册" :"登录"}}</button>
		</view>
	</view>
</template>

<script>
	import md5 from '../../node_modules/md5';
	export default {
		data() {
			return {
				isLogin: true,
				username: '',
				password: '',
				passwordConfirm: '',
				code: '',
				isWait: false,
				waitSecond: 60,
			}
		},
		methods: {
			submit() {
				if (this.isLogin) {
					this.login()
				} else {
					this.registered()
				}
			},
			login() {

			},
			registered() {
				if (this.password !== this.passwordConfirm) {
					this.toast("两次密码不一致");
					return;
				}
				if (!this.isEmail(this.username)) {
					this.toast("请输入正确邮箱地址");
					return;
				}
				if (!this.isValidPassword(this.password)) {
					this.toast("请输入6-15位数字,字母和下划线组成的密码");
					return;
				}
				this.requests({
					url: 'user/registered',
					data: {
						email: this.username,
						code: this.code,
						passwrod: md5(this.password)
					},
					success: (res) => {
						this.toast("注册成功!跳转登录...");
						this.isLogin = true;
					}
				})
			},
			sendEmail() {
				if(this.isWait){return;}
				if (!this.isEmail(this.username)) {
					this.toast("请输入正确邮箱地址");
					return;
				}
				this.requests(
				{
					url: 'user/sendMail',
					data: {
						email: this.username
					},
					success: (res) => {
						this.toast("已向" + this.username + "发送了验证码,如未收到请检查邮箱地址.");
					},
					fail: (res) => {
						
					},
					complete: (res) => {
						this.isWait = true;
						setInterval(() => {
							if (this.waitSecond-- <= 0) {
								clearInterval()
							}
						}, 1000);
					}
				}
				);
			},
			isValidPassword(password) {
				let reg = /^[\w]{6,15}$/;
				return reg.test(password)
			}
		}
	}
</script>

<style lang="scss" scoped>
	.form-input {
		color: $uni-text-color;
		text-align: left;
	}

	.contain {
		background-color: $uni-bg-color-main;
		text-align: center;
		color: white;
		height: 100vh;
		width: 100vw;
	}

	.form-contain {
		padding: 20px 0px 20px 0px;
	}

	.form-input-item {
		width: 100vw;
		background-color: white;
		height: 50px;
		display: flex;

		flex-wrap: nowrap;
		border-bottom: 1px solid $uni-border-color;
	}


	.form-input-item view {
		margin: 0 20px 0 10px;
		color: $uni-text-color;
		line-height: 50px;
	}

	.form-input-item input {
		height: 50px;
		flex-grow: 1;
	}

	.form-button {
		margin: 15px 12vw 0px 12vw;
	}
</style>
