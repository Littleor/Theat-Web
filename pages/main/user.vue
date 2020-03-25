<template>
	<view class="contain">
		<view>

			<uni-list class="list">
				<uni-list-item showExtraIcon :extraIcon="{color: '#8e8e8e',size: '56',type: 'contact'}" class="list-item user-list"
				 :title="userName" :note="email"></uni-list-item>
			</uni-list>
		</view>
		<view style="margin-top: 20px;">
			<uni-list class="list">
				<uni-list-item class="list-item" title="关于" />
				<!-- #ifdef APP-PLUS -->
				<uni-list-item @click="checkVersion" class="list-item" :note="version" title="检查更新" />
				<!-- #endif -->
			</uni-list>
		</view>
		<button @click="logout" type="warn">退出登录</button>
	</view>
</template>

<script>
	// import js-base64 from "../../node_modules/js-base64";
	import {
		Base64
	} from 'js-base64';
	export default {
		data() {
			return {
				userName: 'Hi,账户名字',
				email: 'email',
				// #ifdef APP-PLUS
				version: '',
				// #endif
			}
		},
		onReady() {
			// #ifdef APP-PLUS
			this.version = plus.runtime.version;
			// #endif
			// console.log(Base64.decode(this.token.split('.')[1]))
			let {
				exp,
				data,
				iat
			} = JSON.parse(Base64.decode(this.token.split('.')[1]));
			let {
				email,
				name,
				time
			} = data;
			this.email = email;
			this.userName = `Hi,${name}`;
		},
		methods: {
			logout() {
				uni.showModal({
				    title: `退出登录`,
				    content: "确定退出登录?",
				    success: function (res) {
						if(res.confirm){
							uni.setStorage({
								key: 'token',
								data: '',
								success: () => {
									this.updateToken();
									this.toast("退出登录成功");
									uni.reLaunch({
										url: '../user/index'
									});
								}
							});
						}
					}})
			
			},
			checkVersion(){
				// #ifdef APP-PLUS
				this.requests({
					url: 'version/check',
					data: {
						version: plus.runtime.version,
						appid: plus.runtime.appid
					},
					success: (res) => {
						let {update,desc,version,url} = res.data;
						if(update){
							uni.showModal({
							    title: `更新 - ${version}`,
							    content: desc,
								showCancel: false,
							    success: function (res) {
									if(res.confirm || res.cancel){
										uni.reLaunch({
											url: '/pages/user/index'
										})
										plus.runtime.openURL(url);								
										plus.runtime.quit();
									}
							    }
							});
						}
						else{
							this.toast("已是最新版,无需更新");
						}
					}
				})
				// #endif
			}
		}
	}
</script>

<style lang="scss" scoped>
	body {
		overflow-x: hidden;
	}

	.contain {
		background-color: $uni-bg-color-main;
		color: black;
		height: 100vh;
		width: 100vw;
		// padding-top: 20px;
	}

	.list {
		width: 100vw;
	}

	.list-item {
		background-color: white;
		width: 100vw;
	}

	.user-list {
		margin-top: 1vh;
		margin-bottom: 1vh;
		max-height: 120px;
		font-weight: bold;
	}

	button {
		margin: 20px 10vw 20px 10vw;
	}
</style>
