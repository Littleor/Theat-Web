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
				<uni-list-item @click="joinGroup" class="list-item" title="交流反馈" note="Q群:605161395" />
				<uni-list-item @click="about" class="list-item" title="关于" note="Code by Littleor" />
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
				this.confirm({
					title: '退出登录',
					content: "确定退出登录?",
					confirm: () => {
						uni.setStorage({
							key: 'token',
							data: '',
							success: () => {
								this.updateToken();
								this.toast("退出登录成功");
								uni.reLaunch({
									url: '/pages/user/index'
								});
							}
						});
					}
				})

			},
			checkVersion() {
				// #ifdef APP-PLUS
				this.requests({
					url: 'version/check',
					data: {
						version: plus.runtime.version,
						appid: plus.runtime.appid
					},
					success: (res) => {
						let {
							update,
							desc,
							version,
							url
						} = res.data;
						if (update) {
							uni.showModal({
								title: `更新 - ${version}`,
								content: desc,
								showCancel: false,
								success: function(res) {
									if (res.confirm || res.cancel) {
										uni.reLaunch({
											url: '/pages/user/index'
										})
										plus.runtime.openURL(url);
										plus.runtime.quit();
									}
								}
							});
						} else {
							this.toast("已是最新版,无需更新");
						}
					}
				})
				// #endif
			},
			joinGroup() {
				uni.setClipboardData({
					data: '605161395',
					success: () => {
						this.toast('已将群号复制到剪贴板,请打开QQ搜索加入交流群');
					}
				});
			},
			about() {
				this.confirm({
					title: '关于',
					content: '这是一款专为异地恋情侣设计的一款异地互动APP,我们希望它能为你的异地生活带来不一样的改变.\n人力有限,很多不尽人意之处还望包含.\n最后如果您喜欢这款软件不妨捐赠一波支持下作者.',
					confirm: () => {
						// #ifdef APP-PLUS
						this.toast('感谢大佬支持🙏');
						plus.runtime.openURL('https://pay.sixming.com');
						// #endif
					},
					cancel: () => {
						this.toast('感谢使用!');
					}
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.contain {
		overflow-x: hidden;
		background-color: $uni-bg-color-main;
		color: black;
		height: 100vh;
		width: 100vw;
	}

	.list-item {
		padding-left: 10px;
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
		margin: 20px 12vw 20px 12vw;
	}
</style>
